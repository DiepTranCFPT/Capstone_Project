import { useState, useEffect, useCallback } from "react";
import LearningMaterialService from "~/services/learningMaterialService";
import { useAuth } from "~/hooks/useAuth";
import type { LearningMaterial, PageInfo, LearningMaterialQuery } from "~/types/learningMaterial";

export const useRegisteredMaterials = () => {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRegisteredMaterials = useCallback(async (query?: LearningMaterialQuery) => {
    // Không gọi API nếu chưa đăng nhập
    if (!user) {
      setMaterials([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Try multiple approaches: with params, without params, different page sizes
      let queryParams = query;
      
      // If no query provided, try without params first (some APIs don't need pagination)
      if (!queryParams) {
        console.log("🔍 Trying GET /learning-materials/registered without params");
        try {
          const response = await LearningMaterialService.getRegistered();
          const responseData = response.data?.data;
          if (Array.isArray(responseData) && responseData.length > 0) {
            console.log("✅ Got materials without params:", responseData.length);
            setMaterials(responseData);
            setLoading(false);
            return;
          } else if (responseData && typeof responseData === "object") {
            const pageInfo = responseData as PageInfo<LearningMaterial>;
            const items = pageInfo.items || pageInfo.content || [];
            if (items.length > 0) {
              console.log("✅ Got materials without params (PageInfo):", items.length);
              setMaterials(Array.isArray(items) ? items : []);
              setLoading(false);
              return;
            }
          }
        } catch {
          console.log("⚠️ Failed without params, trying with params");
        }
        
        // If that didn't work, try with default pagination
        queryParams = { pageNo: 0, pageSize: 100 };
      }
      
      console.log("🔍 Fetching registered materials for user:", user?.id, "with params:", queryParams);
      
      const response = await LearningMaterialService.getRegistered(queryParams);
      
      console.log("🔍 Registered Materials API Response:", {
        url: response.config?.url,
        method: response.config?.method,
        status: response.status,
        statusText: response.statusText,
        queryParams,
        fullResponse: response,
        responseData: response.data,
        nestedData: response.data?.data,
        type: typeof response.data?.data,
        isArray: Array.isArray(response.data?.data),
        keys: response.data?.data && typeof response.data?.data === "object" 
          ? Object.keys(response.data.data) 
          : [],
      });
      
      const responseData = response.data?.data;
      
      // Handle PageInfo format (with items/content) or direct array
      if (Array.isArray(responseData)) {
        console.log("✅ Response is array, count:", responseData.length);
        setMaterials(responseData);
      } else if (responseData && typeof responseData === "object") {
        // Check if it's a PageInfo object
        const pageInfo = responseData as PageInfo<LearningMaterial>;
        const items = pageInfo.items || pageInfo.content || [];
        console.log("✅ Response is PageInfo:", {
          pageNo: pageInfo.pageNo,
          pageSize: pageInfo.pageSize,
          totalElement: pageInfo.totalElement,
          totalElements: pageInfo.totalElements,
          itemsCount: Array.isArray(items) ? items.length : 0,
          hasItems: !!pageInfo.items,
          hasContent: !!pageInfo.content,
          items: items,
        });
        
        // If totalElement > 0 but items is empty, might be pagination issue
        if (pageInfo.totalElement > 0 && items.length === 0) {
          console.warn("⚠️ Backend reports", pageInfo.totalElement, "items but returned empty array. This might be a backend issue.");
        }
        
        // Log if we got empty result but user has registered materials
        if (pageInfo.totalElement === 0 && items.length === 0) {
          console.warn("⚠️ No registered materials found. This could mean:");
          console.warn("   1. User hasn't registered any materials yet");
          console.warn("   2. Backend query is not finding registered materials");
          console.warn("   3. There might be a mismatch between registration and query endpoints");
          console.warn("   User ID:", user?.id);
        }
        
        setMaterials(Array.isArray(items) ? items : []);
      } else {
        console.warn("⚠️ Unexpected response format:", responseData);
        setMaterials([]);
      }
    } catch (err) {
      console.error("❌ Error fetching registered materials:", err);
      const axiosError = err as { 
        response?: { 
          data?: { 
            message?: string;
            code?: number;
          };
          status?: number;
        } 
      };
      
      const errorMessage = 
        axiosError.response?.data?.message || 
        `Failed to load registered materials (Status: ${axiosError.response?.status || "unknown"})`;
      
      console.error("Error details:", {
        status: axiosError.response?.status,
        code: axiosError.response?.data?.code,
        message: axiosError.response?.data?.message,
      });
      
      setError(errorMessage);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    // Chỉ gọi API khi đã có user
    if (user) {
      fetchRegisteredMaterials();
    } else {
      // Reset state khi chưa login
      setMaterials([]);
      setLoading(false);
      setError(null);
    }
  }, [fetchRegisteredMaterials, user]);

  return {
    materials,
    loading,
    error,
    refetch: fetchRegisteredMaterials,
  };
};

