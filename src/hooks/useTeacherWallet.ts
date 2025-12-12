// src/hooks/useTeacherWallet.ts
import { useState, useEffect, useCallback } from "react";
import MomoPaymentService from "~/services/MomoPaymentService";
import TokenTransactionService from "~/services/tokenTransactionService";
import type { PaymentObject, WalletBalanceSummary } from "~/types/momoPayment";
import type { UserTokenTransaction } from "~/types/tokenTransaction";

interface TransactionDisplay {
  id: string;
  title: string;
  time: string;
  amount: string;
  status: string;
  type: "income" | "withdraw";
  balanceAfter?: string;
}

interface WalletSummary {
  availableBalance: number;
  monthlyIncome: number;
  pendingAmount: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

const getTransactionType = (
  type: unknown,
  amount: number
): "income" | "withdraw" => {
  // Đảm bảo chỉ gọi toUpperCase khi type là string
  const typeStr =
    typeof type === "string" ? type.toUpperCase() : "";

  // Nếu type là "DEPOSIT" hoặc "INCOME" hoặc amount > 0 thì là thu nhập
  if (
    typeStr.includes("DEPOSIT") ||
    typeStr.includes("INCOME") ||
    amount > 0
  ) {
    return "income";
  }
  return "withdraw";
};

const getTransactionTitle = (transaction: {
  description?: string;
  // type từ Momo (string) hoặc có thể không có nếu là token transaction
  type?: string;
}): string => {
  if (transaction.description) {
    // Hide "Admin note: ..." part if present in description
    const cleaned = transaction.description
      .replace(/\s*\|\s*Admin note:.*$/i, "")
      .trim();

    if (cleaned) {
      return cleaned;
    }

    return transaction.description;
  }
  const type = transaction.type?.toUpperCase() || "";
  if (type.includes("WITHDRAW") || type.includes("RUT")) {
    return "Withdrawal Request";
  }
  if (type.includes("SALARY") || type.includes("LUONG")) {
    return "Salary";
  }
  if (type.includes("COMMISSION") || type.includes("HOA_HONG")) {
    return "Commission";
  }
  return "Transaction";
};

const getStatusText = (status: string): string => {
  const statusUpper = status?.toUpperCase() || "";
  if (statusUpper.includes("SUCCESS") || statusUpper.includes("THANH_CONG") || statusUpper.includes("COMPLETED")) {
    return "Success";
  }
  if (statusUpper.includes("PENDING") || statusUpper.includes("DANG_XU_LY") || statusUpper.includes("CHO")) {
    return "Pending";
  }
  if (statusUpper.includes("FAILED") || statusUpper.includes("THAT_BAI")) {
    return "Failed";
  }
  return status || "Pending";
};

const transformUserTokenTransaction = (
  transaction: UserTokenTransaction
): TransactionDisplay => {
  // API token-transaction/user không có type string, nên suy ra bằng amount
  const type = getTransactionType("", transaction.amount);
  const amount = Math.abs(transaction.amount);
  const formattedAmount = formatCurrency(amount);
  const amountWithSign =
    type === "income" ? `+${formattedAmount}` : `-${formattedAmount}`;

  const balanceAfter =
    typeof transaction.balanceAfter === "number"
      ? formatCurrency(transaction.balanceAfter)
      : undefined;

  return {
    id: `TXN-${transaction.id ?? ""}`,
    title: getTransactionTitle({ description: transaction.description }),
    time: formatDate(transaction.createdAt),
    amount: amountWithSign,
    status: getStatusText(transaction.status || ""),
    type,
    balanceAfter,
  };
};

const calculateWalletSummary = (
  transactions: UserTokenTransaction[],
  availableBalance: number
): WalletSummary => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Tính thu nhập tháng này
  const monthlyIncome = transactions
    .filter((t) => {
      if (!t.createdAt) return false;
      const date = new Date(t.createdAt);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        getTransactionType(t.type, t.amount) === "income"
      );
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Tính số tiền đang chờ xử lý
  const pendingAmount = transactions
    .filter((t) => {
      const status = t.status?.toUpperCase() || "";
      return status.includes("PENDING") || status.includes("DANG_XU_LY") || status.includes("CHO");
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    availableBalance,
    monthlyIncome,
    pendingAmount,
  };
};

const extractAvailableBalance = (
  walletSummaryData: WalletBalanceSummary | PaymentObject[] | undefined
): number => {
  if (typeof walletSummaryData === "number") {
    return walletSummaryData;
  }

  if (Array.isArray(walletSummaryData)) {
    const activePayments = walletSummaryData.filter(
      (payment) => payment?.status?.toUpperCase() === "ACTIVE"
    );
    return activePayments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0);
  }

  if (walletSummaryData && typeof walletSummaryData === "object") {
    const {
      availableBalance,
      balance,
      walletBalance,
      totalAmount,
      amount,
    } = walletSummaryData as Record<string, number | undefined>;

    const candidates = [availableBalance, balance, walletBalance, totalAmount, amount];
    for (const value of candidates) {
      if (value !== undefined && value !== null) {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue)) {
          return numericValue;
        }
      }
    }

    return 0;
  }

  return 0;
};

export const useTeacherWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionDisplay[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary>({
    availableBalance: 0,
    monthlyIncome: 0,
    pendingAmount: 0,
  });

  const fetchTransactions = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsRes, balanceRes] = await Promise.all([
        TokenTransactionService.getUserTokenTransactions(),
        MomoPaymentService.getPaymentbyUser(),
      ]);

      // Chuẩn hóa dữ liệu giao dịch từ API /api/token-transaction/user
      const apiData = transactionsRes.data as
        | { data?: UserTokenTransaction[] }
        | UserTokenTransaction[]
        | undefined;

      const transactionsData: UserTokenTransaction[] = Array.isArray(apiData)
        ? apiData
        : apiData?.data || [];

      const balanceData = extractAvailableBalance(
        balanceRes?.data?.data as WalletBalanceSummary | PaymentObject[] | undefined
      );

      // Sắp xếp giao dịch mới nhất trước để hiển thị đúng thứ tự thời gian
      const sortedTransactions = [...transactionsData].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

      const transformedTransactions = sortedTransactions.map(transformUserTokenTransaction);
      setTransactions(transformedTransactions);

      const summary = calculateWalletSummary(transactionsData, balanceData);
      setWalletSummary(summary);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.message || axiosError.message || "An error occurred while loading wallet data.";
      setError(errorMessage);
      setTransactions([]);
      setWalletSummary({
        availableBalance: 0,
        monthlyIncome: 0,
        pendingAmount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    loading,
    error,
    transactions,
    walletSummary,
    refetch: fetchTransactions,
  };
};

