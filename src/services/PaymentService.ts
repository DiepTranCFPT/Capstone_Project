import axiosInstance from "~/configs/axios";
import type { TransferParentToStudentRequest, TransferParentToStudentResponse } from "~/types/payment";


const PaymentService = {
  transferParentToStudent: (payload: TransferParentToStudentRequest) => {
    return axiosInstance.post<TransferParentToStudentResponse>(
      "/payments/transfer-parent-to-student",
      null,
      { params: payload }
    );
  },
};

export default PaymentService;
