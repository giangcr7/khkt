import React, { useEffect, useState } from 'react';
import { Collapse, Typography, Empty, Spin, Tag, Layout } from 'antd';
import { RobotOutlined, BulbOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Content } = Layout;

const FAQPage: React.FC = () => {
    const [faqs, setFaqs] = useState([]);
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

    return (
        <Layout style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '80px' }}>
            
            {/* KHU VỰC BANNER CHUYÊN NGHIỆP */}
            <div style={{
                background: '#1a3353', // Màu xanh đen sang trọng chuẩn giáo dục
                padding: '80px 20px 100px 20px',
                textAlign: 'center',
                color: '#fff'
            }}>
                <Title level={1} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>
                    Câu hỏi thường gặp (FAQ)
                </Title>
                <Paragraph style={{ color: '#91caff', fontSize: '18px', marginTop: '16px', maxWidth: '650px', margin: '16px auto 0' }}>
                    Tổng hợp các giải đáp về quy chế, thể lệ và hướng dẫn thực hiện Nghiên cứu khoa học dành cho sinh viên.
                </Paragraph>
            </div>
            <Content style={{ maxWidth: '900px', margin: '-40px auto 0', width: '100%', padding: '0 20px' }}>
                
                {/* GỢI Ý CHATBOT NỔI BẬT */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Tag 
                        icon={<RobotOutlined style={{ fontSize: 18 }} />} 
                        color="blue" 
                        style={{ 
                            padding: '12px 24px', 
                            borderRadius: '30px', 
                            fontSize: '15px', 
                            cursor: 'pointer', 
                            boxShadow: '0 4px 15px rgba(24,144,255,0.3)', 
                            border: 'none',
                            fontWeight: 500
                        }}
                        onClick={() => {
                            // Tự động mở Chatbot khi click
                            const chatBtn = document.querySelector('.ant-btn-circle.ant-btn-lg') as HTMLElement;
                            if(chatBtn) chatBtn.click();
                        }}
                    >
                        Chưa tìm thấy đáp án? Hỏi ngay Trợ lý AI của chúng tôi!
                    </Tag>
                </div>

                {/* KHUNG DANH SÁCH CÂU HỎI */}
                <div style={{ 
                    background: '#fff', 
                    padding: '40px', 
                    borderRadius: '16px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}><Spin size="large" /></div>
                    ) : faqs.length > 0 ? (
                        <Collapse
                            accordion
                            bordered={false}
                            expandIcon={({ isActive }) => <BulbOutlined style={{ fontSize: 20, color: isActive ? '#1890ff' : '#bfbfbf' }} />}
                            style={{ background: '#fff' }}
                        >
                            {faqs.map((f: any) => (
                                <Panel
                                    header={<Text strong style={{ fontSize: '16px', color: '#262626' }}>{f.question}</Text>}
                                    key={f.id}
                                    style={{ borderBottom: '1px solid #f0f0f0', padding: '12px 0' }}
                                >
                                    <Paragraph style={{ 
                                        color: '#595959', 
                                        margin: 0, 
                                        lineHeight: '1.8', 
                                        fontSize: '15px', 
                                        whiteSpace: 'pre-wrap', 
                                        paddingLeft: '32px' 
                                    }}>
                                        {f.answer}
                                    </Paragraph>
                                </Panel>
                            ))}
                        </Collapse>
                    ) : (
                        <Empty description="Hiện chưa có câu hỏi nào được cập nhật." style={{ margin: '60px 0' }} />
                    )}
                </div>
            </Content>
        </Layout>
    );
};

export default FAQPage;