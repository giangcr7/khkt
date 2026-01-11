import {
    DashboardOutlined,
    ProjectOutlined,
    ReadOutlined,
    BellOutlined
} from '@ant-design/icons';

export const studentMenuItems = [
    { key: '/student', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/student/my-project', icon: <ProjectOutlined />, label: 'Đề tài của tôi' },
    { key: '/student/resources', icon: <ReadOutlined />, label: 'Kho tài liệu' },
    { key: '/student/notifications', icon: <BellOutlined />, label: 'Thông báo' },
];

export const studentBreadcrumbMap: Record<string, string> = {
    '/student': 'Dashboard',
    '/student/my-project': 'Đề tài của tôi',
    '/student/resources': 'Tài liệu',
    '/student/notifications': 'Thông báo',
};