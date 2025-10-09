import { useEffect, useState } from "react";
import { message } from "antd";
import UserService from "~/services/userService";
import type { User } from "~/types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
  const res = await UserService.getUsers({ pageNo, pageSize, search });
  const page = res.data;
  setUsers(page?.items ?? []);
  setTotal(page?.totalElement ?? 0);
    } catch (error) {
      const err = error as unknown as { message?: string; response?: { status?: number; data?: unknown } };
      console.error("Failed to fetch users:", err);
      message.error(
        `Không tải được danh sách người dùng${err.response?.status ? ` (HTTP ${err.response.status})` : ""}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await UserService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      const err = error as unknown as { message?: string };
      console.error("Failed to delete user:", err);
      message.error("Xóa người dùng thất bại");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageNo, search]);

  return {
    users,
    loading,
    total,
    pageNo,
    search,
    setPageNo,
    setSearch,
    fetchUsers,
    handleDeleteUser,
  };
};
