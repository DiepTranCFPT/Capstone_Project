import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiArrowLeft, FiRefreshCcw } from "react-icons/fi";

const PaymentResult = () => {
  const [params] = useSearchParams();

  const result = useMemo(() => {
    const status = params.get("status") ?? "";
    const message = params.get("message") ?? "";
    const amount = params.get("amount") ?? "";
    const orderId = params.get("orderId") ?? "";
    const transId = params.get("transId") ?? "";

    const isSuccess =
      status.toLowerCase() === "success" ||
      params.get("resultCode") === "0" ||
      /success/gi.test(message);

    return {
      isSuccess,
      status: isSuccess ? "success" : "failed",
      message: message || (isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"),
      amount,
      orderId,
      transId,
    };
  }, [params]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-10 shadow-xl shadow-emerald-100/50">
        <div className="flex flex-col items-center text-center space-y-6">
          <span
            className={`inline-flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
              result.isSuccess ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
            }`}
          >
            {result.isSuccess ? <FiCheckCircle /> : <FiXCircle />}
          </span>

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              AP Wallet
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {result.isSuccess ? "Nạp tiền thành công!" : "Nạp tiền thất bại"}
            </h1>
            <p className="mt-2 text-slate-500 max-w-xl">
              {result.message}
            </p>
          </div>

          <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-6 text-left space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Số tiền</span>
              <span className="font-semibold text-slate-900">
                {Number(result.amount || 0).toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Mã giao dịch</span>
              <span className="font-semibold text-slate-900">{result.transId || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Order ID</span>
              <span className="font-semibold text-slate-900">{result.orderId || "N/A"}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Trạng thái</span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                  result.isSuccess
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {result.isSuccess ? "Success" : "Failed"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-white"
            >
              <FiArrowLeft /> Về bảng điều khiển
            </Link>
            <Link
              to="/wallet"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600"
            >
              <FiRefreshCcw /> Nạp lại
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentResult;
