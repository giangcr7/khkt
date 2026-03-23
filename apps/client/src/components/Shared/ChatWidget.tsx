import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Avatar, Card, Space, Typography, Tag } from 'antd';
import { 
    MessageOutlined, CloseOutlined, SendOutlined, 
    RobotOutlined
} from '@ant-design/icons';
// Import axios thuần để gọi API AI độc lập
import axios from 'axios';

const { Text } = Typography;

// 👇 BỘ CÂU HỎI GỢI Ý (QUICK REPLIES)
const QUICK_QUESTIONS = [
    "NCKH là gì và tại sao nên tham gia?",
    "Cách tìm ý tưởng đề tài phù hợp?",
    "Quyền lợi & điểm rèn luyện khi NCKH?",
    "Quy định số thành viên & cách đăng ký nhóm?"
];

const ChatWidget: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content?: string) => {
        const textToSend = content || inputValue;
        if (!textToSend.trim()) return;

        const userMsg = { role: 'user', content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setLoading(true);

        try {
            // 👇 GỌI THẲNG API ĐẾN SERVER AI CỦA SẾP
            // Chú ý: Sếp kiểm tra lại endpoint ở đuôi. Thường server AI người ta hay đặt là /chat hoặc /api/chat. 
            // Nếu sếp set endpoint khác thì đổi chữ '/chat' bên dưới thành endpoint của sếp nhé.
            const res = await axios.post('https://khkt-ai-server.onrender.com/chat', { 
                prompt: textToSend 
            });
            
            // Giả sử API trả về dạng { answer: "Câu trả lời..." } hoặc { response: "..." }
            const botMsg = { 
                role: 'assistant', 
                content: res.data.answer || res.data.response || res.data 
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Server AI đang ngủ gật, sếp đợi 1 phút cho nó tỉnh dậy rồi hỏi lại nhé!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
            {/* NÚT BẤM MỞ CHAT */}
            {!visible && (
                <Button 
                    type="primary" shape="circle" size="large" 
                    icon={<MessageOutlined />} 
                    onClick={() => setVisible(true)}
                    style={{ width: 60, height: 60, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                />
            )}

            {/* KHUNG CHAT WINDOW */}
            {visible && (
                <Card
                    title={
                        <Space><RobotOutlined /> <Text strong style={{ color: '#fff' }}>Trợ lý AI - NCKH</Text></Space>
                    }
                    extra={<CloseOutlined onClick={() => setVisible(false)} style={{ color: '#fff' }} />}
                    style={{ width: 380, borderRadius: '15px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                    headStyle={{ background: '#1890ff', color: '#fff' }}
                    bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: 450 }}
                >
                    {/* 1. NỘI DUNG CHAT */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f9f9f9' }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 20 }}>
                                <Avatar size={64} icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
                                <div style={{ marginTop: 10 }}>Chào bạn! Mình có thể giúp gì cho bạn về NCKH?</div>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: 12, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                                <div style={{ 
                                    display: 'inline-block', padding: '10px 14px', borderRadius: '15px',
                                    maxWidth: '85%', background: m.role === 'user' ? '#1890ff' : '#fff',
                                    color: m.role === 'user' ? '#fff' : '#333',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>AI đang lục tìm trí nhớ...</div>}
                    </div>

                    {/* 2. CÁC CÂU HỎI GỢI Ý (CHỈ HIỆN KHI MỚI VÀO) */}
                    {messages.length === 0 && (
                        <div style={{ padding: '10px', background: '#f9f9f9' }}>
                            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: 8 }}>CÂU HỎI GỢI Ý:</Text>
                            <Space wrap size={[4, 8]}>
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <Tag 
                                        key={i} color="blue" 
                                        style={{ cursor: 'pointer', borderRadius: '10px', padding: '2px 10px' }}
                                        onClick={() => handleSendMessage(q)}
                                    >
                                        {q}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    )}

                    {/* 3. Ô NHẬP TIN NHẮN */}
                    <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
                        <Input
                            placeholder="Nhập câu hỏi của bạn..."
                            suffix={<SendOutlined onClick={() => handleSendMessage()} style={{ color: '#1890ff', cursor: 'pointer' }} />}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onPressEnter={() => handleSendMessage()}
                            disabled={loading}
                            bordered={false}
                        />
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChatWidget;