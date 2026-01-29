import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Typography, Steps, Card, Row, Col, Statistic, Button, Progress, List, Tag, Avatar, Space, Badge, Empty, Spin, Divider, message } from 'antd';
import {
    FileSearchOutlined, TeamOutlined, FileProtectOutlined, CheckCircleOutlined,
    ProjectOutlined, BellOutlined, UserAddOutlined, FireOutlined, MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';
import { io, Socket } from 'socket.io-client';
import ChatWindow from '../../components/Chat/ChatWindow';

const { Title, Paragraph, Text } = Typography;

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const socketRef = useRef<Socket>();

    const [project, setProject] = useState<any>(null);
    const [recruitments, setRecruitments] = useState([]);
    const [rooms, setRooms] = useState<any[]>([]); 
    const [unreadNotis, setUnreadNotis] = useState(0);
    const [deadline, setDeadline] = useState<{ days: number; date: string; title: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeChat, setActiveChat] = useState<{ roomId: number, receiver: any } | null>(null);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Sử dụng useCallback để hàm có thể được gọi ổn định từ useEffect và các event handlers
    const fetchDashboardData = useCallback(async () => {
        try {
            // 1. Lấy tin tuyển dụng
            const recruitRes = await api.get('/recruitment'); 
            const recruitList = Array.isArray(recruitRes.data) ? recruitRes.data : (recruitRes.data.data || []);
            setRecruitments(recruitList.slice(0, 3)); 

            // 2. Lấy danh sách phòng chat
            const chatRes = await api.get('/chat/rooms');
            setRooms(chatRes.data.slice(0, 5)); 

            // 3. Lấy sự kiện
            const eventsRes = await api.get('/events');
            const eventList = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.data || []);
            
            const nextEvent = eventList
                .filter((ev: any) => dayjs(ev.startDate).isAfter(dayjs())) 
                .sort((a: any, b: any) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix())[0];

            if (nextEvent) {
                setDeadline({
                    days: dayjs(nextEvent.startDate).diff(dayjs(), 'day'),
                    date: dayjs(nextEvent.startDate).format('DD/MM/YYYY'),
                    title: nextEvent.title
                });
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Khởi tạo socket
        socketRef.current = io('http://localhost:3000'); 

        fetchDashboardData();

        // Lắng nghe tin nhắn mới để cập nhật danh sách hội thoại real-time
        socketRef.current.on('receiveMessage', (newMessage) => {
            setRooms((prevRooms) => {
                const roomIndex = prevRooms.findIndex(r => r.id === newMessage.roomId);
                
                if (roomIndex !== -1) {
                    const updatedRooms = [...prevRooms];
                    updatedRooms[roomIndex] = {
                        ...updatedRooms[roomIndex],
                        messages: [newMessage],
                        updatedAt: new Date()
                    };
                    // Sắp xếp phòng mới nhất lên đầu
                    return updatedRooms.sort((a, b) => dayjs(b.updatedAt).unix() - dayjs(a.updatedAt).unix());
                } else {
                    // Nếu là phòng chat mới hoàn toàn, load lại danh sách
                    fetchDashboardData();
                    return prevRooms;
                }
            });

            if (newMessage.senderId !== currentUser.id) {
                message.info(`Tin nhắn mới từ ${newMessage.sender.fullName}`);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [fetchDashboardData, currentUser.id]);

    const getStatusStep = (status: string) => {
        const steps: any = { 'PENDING': 0, 'APPROVED': 1, 'IN_PROGRESS': 2, 'COMPLETED': 4 };
        return steps[status] || 0;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang đồng bộ..." /></div>;

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Title level={3}>Bảng điều khiển Sinh viên</Title>
                    <Paragraph type="secondary">Chào mừng bạn trở lại.</Paragraph>
                </div>
                <Badge count={unreadNotis}>
                    <Button icon={<BellOutlined />} shape="circle" onClick={() => navigate('/student/notifications')} />
                </Badge>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card
                        title="Đề tài nghiên cứu"
                        extra={<Button type="link" onClick={() => navigate('/student/my-project')}>Quản lý</Button>}
                        style={{ marginBottom: 24, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                        {project ? (
                            <Row align="middle" gutter={24}>
                                <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
                                    <Progress type="circle" percent={project.progress || 0} width={100} />
                                </Col>
                                <Col xs={24} sm={18}>
                                    <Title level={4}>{project.name}</Title>
                                    <Tag color="processing">{project.status}</Tag>
                                </Col>
                            </Row>
                        ) : (
                            <Empty description="Bạn chưa đăng ký đề tài nào.">
                                <Button type="primary" onClick={() => navigate('/student/my-project')}>Bắt đầu ngay</Button>
                            </Empty>
                        )}
                    </Card>

                    {/* Chat List */}
                    <Card 
                        title={<span><MessageOutlined /> Tin nhắn chờ phản hồi</span>}
                        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                        bodyStyle={{ padding: '0 24px' }}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={rooms}
                            locale={{ emptyText: <Empty description="Không có tin nhắn" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                            renderItem={(room: any) => {
                                const partner = room.user1Id === currentUser.id ? room.user2 : room.user1;
                                const lastMsg = room.messages && room.messages[0];
                                return (
                                    <List.Item 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setActiveChat({ roomId: room.id, receiver: partner })}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Badge dot={lastMsg && !lastMsg.isRead && lastMsg.senderId !== currentUser.id}>
                                                    <Avatar src={partner?.avatar}>{partner?.fullName?.charAt(0)}</Avatar>
                                                </Badge>
                                            }
                                            title={<Text strong>{partner?.fullName}</Text>}
                                            description={<Text ellipsis type="secondary">{lastMsg ? lastMsg.content : "..."}</Text>}
                                        />
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {lastMsg ? dayjs(lastMsg.createdAt).format('HH:mm') : ''}
                                        </Text>
                                    </List.Item>
                                );
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={<span><FireOutlined style={{ color: '#ff4d4f' }} /> Tuyển đồng đội</span>}
                        style={{ marginBottom: 24, borderRadius: '12px' }}
                        extra={<Button type="link" onClick={() => navigate('/student/recruitment')}>Tất cả</Button>}
                    >
                        <List
                            dataSource={recruitments}
                            renderItem={(item: any) => (
                                <List.Item 
                                    style={{ cursor: 'pointer', padding: '8px' }}
                                    onClick={() => navigate(`/student/recruitment/${item.id}`)}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.author?.avatar}>{item.author?.fullName[0]}</Avatar>}
                                        title={<Text strong>{item.title}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
                        <Statistic
                            title={deadline ? deadline.title : "Sự kiện"}
                            value={deadline ? deadline.days : '--'}
                            suffix="ngày"
                        />
                    </Card>
                </Col>
            </Row>

            {activeChat && (
                <ChatWindow 
                    roomId={activeChat.roomId}
                    currentUser={currentUser}
                    receiver={activeChat.receiver}
                    onClose={() => {
                        setActiveChat(null);
                        fetchDashboardData(); 
                    }}
                />
            )}
        </div>
    );
};

export default StudentDashboard;