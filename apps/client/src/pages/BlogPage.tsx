import React, { useEffect, useState } from 'react';
import { Typography, List, Card, Spin, message, Tag, Space, Empty } from 'antd';
import { BulbOutlined, CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Paragraph, Text } = Typography;

const BlogPage: React.FC = () => {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                // Gọi API lấy toàn bộ bài viết
                const res = await api.get('/posts');
                const allPosts = Array.isArray(res.data) ? res.data : (res.data.data || []);
                
                // CHỈ LỌC ra những bài có type là 'BLOG' và đang được xuất bản (isPublished)
                const experiencePosts = allPosts.filter((post: any) => 
                    post.type === 'BLOG' && post.isPublished !== false
                );
                
                // ĐÃ FIX LỖI "Parameter 'b' implicitly has an 'any' type"
                const sortedPosts = experiencePosts.sort((a: any, b: any) => 
                    dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix()
                );

                setBlogs(sortedPosts);
            } catch (error) {
                console.error("Lỗi tải trang Kinh nghiệm:", error);
                message.error('Lỗi khi tải dữ liệu trang Kinh nghiệm');
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Giao diện khi đang tải dữ liệu
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', minHeight: '100vh', background: '#f5f7fa' }}>
                <Spin size="large" tip="Đang tải các bài học kinh nghiệm..." />
            </div>
        );
    }

    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Header của trang */}
            <div style={{ background: '#fff', padding: '60px 24px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Title level={1} style={{ margin: 0, color: '#1890ff' }}>
                    <BulbOutlined /> Góc Kinh Nghiệm
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '600px', margin: '16px auto 0' }}>
                    Nơi hội tụ những bí kíp thực chiến, kỹ năng mềm và những câu chuyện truyền cảm hứng từ các cựu sinh viên và giảng viên xuất sắc.
                </Paragraph>
            </div>

            {/* Danh sách bài viết */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <List
                    grid={{ gutter: 32, xs: 1, sm: 2, md: 2, lg: 3 }}
                    dataSource={blogs}
                    locale={{ emptyText: <Empty description="Hiện tại chưa có bài chia sẻ kinh nghiệm nào." /> }}
                    renderItem={(item: any) => (
                        <List.Item>
                            <Card
                                hoverable
                                onClick={() => navigate(`/post/${item.id}`)}
                                style={{ 
                                    borderRadius: '16px', 
                                    overflow: 'hidden', 
                                    border: 'none',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}
                                cover={
                                    item.thumbnail ? (
                                        <img 
                                            alt={item.title} 
                                            src={item.thumbnail} 
                                            style={{ height: 220, objectFit: 'cover', width: '100%' }} 
                                        />
                                    ) : (
                                        <div style={{ 
                                            height: 220, 
                                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <BulbOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
                                        </div>
                                    )
                                }
                            >
                                <div style={{ flex: 1 }}>
                                    <Tag color="purple" style={{ marginBottom: '12px', padding: '4px 12px', borderRadius: '4px' }}>
                                        Kinh nghiệm
                                    </Tag>
                                    
                                    <Title level={4} style={{ marginTop: 0, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {item.title}
                                    </Title>

                                    <Paragraph type="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 24 }}>
                                        {item.content || 'Nhấn vào để xem chi tiết bài chia sẻ này...'}
                                    </Paragraph>
                                </div>

                                {/* Footer của Card */}
                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space direction="vertical" size={0}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <UserOutlined /> {item.author?.fullName || 'Admin'}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <CalendarOutlined /> {dayjs(item.createdAt).format('DD/MM/YYYY')}
                                        </Text>
                                    </Space>
                                    <Text style={{ color: '#1890ff', fontWeight: 500 }}>
                                        Đọc tiếp <ArrowRightOutlined />
                                    </Text>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default BlogPage;