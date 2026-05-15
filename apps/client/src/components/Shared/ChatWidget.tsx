import React, { useState, useRef, useEffect } from "react";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CloseOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import api from "../../services/api";

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
  const [retryMsg, setRetryMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, retryMsg]);

  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const fetchWithRetry = async (message: string) => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 5000;

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await api.post("/chatbot/ask", { message });
        return res.data.reply;
      } catch (error: any) {
        const is503 = error?.response?.status === 503;
        const isLast = i === MAX_RETRIES - 1;

        if (is503 && !isLast) {
          setRetryMsg(`⏳ Server đang khởi động, vui lòng chờ... (${i + 1}/${MAX_RETRIES})`);
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        }
        throw error;
      }
    }
  };

  const handleSendMessage = async (content?: string) => {
    const textToSend = content || inputValue;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setInputValue("");
    setLoading(true);
    setRetryMsg("");

    try {
      const reply = await fetchWithRetry(textToSend);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Không thể kết nối đến server, vui lòng thử lại sau!",
        },
      ]);
    } finally {
      setLoading(false);
      setRetryMsg("");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; font-family: 'Be Vietnam Pro', sans-serif; }

        .chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }

        .chat-toggle-btn {
          width: 58px; height: 58px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white; font-size: 22px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(37,99,235,.35); transition: .2s ease;
        }
        .chat-toggle-btn:hover { transform: scale(1.06); }

        .chat-box {
          width: 360px; height: 520px; background: white;
          border-radius: 22px; overflow: hidden; display: flex;
          flex-direction: column; box-shadow: 0 18px 50px rgba(0,0,0,.18);
        }

        .chat-header {
          padding: 16px 18px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          display: flex; align-items: center; justify-content: space-between;
        }
        .chat-header-info { display: flex; align-items: center; gap: 12px; }
        .chat-avatar-header {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 18px;
        }
        .chat-header-title { color: white; font-size: 15px; font-weight: 700; }
        .chat-header-sub { color: rgba(255,255,255,.75); font-size: 12px; margin-top: 2px; }
        .chat-header-close {
          width: 32px; height: 32px; border: none; border-radius: 50%;
          background: rgba(255,255,255,.15); color: white; cursor: pointer;
        }

        .chat-messages {
          flex: 1; overflow-y: auto; padding: 18px 14px;
          background: #f8fafc; display: flex; flex-direction: column; gap: 14px;
        }

        .chat-empty {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; flex: 1; text-align: center; padding: 20px;
        }
        .chat-empty-icon {
          width: 70px; height: 70px; border-radius: 50%;
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; margin-bottom: 16px;
        }
        .chat-empty-title { font-size: 18px; font-weight: 700; color: #0f172a; }
        .chat-empty-sub { margin-top: 8px; color: #64748b; font-size: 13px; line-height: 1.6; }

        .quick-questions {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px;
        }
        .quick-chip {
          padding: 8px 12px; border-radius: 999px; background: white;
          border: 1px solid #dbeafe; color: #2563eb; font-size: 11.5px;
          font-weight: 500; cursor: pointer; transition: .2s;
        }
        .quick-chip:hover { background: #eff6ff; }

        .retry-msg {
          text-align: center; font-size: 12px; color: #64748b;
          padding: 8px 12px; background: #f1f5f9; border-radius: 8px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }

        .typing-indicator {
          display: flex; align-items: center; gap: 8px;
        }
        .typing-dots {
          display: flex; gap: 4px; padding: 10px 14px;
          background: white; border-radius: 16px; border-bottom-left-radius: 4px;
        }
        .typing-dots span {
          width: 7px; height: 7px; border-radius: 50%; background: #94a3b8;
          animation: bounce 1.2s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: .2s; }
        .typing-dots span:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }

        .msg-row { display: flex; align-items: flex-end; gap: 8px; }
        .msg-row.user { flex-direction: row-reverse; }
        .msg-avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 14px;
        }
        .msg-avatar.bot { background: linear-gradient(135deg, #dbeafe, #93c5fd); color: #2563eb; }
        .msg-avatar.user-av { background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; }

        .msg-bubble {
          max-width: 72%; padding: 10px 14px; border-radius: 16px;
          font-size: 13px; line-height: 1.6; word-break: break-word;
        }
        .msg-bubble.bot { background: white; color: #1e293b; border-bottom-left-radius: 4px; }
        .msg-bubble.user {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white; border-bottom-right-radius: 4px;
        }

        .chat-input-area { padding: 12px 14px; background: white; border-top: 1px solid #f1f5f9; }
        .chat-input-wrap {
          display: flex; align-items: center; gap: 10px; background: #f8fafc;
          border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 8px 12px;
        }
        .chat-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-size: 13.5px; }
        .send-btn {
          width: 34px; height: 34px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white; cursor: pointer;
        }
        .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="chat-widget">
        {!visible && (
          <button className="chat-toggle-btn" onClick={() => setVisible(true)}>
            <MessageOutlined />
          </button>
        )}

        {visible && (
          <div className="chat-box">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar-header">
                  <RobotOutlined />
                </div>
                <div>
                  <div className="chat-header-title">AI NCKH Assistant</div>
                  <div className="chat-header-sub">Luôn sẵn sàng hỗ trợ bạn</div>
                </div>
              </div>
              <button className="chat-header-close" onClick={() => setVisible(false)}>
                <CloseOutlined />
              </button>
            </div>

            <div className="chat-messages" ref={scrollRef}>
              <div className="quick-questions">
                {INITIAL_QUESTIONS.map((q, i) => (
                  <div key={i} className="quick-chip" onClick={() => handleSendMessage(q)}>
                    {q}
                  </div>
                ))}
              </div>

              {messages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">🤖</div>
                  <div className="chat-empty-title">Xin chào 👋</div>
                  <div className="chat-empty-sub">
                    Mình là trợ lý AI hỗ trợ về Nghiên cứu Khoa học.
                    <br />
                    Bạn muốn hỏi gì?
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role === "user" ? "user" : ""}`}>
                  <div className={`msg-avatar ${m.role === "user" ? "user-av" : "bot"}`}>
                    {m.role === "user" ? <UserOutlined /> : <RobotOutlined />}
                  </div>
                  <div className={`msg-bubble ${m.role === "user" ? "user" : "bot"}`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && !retryMsg && (
                <div className="typing-indicator">
                  <div className="msg-avatar bot">
                    <RobotOutlined />
                  </div>
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {/* Retry message */}
              {retryMsg && <div className="retry-msg">{retryMsg}</div>}
            </div>

            <div className="chat-input-area">
              <div className="chat-input-wrap">
                <input
                  ref={inputRef}
                  placeholder="Nhập câu hỏi..."
                  value={inputValue}
                  disabled={loading}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  className="send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={loading || !inputValue.trim()}
                >
                  <SendOutlined />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;