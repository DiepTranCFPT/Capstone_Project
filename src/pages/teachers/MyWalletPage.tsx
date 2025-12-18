import { useMemo, useState } from "react";
import {
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiClock,
  FiLoader,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useTeacherWallet } from "~/hooks/useTeacherWallet";
import AddPaymentMethodModal from "~/components/teachers/wallet/AddPaymentMethodModal";
import WithdrawMoneyModal from "~/components/teachers/wallet/WithdrawMoneyModal";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const MyWalletPage = () => {
  const { loading, error, transactions, walletSummary, incomeChartData, refetch } = useTeacherWallet();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [chartRange, setChartRange] = useState<6 | 12>(12);

  const summaryCards = [
    {
      label: "Available Balance",
      value: formatCurrency(walletSummary.availableBalance),
      hint: "Can withdraw immediately",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "This Month's Income",
      value: formatCurrency(walletSummary.monthlyIncome),
      hint: "Total income in current month",
      iconBg: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Pending Processing",
      value: formatCurrency(walletSummary.pendingAmount),
      hint: "Expected within 24h",
      iconBg: "bg-amber-100 text-amber-600",
    },
  ];

  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 5);

  const displayedChartData = useMemo(() => {
    if (!incomeChartData || incomeChartData.length === 0) return [];
    const sliceCount = chartRange === 6 ? 6 : 12;
    return incomeChartData.slice(-sliceCount);
  }, [incomeChartData, chartRange]);
  return (
    <section className="min-h-screen bg-slate-50/80 p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              FINANCIAL OVERVIEW
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Income Management and Payment Requests
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsAddPaymentMethodModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              <FiArrowUpRight /> Add Account
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600"
            >
              <FiArrowUpRight /> Withdrawal Request
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <FiTrendingUp />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <FiLoader className="animate-spin" />
                    <span className="text-lg">Loading...</span>
                  </span>
                ) : (
                  card.value
                )}
              </p>
              <p className="mt-1 text-sm text-slate-400">{card.hint}</p>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Income chart */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Income Chart</h3>
              <p className="text-sm text-slate-400">
                Track income over the last {chartRange} months
              </p>
            </div>
            <select
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
              value={chartRange}
              onChange={(e) => setChartRange(Number(e.target.value) === 6 ? 6 : 12)}
            >
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>
          <div className="mt-6 h-64 w-full rounded-2xl bg-gradient-to-b from-emerald-50 to-white p-6">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                <FiLoader className="animate-spin" />
                <span>Loading income data...</span>
              </div>
            ) : !displayedChartData || displayedChartData.length === 0 ? (
              <div className="h-full rounded-2xl border border-dashed border-emerald-200 flex items-center justify-center text-sm text-slate-400">
                No income data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={displayedChartData}
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
                  <XAxis
                    dataKey="label"
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => {
                      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                      if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                      return value.toString();
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Income"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Transaction History</h3>
              <p className="text-sm text-slate-400">Recent withdrawals and payments</p>
            </div>
            {transactions.length > 5 && (
              <button
                className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                onClick={() => setShowAllTransactions((prev) => !prev)}
              >
                {showAllTransactions ? "Collapse" : "View All"}
              </button>
            )}
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <FiLoader className="animate-spin text-2xl text-slate-400" />
                  <p className="text-sm text-slate-400">Loading transaction history...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-400">No transactions yet</p>
              </div>
            ) : (
              visibleTransactions.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="flex flex-1 items-center gap-4">
                    <span
                      className={`rounded-2xl p-3 ${
                        item.type === "income" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.type === "income" ? <FiArrowUpRight /> : <FiArrowDownRight />}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <FiClock /> {item.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${item.type === "income" ? "text-emerald-600" : "text-slate-600"}`}>
                      {item.amount}
                    </p>
                    {item.balanceAfter && (
                      <p className="text-xs text-slate-400">Balance after: {item.balanceAfter}</p>
                    )}
                    <p
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddPaymentMethodModalOpen}
        onClose={() => setIsAddPaymentMethodModalOpen(false)}
        onSuccess={() => {
          refetch(); // Refresh wallet data after successful payment method creation
        }}
      />

      {/* Withdraw Money Modal */}
      <WithdrawMoneyModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {
          refetch(); // Refresh wallet data after successful withdrawal request
        }}
        availableBalance={walletSummary.availableBalance}
      />
    </section>
  );
};

export default MyWalletPage;
