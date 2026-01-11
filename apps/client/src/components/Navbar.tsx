import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Dropdown, Tag, Avatar } from 'antd';
import {
    HomeOutlined, DashboardOutlined, UserOutlined, LogoutOutlined,
    RocketOutlined, CalendarOutlined, ReadOutlined, FileSearchOutlined,
    ProjectOutlined, TeamOutlined, QuestionCircleOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));

    useEffect(() => {
        setRole(localStorage.getItem('role'));
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, [location]);

    const handleLogout = () => {
        localStorage.clear();
        setRole(null);
        setUser({});
        navigate('/');
        window.location.reload();
    };

    const getNavItems = () => {
        const items: any[] = [
            { key: '/', label: 'Trang chủ', icon: <HomeOutlined />, onClick: () => navigate('/') },
            { key: '/guide', label: 'Hướng dẫn', icon: <InfoCircleOutlined />, onClick: () => navigate('/guide') },
            { key: '/timeline', label: 'Lộ trình', icon: <CalendarOutlined />, onClick: () => navigate('/timeline') },
            { key: '/resources', label: 'Tài liệu', icon: <ReadOutlined />, onClick: () => navigate('/resources') },
            { key: '/faq', label: 'Hỏi đáp', icon: <QuestionCircleOutlined />, onClick: () => navigate('/faq') },
        ];

        const currentRole = role?.toUpperCase();
        if (currentRole === 'STUDENT') {
            items.push({ key: '/student/my-project', label: 'Đề tài của tôi', icon: <ProjectOutlined />, onClick: () => navigate('/student/my-project') });
        } else if (currentRole === 'LECTURER') {
            items.push({ key: '/lecturer/manage-projects', label: 'Quản lý hướng dẫn', icon: <ProjectOutlined />, onClick: () => navigate('/lecturer/manage-projects') });
        } else if (currentRole === 'ADMIN') {
            // SỬA TẠI ĐÂY: Đổi /admin/users thành /admin/user-management
            items.push({ key: '/admin/user-management', label: 'Quản trị hệ thống', icon: <TeamOutlined />, onClick: () => navigate('/admin/user-management') });
        }

        return items;
    };

    return (
        <Header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#001529',
            padding: '0 24px',
            height: '64px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
            {/* Trái: Logo */}
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate('/')}>
                <RocketOutlined style={{ color: '#1890ff', fontSize: '24px', marginRight: '8px' }} />
                <Title level={4} style={{ color: '#fff', margin: 0, whiteSpace: 'nowrap' }}>NCKH TLU</Title>
            </div>

            {/* Giữa: Menu - Đã chuyển sang Navigation thay vì Scroll */}
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={getNavItems()}
                style={{ flex: 1, minWidth: 0, marginLeft: '20px', border: 'none' }}
            />

            {/* Phải: User Profile & Dropdown */}
            <div style={{ flexShrink: 0, marginLeft: '10px' }}>
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
                            <div style={{ textAlign: 'right', lineHeight: '1.2', display: 'none', md: 'block' } as any}>
                                <Text strong style={{ color: '#fff', display: 'block', maxWidth: '120px' }} ellipsis>
                                    {user.fullName || 'Người dùng'}
                                </Text>
                                <Tag color="blue" style={{ fontSize: '10px', margin: 0, border: 'none', lineHeight: '1.6' }}>
                                    {role === 'ADMIN' ? 'Quản trị viên' : role === 'LECTURER' ? 'Giảng viên' : 'Sinh viên'}
                                </Tag>
                            </div>
                            <Avatar
                                src={user.avatar}
                                icon={<UserOutlined />}
                                style={{ border: '2px solid #1890ff', backgroundColor: '#87d068' }}
                            />
                        </Space>
                    </Dropdown>
                )}
            </div>
        </Header>
    );
};

export default Navbar;