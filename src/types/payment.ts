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
  