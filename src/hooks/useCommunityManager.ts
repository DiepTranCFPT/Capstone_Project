import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import type { Community } from "~/types/community";
import type { ApiResponse } from "~/types/api";
import CommunityService from "~/services/communityService";

/**
 * Helper function để normalize text và loại bỏ duplicate
 * Ví dụ: "Common Community, Common Community" -> "Common Community"
 */
const normalizeText = (text: string): string => {
  if (!text || typeof text !== "string") return "";
  // Loại bỏ duplicate nếu có format "text, text" hoặc "text,text"
  const parts = text.split(/,\s*/).map(s => s.trim()).filter(s => s);
  return Array.from(new Set(parts)).join(", ");
};

/**
 * Normalize một community object, loại bỏ duplicate text trong name và description
 */
const normalizeCommunity = (community: Community): Community => {
  const rawName = typeof community.name === "string" ? community.name : String(community.name || "");
  const rawDesc = typeof community.description === "string" 
    ? community.description 
    : String(community.description || "");
  
  const normalizedName = normalizeText(rawName);
  const normalizedDesc = normalizeText(rawDesc);
  
  return {
    ...community,
    name: normalizedName,
    description: normalizedDesc,
  };
};

/**
 * Loại bỏ duplicate communities dựa trên id và normalize data
 */
const deduplicateCommunities = (communities: Community[]): Community[] => {
  const communitiesMap = new Map<string | number, Community>();
  
  communities.forEach((community, index) => {
    if (community && community.id !== undefined && community.id !== null) {
      const idKey = String(community.id);
      if (!communitiesMap.has(idKey)) {
        const normalized = normalizeCommunity(community);
        communitiesMap.set(idKey, normalized);
        
        // Log nếu phát hiện duplicate text
        const rawName = typeof community.name === "string" ? community.name : String(community.name || "");
        const rawDesc = typeof community.description === "string" 
          ? community.description 
          : String(community.description || "");
        
        if (rawName !== normalized.name) {
          console.warn(`Found duplicate name for community ${idKey}: "${rawName}" -> "${normalized.name}"`);
        }
        if (rawDesc !== normalized.description) {
          const normalizedDesc = normalized.description || "";
          console.warn(`Found duplicate description for community ${idKey}: "${rawDesc.substring(0, 50)}..." -> "${normalizedDesc.substring(0, 50)}..."`);
        }
      } else {
        console.warn(`Duplicate community row found with id: ${community.id} at index ${index}`);
        // Nếu đã tồn tại, so sánh và giữ lại version tốt hơn
        const existing = communitiesMap.get(idKey);
        if (existing) {
          const rawName = typeof community.name === "string" ? community.name : String(community.name || "");
          const existingName = existing.name || "";
          if (normalizeText(rawName).length < normalizeText(existingName).length) {
            // Giữ lại version cũ nếu nó ngắn hơn (ít duplicate hơn)
            return;
          }
        }
        // Cập nhật với version mới đã normalize
        communitiesMap.set(idKey, normalizeCommunity(community));
      }
    }
  });

  return Array.from(communitiesMap.values());
};

export const useCommunityManager = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<Community[]>([]);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CommunityService.getCommunities({ page: 0, size: 100 });
      const apiResponse = response.data as ApiResponse<unknown>;
      const data = apiResponse.data;

      let communitiesList: Community[] = [];
      if (Array.isArray(data)) {
        communitiesList = data as Community[];
      } else if (data && typeof data === "object" && "items" in data) {
        const paginated = data as { items: Community[] };
        communitiesList = paginated.items || [];
      }

      // Loại bỏ duplicate và normalize data
      const uniqueCommunities = deduplicateCommunities(communitiesList);
      console.log(`Fetched ${communitiesList.length} communities, normalized to ${uniqueCommunities.length} unique communities`);

      setCommunities(uniqueCommunities);
      setFilteredData(uniqueCommunities);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      message.error("Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const applyFilters = useCallback((search: string) => {
    const filtered = communities.filter((community) => {
      if (!community) return false;
      const name = community.name || "";
      const description = community.description || "";
      const searchLower = search.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
    setFilteredData(filtered);
  }, [communities]);

  useEffect(() => {
    applyFilters(searchText);
  }, [communities, searchText, applyFilters]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value);
  };

  return {
    communities,
    setCommunities,
    loading,
    searchText,
    filteredData,
    fetchCommunities,
    handleSearch,
  };
};

