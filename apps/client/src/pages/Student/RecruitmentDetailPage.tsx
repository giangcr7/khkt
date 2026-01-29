import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Tag, Space, Spin, message, Divider } from 'antd';
import { ArrowLeftOutlined, SendOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../../services/api';
import ChatWindow from '../../components/Chat/ChatWindow';

const { Title, Paragraph, Text } = Typography;

const RecruitmentDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    const [chatConfig, setChatConfig] = useState<{ roomId: number, receiver: any } | null>(null);

    const currentUserStr = localStorage.getItem('user');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    useEffect(() => {
        api.get(`/recruitment/${id}`)
            .then(res => setData(res.data))
            .catch(() => message.error('Không thể tải thông tin'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleOpenChat = async () => {
        if (!currentUser) {
            message.warning("Vui lòng đăng nhập để sử dụng tính năng này");
            return;
        }
        
        // Lấy ID người nhận một cách an toàn nhất
        const receiverId = data?.authorId || data?.author?.id;
        
        if (!receiverId) {
            message.error("Lỗi dữ liệu: Không tìm thấy ID người đăng bài!");
            return;
        }

        if (currentUser.id === receiverId) {
            message.info("Đây là bài đăng của bạn");
            return;
        }

        try {
            // Ép kiểu Number để chắc chắn không gửi chuỗi rỗng hoặc undefined lên Backend
            const res = await api.post('/chat/rooms', { receiverId: Number(receiverId) });
            
            setChatConfig({
                roomId: res.data.id,
                receiver: data.author
            });
        } catch (error: any) {
            console.error("Chat error:", error);
            // Hiển thị lỗi chi tiết từ Backend (Ví dụ: "Không tìm thấy người dùng")
            const errorMsg = error.response?.data?.message || 'Không thể kết nối phòng chat';
            message.error(errorMsg);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

return (
    <div style={{ padding: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            Quay lại
        </Button>
        
        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Title level={3}>{data?.title}</Title>
            <Space style={{ marginBottom: 16 }}>
                <Tag color={data?.status === 'OPEN' ? 'green' : 'red'}>{data?.status}</Tag>
                <Text type="secondary">Đăng bởi: <Text strong>{data?.author?.fullName}</Text></Text>
            </Space>
            <Divider />
            
            <Title level={5}>Nội dung tuyển dụng:</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>{data?.content}</Paragraph>
            
            <div style={{ marginTop: 24 }}>
                <Title level={5}>Kỹ năng yêu cầu:</Title>
                <Space wrap>
                    {data?.skills?.map((s: string) => <Tag color="blue" key={s} style={{ padding: '4px 12px', borderRadius: '4px' }}>{s}</Tag>)}
                </Space>
            </div>

            <Space size="middle" style={{ marginTop: 40, width: '100%' }}>
                {/* 1. Chỉ hiện nút Gửi yêu cầu nếu KHÔNG PHẢI là chủ bài đăng */}
                {currentUser?.id !== (data?.authorId || data?.author?.id) && (
                    <Button 
                        type="primary" 
                        icon={<SendOutlined />} 
                        size="large"
                        style={{ height: '45px', borderRadius: '8px' }}
                    >
                        Gửi yêu cầu tham gia nhóm
                    </Button>
                )}
                
                {/* 2. Vô hiệu hóa nút Chat nếu là chính mình */}
                <Button 
                    icon={<MessageOutlined />} 
                    size="large"
                    onClick={handleOpenChat}
                    // Vô hiệu hóa nút dựa trên ID người dùng
                    disabled={currentUser?.id === (data?.authorId || data?.author?.id)}
                    style={{ 
                        height: '45px', 
                        borderRadius: '8px',
                        // Đổi màu để người dùng biết nút bị khóa
                        cursor: currentUser?.id === (data?.authorId || data?.author?.id) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {currentUser?.id === (data?.authorId || data?.author?.id) 
                        ? "Bài đăng của bạn" 
                        : "Nhắn tin trao đổi"}
                </Button>
            </Space>
        </Card>

        {chatConfig && (
            <ChatWindow 
                roomId={chatConfig.roomId}
                currentUser={currentUser}
                receiver={chatConfig.receiver}
                onClose={() => setChatConfig(null)}
            />
        )}
    </div>
);
};

export default RecruitmentDetailPage;