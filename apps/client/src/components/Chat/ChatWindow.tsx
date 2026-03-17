import React, { useEffect, useState, useRef } from 'react';
import { Card, Input, List, Avatar, Button, Space, Typography } from 'antd';
import { SendOutlined, CloseOutlined, MessageOutlined } from '@ant-design/icons';
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
  const socketRef = useRef<Socket>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Kết nối Socket
    socketRef.current = io('http://localhost:3000'); 

    // 2. Tham gia phòng chat
    socketRef.current.emit('joinRoom', roomId);

    // 3. Lắng nghe tin nhắn mới
    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // 4. Lấy lịch sử tin nhắn từ API
    const fetchHistory = async () => {
      const res = await api.get(`/chat/rooms/${roomId}`);
      setMessages(res.data.messages || []);
    };
    fetchHistory();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const data = { roomId, senderId: currentUser.id, content: input };
    socketRef.current?.emit('sendMessage', data);
    setInput('');
  };

  return (
    <Card
      title={<Space><Avatar src={receiver.avatar}>{receiver.fullName[0]}</Avatar><Text strong>{receiver.fullName}</Text></Space>}
      extra={<Button type="text" icon={<CloseOutlined />} onClick={onClose} />}
      style={{ width: 350, position: 'fixed', bottom: 20, right: 20, zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
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
                maxWidth: '80%'
              }}>
                {msg.content}
              </div>
            </div>
          )}
        />
        <div ref={scrollRef} />
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          suffix={<Button type="primary" icon={<SendOutlined />} onClick={sendMessage} size="small" />}
        />
      </div>
    </Card>
  );
};

export default ChatWindow;