export interface TransferParentToStudentRequest {
    parentId: string;
    studentId: string;
    amount: number;
  }
  
  export interface TransferParentToStudentResponse {
    statusCode: number;
    message: string;
    data: {
      parentBalanceAfter: number;
      studentBalanceAfter: number;
      transferredAmount: number;
    };
  }

export interface ParentTransactionRaw {
  id: string;
  amount: number;
  balanceAfter?: number;
  status?: string;
  externalReference?: string;
  createdAt?: string;
  description?: string;
}
  