import { useState, useEffect, useCallback } from "react";
import type { PercentageConfig, UpdatePercentageConfigRequest } from "~/types/percentageConfig";
import PercentageConfigService from "~/services/percentageConfigService";
import { toast } from "~/components/common/Toast";

export const usePercentageConfig = () => {
    const [config, setConfig] = useState<PercentageConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await PercentageConfigService.getConfig();
            setConfig(response.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to fetch percentage configuration";
            setError(errorMessage);
            console.error("❌ Failed to fetch percentage config:", err);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateConfig = useCallback(async (data: UpdatePercentageConfigRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await PercentageConfigService.updateConfig(data);
            setConfig(response.data);
            toast.success("Percentage configuration updated successfully");
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to update percentage configuration";
            setError(errorMessage);
            console.error("Failed to update percentage config:", err);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        config,
        loading,
        error,
        fetchConfig,
        updateConfig,
    };
};
