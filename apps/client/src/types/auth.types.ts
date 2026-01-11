// Đường dẫn: apps/client/src/types/auth.types.ts

// 1. Thêm chữ export
export interface LoginDTO {
    email: string;
    password: string;
}

// 2. Thêm chữ export
export interface RegisterDTO {
    email: string;
    password: string;
    fullName: string;
}

// 3. QUAN TRỌNG: Thêm chữ export ở đây thì file service mới import được
export interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    };
}