import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/Layout/AdminSidebar'; // Import sidebar vừa tách

const { Header, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sử dụng Sidebar đã tách */}
            <AdminSidebar />

            <Layout>
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)'
                }}>
                    <Space>
                        <UserOutlined />
                        <Text strong>Quản trị viên</Text>
                        <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                            Đăng xuất
                        </Button>
                    </Space>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 8 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;