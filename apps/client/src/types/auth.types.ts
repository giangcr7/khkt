export interface LoginDTO {
    email: string;
    password: string;
}
export interface RegisterDTO {
    email: string;
    password: string;
    fullName: string;
}
export interface AuthResponse {
    accessToken: string;
    user: {
        id: number;
        email: string;
        fullName: string;
        role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    };
}