
import React, { useState, useCallback, useEffect } from "react";
import useMomoPayment from "~/hooks/useMomoPayment";
import { toast } from "~/components/common/Toast";
import type { CreatePaymentResponse } from "~/types/momoPayment";
import { useAuth } from "~/hooks/useAuth";
import useWalletBalance from "~/hooks/useWalletBalance";
import ParentService from "~/services/parentService";
import type { ChildInfo } from "~/types/parent";
import useTransferParentToStudent from "~/hooks/useTransferParentToStudent";
import ParentWalletBalanceCard from "~/components/parents/wallet/ParentWalletBalanceCard";
import ParentChildrenAccounts from "~/components/parents/wallet/ParentChildrenAccounts";
import ParentRecentTransactions, { type ParentTransactionItem } from "~/components/parents/wallet/ParentRecentTransactions";
import TopUpModal from "~/components/parents/wallet/TopUpModal";
import TransferModal from "~/components/parents/wallet/TransferModal";
import PaymentService from "~/services/PaymentService";
import type { ParentTransactionRaw } from "~/types/payment";

const ParentBillingPage: React.FC = () => {
  // Balance from API
  const { balance, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useWalletBalance();
  const { user } = useAuth();
  const { createPayment, loading } = useMomoPayment();
  const [modalOpen, setModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState<number>(500000);
  const topupNote = "Top up parent wallet"; // cố định nội dung ghi chú
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(200000);
  const [transferNote, setTransferNote] = useState<string>("Transfer to child");
  const [transferChildId, setTransferChildId] = useState<string | undefined>(undefined);

  const [childrenAccounts, setChildrenAccounts] = useState<ChildInfo[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const { transfer, loading: transferLoading } = useTransferParentToStudent();
  const [transactions, setTransactions] = useState<ParentTransactionItem[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const randomId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const quickAmounts = [200000, 500000, 1000000, 2000000];

  const fetchChildren = useCallback(async () => {
    try {
      setChildrenLoading(true);
      const res = await ParentService.getChildren();
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setChildrenAccounts(data);
        if (!transferChildId && data.length > 0) {
          setTransferChildId(data[0].studentId);
        }
      } else {
        setChildrenAccounts([]);
      }
    } catch (err) {
      console.error("Failed to load children", err);
      toast.error("Cannot load children accounts");
      setChildrenAccounts([]);
    } finally {
      setChildrenLoading(false);
    }
  }, [transferChildId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const res = await PaymentService.getParentTransactions();
      const data = res.data as ParentTransactionRaw[];
      if (Array.isArray(data)) {
        const mapped: ParentTransactionItem[] = data
          .slice()
          .sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
          .map((item) => ({
            id: item.id,
            title: item.externalReference || item.description || "Transaction",
            date: item.createdAt
              ? new Date(item.createdAt).toLocaleString("vi-VN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "",
            amount: item.amount,
            status: item.status,
            balanceAfter: item.balanceAfter,
          }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTopUp = useCallback(async (amount?: number) => {
    const targetAmount = amount ?? topupAmount;
    const targetNote = topupNote;
    if (!targetAmount || Number.isNaN(targetAmount) || targetAmount < 1000) {
      toast.error("Please enter a valid amount (>= 1,000 VND).");
      return;
    }
    const orderId = `PARENT_WALLET_${randomId()}`;
    const requestId = `REQ_${randomId()}`;

    const res = await createPayment({
      amount: targetAmount,
      orderId,
      requestId,
      orderType: "PARENT_WALLET",
      orderInfo: targetNote,
      extraData: JSON.stringify({
        userId: user?.id,
        channel: "PARENT_WALLET",
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
      toast.success("Redirecting to payment gateway...");
      window.location.assign(payUrl);
    } else {
      toast.error(res.message || "Failed to create top-up request.");
    }
  }, [createPayment, topupAmount, topupNote, user?.id]);

  return (
    <div className="p-4 space-y-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Parent Wallet</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ParentWalletBalanceCard
            balance={balance}
            loading={balanceLoading}
            error={balanceError}
            onRefresh={refetchBalance}
            onTopUp={() => setModalOpen(true)}
            onTransfer={() => setTransferModalOpen(true)}
            topupLoading={loading}
            transferLoading={transferLoading}
            transferDisabled={childrenAccounts.length === 0 || childrenLoading}
          />
        </div>
        <ParentChildrenAccounts
          childrenAccounts={childrenAccounts}
          loading={childrenLoading}
        />
      </div>

      <ParentRecentTransactions transactions={transactions} loading={transactionsLoading} />

      <TopUpModal
        open={modalOpen}
        loading={loading}
        amount={topupAmount}
        note={topupNote}
        quickAmounts={quickAmounts}
        onAmountChange={setTopupAmount}
        onCancel={() => setModalOpen(false)}
        onSubmit={() => handleTopUp(topupAmount)}
      />

      <TransferModal
        open={transferModalOpen}
        loading={transferLoading}
        childrenAccounts={childrenAccounts}
        childrenLoading={childrenLoading}
        selectedChildId={transferChildId}
        amount={transferAmount}
        note={transferNote}
        quickAmounts={quickAmounts}
        onSelectChild={setTransferChildId}
        onAmountChange={setTransferAmount}
        onNoteChange={setTransferNote}
        onCancel={() => setTransferModalOpen(false)}
        onSubmit={() => {
          if (!transferChildId) {
            toast.error("Please select a child.");
            return;
          }
          void (async () => {
            if (!transferAmount || transferAmount < 1000) {
              toast.error("Amount must be at least 1,000 VND.");
              return;
            }
            if (!user?.id) {
              toast.error("Missing parent information.");
              return;
            }
            try {
              await transfer({
                parentId: user.id,
                studentId: transferChildId,
                amount: transferAmount,
              });
              toast.success("Transfer created successfully.");
              setTransferModalOpen(false);
              void refetchBalance();
            } catch {
              toast.error("Transfer failed. Please try again.");
            }
          })();
        }}
      />
    </div>
  );
};

export default ParentBillingPage;
