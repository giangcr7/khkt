import React from 'react';
import { Typography, Input, Button } from 'antd';

const { Title, Paragraph } = Typography;

const HomeHero: React.FC = () => {
    return (
        <div style={{ background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)', padding: '100px 20px', textAlign: 'center', color: '#fff' }}>
            <Title style={{ color: '#fff', fontSize: '42px', fontWeight: 800 }}>
                HÀNH TRÌNH CHINH PHỤC KHOA HỌC TLU
            </Title>
            <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: '18px', marginBottom: '40px' }}>
                Nền tảng hỗ trợ sinh viên từ ý tưởng đến công bố công trình nghiên cứu.
            </Paragraph>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Input.Search
                    placeholder="Nhập từ khóa để gợi ý đề tài..."
                    enterButton={<Button type="primary" size="large">Tìm kiếm ngay</Button>}
                    size="large"
                />
            </div>
        </div>
    );
};

export default HomeHero;