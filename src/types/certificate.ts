// Certificate API response types

export interface CertificateData {
    id: string;
    certificateNumber: string;
    userId: string;
    subjectId: string;
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
