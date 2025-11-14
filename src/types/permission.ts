import type { ApiResponse } from '~/types/api';
import type { User } from './auth';

/**
 * Định nghĩa cho một quyền (Permission)
 */
export interface Permission {
  name: string;
  description: string;
}

/**
 * Payload để tạo một quyền mới
 */
export interface NewPermissionPayload {
  name: string;
  description: string;
}

// --- API Response Types ---

/**
 * Kiểu dữ liệu trả về cho API lấy danh sách quyền
 * GET /permissions
 */
export type PermissionListResponse = ApiResponse<Permission[]>;

/**
 * Kiểu dữ liệu trả về cho API tạo mới một quyền
 * POST /permissions
 */
export type SinglePermissionResponse = ApiResponse<Permission>;

/**
 * Kiểu dữ liệu trả về cho API xóa một quyền
 * DELETE /permissions/{permission}
 * (data trả về là một chuỗi message)
 */
export type DeletePermissionResponse = ApiResponse<string>;

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Payload để gán/thu hồi quyền cho vai trò
 * POST /roles/{roleName}/permissions
 * DELETE /roles/{roleName}/permissions
 */
export interface RolePermissionPayload {
  permissionNames: string[];
}

/**
 * Kiểu dữ liệu trả về cho API gán/thu hồi quyền
 */
export type RolePermissionResponse = ApiResponse<Role>;

export type UserPermissionResponse = ApiResponse<User>;

/**
 * Kiểu dữ liệu trả về cho API lấy quyền của user
 * GET /users/{userId}/permissions
 */
export type UserPermissionsResponse = ApiResponse<Permission[]>;
