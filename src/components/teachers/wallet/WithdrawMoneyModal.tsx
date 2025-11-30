import { useState, useEffect, useCallback } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import TokenTransactionService from "~/services/tokenTransactionService";
import type { PaymentMethod } from "~/types/tokenTransaction";

// Extended PaymentMethod để hỗ trợ cả bankingNumber/nameBanking và bankAccount/bankName
interface ExtendedPaymentMethod extends PaymentMethod {
  bankingNumber?: string;
  nameBanking?: string;
}

interface WithdrawMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const WithdrawMoneyModal: React.FC<WithdrawMoneyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  availableBalance,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<ExtendedPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingMethods(true);
      setError(null);
      const response = await TokenTransactionService.getPaymentMethods();
      
      // Xử lý response từ API
      let methods: ExtendedPaymentMethod[] = [];
      
      if (response.data) {
        // Trường hợp 1: response.data.data là array (ApiResponse<PaymentMethod[]>)
        if (Array.isArray(response.data.data)) {
          methods = response.data.data as ExtendedPaymentMethod[];
        }
        // Trường hợp 2: response.data là array trực tiếp
        else if (Array.isArray(response.data)) {
          methods = response.data as ExtendedPaymentMethod[];
        }
        // Trường hợp 3: response.data là object đơn lẻ, wrap vào array
        else if (typeof response.data === 'object' && response.data !== null) {
          if ('data' in response.data && response.data.data !== undefined) {
            methods = Array.isArray(response.data.data) 
              ? (response.data.data as ExtendedPaymentMethod[])
              : [response.data.data as ExtendedPaymentMethod];
          } else if ('bankingNumber' in response.data || 'nameBanking' in response.data || 'bankAccount' in response.data) {
            methods = [response.data as unknown as ExtendedPaymentMethod];
          }
        }
      }
      
      setPaymentMethods(methods);
      if (methods.length > 0) {
        const firstMethodId = methods[0].id;
        const firstIdString = firstMethodId !== undefined && firstMethodId !== null
          ? String(firstMethodId)
          : "";
        setSelectedPaymentMethod((prev) => prev || firstIdString);
      }
    } catch (err) {
      console.error("Error loading payment methods:", err);
      setError("Không thể tải danh sách tài khoản ngân hàng");
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  // Load payment methods khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen, loadPaymentMethods]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPaymentMethod) {
      setError("Vui lòng chọn tài khoản ngân hàng");
      return;
    }

    const amountNumber = parseFloat(amount.replace(/[^\d]/g, ""));
    if (!amountNumber || amountNumber <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amountNumber > availableBalance) {
      setError(`Số tiền rút không được vượt quá số dư khả dụng (${formatCurrency(availableBalance)})`);
      return;
    }

    const selectedMethod = paymentMethods.find((m) => String(m.id || "") === selectedPaymentMethod);
    if (!selectedMethod) {
      setError("Tài khoản ngân hàng không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await TokenTransactionService.withdraw({
        amount: amountNumber,
        bankAccount: selectedMethod.bankingNumber || selectedMethod.bankAccount,
        bankName: selectedMethod.nameBanking || selectedMethod.bankName,
        accountHolderName: selectedMethod.accountHolderName,
        note: note.trim() || undefined,
      });

      // Reset form
      setAmount("");
      setNote("");
      setSelectedPaymentMethod("");
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
        "Đã xảy ra lỗi khi tạo yêu cầu rút tiền.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    setAmount(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full mx-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Yêu cầu rút tiền</h2>
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

          {/* Available Balance */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Số dư khả dụng</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(availableBalance)}</p>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Chọn tài khoản ngân hàng <span className="text-red-500">*</span>
            </label>
            {loadingMethods ? (
              <div className="flex items-center justify-center py-8">
                <FiLoader className="animate-spin text-2xl text-slate-400" />
                <span className="ml-2 text-sm text-slate-400">Đang tải danh sách...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm text-amber-700">
                  Bạn chưa có tài khoản ngân hàng. Vui lòng thêm tài khoản trước khi rút tiền.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      const methodId = method.id !== undefined && method.id !== null ? String(method.id) : "";
                      setSelectedPaymentMethod(methodId);
                    }}
                    disabled={loading}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPaymentMethod === String(method.id || "")
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {method.nameBanking || method.bankName || "N/A"}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Số TK: {method.bankingNumber || method.bankAccount || "N/A"}
                        </p>
                        {method.accountHolderName && (
                          <p className="text-xs text-slate-500 mt-1">
                            Chủ TK: {method.accountHolderName}
                          </p>
                        )}
                      </div>
                      {selectedPaymentMethod === String(method.id || "") && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-2">
              Số tiền rút (VND) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              type="text"
              value={amount ? formatCurrency(parseFloat(amount.replace(/[^\d]/g, ""))) : ""}
              onChange={handleAmountChange}
              placeholder="Nhập số tiền muốn rút"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={loading || loadingMethods}
            />
            <p className="mt-1 text-xs text-slate-500">
              Tối đa: {formatCurrency(availableBalance)}
            </p>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-semibold text-slate-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              disabled={loading || loadingMethods}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || loadingMethods}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || loadingMethods || paymentMethods.length === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawMoneyModal;

