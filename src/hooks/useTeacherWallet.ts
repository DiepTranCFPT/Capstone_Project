// src/hooks/useTeacherWallet.ts
import { useState, useEffect, useCallback } from "react";
import MomoPaymentService from "~/services/MomoPaymentService";
import type { TransactionResponse, WalletBalanceSummary } from "~/types/momoPayment";

interface TransactionDisplay {
  id: string;
  title: string;
  time: string;
  amount: string;
  status: string;
  type: "income" | "withdraw";
}

interface WalletSummary {
  availableBalance: number;
  monthlyIncome: number;
  pendingAmount: number;
}

interface PaymentObject {
  id: string;
  paymentNumber?: string;
  userId?: string;
  amount: number;
  status: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
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
    return date.toLocaleString("vi-VN", {
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

const getTransactionType = (type: string, amount: number): "income" | "withdraw" => {
  // Nếu type là "DEPOSIT" hoặc "INCOME" hoặc amount > 0 thì là thu nhập
  if (type?.toUpperCase().includes("DEPOSIT") || type?.toUpperCase().includes("INCOME") || amount > 0) {
    return "income";
  }
  return "withdraw";
};

const getTransactionTitle = (transaction: TransactionResponse): string => {
  if (transaction.description) {
    return transaction.description;
  }
  const type = transaction.type?.toUpperCase() || "";
  if (type.includes("WITHDRAW") || type.includes("RUT")) {
    return "Yêu cầu rút tiền";
  }
  if (type.includes("SALARY") || type.includes("LUONG")) {
    return "Lương";
  }
  if (type.includes("COMMISSION") || type.includes("HOA_HONG")) {
    return "Hoa hồng";
  }
  return "Giao dịch";
};

const getStatusText = (status: string): string => {
  const statusUpper = status?.toUpperCase() || "";
  if (statusUpper.includes("SUCCESS") || statusUpper.includes("THANH_CONG") || statusUpper.includes("COMPLETED")) {
    return "Thành công";
  }
  if (statusUpper.includes("PENDING") || statusUpper.includes("DANG_XU_LY") || statusUpper.includes("CHO")) {
    return "Đang xử lý";
  }
  if (statusUpper.includes("FAILED") || statusUpper.includes("THAT_BAI")) {
    return "Thất bại";
  }
  return status || "Đang xử lý";
};

const transformTransaction = (transaction: TransactionResponse): TransactionDisplay => {
  const type = getTransactionType(transaction.type, transaction.amount);
  const amount = Math.abs(transaction.amount);
  const formattedAmount = formatCurrency(amount);
  const amountWithSign = type === "income" ? `+${formattedAmount}` : `-${formattedAmount}`;

  return {
    id: `TXN-${transaction.id}`,
    title: getTransactionTitle(transaction),
    time: formatDate(transaction.createdAt),
    amount: amountWithSign,
    status: getStatusText(transaction.status),
    type,
  };
};

const calculateWalletSummary = (
  transactions: TransactionResponse[],
  balanceData: WalletBalanceSummary
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

  // Lấy số dư khả dụng từ API
  let availableBalance = 0;
  if (typeof balanceData === "number") {
    availableBalance = balanceData;
  } else if (typeof balanceData === "object" && balanceData !== null) {
    availableBalance =
      balanceData.availableBalance ||
      balanceData.balance ||
      balanceData.walletBalance ||
      balanceData.amount ||
      balanceData.totalAmount ||
      0;
  }

  return {
    availableBalance,
    monthlyIncome,
    pendingAmount,
  };
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
        MomoPaymentService.getTransactions(),
        MomoPaymentService.getPaymentbyUser(),
      ]);

      const transactionsData = transactionsRes.data || [];
      
      // Xử lý response từ API by-user
      // API trả về: { code: 1000, message: "Successfully", data: Array<PaymentObject> }
      // Mỗi PaymentObject có: { id, amount, status, ... }
      let balanceData: WalletBalanceSummary = 0;
      
      if (balanceRes?.data?.data) {
        const apiData = balanceRes.data.data;
        
        // Trường hợp 1: data là array các payment objects
        if (Array.isArray(apiData)) {
          // Tính tổng amount của các payment có status "Active"
          const activePayments = apiData.filter(
            (payment: PaymentObject) => payment?.status?.toUpperCase() === 'ACTIVE'
          );
          const totalAmount = activePayments.reduce(
            (sum: number, payment: PaymentObject) => sum + (Number(payment?.amount) || 0),
            0
          );
          balanceData = totalAmount;
        }
        // Trường hợp 2: data là number
        else if (typeof apiData === 'number') {
          balanceData = apiData;
        }
        // Trường hợp 3: data là object với các field như availableBalance, balance, etc.
        else if (typeof apiData === 'object' && apiData !== null) {
          balanceData = apiData as WalletBalanceSummary;
        }
      }

      const transformedTransactions = transactionsData.map(transformTransaction);
      setTransactions(transformedTransactions);

      const summary = calculateWalletSummary(transactionsData, balanceData);
      setWalletSummary(summary);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.message || axiosError.message || "Đã xảy ra lỗi khi tải dữ liệu ví.";
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

