import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { toast } from "~/components/common/Toast";
import { useAuth } from "~/hooks/useAuth";
import useMomoPayment from "~/hooks/useMomoPayment";
import MomoPaymentService from "~/services/MomoPaymentService";
import TokenTransactionService from "~/services/tokenTransactionService";
import type { CreatePaymentResponse, TransactionResponse } from "~/types/momoPayment";
import type { UserTokenTransaction } from "~/types/tokenTransaction";
import TopStatus from "~/components/students/wallet/TopStatus";
import TopUpForm from "~/components/students/wallet/TopUpForm";

import TransactionsSection from "~/components/students/wallet/TransactionsSection";

const quickAmounts = [200_000, 500_000, 1_000_000, 2_000_000];



const WalletPage = () => {
  const { user } = useAuth();
  const { createPayment, loading, error } = useMomoPayment();
  const [amount, setAmount] = useState<number>(500_000);
  const [note, setNote] = useState<string>("Top up AP Wallet");
  const [transactions, setTransactions] = useState<
    (TransactionResponse | UserTokenTransaction)[]
  >([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const displayName = user ? `${user.firstName} ${user.lastName}` : "you";
  const formattedBalance = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(walletBalance),
    [walletBalance]
  );

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const generateId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const formatDate = (value?: string) => {
    if (!value) return "Undefined";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const loadTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      setWalletBalance(0);
      return;
    }
    try {
      setTxLoading(true);
      setTxError(null);
      const [tokenTxRes, momoTxRes, paymentRes] = await Promise.all([
        TokenTransactionService.getUserTokenTransactions(),
        MomoPaymentService.getTransactions(),
        MomoPaymentService.getPaymentbyUser(),
      ]);

      // Chuẩn hóa dữ liệu giao dịch từ API /api/token-transaction/user
      const tokenPayload = tokenTxRes.data as
        | { data?: UserTokenTransaction[] }
        | UserTokenTransaction[]
        | undefined;

      const tokenTransactions: UserTokenTransaction[] = Array.isArray(tokenPayload)
        ? tokenPayload
        : tokenPayload?.data || [];

      // Dữ liệu từ MoMo /api/transactions: trả thẳng mảng TransactionResponse[]
      const momoTransactions: TransactionResponse[] = Array.isArray(momoTxRes.data)
        ? momoTxRes.data
        : [];

      const combinedTransactions: (TransactionResponse | UserTokenTransaction)[] = [
        ...tokenTransactions,
        ...momoTransactions,
      ];

      const sortedTransactions = [...combinedTransactions].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
      setTransactions(sortedTransactions);

      const summaryPayload = paymentRes.data;
      const summaryData = summaryPayload?.data;

      const extractedBalance = (() => {
        if (typeof summaryData === "number") return summaryData;
        if (summaryData && typeof summaryData === "object") {
          const dataObj = summaryData as Record<string, unknown>;
          const candidateKeys = ["balance", "availableBalance", "walletBalance", "totalAmount", "amount"];
          for (const key of candidateKeys) {
            const value = dataObj[key];
            if (typeof value === "number") {
              return value;
            }
          }
        }

        const latestBalance =
          sortedTransactions.find((tx) => typeof tx.balanceAfter === "number")?.balanceAfter ?? 0;
        return latestBalance;
      })();

      setWalletBalance(extractedBalance);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setTxError(axiosError.response?.data?.message || "Failed to load transaction history.");
    } finally {
      setTxLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const scrollToHistory = () => {
    const el = document.getElementById("wallet-history");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 5);

  const isIncomeTx = (tx: TransactionResponse | UserTokenTransaction): boolean => {
    const safeUpper = (v?: string) => (v ? v.toUpperCase() : "");
    const typeLabel =
      typeof tx.type === "string"
        ? safeUpper(tx.type)
        : tx.type && typeof tx.type === "object"
        ? safeUpper((tx.type as Record<string, unknown>).name as string)
        : "";

    const description = safeUpper(tx.description as string | undefined);
    const externalRef = safeUpper((tx as Record<string, unknown>).externalReference as string | undefined);

    const walletTopUpHints = ["TOP UP WALLET", "TOPUP", "AP_WALLET", "WALLET"];
    const paymentLearningHints = ["PAYMENT_LEARNING", "PAYMENT LEARNING"];

    if (walletTopUpHints.some((k) => typeLabel.includes(k) || description.includes(k) || externalRef.includes(k))) {
      return true;
    }
    if (paymentLearningHints.some((k) => typeLabel.includes(k) || description.includes(k) || externalRef.includes(k))) {
      return false;
    }

    // fallback to amount sign
    return (tx.amount ?? 0) > 0;
  };

  const renderTxIcon = (tx: TransactionResponse | UserTokenTransaction) => {
    const isIncome = isIncomeTx(tx);
    const baseClass = "rounded-2xl p-3";
    return (
      <span
        className={`${baseClass} ${
          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
        }`}
      >
        {isIncome ? <FiArrowUpRight /> : <FiArrowDownRight />}
      </span>
    );
  };

  const statusStyles = (status: string) => {
    if (/success|completed/i.test(status)) {
      return "bg-emerald-50 text-emerald-600";
    }
    if (/pending|processing/i.test(status)) {
      return "bg-amber-50 text-amber-600";
    }
    return "bg-slate-100 text-slate-500";
  };

  const handleSubmit = async () => {
    if (!amount || amount < 1_000) {
      toast.error("Minimum top-up amount is 1,000 VND.");
      return;
    }

    const orderId = `APWALLET_${generateId()}`;
    const requestId = `REQ_${generateId()}`;

    const res = await createPayment({
      amount,
      orderId,
      requestId,
      orderType: "AP_WALLET",
      orderInfo: note?.trim() || "Top up AP Wallet",
      extraData: JSON.stringify({
        userId: user?.id,
        channel: "AP_WALLET",
        timestamp: Date.now(),
      }),
    });

    if (!res) {
      toast.error("Unable to create top-up request, please try again.");
      return;
    }

    const successCodes = [0, 1000, "0", "1000"];
    const responseData = (res.data || {}) as CreatePaymentResponse;
    const rawResultCode =
      responseData.resultCode ?? (res as unknown as { resultCode?: number | string }).resultCode;
    const rawMessage = responseData.message || res.message;
    const payUrl = responseData.payUrl || (res as unknown as { payUrl?: string }).payUrl;

    const isSuccess =
      successCodes.includes(res.code as never) ||
      successCodes.includes(rawResultCode as never) ||
      /success/gi.test(rawMessage || "");

    if (isSuccess && payUrl) {
      toast.success("Redirecting to MoMo payment gateway...");
      window.location.assign(payUrl);
    } else {
      toast.error(res.message || "Failed to create top-up request.");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-32 pb-16 px-4 md:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* Top status */}
        <TopStatus formattedBalance={formattedBalance} />

        {/* Main card */}
        <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-teal-100/60">
          <p className="text-sm font-medium text-slate-400">Welcome back,</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {displayName.split(" ")[0]},{" "}
            <span className="text-transparent bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text">
              tuition is ready
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-3xl">
            The online education market is growing positively. Your learning investment portfolio has increased 12% last week,
            top up more to not miss new courses.
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr,1fr]">
            <TopUpForm
              amount={amount}
              setAmount={setAmount}
              note={note}
              setNote={setNote}
              handleSubmit={handleSubmit}
              scrollToHistory={scrollToHistory}
              loading={loading}
              error={error}
              formatAmount={formatAmount}
              quickAmounts={quickAmounts}
            />
            {/* Summary removed as requested */}
          </div>
        </div>



        {/* Transactions */}
        <TransactionsSection
          transactions={transactions}
          visibleTransactions={visibleTransactions}
          loadTransactions={loadTransactions}
          txLoading={txLoading}
          txError={txError}
          showAllTransactions={showAllTransactions}
          setShowAllTransactions={setShowAllTransactions}
          formatDate={formatDate}
          formatAmount={formatAmount}
          isIncomeTx={isIncomeTx}
          renderTxIcon={renderTxIcon}
          statusStyles={statusStyles}
        />
      </div>
    </section>
  );
};

export default WalletPage;
