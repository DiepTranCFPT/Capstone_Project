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

// Format số với dấu phẩy nhưng không có ký hiệu VND (để dễ xóa trong input)
const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount);
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

    if (!selectedPaymentMethod) {
      setError("Vui lòng chọn tài khoản ngân hàng");
      return;
    }

    try {
      setLoading(true);
      await TokenTransactionService.withdraw({
        amount: amountNumber,
        description: note.trim() || undefined,
        type: "WITHDRAW", // Thêm transaction type
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
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đã xảy ra lỗi khi tạo yêu cầu rút tiền.";
      
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data as { message?: string; error?: string } | string;
        // Kiểm tra message trong response
        if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      // Xử lý lỗi "Transaction type not found"
      if (errorMessage.toLowerCase().includes("transaction type not found") || 
          errorMessage.toLowerCase().includes("type not found")) {
        errorMessage = "Loại giao dịch không hợp lệ. Vui lòng thử lại.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ lấy số, không format khi đang nhập để dễ xóa
    const rawValue = e.target.value.replace(/[^\d]/g, "");
    setAmount(rawValue);
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Khi blur, format lại số với dấu phẩy
    if (amount) {
      e.target.value = formatNumber(parseFloat(amount));
    }
  };

  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Khi focus, hiển thị số thô để dễ chỉnh sửa
    if (amount) {
      e.target.value = amount;
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Cho phép tất cả các phím điều hướng, xóa và phím tắt
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Tab" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      return;
    }
    // Chỉ cho phép số
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
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
            <div className="relative">
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  value={amount || ""}
                  onChange={handleAmountChange}
                  onKeyDown={handleAmountKeyDown}
                  onBlur={handleAmountBlur}
                  onFocus={handleAmountFocus}
                  placeholder="Nhập số tiền muốn rút"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={loading || loadingMethods}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  ₫
                </span>
              </div>
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  disabled={loading || loadingMethods}
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
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

