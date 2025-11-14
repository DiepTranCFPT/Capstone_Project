import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import PermissionService from '~/services/permissionService';
import type {
  Permission,
  NewPermissionPayload,
  Role,
  RolePermissionPayload,
} from '~/types/permission';
import type { ApiResponse } from '~/types/api';
import { toast } from '~/components/common/Toast';

/**
 * Hook để quản lý state của Permissions
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm state cho quyền của vai trò
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // Thêm state cho quyền của user
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  /**
   * Hàm xử lý lỗi chung
   */
  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
    const apiMessage = e.response?.data?.message;
    const msg = apiMessage || e.message || defaultMessage;
    setError(msg);
    toast.error(msg);
  };

  /**
   * Lấy danh sách tất cả các quyền
   */
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await PermissionService.getAll();
      if (res.data.code === 0 || res.data.code === 1000) {
        setPermissions(res.data.data || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch permissions');
      }
    } catch (err) {
      handleError(err, 'Không thể tải danh sách quyền');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy danh sách quyền cho một vai trò cụ thể
   */
  const fetchPermissionsForRole = useCallback(async (roleName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await PermissionService.getPermissionsForRole(roleName);
      if (res.data.code === 0 || res.data.code === 1000) {
        setRolePermissions(res.data.data || []);
      } else {
        throw new Error(res.data.message || 'Failed to fetch role permissions');
      }
    } catch (err) {
      handleError(err, 'Không thể tải danh sách quyền cho vai trò');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy danh sách quyền cho một user cụ thể
   */
  const fetchPermissionsForUser = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await PermissionService.getPermissionsForUser(userId);
      if (res.data.code === 0 || res.data.code === 1000) {
        setUserPermissions(res.data.data || []);
        setCurrentUserId(userId);
      } else {
        throw new Error(res.data.message || 'Failed to fetch user permissions');
      }
    } catch (err) {
      handleError(err, 'Không thể tải danh sách quyền cho user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo một quyền mới
   */
  const createPermission = useCallback(
    async (data: NewPermissionPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PermissionService.create(data);
        if (res.data.code === 0 || res.data.code === 1000) {
          message.success('Tạo quyền mới thành công!');
          // Thêm quyền mới vào danh sách state
          setPermissions((prev) => [...prev, res.data.data]);
        } else {
          throw new Error(res.data.message || 'Failed to create permission');
        }
      } catch (err) {
        handleError(err, 'Không thể tạo quyền mới');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Xóa một quyền
   */
  const deletePermission = useCallback(async (permissionName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await PermissionService.delete(permissionName);
      if (res.data.code === 0 || res.data.code === 1000) {
        toast.success('Xóa quyền thành công!');
        // Xóa quyền khỏi danh sách state
        setPermissions((prev) =>
          prev.filter((p) => p.name !== permissionName)
        );
      } else {
        throw new Error(res.data.message || 'Failed to delete permission');
      }
    } catch (err) {
      handleError(err, 'Không thể xóa quyền');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gán quyền cho một vai trò
   */
  const assignPermissions = useCallback(
    async (roleName: string, data: RolePermissionPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PermissionService.assignPermissionsToRole(roleName, data);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success('Gán quyền thành công!');
          setCurrentRole(res.data.data);
          // Tải lại danh sách quyền cho vai trò này
          await fetchPermissionsForRole(roleName);
        } else {
          throw new Error(res.data.message || 'Failed to assign permissions');
        }
      } catch (err) {
        handleError(err, 'Không thể gán quyền');
      } finally {
        setLoading(false);
      }
    },
    [fetchPermissionsForRole] // Thêm dependency
  );

  /**
   * Gán quyền cho một user
   */
  const assignPermissionsToUser = useCallback(
    async (userId: string, permissionNames: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PermissionService.assignPermissionsToUser(userId, permissionNames);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success('Gán quyền cho user thành công!');

        } else {
          throw new Error(res.data.message || 'Failed to assign user permissions');
        }
      } catch (err) {
        handleError(err, 'Không thể gán quyền cho user');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Thu hồi quyền từ một vai trò
   */
  const revokePermissions = useCallback(
    async (roleName: string, data: RolePermissionPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PermissionService.revokePermissionsFromRole(roleName, data);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success('Thu hồi quyền thành công!');
          setCurrentRole(res.data.data);
          // Tải lại danh sách quyền cho vai trò này
          await fetchPermissionsForRole(roleName);
        } else {
          throw new Error(res.data.message || 'Failed to revoke permissions');
        }
      } catch (err) {
        handleError(err, 'Không thể thu hồi quyền');
      } finally {
        setLoading(false);
      }
    },
    [fetchPermissionsForRole] // Thêm dependency
  );

  /**
   * Thu hồi quyền từ một user
   */
  const revokePermissionsFromUser = useCallback(
    async (userId: string, permissionNames: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await PermissionService.revokePermissionsFromUser(userId, permissionNames);
        if (res.data.code === 0 || res.data.code === 1000) {
          toast.success('Thu hồi quyền của user thành công!');
        } else {
          throw new Error(res.data.message || 'Failed to revoke user permissions');
        }
      } catch (err) {
        handleError(err, 'Không thể thu hồi quyền của user');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Tải danh sách quyền khi hook được mount
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    rolePermissions,
    userPermissions, // Thêm
    currentRole,
    currentUserId, // Thêm
    loading,
    error,
    fetchPermissions,
    createPermission,
    deletePermission,
    fetchPermissionsForRole,
    fetchPermissionsForUser, // Thêm
    assignPermissions,
    revokePermissions,
    assignPermissionsToUser, // Thêm
    revokePermissionsFromUser, // Thêm
  };
};

export default usePermissions;
