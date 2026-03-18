import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            const cleanToken = token.trim().replace(/^"|"$/g, ''); 
            config.headers.Authorization = `Bearer ${cleanToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response, config } = error;
        if (response?.status === 401 && !config.url?.includes('/auth/login')) {
            console.warn('Unauthorized! Đang dọn dẹp và chuyển hướng...');
            localStorage.clear();
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;