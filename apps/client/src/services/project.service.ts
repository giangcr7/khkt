import api from './api';
import type { Project, CreateProjectDTO } from '../types/project.types';

export const projectService = {
    // 1. Lấy đề tài của tôi
    getMyProject: async () => {
        const response = await api.get<Project[]>('/projects');
        return response.data.length > 0 ? response.data[0] : null;
    },

    // 2. Đăng ký đề tài
    registerProject: async (data: CreateProjectDTO) => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },
    updateProject: async (id: number, data: { reportUrl?: string; slideUrl?: string }) => {
        const response = await api.patch<Project>(`/projects/${id}`, data);
        return response.data;
    }
};