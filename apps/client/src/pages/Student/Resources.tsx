import React, { useEffect, useState } from 'react';
import { List, Card, Button, Tag, Tabs, message, Empty } from 'antd';
import { DownloadOutlined, YoutubeOutlined, FilePdfOutlined, ReadOutlined } from '@ant-design/icons';
import api from '../../services/api';

const ResourcesPage: React.FC = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Lấy dữ liệu khi vào trang
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

    // 2. Hàm xử lý URL: Nếu là file upload thì thêm localhost, nếu là link web thì giữ nguyên
    const getFullUrl = (url: string) => {
        // Bạn có thể thay localhost:3000 bằng import.meta.env.VITE_API_URL nếu đã cấu hình
        const API_URL = 'http://localhost:3000';
        return url.startsWith('http') ? url : `${API_URL}${url}`;
    };

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 24 }}>📚 Kho Tài liệu & Biểu mẫu</h2>

            <Tabs defaultActiveKey="1" items={[
                {
                    key: '1',
                    label: 'Biểu mẫu & Hướng dẫn (Tải về)',
                    icon: <FilePdfOutlined />,
                    children: (
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                            // Lọc lấy các loại là TEMPLATE hoặc GUIDE
                            dataSource={data.filter((d: any) => d.type === 'TEMPLATE' || d.type === 'GUIDE')}
                            loading={loading}
                            locale={{ emptyText: <Empty description="Chưa có tài liệu nào" /> }}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <Card
                                        title={item.title}
                                        extra={item.type === 'TEMPLATE' ? <Tag color="blue">Mẫu</Tag> : <Tag color="green">HD</Tag>}
                                        hoverable
                                        actions={[
                                            <Button type="primary" icon={<DownloadOutlined />} href={getFullUrl(item.fileUrl)} target="_blank">
                                                Tải về máy
                                            </Button>
                                        ]}
                                    >
                                        <p style={{ color: '#888', fontSize: 12 }}>
                                            Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                        </p>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )
                },
                {
                    key: '2',
                    label: 'Video Hướng dẫn Online',
                    icon: <YoutubeOutlined />,
                    children: (
                        <List
                            itemLayout="horizontal"
                            // Lọc lấy VIDEO
                            dataSource={data.filter((d: any) => d.type === 'VIDEO')}
                            loading={loading}
                            locale={{ emptyText: <Empty description="Chưa có video nào" /> }}
                            renderItem={(item: any) => (
                                <List.Item actions={[
                                    <Button href={item.fileUrl} target="_blank" icon={<ReadOutlined />}>Xem Video</Button>
                                ]}>
                                    <List.Item.Meta
                                        avatar={<YoutubeOutlined style={{ fontSize: 40, color: '#ff4d4f' }} />}
                                        title={<a href={item.fileUrl} target="_blank" rel="noreferrer">{item.title}</a>}
                                        description="Video hướng dẫn trực tuyến (Youtube/Drive)"
                                    />
                                </List.Item>
                            )}
                        />
                    )
                }
            ]} />
        </div>
    );
};

export default ResourcesPage;