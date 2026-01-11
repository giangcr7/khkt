import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { lecturerMenuItems } from '../../constants/lecturerMenu';

const { Sider } = Layout;

interface Props {
    collapsed: boolean;
    onCollapse: (val: boolean) => void;
}

const LecturerSidebar: React.FC<Props> = ({ collapsed, onCollapse }) => {
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
            <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <h3 style={{ margin: 0, color: '#faad14', fontWeight: 'bold' }}>
                    {collapsed ? 'GV' : 'GIẢNG VIÊN'}
                </h3>
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={lecturerMenuItems}
                onClick={({ key }) => navigate(key)}
                style={{ borderRight: 0, paddingTop: 16 }}
            />
        </Sider>
    );
};

export default LecturerSidebar;