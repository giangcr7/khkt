import React from 'react';
import { Typography, Button } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const HomeResources: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ background: '#fafafa', padding: '60px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <Title level={3}>
                    <FolderOpenOutlined /> KHO TÀI LIỆU TIÊU BIỂU
                </Title>
                <Button
                    type="primary"
                    ghost
                    onClick={() => navigate('/resources')}
                    style={{ marginBottom: 30 }}
                >
                    Truy cập kho biểu mẫu & Video
                </Button>
            </div>
        </div>
    );
};

export default HomeResources;