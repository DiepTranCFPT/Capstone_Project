import React from "react";
import type { TransactionResponse } from "~/types/momoPayment";
import type { UserTokenTransaction } from "~/types/tokenTransaction";

interface TransactionsSectionProps {
  transactions: (TransactionResponse | UserTokenTransaction)[];
  visibleTransactions: (TransactionResponse | UserTokenTransaction)[];
  loadTransactions: () => Promise<void> | void;
  txLoading: boolean;
  txError: string | null;
  showAllTransactions: boolean;
  setShowAllTransactions: React.Dispatch<React.SetStateAction<boolean>>;
  formatDate: (value?: string) => string;
  formatAmount: (value: number) => string;
  isIncomeTx: (tx: TransactionResponse | UserTokenTransaction) => boolean;
  renderTxIcon: (tx: TransactionResponse | UserTokenTransaction) => React.ReactNode;
  statusStyles: (status: string) => string;
}

const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  visibleTransactions,
  loadTransactions,
  txLoading,
  txError,
  showAllTransactions,
  setShowAllTransactions,
  formatDate,
  formatAmount,
  isIncomeTx,
  renderTxIcon,
  statusStyles,
}) => {
  return (
    <div
      id="wallet-history"
      className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-lg shadow-teal-50/80"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-teal-500 uppercase tracking-widest">
            Transaction History
          </p>
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
        </div>
        <div className="flex items-center gap-3">
          {transactions.length > 5 && (
            <button
              type="button"
              className="text-sm font-semibold text-teal-600 hover:text-teal-700"
              onClick={() => setShowAllTransactions((prev) => !prev)}
            >
              {showAllTransactions ? "Show less" : "View all"}
            </button>
          )}
          <button
            type="button"
            onClick={loadTransactions}
            disabled={txLoading}
            className="inline-flex items-center gap-2 rounded-full border border-teal-100 px-5 py-2 text-sm font-semibold text-teal-600 transition hover:border-teal-200 hover:text-teal-700 disabled:opacity-60"
          >
            {txLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {txError && (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 text-sm text-red-600">
          {txError}
        </div>
      )}

      <div className="mt-6 divide-y divide-slate-100">
        {txLoading && transactions.length === 0
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className="flex animate-pulse items-center gap-4 py-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-3 w-2/4 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-20 rounded bg-slate-100" />
              </div>
            ))
          : null}

        {!txLoading && transactions.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            No transactions yet. Top up to get started!
          </div>
        )}

        {visibleTransactions.map((tx) => {
          const isIncome = isIncomeTx(tx);
          const signedAmount = `${isIncome ? "+" : "-"}${formatAmount(Math.abs(tx.amount))}`;
          const balanceAfterText =
            typeof tx.balanceAfter === "number"
              ? formatAmount(tx.balanceAfter)
              : null;
          return (
            <div key={tx.id ?? `${tx.createdAt}-${tx.amount}`} className="flex flex-wrap items-center gap-4 py-4">
              <div className="flex flex-1 items-center gap-4">
                {renderTxIcon(tx)}
                <div>
                  <p className="font-semibold text-slate-800">
                    {tx.description || "Transaction"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    isIncome ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {signedAmount}
                </p>
                {balanceAfterText && (
                  <p className="text-xs text-slate-400">Balance after: {balanceAfterText}</p>
                )}
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles(
                    tx.status || ""
                  )}`}
                >
                  {tx.status || "Undefined"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionsSection;

