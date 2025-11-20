export interface TokenData {
  id: string;
  tokenAmount: number;
  price: number;
  status: 'Active' | 'Inactive';
}

export interface PaymentData {
    id: string;
    transactionId: string;
    userId: string;
    userName: string;
    tokenAmount: number;
    amount: number;
    currency: string;
    status: 'Success' | 'Pending' | 'Failed';
    date: string; // ISO string
    paymentMethod: string;
    notes?: string;
}