import React from 'react';
import { Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom'; 

const { Title, Paragraph } = Typography;
const { Search } = Input;

const HomeHero: React.FC = () => {
    const navigate = useNavigate(); 

    const handleSearch = (value: string) => {
        if (value.trim()) {
            navigate(`/news?keyword=${encodeURIComponent(value)}`);
        }
    };

    return (
        <div style={{ background: '#002140', padding: '100px 20px', textAlign: 'center' }}>
            <Title style={{ color: '#fff', fontSize: 42, marginBottom: 16 }}>
                HÀNH TRÌNH CHINH PHỤC KHOA HỌC TLS
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 40 }}>
                Nền tảng hỗ trợ sinh viên từ ý tưởng đến công bố công trình nghiên cứu.
            </Paragraph>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Search
                    placeholder="Tìm kiếm đề tài, tin tức, tài liệu hướng dẫn..."
                    allowClear
                    enterButton="Tìm kiếm ngay"
                    size="large"
                    onSearch={handleSearch} 
                    style={{ borderRadius: 8 }}
                />
            </div>
        </div>
    );
};

export default HomeHero;