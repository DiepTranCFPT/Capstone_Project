// src/types/tokenTransaction.ts

// Payload cho yêu cầu rút tiền
export interface WithdrawRequestPayload {
  amount: number;
  bankAccount?: string;
  bankName?: string;
  accountHolderName?: string;
  note?: string;
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
export interface WithdrawRequest {
  id: string;
  userId?: string;
  amount: number;
  status: string;
  bankAccount?: string;
  bankName?: string;
  accountHolderName?: string;
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

