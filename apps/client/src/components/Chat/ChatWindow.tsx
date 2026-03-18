import React, { useEffect, useState, useRef } from 'react';
import { Card, Input, List, Avatar, Button, Space, Typography } from 'antd';
import { SendOutlined, CloseOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';

const { Text } = Typography;

interface ChatWindowProps {
  roomId: number;
  currentUser: any;
  receiver: any;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, currentUser, receiver, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  // 1. Khởi tạo useRef chuẩn TypeScript
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 2. Chỉ khởi tạo 1 kết nối duy nhất
    const socket = io('https://khkt-backend.onrender.com');
    socketRef.current = socket;

    // 3. Đợi kết nối thành công mới tham gia phòng (Join Room)
    socket.on('connect', () => {
      console.log("Chat kết nối thành công:", socket.id);
      socket.emit('joinRoom', roomId); // roomId gửi trực tiếp dưới dạng số
    });

    // 4. Lắng nghe tin nhắn mới (Tên sự kiện 'receiveMessage' khớp với Backend của sếp)
    socket.on('receiveMessage', (message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // 5. Lấy lịch sử tin nhắn từ API
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/rooms/${roomId}`);
        // Chú ý: Backend trả về messages bên trong object room
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
      }
    };
    fetchHistory();

    // 6. Cleanup khi đóng cửa sổ chat: Ngắt kết nối để không rò rỉ bộ nhớ
    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  // 7. Tự động cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 8. Hàm gửi tin nhắn
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const data = { 
      roomId, 
      senderId: currentUser.id, 
      content: input 
    };

    // Gửi sự kiện 'sendMessage' lên Gateway
    socketRef.current.emit('sendMessage', data);
    setInput('');
  };

  return (
    <Card
      title={
        <Space>
          <Avatar src={receiver?.avatar}>{receiver?.fullName?.[0] || 'U'}</Avatar>
          <Text strong>{receiver?.fullName}</Text>
        </Space>
      }
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      style={{ 
        width: 350, 
        position: 'fixed', 
        bottom: 20, 
        right: 20, 
        zIndex: 1000, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        borderRadius: '12px'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ height: 300, overflowY: 'auto', padding: 16, backgroundColor: '#f5f5f5' }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <div style={{ textAlign: msg.senderId === currentUser.id ? 'right' : 'left', marginBottom: 12 }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 12px', 
                borderRadius: '12px', 
                backgroundColor: msg.senderId === currentUser.id ? '#1890ff' : '#fff',
                color: msg.senderId === currentUser.id ? '#fff' : '#000',
                maxWidth: '80%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                {msg.content}
              </div>
            </div>
          )}
        />
        {/* Điểm neo để cuộn chuột */}
        <div ref={scrollRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          suffix={
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={sendMessage} 
              size="small" 
              disabled={!input.trim()}
            />
          }
        />
      </div>
    </Card>
  );
};

export default ChatWindow;