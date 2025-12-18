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
  updateCommunity(
    communityId: string | number,
    payload: CommunityUpdatePayload
  ): Promise<AxiosResponse<ApiResponse<Community>>> {
    const formData = new FormData();

    // Gửi file qua form-data, text qua query params để tránh duplicate ở BE
    if (payload.avatar) {
      formData.append("avatar", payload.avatar);
    }
    if (payload.bannerImage) {
      formData.append("bannerImage", payload.bannerImage);
    }
    
    const params = new URLSearchParams();
    if (payload.name) {
      params.append("name", payload.name);
    }
    if (payload.description !== undefined) {
      params.append("description", payload.description || "");
    }
    if (payload.privacy) {
      params.append("privacy", payload.privacy);
    }
    
    return axiosInstance.put(`/communities/${communityId}?${params.toString()}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // DELETE /communities/{communityId}
  // Xóa một community theo ID
  deleteCommunity(
    communityId: string | number
  ): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/communities/${communityId}`);
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

  // POST /communities
  // Tạo community mới
  // API yêu cầu: name, description (query params), subjectId (optional), image (multipart/form-data)
  createCommunity(
    payload: {
      name: string;
      description: string;
      subjectId?: string | number;
      image?: File;
    }
  ): Promise<AxiosResponse<ApiResponse<Community>>> {
    const formData = new FormData();
    if (payload.image) {
      formData.append("image", payload.image);
    }

    const params = new URLSearchParams();
    params.append("name", payload.name);
    params.append("description", payload.description);
    if (payload.subjectId) {
      params.append("subjectId", String(payload.subjectId));
    }

    return axiosInstance.post(`/communities?${params.toString()}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
  // BE yêu cầu: postId (path), content & parentCommentId (query), image (multipart/form-data body)
  // Lưu ý: BE luôn mong đợi multipart/form-data, kể cả khi không có image thì cũng gửi empty image field
  createPostComment(
    postId: string | number,
    payload: CreateCommunityCommentPayload
  ): Promise<AxiosResponse<ApiResponse<CommunityComment>>> {
    const { content, parentCommentId, image } = payload;

    // Query params: content, parentCommentId (optional)
    const params: Record<string, string | number> = {};
    if (content) params.content = content;
    if (parentCommentId !== undefined && parentCommentId !== null) {
      params.parenCommentId = parentCommentId; // BE dùng tên "parenCommentId" (thiếu chữ 't')
    }

    // Body: luôn gửi FormData với multipart/form-data (theo Swagger: -F 'image=')
    const formData = new FormData();
    if (image) {
      formData.append("image", image);
    } else {
      // Gửi empty image field như Swagger yêu cầu
      formData.append("image", "");
    }

    return axiosInstance.post(`/posts/${postId}/comments`, formData, {
      params,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // PUT /comments/{commentId}
  // BE yêu cầu: gửi string trực tiếp trong body (ví dụ: "hay"), không phải object { content: "hay" }
  // Content-Type: application/json
  updateComment(
    commentId: string | number,
    payload: Partial<CreateCommunityCommentPayload>
  ): Promise<AxiosResponse<ApiResponse<CommunityComment>>> {
    // Gửi string content trực tiếp trong body (theo Swagger: -d '"hay"')
    const content = payload.content || "";
    return axiosInstance.put(`/comments/${commentId}`, content, {
      headers: {
        "Content-Type": "application/json",
      },
    });
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

  // POST /posts/{postId}/vote
  // Vote / like một bài viết
  // Swagger: required query param `value` (integer)
  votePost(
    postId: string | number,
    value: number
  ): Promise<AxiosResponse<ApiResponse<CommunityPost>>> {
    return axiosInstance.post(`/posts/${postId}/vote`, null, {
      params: { value },
    });
  },

  // DELETE /posts/{postId}
  // Xóa bài viết
  deletePost(
    postId: string | number
  ): Promise<AxiosResponse<ApiResponse<null>>> {
    return axiosInstance.delete(`/posts/${postId}`);
  },

  // PUT /posts/{postId}/pin
  // Pin/Unpin một bài viết (chỉ admin)
  pinPost(
    postId: string | number
  ): Promise<AxiosResponse<ApiResponse<CommunityPost>>> {
    return axiosInstance.put(`/posts/${postId}/pin`);
  },
};

export default CommunityService;


