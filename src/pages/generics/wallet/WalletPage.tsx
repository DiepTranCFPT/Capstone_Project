import { FiArrowUpRight, FiTrendingUp } from "react-icons/fi";
import { FaWallet } from "react-icons/fa";
import { useAuth } from "~/hooks/useAuth";

const demoCards = [
  { id: 1, title: "Gói đầu tư STEM", change: "+2.4%", desc: "Mức tăng trong tuần" },
  { id: 2, title: "Quỹ học liệu", change: "+2.4%", desc: "Danh mục an toàn" },
  { id: 3, title: "Gia sư cao cấp", change: "+2.4%", desc: "Thanh toán sẵn" },
  { id: 4, title: "Mock Test Premium", change: "+2.4%", desc: "Đã kích hoạt" },
];

const WalletPage = () => {
  const { user } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}` : "bạn";

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-32 pb-16 px-4 md:px-16">
      <div className="mx-auto w-full max-w-6xl space-y-10">
        {/* Top status */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Số dư khả dụng</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-3xl font-bold text-slate-900">$12,450</span>
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

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:scale-105">
                Nạp tiền ngay <FiArrowUpRight />
              </button>
              <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-500">
                Lịch sử giao dịch
              </button>
            </div>

            <div className="w-full rounded-3xl border border-indigo-50 bg-white p-6 shadow-lg shadow-indigo-100/50 sm:w-auto">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Lợi nhuận ròng</p>
                  <p className="mt-3 text-3xl font-bold text-slate-900">$1,240.50</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-500">+12.5% (7 ngày)</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <FiTrendingUp />
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 max-w-xs">
                Theo dõi hiệu suất tích lũy từ những dịch vụ học thuật mà bạn tham gia hoặc giới thiệu.
              </p>
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
