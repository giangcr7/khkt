import React from 'react';
import { Timeline, Typography, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

const HomeTimeline: React.FC<{ events: any[] }> = ({ events }) => {
    const navigate = useNavigate();

    const timelineItems = events.slice(0, 4).map((ev: any) => ({
        color: ev.isImportant ? 'red' : 'blue',
        label: <Text strong>{dayjs(ev.startDate).format('DD/MM')}</Text>,
        children: (
            <div style={{ marginBottom: 15 }}>
                <Text strong>{ev.title}</Text>
                <Paragraph type="secondary" style={{ fontSize: '12px', marginBottom: 4 }}>{ev.description}</Paragraph>
                {ev.fileUrl && (
                    <Button size="small" type="link" icon={<DownloadOutlined />}
                        href={`${import.meta.env.VITE_API_URL}${ev.fileUrl}`} target="_blank" style={{ padding: 0 }}>
                        Tải tài liệu
                    </Button>
                )}
            </div>
        ),
    }));

    return (
        <>
            <Timeline items={timelineItems} />
            <Button block type="primary" onClick={() => navigate('/timeline')}>Xem toàn bộ lịch trình</Button>
        </>
    );
};

export default HomeTimeline;