import React, { useEffect, useState } from 'react';
import { Typography, Card, Steps, Row, Col, Divider, List, Collapse, Space, Spin, Empty, message } from 'antd';
import {
    SearchOutlined, ExperimentOutlined, TeamOutlined,
    ReadOutlined, RocketOutlined
} from '@ant-design/icons';
import api from '../../services/api'; // Đảm bảo đường dẫn tới dịch vụ api của bạn chính xác

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

// Định nghĩa Interface cho dữ liệu động
interface GuideStep {
    title: string;
    description: string;
}

interface ResearchTool {
    name: string;
    desc: string;
}

interface DefenseSkill {
    header: string;
    content: string;
}

interface GuideData {
    mainTitle: string;
    subTitle: string;
    steps: GuideStep[];
    tools: ResearchTool[];
    skills: DefenseSkill[];
}

const GuidePage: React.FC = () => {
    const [guideData, setGuideData] = useState<GuideData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchGuideData = async () => {
            setLoading(true);
            try {
                // Gọi API lấy dữ liệu cẩm nang (Giả sử endpoint là /guides/research)
                const res = await api.get('/guides/research');
                setGuideData(res.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu hướng dẫn:", error);
                message.error("Không thể tải dữ liệu hướng dẫn nghiên cứu.");
            } finally {
                setLoading(false);
            }
        };

        fetchGuideData();
    }, []);

    // Trạng thái đang tải
    if (loading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Spin size="large" tip="Đang tải cẩm nang nghiên cứu..." />
            </div>
        );
    }

    // Trạng thái không có dữ liệu
    if (!guideData) {
        return (
            <div style={{ padding: '100px' }}>
                <Empty description="Hiện chưa có nội dung hướng dẫn." />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', marginTop: '64px' }}>
            {/* Tiêu đề chính */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <Title level={2}>📘 {guideData.mainTitle}</Title>
                <Paragraph style={{ fontSize: '16px', color: '#595959' }}>
                    {guideData.subTitle}
                </Paragraph>
            </div>

            <Divider />

            <Row gutter={[40, 40]}>
                {/* Quy trình thực hiện lấy từ DB */}
                <Col xs={24} lg={14}>
                    <Title level={3}><ExperimentOutlined /> Quy trình các giai đoạn thực hiện đề tài</Title>
                    <Steps
                        direction="vertical"
                        style={{ marginTop: '30px' }}
                        items={guideData.steps.map(step => ({
                            title: step.title,
                            description: step.description
                        }))}
                    />
                </Col>

                <Col xs={24} lg={10}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        {/* Công cụ tìm kiếm lấy từ DB */}
                        <Card
                            title={<span><SearchOutlined /> Công cụ tìm kiếm tài liệu</span>}
                            bordered={false}
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}
                        >
                            <List
                                dataSource={guideData.tools}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Space>
                                            <ReadOutlined style={{ color: '#1890ff' }} />
                                            <Text strong>{item.name}:</Text>
                                            <Text type="secondary">{item.desc}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        </Card>

                        {/* Kỹ năng phản biện lấy từ DB */}
                        <Card
                            title={<span><TeamOutlined /> Kỹ năng phản biện & Bảo vệ</span>}
                            bordered={false}
                            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}
                        >
                            <Collapse ghost accordion>
                                {guideData.skills.map((skill, index) => (
                                    <Panel header={<Text strong>{skill.header}</Text>} key={index}>
                                        <Paragraph style={{ fontSize: '13px' }}>
                                            {skill.content}
                                        </Paragraph>
                                    </Panel>
                                ))}
                            </Collapse>
                        </Card>
                    </Space>
                </Col>
            </Row>

            <Divider style={{ marginTop: '60px' }} />

            {/* Mục hỗ trợ nhanh */}
            <Card style={{ background: '#f9f9f9', textAlign: 'center', borderRadius: '12px', border: 'none' }}>
                <RocketOutlined style={{ fontSize: '30px', color: '#1890ff', marginBottom: '15px' }} />
                <Title level={4}>Bắt đầu đề tài của bạn ngay hôm nay!</Title>
                <Paragraph>
                    Nếu bạn đã sẵn sàng, hãy đăng nhập để đăng ký đề tài hoặc tìm kiếm đồng đội cùng nghiên cứu.
                </Paragraph>
            </Card>
        </div>
    );
};

export default GuidePage;