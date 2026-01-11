import React, { useEffect, useState } from 'react';
import { Collapse, Typography, Input, Button, Card, Divider, Space, Empty, Spin } from 'antd';
import { QuestionCircleOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const FAQPage: React.FC = () => {
    const [faqs, setFaqs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            try {
                const res = await api.get('/faqs');
                setFaqs(res.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách câu hỏi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const filteredFaqs = faqs.filter((f: any) =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', marginTop: '64px' }}>
            {/* Tiêu đề và Thanh tìm kiếm */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <Title level={2}>
                    <QuestionCircleOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
                    Giải đáp thắc mắc (FAQ)
                </Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                    Tìm kiếm nhanh câu trả lời cho các vấn đề thường gặp trong quá trình Nghiên cứu khoa học.
                </Paragraph>
                <Input
                    placeholder="Tìm kiếm câu hỏi (ví dụ: quy định nhóm, cách nộp bài, SPSS...)"
                    size="large"
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: '600px', marginTop: '20px', borderRadius: '8px' }}
                />
            </div>

            {/* Danh sách câu hỏi */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
            ) : filteredFaqs.length > 0 ? (
                <Collapse
                    accordion
                    style={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                >
                    {filteredFaqs.map((f: any) => (
                        <Panel
                            header={<Text strong style={{ fontSize: '15px' }}>{f.question}</Text>}
                            key={f.id}
                            style={{ borderBottom: '1px solid #f0f0f0' }}
                        >
                            <Paragraph style={{ color: '#555', margin: 0, lineHeight: '1.6' }}>
                                {f.answer}
                            </Paragraph>
                        </Panel>
                    ))}
                </Collapse>
            ) : (
                <Empty description="Không tìm thấy câu hỏi phù hợp" />
            )}

            <Divider style={{ marginTop: '60px' }} />

            {/* Phần liên hệ tư vấn */}
            <Card
                style={{
                    background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)',
                    textAlign: 'center',
                    borderRadius: '15px',
                    border: 'none'
                }}
            >
                <Space direction="vertical" size="middle">
                    <Avatar
                        size={64}
                        icon={<MessageOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                    />
                    <Title level={4} style={{ margin: 0 }}>Bạn vẫn còn câu hỏi chuyên môn khác?</Title>
                    <Paragraph style={{ maxWidth: '600px', margin: '0 auto' }}>
                        Nếu không tìm thấy câu trả lời trong kho FAQ, bạn có thể gửi câu hỏi trực tiếp cho hội đồng tư vấn.
                        Đội ngũ giảng viên sẽ phản hồi qua email của bạn trong vòng 48 giờ.
                    </Paragraph>
                    <Button type="primary" size="large" shape="round" style={{ height: '45px', padding: '0 40px' }}>
                        Gửi câu hỏi tư vấn ngay
                    </Button>
                </Space>
            </Card>
        </div>
    );
};

// Import bổ sung Avatar nếu cần
import { Avatar } from 'antd';

export default FAQPage;