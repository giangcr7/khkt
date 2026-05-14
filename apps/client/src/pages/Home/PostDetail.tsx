import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Typography, Card, Button, Tag, Divider, Spin, Space, Empty } from 'antd';
import { ArrowLeftOutlined, LinkOutlined, CalendarOutlined, UserOutlined, TagOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const PostDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setPost(res.data);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang tải bài viết..." /></div>;
    if (!post) return <div style={{ padding: '100px' }}><Empty description="Không tìm thấy bài viết" /></div>;

    // Cấu hình nhãn cho từng loại bài viết
    const typeConfigs: any = {
        NEWS: { color: 'blue', label: 'Tin tức' },
        GUIDE: { color: 'green', label: 'Hướng dẫn' },
        BLOG: { color: 'purple', label: 'Kinh nghiệm' },
        CONTEST: { color: 'volcano', label: 'Cuộc thi' }
    };
    const currentConfig = typeConfigs[post.type] || typeConfigs.NEWS;

    return (
        <Layout style={{ background: '#f5f7fa', minHeight: '100vh' }}>
            <Content style={{ maxWidth: '950px', margin: '40px auto', padding: '0 20px' }}>
                <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 24 }}
                        type="text"
                    >
                        Quay lại trang trước
                    </Button>

                    {/* Thumbnail lớn làm Header bài viết */}
                    {post.thumbnail && (
                        <div style={{ marginBottom: 32 }}>
                            <img
                                src={post.thumbnail}
                                alt="cover"
                                style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        </div>
                    )}

                    <Title level={1} style={{ marginBottom: 16 }}>{post.title}</Title>

                    <Space split={<Divider type="vertical" />} style={{ marginBottom: 32, flexWrap: 'wrap' }}>
                        <Tag color={currentConfig.color} icon={<TagOutlined />}>
                            {currentConfig.label}
                        </Tag>
                        <Text type="secondary"><CalendarOutlined /> Ngày đăng: {dayjs(post.createdAt).format('DD/MM/YYYY')}</Text>
                        <Text type="secondary"><UserOutlined /> Tác giả: {post.author?.fullName || 'Ban Quản trị'}</Text>
                    </Space>

                    <Divider />

                    {/* Chú ý: whiteSpace: 'pre-line' cực kỳ quan trọng để hiển thị xuống dòng */}
                    <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#434343', whiteSpace: 'pre-line' }}>
                        <Paragraph>
                            {post.content}
                        </Paragraph>
                    </div>

                    {/* Card hiển thị Link đính kèm */}
                    {post.externalLink && (
                        <Card
                            style={{ marginTop: 48, background: '#f0f5ff', borderLeft: '4px solid #1890ff', borderRadius: '8px' }}
                            bordered={false}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Title level={5} style={{ margin: 0 }}><LinkOutlined /> Tài liệu & Liên kết liên quan:</Title>
                                <Text type="secondary">Admin đã đính kèm một liên kết ngoài cho bài viết này. Bạn có thể truy cập để xem chi tiết tài liệu</Text>
                                <Button
                                    type="primary"
                                    size="large"
                                    href={post.externalLink}
                                    target="_blank"
                                    style={{ marginTop: 8 }}
                                >
                                    Truy cập ngay
                                </Button>
                            </Space>
                        </Card>
                    )}
                </Card>
            </Content>
        </Layout>
    );
};

export default PostDetail;