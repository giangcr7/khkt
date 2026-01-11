import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentMenuItems } from '../../constants/studentMenu';

const { Sider } = Layout;

interface Props {
    collapsed: boolean;
    onCollapse: (val: boolean) => void;
}

const StudentSidebar: React.FC<Props> = ({ collapsed, onCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            theme="light"
            width={250}
            style={{
                overflow: 'auto',
                height: 'calc(100vh - 64px)',
                position: 'fixed',
                left: 0,
                top: 64,
                bottom: 0,
                zIndex: 1000,
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
            }}
        >
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={studentMenuItems}
                onClick={({ key }) => navigate(key)}
                style={{ borderRight: 0, paddingTop: 16 }}
            />
        </Sider>
    );
};

export default StudentSidebar;