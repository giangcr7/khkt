import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminMenuItems } from '../../constants/adminMenu';

const { Sider } = Layout;

const AdminSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Sider breakpoint="lg" collapsedWidth="0" theme="dark" width={250}>
            <div style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#002140',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '18px'
            }}>
                HỆ THỐNG ADMIN
            </div>
            <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={adminMenuItems}
                onClick={({ key }) => navigate(key)}
            />
        </Sider>
    );
};

export default AdminSidebar;