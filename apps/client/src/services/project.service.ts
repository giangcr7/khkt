import api from './api';
import type { Project, CreateProjectDTO } from '../types/project.types';

export const projectService = {
    // 1. Lấy đề tài của tôi
    getMyProject: async () => {
        const response = await api.get<Project[]>('/projects');
        // Backend trả về mảng, ta lấy phần tử đầu tiên (vì sinh viên chỉ có 1 đề tài active)
        return response.data.length > 0 ? response.data[0] : null;
    },

    // 2. Đăng ký đề tài
    registerProject: async (data: CreateProjectDTO) => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    // 3. Nộp báo cáo (Cập nhật link) - MỚI
    updateProject: async (id: number, data: { reportUrl?: string; slideUrl?: string }) => {
        const response = await api.patch<Project>(`/projects/${id}`, data);
        return response.data;
    }
};