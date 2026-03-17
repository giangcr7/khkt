import React, { useEffect, useState } from 'react';
import { Timeline, Typography, Card, Tag, Button, Empty, Spin, Badge } from 'antd';
import { 
    ClockCircleOutlined, 
    DownloadOutlined, 
    StarOutlined, 
    CalendarOutlined, 
    CheckCircleOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;

const TimelinePage: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const res = await api.get('/events');
                const eventData = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setEvents(eventData);
            } catch (err) {
                console.error("Lỗi khi tải lộ trình:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);
    const getEventStatus = (startDate: string, endDate?: string) => {
        const now = dayjs();
        const start = dayjs(startDate);
        const end = endDate ? dayjs(endDate) : start.endOf('day');

        if (now.isAfter(end)) return 'PAST'; // Đã kết thúc
        if (now.isBetween(start, end, 'day', '[]')) return 'CURRENT'; // Đang diễn ra
        return 'FUTURE'; // Chưa tới
    };

    return (
        <div style={{ padding: '40px 20px', background: '#f5f7fa', minHeight: '100vh', marginTop: '64px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Nội dung Timeline */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" tip="Đang đồng bộ lộ trình..." />
                    </div>
                ) : events.length > 0 ? (
                    <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '20px 0' }}>
                        <Timeline mode="alternate">
                            {events.map((ev: any) => {
                                const status = getEventStatus(ev.startDate, ev.endDate);
                                
                                // Giao diện linh động theo trạng thái
                                const isPast = status === 'PAST';
                                const isCurrent = status === 'CURRENT';
                                
                                let dotIcon = <ClockCircleOutlined style={{ fontSize: '16px' }} />;
                                let dotColor = 'blue';

                                if (isPast) {
                                    dotIcon = <CheckCircleOutlined style={{ fontSize: '18px' }} />;
                                    dotColor = 'green';
                                } else if (isCurrent) {
                                    dotIcon = <PlayCircleOutlined style={{ fontSize: '20px' }} />;
                                    dotColor = '#faad14'; 
                                } else if (ev.isImportant) {
                                    dotIcon = <StarOutlined style={{ fontSize: '18px' }} />;
                                    dotColor = 'red';
                                }

                                return (
                                    <Timeline.Item key={ev.id} color={dotColor} dot={dotIcon}>
                                        <Badge.Ribbon 
                                            text={isCurrent ? "Đang diễn ra" : (ev.isImportant && !isPast ? "Quan trọng" : "")} 
                                            color={isCurrent ? "#faad14" : "red"}
                                            style={{ display: (isCurrent || (ev.isImportant && !isPast)) ? 'block' : 'none' }}
                                        >
                                            <Card
                                                size="small"
                                                hoverable={!isPast}
                                                style={{ 
                                                    borderRadius: '12px', 
                                                    opacity: isPast ? 0.6 : 1,
                                                    border: isCurrent ? '2px solid #faad14' : '1px solid #f0f0f0',
                                                    background: isPast ? '#fafafa' : '#fff'
                                                }}
                                            >
                                                <Title level={5} style={{ margin: '0 0 8px 0', color: isPast ? '#8c8c8c' : '#262626', textDecoration: isPast ? 'line-through' : 'none' }}>
                                                    {ev.title}
                                                </Title>
                                                
                                                <Text type="secondary" style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
                                                    <CalendarOutlined style={{ marginRight: '6px' }} />
                                                    {dayjs(ev.startDate).format('DD/MM/YYYY')}
                                                    {ev.endDate && ` - ${dayjs(ev.endDate).format('DD/MM/YYYY')}`}
                                                </Text>

                                                <Paragraph style={{ marginBottom: '16px', color: isPast ? '#bfbfbf' : '#595959' }}>
                                                    {ev.description}
                                                </Paragraph>

                                                {ev.fileUrl && !isPast && (
                                                    <Button
                                                        type="dashed"
                                                        size="small"
                                                        icon={<DownloadOutlined />}
                                                        href={`http://localhost:3000${ev.fileUrl}`}
                                                        target="_blank"
                                                    >
                                                        Tải tài liệu đính kèm
                                                    </Button>
                                                )}
                                            </Card>
                                        </Badge.Ribbon>
                                    </Timeline.Item>
                                );
                            })}
                        </Timeline>
                    </Card>
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Hiện chưa có thông báo về lộ trình mới trong năm học này."
                    />
                )}
            </div>
        </div>
    );
};

export default TimelinePage;