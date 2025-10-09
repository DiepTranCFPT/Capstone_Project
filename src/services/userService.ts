
import axiosInstance from "~/configs/axios";
import type { UserQueryParams, UserResponse } from "~/types/user";


const UserService = {
  async getUsers(params: UserQueryParams): Promise<UserResponse> {
    const response = await axiosInstance.get<UserResponse>("/users", { params });
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },
};

export default UserService;
