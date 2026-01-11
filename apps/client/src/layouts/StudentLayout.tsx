import React, { useState } from 'react';
import { Layout, theme, Breadcrumb } from 'antd';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';
import StudentSidebar from '../components/Layout/StudentSidebar';
import { studentBreadcrumbMap } from '../constants/studentMenu';

const { Content } = Layout;

const StudentLayout: React.FC = () => {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <div style={{ height: 64 }} /> {/* Khoảng đệm Navbar */}

            <Layout>
                <StudentSidebar collapsed={collapsed} onCollapse={setCollapsed} />

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
                            {studentBreadcrumbMap[location.pathname] || 'Sinh viên'}
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

export default StudentLayout;