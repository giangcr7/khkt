import api from './api';
import type { LoginDTO, RegisterDTO, AuthResponse } from '../types/auth.types';

export const authService = {
    // Đăng nhập
    login: async (data: LoginDTO) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    // Đăng ký
    register: async (data: RegisterDTO) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Lưu thông tin xác thực vào LocalStorage
     * @param token Chuỗi JWT Access Token
     * @param role Vai trò người dùng (STUDENT, LECTURER, ADMIN)
     * @param user Đối tượng thông tin chi tiết người dùng
     */
  saveToken(token: string, role: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role); // LƯU TRỰC TIẾP, không JSON.stringify
    localStorage.setItem('user', JSON.stringify(user)); // Object thì mới stringify
},
    // Đăng xuất và dọn dẹp bộ nhớ
    logout: () => {
        localStorage.clear(); // Xóa tất cả để tránh xung đột dữ liệu cũ
        window.location.href = '/';
    }
};