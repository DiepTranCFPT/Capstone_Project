import { useMemo, useState } from "react";
import { FiArrowUpRight, FiTrendingUp } from "react-icons/fi";
import { FaWallet } from "react-icons/fa";
import { toast } from "~/components/common/Toast";
import { useAuth } from "~/hooks/useAuth";
import useMomoPayment from "~/hooks/useMomoPayment";
import type { CreatePaymentResponse } from "~/types/momoPayment";

const quickAmounts = [200_000, 500_000, 1_000_000, 2_000_000];

const demoCards = [
  { id: 1, title: "Gói đầu tư STEM", change: "+2.4%", desc: "Mức tăng trong tuần" },
  { id: 2, title: "Quỹ học liệu", change: "+2.4%", desc: "Danh mục an toàn" },
  { id: 3, title: "Gia sư cao cấp", change: "+2.4%", desc: "Thanh toán sẵn" },
  { id: 4, title: "Mock Test Premium", change: "+2.4%", desc: "Đã kích hoạt" },
];

const WalletPage = () => {
  const { user } = useAuth();
  const { createPayment, loading, error } = useMomoPayment();
  const [amount, setAmount] = useState<number>(500_000);
  const [note, setNote] = useState<string>("Nạp AP Wallet");

  const displayName = user ? `${user.firstName} ${user.lastName}` : "bạn";
  const formattedBalance = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(12_450_000),
    []
  );

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const generateId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const handleSubmit = async () => {
    if (!amount || amount < 10_000) {
      toast.error("Số tiền nạp tối thiểu là 10.000đ.");
      return;
    }

    const orderId = `APWALLET_${generateId()}`;
    const requestId = `REQ_${generateId()}`;

    const res = await createPayment({
      amount,
      orderId,
      requestId,
      orderType: "AP_WALLET",
      orderInfo: note?.trim() || "Nạp AP Wallet",
      extraData: JSON.stringify({
        userId: user?.id,
        channel: "AP_WALLET",
        timestamp: Date.now(),
      }),
    });

    if (!res) {
      toast.error("Không thể tạo yêu cầu nạp tiền, vui lòng thử lại.");
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
      toast.success("Đang chuyển tới cổng thanh toán MoMo...");
      window.location.assign(payUrl);
    } else {
      toast.error(res.message || "Không tạo được yêu cầu nạp tiền.");
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-32 pb-16 px-4 md:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* Top status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Số dư khả dụng</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-900">{formattedBalance}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">
                <FiTrendingUp /> +12.5% / 7 ngày
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <FaWallet className="text-teal-500" />
            <span className="text-sm font-semibold text-slate-600">AP Wallet</span>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-3xl bg-white/90 p-8 shadow-xl shadow-teal-100/60">
          <p className="text-sm font-medium text-slate-400">Chào mừng trở lại,</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {displayName.split(" ")[0]},{" "}
            <span className="text-transparent bg-gradient-to-r from-teal-500 to-indigo-500 bg-clip-text">
              học phí đã sẵn sàng
            </span>
          </h1>
          <p className="mt-3 text-base text-slate-500 max-w-3xl">
            Thị trường giáo dục trực tuyến đang tăng trưởng tích cực. Danh mục đầu tư học tập của bạn đã tăng 12% tuần qua,
            hãy nạp thêm để không lỡ các khóa mới.
          </p>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr,1fr]">
            {/* Form */}
            <div className="space-y-5">
              <label className="block text-sm font-semibold text-slate-600">
                Số tiền muốn nạp
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-2xl font-bold text-slate-900 shadow-inner">
                    {formatAmount(amount || 0)}
                  </div>
                  <input
                    type="number"
                    min={10000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    placeholder="Nhập số tiền (VNĐ)"
                  />
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
                Nội dung hiển thị trên hóa đơn
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  placeholder="VD: Nạp tiền cho khóa luyện thi AP"
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
                  {loading ? "Đang xử lý..." : "Nạp tiền ngay"} <FiArrowUpRight />
                </button>
                <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-500">
                  Lịch sử giao dịch
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-3xl border border-indigo-50 bg-white p-6 shadow-lg shadow-indigo-100/50">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Lợi nhuận ròng</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">1.240.500đ</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-500">+12.5% (7 ngày)</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <FiTrendingUp />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Theo dõi hiệu suất tích lũy từ những dịch vụ học thuật mà bạn tham gia hoặc giới thiệu.
              </p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                <p className="font-semibold text-slate-700">Thông tin liên kết</p>
                <p>Họ tên: {displayName}</p>
                <p>Email: {user?.email || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {demoCards.map((card) => (
            <div
              key={card.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500">
                  {card.change}
                </span>
              </div>
              <p className="mt-4 text-base font-semibold text-slate-800">{card.title}</p>
              <p className="mt-2 text-sm text-slate-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WalletPage;
