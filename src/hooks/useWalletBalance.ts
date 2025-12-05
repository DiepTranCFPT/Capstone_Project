import { useState, useEffect, useCallback } from "react";
import MomoPaymentService from "~/services/MomoPaymentService";
import type { WalletBalanceSummary } from "~/types/momoPayment";

interface UseWalletBalanceReturn {
    balance: number | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook to fetch user's wallet/token balance from the API
 */
export function useWalletBalance(): UseWalletBalanceReturn {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await MomoPaymentService.getPaymentbyUser();
            const data: WalletBalanceSummary = response.data.data;

            // Handle different response formats
            let tokenBalance: number;
            if (typeof data === "number") {
                tokenBalance = data;
            } else if (data && typeof data === "object") {
                // Try different possible properties
                tokenBalance = data.balance ??
                    data.walletBalance ??
                    data.availableBalance ??
                    data.totalAmount ??
                    data.amount ??
                    0;
            } else {
                tokenBalance = 0;
            }

            setBalance(tokenBalance);
        } catch (err) {
            console.error("Error fetching wallet balance:", err);
            setError("Không thể tải số dư token");
            setBalance(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        loading,
        error,
        refetch: fetchBalance,
    };
}

export default useWalletBalance;
