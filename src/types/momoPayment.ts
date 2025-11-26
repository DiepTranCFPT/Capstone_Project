// Types cho create payment
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

// Types cho IPN (Instant Payment Notification)
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

// Types cho redirect
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

