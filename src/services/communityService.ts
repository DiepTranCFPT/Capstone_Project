// src/services/communityService.ts
import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse, PaginatedResponse } from "~/types/api";
import type {
  Community,
  CommunityPost,
  CommunityComment,
  CommunityUpdatePayload,
  CreateCommunityPostPayload,
  CreateCommunityCommentPayload,
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

  // ===== Post / Comment controller APIs (post-controller & comment-controller) =====

  // GET /posts/{postId}/comments
  getPostComments(
    postId: string | number
  ): Promise<AxiosResponse<ApiResponse<CommunityComment[]>>> {
    return axiosInstance.get(`/posts/${postId}/comments`);
  },

  // POST /posts/{postId}/comments
  createPostComment(
    postId: string | number,
    payload: CreateCommunityCommentPayload
  ): Promise<AxiosResponse<ApiResponse<CommunityComment>>> {
    return axiosInstance.post(`/posts/${postId}/comments`, payload);
  },

  // PUT /comments/{commentId}
  updateComment(
    commentId: string | number,
    payload: Partial<CreateCommunityCommentPayload>
  ): Promise<AxiosResponse<ApiResponse<CommunityComment>>> {
    return axiosInstance.put(`/comments/${commentId}`, payload);
  },

  // DELETE /comments/{commentId}
  deleteComment(
    commentId: string | number
  ): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/comments/${commentId}`);
  },

  // GET /comments/{commentId}/replies
  getCommentReplies(
    commentId: string | number
  ): Promise<AxiosResponse<ApiResponse<CommunityComment[]>>> {
    return axiosInstance.get(`/comments/${commentId}/replies`);
  },
};

export default CommunityService;


