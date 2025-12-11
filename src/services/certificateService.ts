import axiosInstance from '~/configs/axios';
import type { CertificateResponse, CertificatesResponse } from '~/types/certificate';

/**
 * Get certificate by ID
 * @param certificateId - The certificate ID
 */
export const getCertificateById = async (certificateId: string): Promise<CertificateResponse> => {
    const response = await axiosInstance.get<CertificateResponse>(`/certificates/${certificateId}`);
    return response.data;
};

/**
 * Get certificates by user ID
 * @param userId - The user ID
 */
export const getCertificatesByUserId = async (userId: string): Promise<CertificatesResponse> => {
    const response = await axiosInstance.get<CertificatesResponse>(`/certificates/user/${userId}`);
    return response.data;
};

/**
 * Get my certificates (current authenticated user)
 */
export const getMyCertificates = async (): Promise<CertificatesResponse> => {
    const response = await axiosInstance.get<CertificatesResponse>('/certificates/me');
    return response.data;
};
