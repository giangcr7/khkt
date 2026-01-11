export interface Project {
    mentor: any;
    reportUrl: any;
    slideUrl: any;
    score: any;
    feedback: string;
    id: number;
    name: string;
    topic?: string;
    description?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
    studentId: number;
    mentorId?: number;
    createdAt: string;
}

export interface CreateProjectDTO {
    name: string;
    topic: string;
    description: string;
    mentorId: number; // ID của giảng viên muốn đăng ký
}