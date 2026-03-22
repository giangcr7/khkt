import React, { useEffect, useState } from 'react';
import { Typography, List, Card, Spin, message, Tag, Space, Empty, Button } from 'antd';
import { BulbOutlined, CalendarOutlined, UserOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
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
                const res = await api.get('/posts');
                const allPosts = Array.isArray(res.data) ? res.data : (res.data.data || []);
                
                const experiencePosts = allPosts.filter((post: any) => 
                    post.type === 'BLOG' && post.isPublished !== false
                );
                
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

    // --- HÀM ÉP TẢI CLOUDINARY ---
    const getDownloadUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px', minHeight: '100vh', background: '#f5f7fa' }}>
                <Spin size="large" tip="Đang tải các bài học kinh nghiệm..." />
            </div>
        );
    }

    return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{ background: '#fff', padding: '60px 24px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Title level={1} style={{ margin: 0, color: '#1890ff' }}>
                    <BulbOutlined /> Góc Kinh Nghiệm
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959', maxWidth: '600px', margin: '16px auto 0' }}>
                    Nơi hội tụ những bí kíp thực chiến, kỹ năng mềm và những câu chuyện truyền cảm hứng từ các cựu sinh viên và giảng viên xuất sắc.
                </Paragraph>
            </div>

            {/* Danh sách */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <List
                    grid={{ gutter: 32, xs: 1, sm: 2, md: 2, lg: 3 }}
                    dataSource={blogs}
                    locale={{ emptyText: <Empty description="Hiện tại chưa có bài chia sẻ kinh nghiệm nào." /> }}
                    renderItem={(item: any) => (
                        <List.Item>
                            <Card
                                hoverable
                                style={{ 
                                    borderRadius: '16px', 
                                    overflow: 'hidden', 
                                    border: 'none',
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1 }}
                                cover={
                                    item.thumbnail ? (
                                        <img 
                                            alt={item.title} 
                                            src={item.thumbnail} 
                                            style={{ height: 220, objectFit: 'cover', width: '100%', cursor: 'pointer' }} 
                                            onClick={() => navigate(`/post/${item.id}`)}
                                        />
                                    ) : (
                                        <div 
                                            style={{ 
                                                height: 220, 
                                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/post/${item.id}`)}
                                        >
                                            <BulbOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
                                        </div>
                                    )
                                }
                                // 👇 DÀN NÚT BẤM DƯỚI ĐÁY CARD (GIỐNG HỆT BÊN TÀI LIỆU) 👇
                                actions={[
                                    <Button 
                                        type="link" 
                                        icon={<DownloadOutlined />} 
                                        href={getDownloadUrl(item.externalLink)} 
                                        download 
                                        disabled={!item.externalLink} // Làm mờ nút nếu bài viết không có file đính kèm
                                    >
                                        Tải về
                                    </Button>,
                                    <Button 
                                        type="text" 
                                        icon={<EyeOutlined />} 
                                        onClick={() => {
                                            // Ưu tiên mở file nếu có, không có thì mở trang chi tiết để đọc chữ
                                            if (item.externalLink) window.open(item.externalLink, '_blank');
                                            else navigate(`/post/${item.id}`);
                                        }}
                                    >
                                        Xem
                                    </Button>
                                ]}
                            >
                                {/* Phần thân Card: Click vào đây để xem chi tiết bài viết */}
                                <div 
                                    style={{ padding: '24px', flex: 1, cursor: 'pointer' }}
                                    onClick={() => navigate(`/post/${item.id}`)}
                                >
                                    <Tag color="purple" style={{ marginBottom: '12px', padding: '4px 12px', borderRadius: '4px' }}>
                                        Kinh nghiệm
                                    </Tag>
                                    
                                    <Title level={4} style={{ marginTop: 0, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {item.title}
                                    </Title>

                                    <Paragraph type="secondary" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 24 }}>
                                        {item.content || 'Nhấn vào để xem chi tiết bài chia sẻ này...'}
                                    </Paragraph>

                                    <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <UserOutlined /> {item.author?.fullName || 'Admin'}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            <CalendarOutlined /> {dayjs(item.createdAt).format('DD/MM/YYYY')}
                                        </Text>
                                    </div>
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