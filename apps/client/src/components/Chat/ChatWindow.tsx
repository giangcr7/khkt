import React, { useEffect, useState, useRef } from 'react';
import { Card, Input, List, Avatar, Button, Space, Typography, Badge } from 'antd';
import { SendOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons'; // Thêm DownOutlined
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
  const [showScrollButton, setShowScrollButton] = useState(false); // 1. Thêm state quản lý nút

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null); // 2. Thêm ref cho khung cuộn

  useEffect(() => {
    const socket = io('https://khkt-backend.onrender.com');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('joinRoom', roomId);
    });

    socket.on('receiveMessage', (message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const fetchHistory = async () => {
      try {
        const res = await api.get(`/chat/rooms/${roomId}`);
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error("Lỗi lấy lịch sử chat:", error);
      }
    };
    fetchHistory();

    return () => {
      socket.off('receiveMessage');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  // 3. Hàm cuộn xuống đáy
  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

  // Cuộn tự động khi có tin nhắn mới
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Xử lý logic hiện nút khi cuộn lên
  const handleScroll = () => {
    if (listContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listContainerRef.current;
      // Nếu cách đáy lớn hơn 50px thì hiện nút
      const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 50;
      setShowScrollButton(isNotAtBottom);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    const data = { roomId, senderId: currentUser.id, content: input };
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
        width: 350, position: 'fixed', bottom: 20, right: 100, 
        zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '12px'
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ position: 'relative' }}> {/* Bọc relative để nút absolute chuẩn xác */}
        <div 
          ref={listContainerRef} 
          onScroll={handleScroll} // Bắt sự kiện cuộn
          style={{ height: 300, overflowY: 'auto', padding: 16, backgroundColor: '#f5f5f5' }}
        >
          <List
            dataSource={messages}
            renderItem={(msg) => {
              const isMine = String(msg.senderId) === String(currentUser.id);
              return (
                <div style={{ textAlign: isMine ? 'right' : 'left', marginBottom: 12, padding: '0 10px' }}>
                  {!isMine && (
                    <div style={{ fontSize: '10px', color: '#8c8c8c', marginLeft: '8px', marginBottom: '2px' }}>
                      {receiver.fullName}
                    </div>
                  )}
                  <div style={{ 
                    display: 'inline-block', padding: '8px 12px', 
                    borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                    backgroundColor: isMine ? '#1890ff' : '#e8e8e8', 
                    color: isMine ? '#fff' : '#000', maxWidth: '80%', 
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textAlign: 'left' 
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            }}
          />
          <div ref={scrollRef} />
        </div>

        {/* 5. Nút cuộn xuống (Chỉ hiện khi showScrollButton = true) */}
        {showScrollButton && (
          <Button
            type="primary"
            shape="circle"
            icon={<DownOutlined />}
            size="small"
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: 10,
              right: '50%',
              transform: 'translateX(50%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: 0.8
            }}
          />
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          suffix={
            <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} size="small" disabled={!input.trim()} />
          }
        />
      </div>
    </Card>
  );
};

export default ChatWindow;