import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Space, Tag, Spin, message } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Sửa lại đường dẫn này cho khớp với cấu trúc thư mục của sếp nhé

const { Title, Text, Paragraph } = Typography;

const NewsListPage: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                // Gọi API lấy toàn bộ tin tức & thông báo
                const res = await api.get('/posts');
                // Sắp xếp bài mới nhất lên trên cùng
                const sortedPosts = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPosts(sortedPosts);
            } catch (error) {
                message.error('Không thể tải danh sách tin tức');
            } finally {
                setLoading(false);
            }
        };
        fetchAllPosts();
    }, []);

    return (
        <div style={{ padding: '40px 20px', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* THANH TIÊU ĐỀ & NÚT QUAY LẠI */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
                    <ArrowLeftOutlined 
                        style={{ fontSize: 24, cursor: 'pointer', marginRight: 16, color: '#1890ff' }} 
                        onClick={() => navigate(-1)} // Nút lùi lại trang trước
                    />
                    <Title level={2} style={{ margin: 0, color: '#1a3353' }}>TẤT CẢ TIN TỨC & THÔNG BÁO</Title>
                </div>

                {/* DANH SÁCH BÀI VIẾT (CÓ PHÂN TRANG) */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
                ) : (
                    <List
                        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        dataSource={posts}
                        pagination={{
                            pageSize: 9, // Cho phép hiển thị 9 bài / 1 trang
                            align: 'center',
                        }}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    onClick={() => navigate(`/news/${item.id}`)}
                                    style={{ borderRadius: 12, overflow: 'hidden', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    cover={
                                        <div style={{ height: 200, background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            {item.thumbnail ? (
                                                <img alt="thumbnail" src={item.thumbnail} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <img alt="default" src="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    }
                                >
                                    <Tag color={item.type === 'ANNOUNCEMENT' ? 'volcano' : 'blue'} style={{ marginBottom: 12 }}>
                                        {item.type === 'ANNOUNCEMENT' ? 'THÔNG BÁO' : 'TIN TỨC'}
                                    </Tag>
                                    <Card.Meta
                                        title={<Text strong style={{ fontSize: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Text>}
                                        description={
                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>{item.content}</Paragraph>
                                                <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default NewsListPage;