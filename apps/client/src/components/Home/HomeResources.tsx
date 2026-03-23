import React from 'react';
import { Row, Col, Card, Typography, Button, List, Space } from 'antd';
import { 
    FilePdfOutlined, VideoCameraOutlined, ArrowRightOutlined, 
    DownloadOutlined, LockOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// 👇 NHẬN THÊM BIẾN isLoggedIn TỪ HOMEPAGE
const HomeResources: React.FC<{ resources?: any[], isLoggedIn?: boolean }> = ({ resources = [], isLoggedIn = false }) => {
    const navigate = useNavigate();

    const getIcon = (type: string) => {
        if (type === 'VIDEO') return <VideoCameraOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
        return <FilePdfOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    };

    return (
        <div style={{ padding: '60px 0', background: '#fff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <Row gutter={[48, 32]} align="middle">
                    
                    {/* KHUNG BÊN TRÁI: Text giới thiệu */}
                    <Col xs={24} md={10}>
                        <Title level={2} style={{ color: '#1a3353', marginBottom: 16 }}>KHO TÀI LIỆU TIÊU BIỂU</Title>
                        <Paragraph type="secondary" style={{ fontSize: 16 }}>
                            Hệ thống cung cấp đầy đủ các biểu mẫu theo chuẩn ISO của trường, các bài báo cáo mẫu đạt giải cao và video hướng dẫn chi tiết giúp sinh viên dễ dàng tiếp cận NCKH.
                        </Paragraph>
                        
                        {/* Nút bấm tự động đổi tùy theo trạng thái đăng nhập */}
                        {isLoggedIn ? (
                            <Button type="primary" size="large" onClick={() => navigate('/resources')} style={{ marginTop: 16, borderRadius: 8 }}>
                                Truy cập toàn bộ kho tài liệu <ArrowRightOutlined />
                            </Button>
                        ) : (
                            <Button type="primary" size="large" onClick={() => navigate('/login')} style={{ marginTop: 16, borderRadius: 8 }}>
                                Đăng nhập để xem tài liệu <ArrowRightOutlined />
                            </Button>
                        )}
                    </Col>
                    
                    {/* KHUNG BÊN PHẢI: Danh sách tài liệu */}
                    <Col xs={24} md={14}>
                        <div style={{ position: 'relative' }}>
                            {/* Dàn danh sách gốc (bị làm mờ nếu chưa login) */}
                            <Card 
                                bordered={false} 
                                style={{ 
                                    borderRadius: 12, 
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                    // Hiệu ứng làm mờ nội dung nếu chưa login
                                    filter: !isLoggedIn ? 'blur(4px)' : 'none',
                                    pointerEvents: !isLoggedIn ? 'none' : 'auto', 
                                    userSelect: !isLoggedIn ? 'none' : 'auto',
                                    transition: 'all 0.3s'
                                }}
                            >
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

                            {/* 👇 LỚP PHỦ Ổ KHÓA BÊN TRÊN (Chỉ hiện khi chưa login) 👇 */}
                            {!isLoggedIn && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'center', alignItems: 'center',
                                    background: 'rgba(255, 255, 255, 0.4)',
                                    zIndex: 10,
                                    borderRadius: 12
                                }}>
                                    <Space direction="vertical" align="center" size="middle">
                                        <div style={{ 
                                            width: 64, height: 64, borderRadius: '50%', 
                                            background: '#1890ff', display: 'flex', 
                                            justifyContent: 'center', alignItems: 'center',
                                            boxShadow: '0 4px 12px rgba(24,144,255,0.4)'
                                        }}>
                                            <LockOutlined style={{ fontSize: 28, color: '#fff' }} />
                                        </div>
                                        <Title level={4} style={{ margin: 0, color: '#1a3353' }}>Tài liệu nội bộ</Title>
                                        <Text type="secondary" style={{ fontSize: 15 }}>Vui lòng đăng nhập để xem và tải tài liệu</Text>
                                        <Button type="primary" shape="round" size="large" onClick={() => navigate('/login')} style={{ marginTop: 8 }}>
                                            Đăng nhập ngay
                                        </Button>
                                    </Space>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default HomeResources;