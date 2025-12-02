// src/types/tokenTransaction.ts

// Payload cho yêu cầu rút tiền
export interface WithdrawRequestPayload {
  amount: number;
  description?: string;
  type?: string; // Transaction type, ví dụ: "WITHDRAW"
  [key: string]: unknown;
}

// Response sau khi tạo yêu cầu rút tiền
export interface WithdrawRequestResponse {
  id?: string;
  requestId?: string;
  amount: number;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

// Payload cho xác nhận rút tiền
export interface ConfirmWithdrawalPayload {
  requestId?: string;
  transactionId?: string;
  otp?: string;
  approved?: boolean;
  adminNote?: string;
  [key: string]: unknown;
}

// Response sau khi xác nhận rút tiền
export interface ConfirmWithdrawalResponse {
  success: boolean;
  message?: string;
  transactionId?: string;
  [key: string]: unknown;
}

// Thông tin yêu cầu rút tiền (dùng cho GET danh sách)
// Khớp với response hiện tại của API /withdraw-requests
// [
//   {
//     "transactionId": "...",
//     "teacherId": "...",
//     "teacherName": "Teacher System",
//     "amount": 1000,
//     "status": "pending",
//     "bankingNumber": "098372",
//     "nameBanking": "Viettinbank",
//     "createdAt": "2025-12-02"
//   }
// ]
export interface WithdrawRequest {
  transactionId: string;
  teacherId?: string;
  teacherName?: string;
  amount: number;
  status: string;
  bankingNumber?: string;
  nameBanking?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Payment Method types
export interface PaymentMethod {
  id?: string;
  type?: string; // 'BANK', 'MOMO', etc.
  bankName?: string;
  bankAccount?: string;
  accountHolderName?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface PaymentMethodPayload {
  type?: string;
  bankName?: string;
  bankAccount?: string;
  accountHolderName?: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

