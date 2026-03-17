import {
    DashboardOutlined,ProjectOutlined,
    CalendarOutlined, QuestionCircleOutlined, FileTextOutlined,
    FolderOpenOutlined, TagsOutlined, UserOutlined
} from '@ant-design/icons';

export const adminMenuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
    { key: '/admin/manage-projects', icon: <ProjectOutlined />, label: 'Quản lý Đề tài' },
    { key: '/admin/manage-events', icon: <CalendarOutlined />, label: 'Quản lý lộ trình' },
    { key: '/admin/manage-faq', icon: <QuestionCircleOutlined />, label: 'Quản lý FAQ' },
    { key: '/admin/manage-news', icon: <FileTextOutlined />, label: 'Quản lý Tin tức' },
    { key: '/admin/manage-resources', icon: <FolderOpenOutlined />, label: 'Quản lý Tài liệu' },
    { key: '/admin/manage-topics', icon: <TagsOutlined />, label: 'Quản lý Lĩnh vực' },
    { key: '/admin/user-management', icon: <UserOutlined />, label: 'Quản lý Người dùng' },
];