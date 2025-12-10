import axiosInstance from "~/configs/axios";
import type {
  TransferParentToStudentRequest,
  TransferParentToStudentResponse,
  ParentTransactionRaw,
} from "~/types/payment";


const PaymentService = {
  transferParentToStudent: (payload: TransferParentToStudentRequest) => {
    return axiosInstance.post<TransferParentToStudentResponse>(
      "/payments/transfer-parent-to-student",
      null,
      { params: payload }
    );
  },
  getParentTransactions: () => {
    // Backend path includes /api/transactions under baseURL
    return axiosInstance.get<ParentTransactionRaw[]>("/api/transactions");
  },
};

export default PaymentService;
