import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Tabs, message, Typography, Space, Tooltip } from 'antd';
import { 
    DownloadOutlined, 
    YoutubeOutlined, 
    FileWordOutlined, 
    VideoCameraOutlined,
    EyeOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ResourcesPage: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get('/resources');
                setData(res.data);
            } catch (error) {
                message.error('Không thể tải tài liệu');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HÀM ÉP TẢI CLOUDINARY (Xử lý link để ép trình duyệt tải về) ---
    const getDownloadUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    // --- HÀM TẠO THUMBNAIL THẬT TỪ NỘI DUNG FILE ---
    const renderCardCover = (item: any) => {
        const url = item.fileUrl || '';
        const isPDF = url.toLowerCase().endsWith('.pdf');
        const isVideo = item.type === 'VIDEO';
        
        const coverStyle: React.CSSProperties = {
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            background: '#f5f5f5',
        };
        if (isVideo) {
            return (
                <div style={{ ...coverStyle, background: 'linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%)' }}>
                    <VideoCameraOutlined style={{ fontSize: '54px', color: '#fff' }} />
                    <span style={{ fontSize: '11px', color: '#fff', marginTop: '8px', fontWeight: 'bold' }}>VIDEO TUTORIAL</span>
                </div>
            );
        }

        // Nếu là PDF: Sử dụng Cloudinary Transformation để biến trang 1 thành ảnh JPG
        if (isPDF) {
            const thumbnailUrl = url.replace(/\.pdf$/i, '.jpg');
            return (
                <div style={coverStyle}>
                    <img 
                        src={thumbnailUrl} 
                        alt="Document Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        onError={(e) => {
                            (e.target as any).src = "https://placehold.co/400x500/ff7875/ffffff?text=PDF+Preview";
                        }}
                    />
                </div>
            );
        }

        // Nếu là Word hoặc file khác: Hiện Icon đại diện
        return (
            <div style={{ ...coverStyle, background: 'linear-gradient(135deg, #91d5ff 0%, #40a9ff 100%)' }}>
                <FileWordOutlined style={{ fontSize: '54px', color: '#fff' }} />
                <span style={{ fontSize: '11px', color: '#fff', marginTop: '8px', fontWeight: 'bold' }}>DOCUMENT</span>
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <Title level={2}><FileTextOutlined /> Kho Tài liệu</Title>
                <Text type="secondary">Hệ thống cung cấp cái nhìn trực quan về các tài liệu và quy trình nghiên cứu.</Text>
            </div>

            <Tabs 
                type="card"
                defaultActiveKey="1" 
                items={[
                    {
                        key: '1',
                        label: ' Tài liệu DOC/PDF',
                        children: (
                            <List
                                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
                                dataSource={data.filter((d: any) => d.type === 'TEMPLATE' || d.type === 'GUIDE')}
                                loading={loading}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            style={{ 
                                                borderRadius: '12px', 
                                                overflow: 'hidden', 
                                                border: 'none', 
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                height: '100%' 
                                            }}
                                            cover={renderCardCover(item)}
                                            actions={[
                                                // Đã sửa lại link Tải Về ở đây
                                                <Button type="link" icon={<DownloadOutlined />} href={getDownloadUrl(item.fileUrl)} download>Tải về</Button>,
                                                <Button type="text" icon={<EyeOutlined />} href={item.fileUrl} target="_blank">Xem</Button>
                                            ]}
                                        >
                                            <Card.Meta
                                                title={
                                                    <Tooltip title={item.title}>
                                                        <Text strong style={{ 
                                                            fontSize: '15px', 
                                                            height: '42px', 
                                                            display: '-webkit-box', 
                                                            WebkitLineClamp: 2, 
                                                            WebkitBoxOrient: 'vertical', 
                                                            overflow: 'hidden' 
                                                        }}>
                                                            {item.title}
                                                        </Text>
                                                    </Tooltip>
                                                }
                                                description={
                                                    <div style={{ height: '55px', marginTop: 8 }}>
                                                        <Tag color={item.type === 'TEMPLATE' ? 'blue' : 'green'}>
                                                            {item.type === 'TEMPLATE' ? 'Mẫu chuẩn' : 'Hướng dẫn'}
                                                        </Tag>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                                            Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                        </Text>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        )
                    },
                    {
                        key: '2',
                        label: '🎬 Video Hướng dẫn Online',
                        children: (
                            <List
                                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3 }}
                                dataSource={data.filter((d: any) => d.type === 'VIDEO')}
                                loading={loading}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                            cover={renderCardCover(item)}
                                            onClick={() => window.open(item.fileUrl, '_blank')}
                                        >
                                            <Card.Meta
                                                title={<Text strong>{item.title}</Text>}
                                                description={
                                                    <Space style={{ marginTop: 8 }}>
                                                        <Tag icon={<YoutubeOutlined />} color="error">Youtube</Tag>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>Video quy trình</Text>
                                                    </Space>
                                                }
                                            />
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        )
                    }
                ]} 
            />
        </div>
    );
};

export default ResourcesPage;