import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    // BỎ headers mặc định ở đây để tránh xung đột với các request đặc biệt
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Xử lý triệt để dấu ngoặc kép và khoảng trắng dư thừa
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

        // CHỐNG VĂNG: Chỉ redirect nếu KHÔNG PHẢI là request đăng nhập
        // Nếu đang ở trang login mà gọi sai pass bị 401 thì không được clear storage
        if (response?.status === 401 && !config.url?.includes('/auth/login')) {
            console.warn('Unauthorized! Đang dọn dẹp và chuyển hướng...');
            localStorage.clear();
            // Xóa nốt Cookie rác nếu có thể (chỉ với cookie không HttpOnly)
            document.cookie.split(";").forEach((c) => {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;