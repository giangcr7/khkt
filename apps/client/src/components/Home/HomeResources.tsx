import React from 'react';
import { Row, Col, Card, Typography, Button, List, Space } from 'antd';
import { FilePdfOutlined, VideoCameraOutlined, ArrowRightOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const HomeResources: React.FC<{ resources?: any[] }> = ({ resources = [] }) => {
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        if (type === 'VIDEO') return <VideoCameraOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
        return <FilePdfOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    };

    return (
        <div style={{ padding: '60px 0', background: '#fff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[48, 32]} align="middle">
                    <Col xs={24} md={10}>
                        <Title level={2} style={{ color: '#1a3353', marginBottom: 16 }}>KHO TÀI LIỆU TIÊU BIỂU</Title>
                        <Paragraph type="secondary" style={{ fontSize: 16 }}>
                            Hệ thống cung cấp đầy đủ các biểu mẫu theo chuẩn ISO của trường, các bài báo cáo mẫu đạt giải cao và video hướng dẫn chi tiết giúp sinh viên dễ dàng tiếp cận NCKH.
                        </Paragraph>
                        <Button type="primary" size="large" onClick={() => navigate('/resources')} style={{ marginTop: 16, borderRadius: 8 }}>
                            Truy cập toàn bộ kho tài liệu <ArrowRightOutlined />
                        </Button>
                    </Col>
                    
                    <Col xs={24} md={14}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                            <List
                                itemLayout="horizontal"
                                dataSource={resources}
                                renderItem={(item: any) => (
                                    <List.Item
                                        actions={[
                                            <Button type="text" icon={<DownloadOutlined />} href={item.fileUrl} target="_blank" style={{ color: '#1890ff' }}>Tải về</Button>
                                        ]}
                                    >
                                        <List.Item.Meta
                                            avatar={<div style={{ padding: 10, background: '#f0f5ff', borderRadius: 8 }}>{getIcon(item.type)}</div>}
                                            title={<Text strong style={{ fontSize: 15 }}>{item.title}</Text>}
                                            description={<Text type="secondary" ellipsis style={{ maxWidth: 300 }}>{item.description || 'Tài liệu NCKH'}</Text>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default HomeResources;