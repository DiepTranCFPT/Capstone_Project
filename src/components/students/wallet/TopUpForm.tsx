import React from "react";

interface TopUpFormProps {
  amount: number;
  setAmount: (value: number) => void;
  note: string;
  handleSubmit: () => Promise<void> | void;
  scrollToHistory: () => void;
  loading: boolean;
  error: string | null;
  formatAmount: (value: number) => string;
  quickAmounts: number[];
}

const TopUpForm: React.FC<TopUpFormProps> = ({
  amount,
  setAmount,
  note,
  handleSubmit,
  scrollToHistory,
  loading,
  error,
  formatAmount,
  quickAmounts,
}) => {
  return (
    <div className="space-y-5">
      <label className="block text-sm font-semibold text-slate-600">
        Amount to top up
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            type="number"
            min={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 sm:max-w-md"
            placeholder="Enter amount (VND)"
          />
          <div className="min-w-[140px] rounded-2xl border border-slate-200 bg-white px-5 py-3 text-2xl font-bold text-slate-900 shadow-inner">
            {formatAmount(amount || 0)}
          </div>
        </div>
      </label>

      <div className="flex flex-wrap gap-3">
        {quickAmounts.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              amount === value
                ? "border-teal-400 bg-teal-50 text-teal-600"
                : "border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-500"
            }`}
          >
            {formatAmount(value)}
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold text-slate-600">
        Invoice display content
        <textarea
          value={note}
          readOnly
          rows={3}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none bg-slate-50 text-slate-500 cursor-not-allowed"
          placeholder="Top up AP Wallet"
        />
      </label>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/60 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Processing..." : "Top up now"}
        </button>
        <button
          type="button"
          onClick={scrollToHistory}
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-500"
        >
          Transaction History
        </button>
      </div>
    </div>
  );
};

export default TopUpForm;

