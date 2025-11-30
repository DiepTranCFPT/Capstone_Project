import { useState } from "react";
import { FiX } from "react-icons/fi";
import TokenTransactionService from "~/services/tokenTransactionService";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Danh sách các ngân hàng phổ biến ở Việt Nam
const VIETNAM_BANKS = [
  "Vietcombank",
  "BIDV",
  "VietinBank",
  "Techcombank",
  "ACB",
  "VPBank",
  "TPBank",
  "MBBank",
  "Sacombank",
  "HDBank",
  "SHB",
  "VIB",
  "Eximbank",
  "MSB",
  "OCB",
  "SeABank",
  "PVcomBank",
  "NCB",
  "BacABank",
  "NamABank",
];

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [bankingNumber, setBankingNumber] = useState("");
  const [nameBanking, setNameBanking] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bankingNumber.trim()) {
      setError("Vui lòng nhập số tài khoản ngân hàng");
      return;
    }

    if (!nameBanking.trim()) {
      setError("Vui lòng nhập tên ngân hàng");
      return;
    }

    try {
      setLoading(true);
      await TokenTransactionService.createPaymentMethod({
        bankingNumber: bankingNumber.trim(),
        nameBanking: nameBanking.trim(),
      });

      // Reset form
      setBankingNumber("");
      setNameBanking("");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Đã xảy ra lỗi khi tạo phương thức thanh toán.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full mx-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Thêm phương thức thanh toán</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="bankingNumber" className="block text-sm font-semibold text-slate-700 mb-2">
              Số tài khoản ngân hàng <span className="text-red-500">*</span>
            </label>
            <input
              id="bankingNumber"
              type="text"
              value={bankingNumber}
              onChange={(e) => setBankingNumber(e.target.value)}
              placeholder="Nhập số tài khoản ngân hàng"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="nameBanking" className="block text-sm font-semibold text-slate-700 mb-2">
              Tên ngân hàng <span className="text-red-500">*</span>
            </label>
            {/* Input để nhập tay */}
            <input
              id="nameBanking"
              type="text"
              value={nameBanking}
              onChange={(e) => setNameBanking(e.target.value)}
              placeholder="Nhập tên ngân hàng hoặc chọn từ gợi ý bên dưới"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-3"
              disabled={loading}
            />
            
            {/* Scrollable bank buttons - Gợi ý */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Gợi ý các ngân hàng phổ biến:</p>
              <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                <div className="flex gap-2 min-w-max">
                  {VIETNAM_BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setNameBanking(bank)}
                      disabled={loading}
                      className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                        nameBanking.toLowerCase().includes(bank.toLowerCase()) || nameBanking === bank
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
                      } disabled:opacity-50`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;

