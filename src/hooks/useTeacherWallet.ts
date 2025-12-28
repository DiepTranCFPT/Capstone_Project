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

export interface IncomeChartPoint {
  label: string;
  monthKey: string;
  total: number;
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
  // Extract type string from either string type or object type with name property
  let typeStr = "";
  if (typeof type === "string") {
    typeStr = type.toUpperCase();
  } else if (type && typeof type === "object") {
    const typeName = (type as Record<string, unknown>).name;
    typeStr = typeof typeName === "string" ? typeName.toUpperCase() : "";
  }

  // Check for withdrawal transactions first - these should always be outgoing
  if (typeStr.includes("WITHDRAWAL") || typeStr.includes("WITHDRAW")) {
    return "withdraw";
  }

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
  // Pass transaction.type to properly detect WITHDRAWAL and other transaction types
  const type = getTransactionType(transaction.type, transaction.amount);
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
  const [incomeChartData, setIncomeChartData] = useState<IncomeChartPoint[]>([]);

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

      // Chuẩn hóa dữ liệu cho biểu đồ thu nhập theo tháng (12 tháng gần nhất)
      const now = new Date();
      const monthsBack = 12;

      // Tạo map YYYY-MM -> tổng thu nhập
      const incomeByMonth = new Map<string, number>();

      transactionsData.forEach((t) => {
        if (!t.createdAt) return;
        if (getTransactionType(t.type, t.amount) !== "income") return;

        const date = new Date(t.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-11

        const diffMonths =
          (now.getFullYear() - year) * 12 +
          (now.getMonth() - month);

        // Chỉ lấy trong 12 tháng gần nhất (kể cả tháng hiện tại)
        if (diffMonths < 0 || diffMonths >= monthsBack) return;

        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
        const prev = incomeByMonth.get(monthKey) ?? 0;
        incomeByMonth.set(monthKey, prev + Math.abs(t.amount));
      });

      // Tạo danh sách 12 tháng gần nhất theo thứ tự thời gian tăng dần
      const chartPoints: IncomeChartPoint[] = [];
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = date.getFullYear();
        const monthIndex = date.getMonth(); // 0-11
        const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
        const label = date.toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });
        chartPoints.push({
          label,
          monthKey,
          total: incomeByMonth.get(monthKey) ?? 0,
        });
      }

      setIncomeChartData(chartPoints);
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
    incomeChartData,
    refetch: fetchTransactions,
  };
};

