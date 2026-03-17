import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Dropdown, Tag, Avatar, Badge, message } from 'antd';
import {
    HomeOutlined, DashboardOutlined, UserOutlined, LogoutOutlined,
    RocketOutlined, CalendarOutlined, ReadOutlined, FileSearchOutlined,
    ProjectOutlined, TeamOutlined, QuestionCircleOutlined, InfoCircleOutlined,
    BellOutlined // Import thêm icon chuông
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
    const [unreadCount, setUnreadCount] = useState(0); // State quản lý số thông báo chưa đọc

    // Hàm lấy số lượng thông báo chưa đọc
    const fetchUnreadNotis = async () => {
        if (!localStorage.getItem('token')) return;
        try {
            // Gọi API lấy thông báo của tôi
            const res = await api.get('/notifications/my');
            const unread = res.data.filter((n: any) => !n.isRead).length; // Lọc các thông báo có isRead = false
            setUnreadCount(unread);
        } catch (error) {
            console.error("Lỗi tải thông báo Navbar");
        }
    };

    useEffect(() => {
        setRole(localStorage.getItem('role'));
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        
        // Chỉ lấy thông báo nếu người dùng đã đăng nhập
        if (localStorage.getItem('token')) {
            fetchUnreadNotis();
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        setRole(null);
        setUser({});
        setUnreadCount(0);
        navigate('/');
        window.location.reload();
    };

    const getNavItems = () => {
        const items: any[] = [
            { key: '/', label: 'Trang chủ', icon: <HomeOutlined />, onClick: () => navigate('/') },
            { key: '/timeline', label: 'Lộ trình', icon: <CalendarOutlined />, onClick: () => navigate('/timeline') },
            { key: '/resources', label: 'Tài liệu', icon: <ReadOutlined />, onClick: () => navigate('/resources') },
            { key: '/faq', label: 'Hỏi đáp', icon: <QuestionCircleOutlined />, onClick: () => navigate('/faq') },
        ];

        const currentRole = role?.toUpperCase();
        if (currentRole === 'STUDENT') {
            items.push({ key: '/student/my-project', label: 'Đề tài của tôi', icon: <ProjectOutlined />, onClick: () => navigate('/student/my-project') });
            // Thêm menu Thông báo cho Sinh viên
            items.push({ key: '/student/notifications', label: 'Thông báo', icon: <BellOutlined />, onClick: () => navigate('/student/notifications') });
        } else if (currentRole === 'LECTURER') {
            items.push({ key: '/lecturer/manage-projects', label: 'Quản lý hướng dẫn', icon: <ProjectOutlined />, onClick: () => navigate('/lecturer/manage-projects') });
        } else if (currentRole === 'ADMIN') {
            items.push({ key: '/admin/user-management', label: 'Quản trị hệ thống', icon: <TeamOutlined />, onClick: () => navigate('/admin/user-management') });
        }

        return items;
    };

    return (
        <Header style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#001529', padding: '0 24px', height: '64px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
                <RocketOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '8px' }} />
                <Title level={4} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>NCKH TLU</Title>
            </div>

            <Menu
                theme="dark" mode="horizontal"
                selectedKeys={[location.pathname]}
                items={getNavItems()}
                style={{ flex: 1, minWidth: 0, marginLeft: '20px', border: 'none' }}
            />

            <div style={{ flexShrink: 0, marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                {role && (
                    <div style={{ marginRight: '20px', cursor: 'pointer' }} onClick={() => navigate(role.toLowerCase() === 'student' ? '/student/notifications' : '#')}>
                        <Badge count={unreadCount} overflowCount={99} size="small">
                            <BellOutlined style={{ color: '#fff', fontSize: '20px' }} />
                        </Badge>
                    </div>
                )}

                {!role ? (
                    <Button type="primary" shape="round" onClick={() => navigate('/login')}>Đăng nhập</Button>
                ) : (
                    <Dropdown
                        placement="bottomRight"
                        trigger={['click']}
                        menu={{
                            items: [
                                {
                                    key: 'dash',
                                    label: 'Bảng điều khiển (Dashboard)',
                                    icon: <DashboardOutlined />,
                                    onClick: () => {
                                        const r = role.toLowerCase();
                                        if (r === 'admin') navigate('/admin');
                                        else if (r === 'lecturer') navigate('/lecturer');
                                        else navigate('/student');
                                    }
                                },
                                { type: 'divider' },
                                {
                                    key: 'logout',
                                    label: 'Đăng xuất tài khoản',
                                    icon: <LogoutOutlined />,
                                    danger: true,
                                    onClick: handleLogout
                                }
                            ]
                        }}
                    >
                        <Space style={{ cursor: 'pointer', padding: '0 8px' }}>
                            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                                <Text strong style={{ color: '#fff', display: 'block', maxWidth: '120px' }} ellipsis>
                                    {user.fullName || 'Người dùng'}
                                </Text>
                                <Tag color="blue" style={{ fontSize: '10px', margin: 0, border: 'none', lineHeight: '1.6' }}>
                                    {role === 'ADMIN' ? 'Quản trị viên' : role === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                                </Tag>
                            </div>
                            <Avatar src={user.avatar} icon={<UserOutlined />} style={{ border: '2px solid #1890ff', backgroundColor: '#87d068' }} />
                        </Space>
                    </Dropdown>
                )}
            </div>
        </Header>
    );
};

export default Navbar;