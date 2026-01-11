import React, { useEffect, useState } from 'react';
import { Layout, theme, Breadcrumb } from 'antd';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import LecturerSidebar from '../components/Layout/LecturerSidebar';
import { lecturerBreadcrumbMap } from '../constants/lecturerMenu';

const { Content } = Layout;

const LecturerLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        const role = localStorage.getItem('role')?.toUpperCase();
        if (!role || role !== 'LECTURER') {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <div style={{ height: 64 }} /> {/* Offset for fixed Navbar */}

            <Layout>
                <LecturerSidebar collapsed={collapsed} onCollapse={setCollapsed} />

                <Layout
                    style={{
                        marginLeft: collapsed ? 80 : 250,
                        transition: 'all 0.2s',
                        padding: '0 24px 24px',
                        minHeight: 'calc(100vh - 64px)'
                    }}
                >
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>
                            <Link to="/"><HomeOutlined /> Trang chủ</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {lecturerBreadcrumbMap[location.pathname] || 'Giảng viên'}
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    <Content
                        style={{
                            padding: 24,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            minHeight: 280,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default LecturerLayout;