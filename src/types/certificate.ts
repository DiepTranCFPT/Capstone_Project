// Certificate API response types

export interface CertificateData {
    id: string;
    certificateNumber: string;
    userId: string;
    subjectId: string;
    /** 
     * ID của learning material mà certificate này gắn với.
     * Backend mới bổ sung trường này – để an toàn, khai báo là optional.
     */
    materialId?: string;
    issueDate: string;
    isValid: boolean;
    certificateUrl: string;
}

export interface CertificateResponse {
    code: number;
    message: string;
    data: CertificateData;
}

export interface CertificatesResponse {
    code: number;
    message: string;
    data: CertificateData[];
}
