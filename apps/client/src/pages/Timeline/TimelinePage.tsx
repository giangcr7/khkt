import React, { useEffect, useState } from 'react';
import { Timeline, Typography, Card, Tag, Button, Empty, Spin } from 'antd';
import { ClockCircleOutlined, DownloadOutlined, StarOutlined } from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const TimelinePage: React.FC = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await api.get('/events');
                setEvents(res.data);
            } catch (err) {
                console.error("Lỗi khi tải lộ trình:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div style={{ padding: '40px', background: '#f0f2f5', minHeight: '100vh', marginTop: '64px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Phần giới thiệu đầu trang */}
                <Card style={{ textAlign: 'center', marginBottom: '40px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Title level={2}>🗓️ Lộ trình & Thời hạn NCKH</Title>
                    <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                        Theo dõi các mốc thời gian quan trọng trong năm học để đảm bảo tiến độ thực hiện và nộp bài đúng hạn.
                    </Paragraph>
                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        href="/template-timeline.pdf"
                        target="_blank"
                    >
                        Tải File kế hoạch tổng thể (PDF)
                    </Button>
                </Card>

                {/* Nội dung Timeline */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" tip="Đang tải lộ trình..." />
                    </div>
                ) : (
                    <Timeline mode="alternate">
                        {events.map((ev: any) => (
                            <Timeline.Item
                                key={ev.id}
                                color={ev.isImportant ? 'red' : 'blue'}
                                dot={ev.isImportant ? <StarOutlined style={{ fontSize: '18px' }} /> : <ClockCircleOutlined style={{ fontSize: '16px' }} />}
                            >
                                <Card
                                    title={<Text strong style={{ fontSize: '16px' }}>{ev.title}</Text>}
                                    size="small"
                                    hoverable
                                    style={{ borderRadius: '10px' }}
                                    extra={ev.isImportant ? <Tag color="error">Quan trọng</Tag> : null}
                                >
                                    <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                                        <CalendarOutlined style={{ marginRight: '5px' }} />
                                        {dayjs(ev.startDate).format('DD/MM/YYYY')}
                                        {ev.endDate && ` - ${dayjs(ev.endDate).format('DD/MM/YYYY')}`}
                                    </Text>

                                    <Paragraph style={{ marginBottom: '15px' }}>
                                        {ev.description}
                                    </Paragraph>

                                    {ev.fileUrl && (
                                        <Button
                                            type="link"
                                            icon={<DownloadOutlined />}
                                            href={`http://localhost:3000${ev.fileUrl}`}
                                            target="_blank"
                                            style={{ padding: 0 }}
                                        >
                                            Tải biểu mẫu/tài liệu liên quan
                                        </Button>
                                    )}
                                </Card>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}

                {/* Hiển thị khi không có dữ liệu */}
                {events.length === 0 && !loading && (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Hiện chưa có thông báo về lộ trình mới"
                    />
                )}
            </div>
        </div>
    );
};

// Import bổ sung icon nếu chưa có
import { CalendarOutlined } from '@ant-design/icons';

export default TimelinePage;