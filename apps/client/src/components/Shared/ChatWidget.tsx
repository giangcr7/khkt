import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Avatar, Card, Space, Typography, Tag } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../services/api";

const { Text } = Typography;

// ✅ 5 CÂU HỎI MẪU MỚI
const INITIAL_QUESTIONS = [
  "NCKH sinh viên là gì?",
  "Tham gia NCKH có bắt buộc không?",
  "Một đề tài NCKH tối đa bao nhiêu thành viên?",
  "Các bước cơ bản để thực hiện một đề tài nghiên cứu khoa học là gì?",
  "Quy trình chuẩn bị cho buổi bảo vệ đề tài gồm những bước nào?",
];

const ChatWidget: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableQuestions, setAvailableQuestions] =
    useState<string[]>(INITIAL_QUESTIONS);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (content?: string) => {
    const textToSend = content || inputValue;
    if (!textToSend.trim()) return;

    if (availableQuestions.includes(textToSend)) {
      setAvailableQuestions((prev) => prev.filter((q) => q !== textToSend));
    }

    const userMsg = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/ask", { message: textToSend });
      const botMsg = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "AI đang bận, thử lại sau nhé!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 30, right: 30, zIndex: 1000 }}>
      {/* BUTTON */}
      {!visible && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => setVisible(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1890ff, #40a9ff)",
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
          }}
        />
      )}

      {/* CHAT BOX */}
      {visible && (
        <Card
          title={
            <Space>
              <RobotOutlined />
              <Text strong style={{ color: "#fff" }}>
                AI NCKH Assistant
              </Text>
            </Space>
          }
          extra={
            <CloseOutlined
              onClick={() => setVisible(false)}
              style={{ color: "#fff" }}
            />
          }
          style={{
            width: 380,
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            maxHeight: 550,
          }}
          headStyle={{
            background: "linear-gradient(135deg, #1890ff, #40a9ff)",
            color: "#fff",
          }}
          bodyStyle={{
            padding: 0,
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          {/* CHAT CONTENT */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              background: "#f4f6f8",
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Avatar
                  size={64}
                  icon={<RobotOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div style={{ marginTop: 10 }}>
                  Xin chào 👋
                  <br />
                  Hỏi mình về NCKH nhé!
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                {m.role === "assistant" && (
                  <Avatar
                    size={32}
                    icon={<RobotOutlined />}
                    style={{ marginRight: 8 }}
                  />
                )}

                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 16,
                    maxWidth: "75%",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #1890ff, #40a9ff)"
                        : "#fff",
                    color: m.role === "user" ? "#fff" : "#333",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {m.content}
                </div>

                {m.role === "user" && (
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </div>
            ))}

            {loading && (
              <div style={{ fontStyle: "italic", color: "#888" }}>
                🤖 AI đang suy nghĩ...
              </div>
            )}
          </div>

          {/* QUICK QUESTIONS */}
          {availableQuestions.length > 0 && (
            <div
              style={{
                padding: 12,
                background: "#fff",
                borderTop: "1px solid #eee",
              }}
            >
              <Text type="secondary" style={{ fontSize: 11 }}>
                GỢI Ý:
              </Text>
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                {availableQuestions.map((q, i) => (
                  <Tag
                    key={i}
                    color="blue"
                    style={{
                      cursor: "pointer",
                      borderRadius: 20,
                      padding: "6px 12px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => handleSendMessage(q)}
                  >
                    {q}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          {/* INPUT */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid #eee",
              background: "#fff",
            }}
          >
            <Input
              placeholder="Nhập câu hỏi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={() => handleSendMessage()}
              disabled={loading}
              suffix={
                <SendOutlined
                  onClick={() => handleSendMessage()}
                  style={{ color: "#1890ff", cursor: "pointer" }}
                />
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;
