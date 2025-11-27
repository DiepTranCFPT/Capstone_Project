export interface CreatePaymentPayload {
  amount: number;
  orderId?: string;
  orderInfo?: string;
  extraData?: string;
  [key: string]: unknown;
}

export interface CreatePaymentResponse {
  payUrl: string;
  orderId?: string;
  requestId?: string;
  resultCode?: number | string;
  message?: string;
  amount?: number;
  responseTime?: number;
  [key: string]: unknown;
}

export interface IpnPayload {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number;
  orderInfo?: string;
  orderType?: string;
  transId?: string;
  resultCode?: number;
  message?: string;
  payType?: string;
  responseTime?: number;
  extraData?: string;
  signature?: string;
  [key: string]: unknown;
}

export interface IpnResponse {
  message?: string;
  [key: string]: unknown;
}

export interface RedirectParams {
  partnerCode?: string;
  orderId?: string;
  requestId?: string;
  amount?: number;
  orderInfo?: string;
  orderType?: string;
  transId?: string;
  resultCode?: number;
  message?: string;
  payType?: string;
  responseTime?: number;
  extraData?: string;
  signature?: string;
  [key: string]: unknown;
}

export interface RedirectResponse {
  orderId?: string;
  transId?: string;
  resultCode?: number;
  message?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface TransactionParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  keyword?: string;
  [key: string]: unknown;
}

export interface TransactionResponse {
  id: number | string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  createdAt?: string;
  transId?: string;
  balanceAfter?: number;
  [key: string]: unknown;
}

export type WalletBalanceSummary =
  | number
  | {
      balance?: number;
      availableBalance?: number;
      totalAmount?: number;
      amount?: number;
      walletBalance?: number;
      [key: string]: unknown;
    };