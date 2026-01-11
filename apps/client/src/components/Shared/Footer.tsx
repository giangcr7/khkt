import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
    return (
        <AntFooter style={{ textAlign: 'center', background: '#001529', color: '#fff', padding: '60px 50px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                ©2026 Cổng thông tin NCKH TLU - Team KHKT phát triển
            </Text>
        </AntFooter>
    );
};

export default Footer;