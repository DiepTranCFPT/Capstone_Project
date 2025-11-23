import axiosInstance from "~/configs/axios";
import type { User, UserQueryParams, UserResponse } from "~/types/user";

// Định nghĩa nhanh kiểu Response trả về 1 item (để không phải tạo file mới)
interface SingleUserResponse {
  code: number;
  message: string;
  data: User;
}

const UserService = {
  // --- 1. User Management (Admin) ---

  // GET /users: Lấy danh sách (dùng UserResponse gốc của bạn)
  async getUsers(params: UserQueryParams): Promise<UserResponse> {
    const response = await axiosInstance.get<UserResponse>("/users", { params });
    return response.data;
  },

  // POST /users: Tạo user mới
  async registerUser(data: Partial<User>): Promise<SingleUserResponse> {
    const response = await axiosInstance.post<SingleUserResponse>("/users", data);
    return response.data;
  },

  // DELETE /users/{userId}
  async deleteUser(id: string): Promise<{ code: number; message: string }> {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  // GET /users/profile: Lấy profile theo ID (thường trả về 1 User)
  async getUserProfile(userId: string): Promise<SingleUserResponse> {
    // Thử endpoint /users/{userId} trước
    try {
      const response = await axiosInstance.get<SingleUserResponse>(`/users/${userId}`);
      return response.data;
    } catch (err) {
      // Nếu lỗi, thử endpoint cũ với query param
      const response = await axiosInstance.get<SingleUserResponse>("/users/profile", {
        params: { userId: userId }
      });
      return response.data;
    }
  },

  // --- 2. Current User (Me) ---

  // GET /users/me
  async getMe(): Promise<SingleUserResponse> {
    const response = await axiosInstance.get<SingleUserResponse>("/users/me");
    return response.data;
  },

  // PUT /users/me: Cập nhật profile
  async updateMe(data: Partial<User>): Promise<SingleUserResponse> {
    const response = await axiosInstance.put<SingleUserResponse>("/users/me", data);
    return response.data;
  },

  // --- 3. Avatar ---

  // POST /users/me/avatar
  async uploadAvatar(file: File): Promise<SingleUserResponse> {
    const formData = new FormData();
    formData.append("file", file); 

    const response = await axiosInstance.post<SingleUserResponse>("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // DELETE /users/me/avatar
  async deleteAvatar(): Promise<SingleUserResponse> {
    const response = await axiosInstance.delete<SingleUserResponse>("/users/me/avatar");
    return response.data;
  },

  // --- 4. Roles & Permissions (Admin) ---

  // PATCH /users/{userId}/roles
  async updateUserRoles(userId: string, roles: string[]): Promise<SingleUserResponse> {
    const response = await axiosInstance.patch<SingleUserResponse>(`/users/${userId}/roles`, { roles });
    return response.data;
  },

  // GET /users/{userId}/permissions
  // Trả về danh sách Permission, ta dùng inline type cho data
  async getUserPermissions(userId: string) {
    const response = await axiosInstance.get<{ code: number, message: string, data: unknown[] }>(`/users/${userId}/permissions`);
    return response.data;
  },

  // POST /users/{userId}/permissions/grant
  async grantPermission(userId: string, permissionName: string) {
    const response = await axiosInstance.post(`/users/${userId}/permissions/grant`, { permission: permissionName });
    return response.data;
  },

  // POST /users/{userId}/permissions/revoke
  async revokePermission(userId: string, permissionName: string) {
    const response = await axiosInstance.post(`/users/${userId}/permissions/revoke`, { permission: permissionName });
    return response.data;
  },
};

export default UserService;