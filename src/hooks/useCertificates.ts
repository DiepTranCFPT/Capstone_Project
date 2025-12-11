import { useState, useCallback } from 'react';
import type { CertificateData } from '~/types/certificate';
import { getCertificateById, getCertificatesByUserId, getMyCertificates } from '~/services/certificateService';

export const useCertificates = () => {
    const [certificates, setCertificates] = useState<CertificateData[]>([]);
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch certificate by ID
     */
    const fetchCertificateById = useCallback(async (certificateId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getCertificateById(certificateId);
            if (response.code === 1000) {
                setCertificate(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch certificate');
                return null;
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch certificates by user ID
     */
    const fetchCertificatesByUserId = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getCertificatesByUserId(userId);
            if (response.code === 1000) {
                setCertificates(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch certificates');
                return [];
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch my certificates (current user)
     */
    const fetchMyCertificates = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getMyCertificates();
            if (response.code === 1000) {
                setCertificates(response.data);
                return response.data;
            } else {
                setError(response.message || 'Failed to fetch certificates');
                return [];
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Clear certificates state
     */
    const clearCertificates = useCallback(() => {
        setCertificates([]);
        setCertificate(null);
    }, []);

    return {
        certificates,
        certificate,
        isLoading,
        error,
        fetchCertificateById,
        fetchCertificatesByUserId,
        fetchMyCertificates,
        clearError,
        clearCertificates
    };
};
