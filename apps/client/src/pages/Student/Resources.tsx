import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Tabs, message, Typography, Space, Tooltip, Empty } from 'antd';
import { 
    DownloadOutlined, 
    YoutubeOutlined, 
    FileWordOutlined, 
    VideoCameraOutlined,
    EyeOutlined,
    FileTextOutlined,
    BookOutlined,
    FormOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ResourcesPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
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

    const getDownloadUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('cloudinary.com')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    const renderCardCover = (item: any) => {
        const url = item.fileUrl || '';
        const isPDF = url.toLowerCase().endsWith('.pdf');
        
        const coverStyle: React.CSSProperties = {
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '12px 12px 0 0',
            overflow: 'hidden',
            background: '#f5f5f5',
        };

        if (isPDF) {
            const thumbnailUrl = url.replace(/\.pdf$/i, '.jpg');
            return (
                <div style={coverStyle}>
                    <img 
                        src={thumbnailUrl} 
                        alt="Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        onError={(e) => {
                            (e.target as any).src = "https://placehold.co/400x500/1890ff/ffffff?text=Document";
                        }}
                    />
                </div>
            );
        }

        return (
            <div style={{ ...coverStyle, background: 'linear-gradient(135deg, #91d5ff 0%, #40a9ff 100%)' }}>
                <FileWordOutlined style={{ fontSize: '48px', color: '#fff' }} />
            </div>
        );
    };

    // Hàm render danh sách tài liệu theo từng loại
    const renderResourceList = (type: string) => (
        <List
            grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={data.filter((d: any) => d.type === type)}
            loading={loading}
            locale={{ emptyText: <Empty description={`Chưa có ${type.toLowerCase()} nào`} /> }}
            renderItem={(item: any) => (
                <List.Item>
                    <Card
                        hoverable
                        style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' }}
                        cover={renderCardCover(item)}
                        actions={[
                            <Button type="link" icon={<DownloadOutlined />} href={getDownloadUrl(item.fileUrl)} download>Tải về</Button>,
                            <Button type="text" icon={<EyeOutlined />} href={item.fileUrl} target="_blank">Xem</Button>
                        ]}
                    >
                        <Card.Meta
                            title={<Tooltip title={item.title}><Text strong ellipsis>{item.title}</Text></Tooltip>}
                            description={
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                    Đăng ngày: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                </Text>
                            }
                        />
                    </Card>
                </List.Item>
            )}
        />
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ marginBottom: 32, borderBottom: '2px solid #f0f0f0', paddingBottom: '16px' }}>
                <Title level={2}><FileTextOutlined /> Kho Tài liệu</Title>
                <Text type="danger" strong style={{ fontSize: '18px' }}>Tài liệu tham khảo - Mẫu biểu - Quy định</Text>
            </div>

            <Tabs 
                type="card"
                defaultActiveKey="REFERENCE" 
                items={[
                    {
                        key: 'REFERENCE',
                        label: <span><BookOutlined /> Tài liệu tham khảo</span>,
                        children: renderResourceList('REFERENCE')
                    },
                    {
                        key: 'TEMPLATE',
                        label: <span><FormOutlined /> Mẫu biểu</span>,
                        children: renderResourceList('TEMPLATE')
                    },
                    {
                        key: 'GUIDE',
                        label: <span><SafetyCertificateOutlined /> Quy định - Hướng dẫn</span>,
                        children: renderResourceList('GUIDE')
                    },
                    {
                        key: 'VIDEO',
                        label: <span><VideoCameraOutlined /> Video hướng dẫn</span>,
                        children: (
                            <List
                                grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3 }}
                                dataSource={data.filter((d: any) => d.type === 'VIDEO')}
                                renderItem={(item: any) => (
                                    <List.Item>
                                        <Card
                                            hoverable
                                            style={{ borderRadius: '12px', overflow: 'hidden' }}
                                            cover={
                                                <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ff4d4f' }}>
                                                    <YoutubeOutlined style={{ fontSize: '64px', color: '#fff' }} />
                                                </div>
                                            }
                                            onClick={() => window.open(item.fileUrl, '_blank')}
                                        >
                                            <Card.Meta title={<Text strong>{item.title}</Text>} />
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