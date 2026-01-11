import { DashboardOutlined, CheckSquareOutlined } from '@ant-design/icons';

export const lecturerMenuItems = [
    { key: '/lecturer', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/lecturer/manage-projects', icon: <CheckSquareOutlined />, label: 'Quản lý Đề tài' },
];

export const lecturerBreadcrumbMap: Record<string, string> = {
    '/lecturer': 'Dashboard',
    '/lecturer/manage-projects': 'Quản lý đề tài',
};