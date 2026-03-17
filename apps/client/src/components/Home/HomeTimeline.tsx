import React from 'react';
import { Typography, Card, Tag, Button, Empty } from 'antd';
import { CalendarOutlined, ArrowRightOutlined, ClockCircleOutlined, PushpinOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface HomeTimelineProps {
    events: any[];
}

const HomeTimeline: React.FC<HomeTimelineProps> = ({ events }) => {
    const navigate = useNavigate();
    if (!events || events.length === 0) return null;

    return (
        <div style={{ padding: '60px 0', background: '#fff' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
                
                {/* TIÊU ĐỀ SECTION */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Tag color="geekblue" style={{ padding: '4px 16px', borderRadius: 20, fontSize: 14, marginBottom: 12 }}>
                        <CalendarOutlined /> Lịch trình & Sự kiện
                    </Tag>
                    <Title level={2} style={{ margin: 0, color: '#1a3353' }}>
                        LỘ TRÌNH NGHIÊN CỨU KHOA HỌC
                    </Title>
                    <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 16 }}>
                        Đừng bỏ lỡ các mốc thời gian quan trọng trong năm học
                    </Paragraph>
                </div>

                {/* DANH SÁCH SỰ KIỆN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {events.map((event, index) => {
                        const isHot = event.isImportant; 

                        return (
                            <Card
                                key={event.id || index}
                                hoverable
                                style={{
                                    borderRadius: 12,
                                    border: isHot ? '1px solid #ffa39e' : '1px solid #e6f7ff',
                                    background: isHot ? '#fff1f0' : '#f0f5ff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                    
                                    {/* Ô LỊCH NGÀY/THÁNG BÊN TRÁI */}
                                    <div style={{
                                        background: isHot ? '#ff4d4f' : '#1890ff',
                                        color: '#fff',
                                        borderRadius: 12,
                                        padding: '12px 16px',
                                        textAlign: 'center',
                                        minWidth: '90px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>
                                            {dayjs(event.startDate).format('DD')}
                                        </div>
                                        <div style={{ fontSize: 13, textTransform: 'uppercase', marginTop: 4, fontWeight: 500 }}>
                                            Tháng {dayjs(event.startDate).format('MM')}
                                        </div>
                                    </div>

                                    {/* NỘI DUNG SỰ KIỆN */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <Title level={4} style={{ margin: 0, color: '#1a3353' }}>{event.title}</Title>
                                            {isHot && (
                                                <Tag color="red" icon={<ClockCircleOutlined />} style={{ borderRadius: 4 }}>
                                                    Quan trọng
                                                </Tag>
                                            )}
                                        </div>
                                        <Paragraph style={{ margin: 0, color: '#595959', fontSize: 15 }}>
                                            {event.description}
                                        </Paragraph>
                                    </div>

                                    {/* NÚT THAO TÁC (Tùy chọn) */}
                                    <div>
                                        <Button type="text" shape="circle" icon={<PushpinOutlined style={{ fontSize: 20, color: isHot ? '#ff4d4f' : '#1890ff' }} />} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* NÚT XEM TẤT CẢ */}
                <div style={{ textAlign: 'center', marginTop: 30 }}>
                    <Button 
                        type="dashed" 
                        size="large" 
                        onClick={() => navigate('/timeline')} 
                        style={{ borderRadius: 8, color: '#1890ff', borderColor: '#1890ff' }}
                    >
                        Xem chi tiết toàn bộ lịch trình <ArrowRightOutlined />
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default HomeTimeline;