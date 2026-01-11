import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, RocketOutlined, CheckCircleOutlined, GlobalOutlined } from '@ant-design/icons';

interface HomeStatsProps {
    stats: any;
}

const HomeStats: React.FC<HomeStatsProps> = ({ stats }) => {
    return (
        <div style={{ padding: '0 50px', marginTop: '-40px' }}>
            <Card bordered={false} style={{ borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <Row gutter={[32, 32]} justify="center">
                    <Col xs={12} sm={6}><Statistic title="Đề tài" value={stats?.totalProjects} prefix={<RocketOutlined style={{ color: '#1890ff' }} />} /></Col>
                    <Col xs={12} sm={6}><Statistic title="Giảng viên" value={stats?.totalLecturers} prefix={<UserOutlined style={{ color: '#52c41a' }} />} /></Col>
                    <Col xs={12} sm={6}><Statistic title="Lĩnh vực" value={stats?.totalTopics} prefix={<GlobalOutlined style={{ color: '#722ed1' }} />} /></Col>
                    <Col xs={12} sm={6}><Statistic title="Hoàn thành" value={stats?.completedProjects} prefix={<CheckCircleOutlined style={{ color: '#eb2f96' }} />} /></Col>
                </Row>
            </Card>
        </div>
    );
};

export default HomeStats;
