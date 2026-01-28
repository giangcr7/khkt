import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Badge, Tag, Button, message, Empty, Spin, Space } from 'antd';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs'; // Cài đặt: npm install dayjs
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Text, Title } = Typography;

const StudentNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            // Gọi đến API bạn vừa tạo ở Backend
            const res = await api.get('/notifications/my'); 
            setNotifications(res.data);
        } catch (error) {
            message.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            // Cập nhật state tại chỗ để đổi màu giao diện
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Card 
                title={<Title level={4} style={{ margin: 0 }}><BellOutlined /> Thông báo hệ thống</Title>}
                extra={<Button type="link" onClick={fetchNotifications}>Làm mới</Button>}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
                ) : notifications.length === 0 ? (
                    <Empty description="Bạn chưa có thông báo nào" />
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                style={{ 
                                    cursor: 'pointer',
                                    backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                                    transition: '0.3s',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '8px'
                                }}
                                onClick={() => handleMarkAsRead(item.id)}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Badge dot={!item.isRead}>
                                            {item.isRead ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />}
                                        </Badge>
                                    }
                                    title={
                                        <Space>
                                            <Text strong={!item.isRead}>{item.title}</Text>
                                            {!item.isRead && <Tag color="blue">Mới</Tag>}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <div style={{ color: '#555', marginBottom: '4px' }}>{item.content}</div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {dayjs(item.createdAt).fromNow()} {/* Hiển thị: "2 giờ trước" */}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default StudentNotifications;