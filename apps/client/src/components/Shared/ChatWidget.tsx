import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Typography } from 'antd';
import { 
    MessageOutlined, 
    CloseOutlined, 
    SendOutlined, 
    RobotOutlined, 
    UserOutlined 
} from '@ant-design/icons';
// QUAN TRỌNG: Gọi qua file api.ts của dự án thay vì axios thuần
import api from '../../services/api'; 

const { Text } = Typography;

interface Message {
    text: string;
    isBot: boolean;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { text: "Chào bạn! Mình là Trợ lý AI hỗ trợ Nghiên cứu Khoa học. Mình có thể giúp gì cho bạn?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        setInputValue('');
        
        // 1. Thêm tin nhắn của User vào khung chat
        setMessages(prev => [...prev, { text: userText, isBot: false }]);
        setIsLoading(true);

        try {
            // 2. GỌI API CỦA NESTJS (Backend chính)
            // Thay vì gọi sang cổng 5000, chúng ta gọi endpoint NestJS mà bạn vừa tạo
            const res = await api.post('/chatbot/ask', { 
                message: userText 
            });

            // 3. Nhận kết quả và hiển thị
            if (res.data && res.data.reply) {
                setMessages(prev => [...prev, { text: res.data.reply, isBot: true }]);
            } else {
                setMessages(prev => [...prev, { text: "Hệ thống AI hiện không phản hồi. Vui lòng thử lại!", isBot: true }]);
            }
        } catch (error) {
            console.error("Lỗi gọi AI:", error);
            setMessages(prev => [...prev, { text: "Không thể kết nối đến máy chủ. Hãy đảm bảo Server đang chạy nhé!", isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
            {/* Nút bấm tròn để mở Chatbox */}
            {!isOpen && (
                <Button 
                    type="primary" 
                    shape="circle" 
                    size="large" 
                    icon={<MessageOutlined style={{ fontSize: 24 }} />} 
                    style={{ width: 60, height: 60, boxShadow: '0 4px 12px rgba(24,144,255,0.4)' }}
                    onClick={() => setIsOpen(true)}
                />
            )}

            {/* Cửa sổ Chatbox */}
            {isOpen && (
                <Card 
                    style={{ 
                        width: 350, 
                        height: 500, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        borderRadius: 16,
                        overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                    {/* Header */}
                    <div style={{ background: '#1890ff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar icon={<RobotOutlined />} style={{ background: '#fff', color: '#1890ff' }} />
                            <Text strong style={{ color: '#fff', fontSize: 16 }}>Trợ lý AI - NCKH</Text>
                        </div>
                        <Button type="text" icon={<CloseOutlined style={{ color: '#fff' }} />} onClick={() => setIsOpen(false)} />
                    </div>

                    {/* Nội dung Chat */}
                    <div style={{ flex: 1, padding: 16, overflowY: 'auto', background: '#f5f7fa' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ 
                                display: 'flex', 
                                justifyContent: msg.isBot ? 'flex-start' : 'flex-end', 
                                marginBottom: 16 
                            }}>
                                {/* SỬA LỖI Ở ĐÂY: Tự dùng Flexbox thay vì thẻ Space để đổi chiều linh hoạt */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: msg.isBot ? 'row' : 'row-reverse',
                                    alignItems: 'flex-start',
                                    gap: 12
                                }}>
                                    <Avatar 
                                        icon={msg.isBot ? <RobotOutlined /> : <UserOutlined />} 
                                        style={{ background: msg.isBot ? '#1890ff' : '#52c41a' }} 
                                    />
                                    <div style={{ 
                                        maxWidth: 220, 
                                        padding: '10px 14px', 
                                        borderRadius: 12,
                                        background: msg.isBot ? '#fff' : '#1890ff',
                                        color: msg.isBot ? '#333' : '#fff',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        borderTopLeftRadius: msg.isBot ? 0 : 12,
                                        borderTopRightRadius: msg.isBot ? 12 : 0,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                                    <Avatar icon={<RobotOutlined />} style={{ background: '#1890ff' }} />
                                    <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 12, borderTopLeftRadius: 0 }}>
                                        <Text type="secondary">AI đang suy nghĩ...</Text>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Khu vực nhập liệu */}
                    <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                        <Input 
                            placeholder="Nhập câu hỏi của bạn..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleSend}
                            disabled={isLoading}
                            style={{ borderRadius: 20 }}
                        />
                        <Button 
                            type="primary" 
                            shape="circle" 
                            icon={<SendOutlined />} 
                            onClick={handleSend}
                            loading={isLoading}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChatWidget;