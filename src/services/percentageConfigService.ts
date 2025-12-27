import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { PercentageConfig, UpdatePercentageConfigRequest } from "~/types/percentageConfig";

const PercentageConfigService = {
    // Get current percentage configuration
    // Note: Backend returns the object directly, not wrapped in ApiResponse
    async getConfig(): Promise<AxiosResponse<PercentageConfig>> {
        return axiosInstance.get("/percentages-config");
    },

    // Update percentage configuration
    async updateConfig(
        data: UpdatePercentageConfigRequest
    ): Promise<AxiosResponse<PercentageConfig>> {
        return axiosInstance.put("/percentages-config", data);
    },
};

export default PercentageConfigService;
