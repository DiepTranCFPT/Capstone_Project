import { useState } from "react";
import {
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiClock,
  FiCopy,
  FiLoader,
} from "react-icons/fi";
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
  const { loading, error, transactions, walletSummary, refetch } = useTeacherWallet();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddPaymentMethodModalOpen, setIsAddPaymentMethodModalOpen] = useState(false);

  const summaryCards = [
    {
      label: "Số dư khả dụng",
      value: formatCurrency(walletSummary.availableBalance),
      hint: "Có thể rút ngay",
      iconBg: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Thu nhập tháng này",
      value: formatCurrency(walletSummary.monthlyIncome),
      hint: "Tổng thu nhập trong tháng hiện tại",
      iconBg: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Đang chờ xử lý",
      value: formatCurrency(walletSummary.pendingAmount),
      hint: "Dự kiến về sau 24h",
      iconBg: "bg-amber-100 text-amber-600",
    },
  ];
  return (
    <section className="min-h-screen bg-slate-50/80 p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Tổng quan tài chính
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Quản lý thu nhập và yêu cầu thanh toán
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-white">
              <FiCopy /> Sao kê
            </button>
            <button
              onClick={() => setIsAddPaymentMethodModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              <FiArrowUpRight /> Thêm tài khoản
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600"
            >
              <FiArrowUpRight /> Yêu cầu rút tiền
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
                    <span className="text-lg">Đang tải...</span>
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

        {/* Chart placeholder */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Biểu đồ thu nhập</h3>
              <p className="text-sm text-slate-400">Theo dõi 6 tháng gần nhất</p>
            </div>
            <select className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600">
              <option>6 tháng qua</option>
              <option>12 tháng qua</option>
            </select>
          </div>
          <div className="mt-6 h-64 w-full rounded-2xl bg-gradient-to-b from-emerald-50 to-white p-6">
            <div className="h-full rounded-2xl border border-dashed border-emerald-200 flex items-center justify-center text-sm text-slate-400">
              Biểu đồ sẽ hiển thị khi tích hợp dữ liệu thực tế
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Lịch sử giao dịch</h3>
              <p className="text-sm text-slate-400">Các lệnh rút và thanh toán gần đây</p>
            </div>
            <button className="text-sm font-semibold text-teal-600 hover:text-teal-700">
              Xem tất cả
            </button>
          </div>
          <div className="mt-4 divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <FiLoader className="animate-spin text-2xl text-slate-400" />
                  <p className="text-sm text-slate-400">Đang tải lịch sử giao dịch...</p>
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-sm text-slate-400">Chưa có giao dịch nào</p>
              </div>
            ) : (
              transactions.map((item) => (
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
                        <FiClock /> {item.time} · {item.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${item.type === "income" ? "text-emerald-600" : "text-slate-600"}`}>
                      {item.amount}
                    </p>
                    <p
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Thành công"
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
