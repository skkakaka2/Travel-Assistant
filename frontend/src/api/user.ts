import request from "@/utils/request";
import type { ApiResponse, User, SetHomeDto, UpdateUserDto } from "@/types/api";

export const userApi = {
  // 获取当前用户信息
  getCurrentUser() {
    return request.get<ApiResponse<User>>("/user/me");
  },

  // 更新用户信息
  update(id: number, data: UpdateUserDto) {
    return request.patch<ApiResponse<User>>(`/user/${id}`, data);
  },

  // 设置家地址
  setHome(data: SetHomeDto) {
    return request.post<ApiResponse<User>>("/user/set-home", data);
  },

  hasHome() {
    return request.get<ApiResponse<boolean>>("/user/has-home");
  },
};
