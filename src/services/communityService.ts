// src/services/communityService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse, PaginatedResponse } from "~/types/api";
import type {
  Community,
  CommunityPost,
  CommunityUpdatePayload,
  CreateCommunityPostPayload,
  CommunityQueryParams,
  CommunitySearchParams,
} from "~/types/community";

const CommunityService = {
  // PUT /communities/{communityId}
  // Cập nhật thông tin community
  updateCommunity(
    communityId: string | number,
    payload: CommunityUpdatePayload
  ): Promise<AxiosResponse<ApiResponse<Community>>> {
    return axiosInstance.put(`/communities/${communityId}`, payload);
  },

  // GET /communities/{communityId}/posts
  // Lấy danh sách bài viết theo community
  getCommunityPosts(
    communityId: string | number,
    params?: CommunityQueryParams
  ): Promise<
    AxiosResponse<ApiResponse<PaginatedResponse<CommunityPost> | CommunityPost[]>>
  > {
    return axiosInstance.get(`/communities/${communityId}/posts`, {
      params,
    });
  },

  // POST /communities/{communityId}/posts
  // Tạo bài viết mới trong community
  createCommunityPost(
    communityId: string | number,
    payload: CreateCommunityPostPayload
  ): Promise<AxiosResponse<ApiResponse<CommunityPost>>> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("content", payload.content);
    if (payload.image) {
      formData.append("image", payload.image);
    }

    return axiosInstance.post(
      `/communities/${communityId}/posts`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  // GET /communities
  // Lấy danh sách community (có thể phân trang tuỳ BE)
  getCommunities(
    params?: CommunityQueryParams
  ): Promise<
    AxiosResponse<ApiResponse<PaginatedResponse<Community> | Community[]>>
  > {
    return axiosInstance.get(`/communities`, { params });
  },

  // GET /communities/search
  // Tìm kiếm community
  searchCommunities(
    params?: CommunitySearchParams
  ): Promise<
    AxiosResponse<ApiResponse<PaginatedResponse<Community> | Community[]>>
  > {
    return axiosInstance.get(`/communities/search`, { params });
  },
};

export default CommunityService;


