import axios from 'axios';

// Tạo một instance của axios
const api = axios.create({
    // Lấy URL từ biến môi trường hoặc mặc định là localhost:3000
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Trước khi gửi request đi
api.interceptors.request.use(
    (config) => {
        // SỬA: Lấy đúng key 'token' thay vì 'accessToken'
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý lỗi trả về
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // SỬA: Xóa đúng các key đã lưu trong authService
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;