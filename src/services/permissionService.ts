import type { AxiosResponse } from 'axios';
import axiosInstance from '~/configs/axios';
import type {
  PermissionListResponse,
  SinglePermissionResponse,
  DeletePermissionResponse,
  NewPermissionPayload,
  RolePermissionPayload,
  RolePermissionResponse,
  UserPermissionResponse,
  UserPermissionsResponse,
} from '~/types/permission';

/**
 * Service để quản lý API Permissions
 */
const PermissionService = {
  /**
   * Lấy tất cả các quyền
   * GET /permissions
   */
  getAll: (): Promise<AxiosResponse<PermissionListResponse>> => {
    return axiosInstance.get('/permissions');
  },

  /**
   * Tạo một quyền mới
   * POST /permissions
   */
  create: (
    data: NewPermissionPayload
  ): Promise<AxiosResponse<SinglePermissionResponse>> => {
    return axiosInstance.post('/permissions', data);
  },

  /**
   * Xóa một quyền bằng tên
   * DELETE /permissions/{permissionName}
   */
  delete: (
    permissionName: string
  ): Promise<AxiosResponse<DeletePermissionResponse>> => {
    // Đảm bảo mã hóa tên quyền nếu nó chứa ký tự đặc biệt
    return axiosInstance.delete(`/permissions/${encodeURIComponent(permissionName)}`);
  },

  getPermissionsForRole: (
    roleName: string
  ): Promise<AxiosResponse<PermissionListResponse>> => {
    return axiosInstance.get(
      `/roles/${encodeURIComponent(roleName)}/permissions`
    );
  },

  /**
   * Gán một hoặc nhiều quyền cho vai trò
   * POST /roles/{roleName}/permissions
   */
  assignPermissionsToRole: (
    roleName: string,
    data: RolePermissionPayload
  ): Promise<AxiosResponse<RolePermissionResponse>> => {
    return axiosInstance.post(
      `/roles/${encodeURIComponent(roleName)}/permissions`,
      data
    );
  },

  /**
   * Thu hồi một hoặc nhiều quyền từ vai trò
   * DELETE /roles/{roleName}/permissions
   */
  revokePermissionsFromRole: (
    roleName: string,
    data: RolePermissionPayload
  ): Promise<AxiosResponse<RolePermissionResponse>> => {
    return axiosInstance.delete(
      `/roles/${encodeURIComponent(roleName)}/permissions`,
      { data } // DELETE request với body cần đưa vào 'data' property
    );
  },

  /**
   * Gán một hoặc nhiều quyền cho user
   * POST /users/{userId}/permissions
   */
  assignPermissionsToUser: (
    userId: string,
    permissionNames: string[] // Truyền thẳng array
  ): Promise<AxiosResponse<UserPermissionResponse>> => {
    return axiosInstance.post(
      `/users/${encodeURIComponent(userId)}/permissions/grant`,
      permissionNames
    );
  },

  /**
   * Lấy quyền của một user cụ thể
   * GET /users/{userId}/permissions
   */
  getPermissionsForUser: (
    userId: string
  ): Promise<AxiosResponse<UserPermissionsResponse>> => {
    return axiosInstance.get(
      `/users/${encodeURIComponent(userId)}/permissions`
    );
  },

  /**
   * Thu hồi một hoặc nhiều quyền từ user
   * DELETE /users/{userId}/permissions
   */
  revokePermissionsFromUser: (
    userId: string,
    permissionNames: string[] // Truyền thẳng array
  ): Promise<AxiosResponse<UserPermissionResponse>> => {
    return axiosInstance.post(
      `/users/${encodeURIComponent(userId)}/permissions/revoke`,
       permissionNames  // DELETE request với body là array
    );
  },

};

export default PermissionService;
