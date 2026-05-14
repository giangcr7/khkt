import React, { useEffect, useState, useRef } from "react";
import { Card, Input, Avatar, Button, Space, Typography } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { io, Socket } from "socket.io-client";
import api from "../../services/api";

const { Text } = Typography;

interface ChatWindowProps {
  roomId: number;
  currentUser: any;
  receiver: any;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  currentUser,
  receiver,
  onClose,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // ==============================
  // SOCKET + LOAD HISTORY
  // ==============================
  useEffect(() => {
    const socket = io("https://khkt-backend.onrender.com");

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRoom", roomId);
    });

    socket.on("receiveMessage", (message) => {
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
      socket.off("receiveMessage");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  // ==============================
  // AUTO SCROLL
  // ==============================
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!listContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      listContainerRef.current;

    const isNotAtBottom =
      scrollHeight - scrollTop - clientHeight > 50;

    setShowScrollButton(isNotAtBottom);
  };

  // ==============================
  // SEND MESSAGE
  // ==============================
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      roomId,
      senderId: currentUser.id,
      content: input.trim(),
    });

    setInput("");
  };

  return (
    <Card
      title={
        <Space>
          <Avatar src={receiver?.avatar}>
            {receiver?.fullName?.[0] || "U"}
          </Avatar>

          <Text strong>{receiver?.fullName}</Text>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
        />
      }
      style={{
        width: 380,
        position: "fixed",
        bottom: 20,
        right: 100,
        zIndex: 1000,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      {/* ========================= */}
      {/* CHAT BODY */}
      {/* ========================= */}
      <div style={{ position: "relative" }}>
        <div
          ref={listContainerRef}
          onScroll={handleScroll}
          style={{
            height: 420,
            overflowY: "auto",
            padding: 16,
            background:
              "linear-gradient(to bottom, #f7f9fc, #eef2f7)",
          }}
        >
          {messages.map((msg, index) => {
            const isMine =
              String(msg.senderId) ===
              String(currentUser.id);

            return (
              <div
                key={msg.id || index}
                style={{
                  display: "flex",
                  justifyContent: isMine
                    ? "flex-end"
                    : "flex-start",
                  marginBottom: 16,
                  width: "100%",
                  paddingLeft: isMine ? "18%" : 0,
                  paddingRight: !isMine ? "18%" : 0,
                }}
              >
                {/* ========================= */}
                {/* AVATAR NGƯỜI KHÁC */}
                {/* ========================= */}
                {!isMine && (
                  <Avatar
                    src={msg.sender?.avatar}
                    style={{
                      marginRight: 8,
                      alignSelf: "flex-end",
                      flexShrink: 0,
                    }}
                  >
                    {msg.sender?.fullName?.[0] || "U"}
                  </Avatar>
                )}

                {/* ========================= */}
                {/* CONTENT */}
                {/* ========================= */}
                <div
                  style={{
                    maxWidth: "100%",
                    width: "fit-content",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isMine
                      ? "flex-end"
                      : "flex-start",
                  }}
                >
                  {/* Tên người gửi */}
                  {!isMine && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#888",
                        marginBottom: 4,
                        marginLeft: 4,
                      }}
                    >
                      {msg.sender?.fullName}
                    </Text>
                  )}

                  {/* ========================= */}
                  {/* MESSAGE BUBBLE */}
                  {/* ========================= */}
                  <div
                    style={{
                      padding: "10px 14px",

                      borderRadius: isMine
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",

                      background: isMine
                        ? "linear-gradient(135deg, #1677ff, #4096ff)"
                        : "#ffffff",

                      color: isMine ? "#fff" : "#000",

                      border: isMine
                        ? "none"
                        : "1px solid #e8e8e8",

                      boxShadow:
                        "0 2px 8px rgba(0,0,0,0.06)",

                      wordBreak: "break-word",

                      whiteSpace: "pre-wrap",

                      display: "inline-block",

                      lineHeight: 1.5,

                      fontSize: 14,
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* ========================= */}
                  {/* TIME */}
                  {/* ========================= */}
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#999",
                      marginTop: 4,
                      padding: "0 4px",
                    }}
                  >
                    {msg.createdAt
                      ? new Date(
                          msg.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </div>

                {/* ========================= */}
                {/* AVATAR CỦA MÌNH */}
                {/* ========================= */}
                {isMine && (
                  <Avatar
                    src={currentUser?.avatar}
                    style={{
                      marginLeft: 8,
                      alignSelf: "flex-end",
                      background: "#1677ff",
                      flexShrink: 0,
                    }}
                  >
                    {currentUser?.fullName?.[0] || "T"}
                  </Avatar>
                )}
              </div>
            );
          })}

          <div ref={scrollRef} />
        </div>

        {/* ========================= */}
        {/* SCROLL BUTTON */}
        {/* ========================= */}
        {showScrollButton && (
          <Button
            type="primary"
            shape="circle"
            icon={<DownOutlined />}
            size="small"
            onClick={scrollToBottom}
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              opacity: 0.9,
            }}
          />
        )}
      </div>

      {/* ========================= */}
      {/* INPUT */}
      {/* ========================= */}
      <div
        style={{
          padding: 12,
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          size="large"
          suffix={
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!input.trim()}
            />
          }
        />
      </div>
    </Card>
  );
};

export default ChatWindow;