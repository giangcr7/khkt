import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, message, Progress, Typography, Divider, List, Tag, Button, Space, Skeleton, Badge } from 'antd';
import {
    UserOutlined,
    SolutionOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    BookOutlined,
    CalendarOutlined,
    RocketOutlined,
    ExclamationCircleOutlined,
    FileExcelOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Gọi API thống kê tổng quát từ Backend
                const res = await api.get('/stats/dashboard');
                setStats(res.data);
            } catch (error) {
                message.error('Không thể tải dữ liệu thống kê');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ padding: '24px' }}><Skeleton active /><Skeleton active /></div>;
    if (!stats) return <div style={{ textAlign: 'center', padding: 50 }}>Không có dữ liệu hệ thống</div>;

    // Cấu hình biểu đồ Donut Trạng thái
    const pieData = [
        { type: 'Chờ duyệt', value: stats.projects.pending },
        { type: 'Đang thực hiện', value: stats.projects.inProgress },
        { type: 'Đã hoàn thành', value: stats.projects.completed },
        { type: 'Đã từ chối', value: stats.projects.rejected || 0 },
    ];

    const pieConfig = {
        appendPadding: 10,
        data: pieData,
        angleField: 'value',
        colorField: 'type',
        radius: 1,
        innerRadius: 0.6,
        label: {
            type: 'inner',
            offset: '-50%',
            content: '{value}',
            style: { textAlign: 'center', fontSize: 14 },
        },
        interactions: [{ type: 'element-active' }],
        color: ['#faad14', '#1890ff', '#52c41a', '#ff4d4f'],
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row justify="space-between" align="middle">
                <Col>
                    <Title level={2} style={{ margin: 0 }}>Tổng quan hệ thống Quản lý NCKH</Title>
                    <Text type="secondary">Cập nhật số liệu thống kê thực tế đến năm 2026</Text>
                </Col>
                <Col>
                    <Button type="primary" icon={<FileExcelOutlined />} onClick={() => message.loading('Đang khởi tạo tệp báo cáo Excel...')}>
                        Xuất báo cáo tổng hợp
                    </Button>
                </Col>
            </Row>
            <Divider />

            {/* HÀNG 1: THỐNG KÊ TỔNG QUAN */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable style={{ borderLeft: '4px solid #1890ff' }}>
                        <Statistic title="Tổng Sinh viên" value={stats.users.student} prefix={<UserOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable style={{ borderLeft: '4px solid #722ed1' }}>
                        <Statistic title="Tổng Giảng viên" value={stats.users.lecturer} prefix={<SolutionOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable style={{ borderLeft: '4px solid #faad14' }}>
                        <Statistic title="Tổng Đề tài" value={stats.projects.total} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} hoverable style={{ borderLeft: '4px solid #13c2c2' }}>
                        <Statistic title="Tài liệu & Video" value={stats.resources} prefix={<BookOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                {/* BIỂU ĐỒ TRẠNG THÁI */}
                <Col xs={24} lg={10}>
                    <Card title="Phân tích Trạng thái Đề tài" bordered={false} bodyStyle={{ height: 380 }}>
                        <Pie {...pieConfig} />
                    </Card>
                </Col>

                {/* TÁC VỤ ƯU TIÊN (MỚI) */}
                <Col xs={24} lg={6}>
                    <Card title="Tác vụ ưu tiên" bordered={false} bodyStyle={{ height: 380 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ marginBottom: 16 }}>
                                <Text type="secondary">Cần xử lý ngay:</Text>
                                <div style={{ marginTop: 8 }}>
                                    <Badge count={stats.projects.pending} overflowCount={99}>
                                        <Button block onClick={() => navigate('/admin/projects')}>Duyệt đề tài mới</Button>
                                    </Badge>
                                </div>
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                            <Button block icon={<RocketOutlined />} onClick={() => navigate('/admin/news')}>Đăng thông báo mới</Button>
                            <Button block icon={<CalendarOutlined />} onClick={() => navigate('/admin/events')}>Cập nhật lộ trình</Button>
                            <Button block icon={<ExclamationCircleOutlined />} danger>Nhắc nhở trễ hạn</Button>
                        </Space>
                    </Card>
                </Col>

                {/* KPI HOÀN THÀNH */}
                <Col xs={24} lg={8}>
                    <Card title="Chỉ số hiệu quả (KPI)" bordered={false} bodyStyle={{ height: 380, textAlign: 'center' }}>
                        <Progress
                            type="dashboard"
                            percent={Math.round((stats.projects.completed / stats.projects.total) * 100) || 0}
                            strokeColor="#52c41a"
                            gapDegree={30}
                            width={180}
                        />
                        <div style={{ marginTop: 20 }}>
                            <Text strong style={{ fontSize: 18 }}>Tỉ lệ đề tài về đích</Text>
                            <br />
                            <Text type="secondary">Mục tiêu năm 2026: 85%</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 40 }}>
                {/* LĨNH VỰC NGHIÊN CỨU */}
                <Col xs={24} lg={14}>
                    <Card title="Phân bố theo Lĩnh vực (Topics)" bordered={false}>
                        <List
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                            dataSource={stats.topics || []}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <Card size="small" style={{ background: '#fafafa' }}>
                                        <Statistic
                                            title={item.name}
                                            value={item._count.projects}
                                            suffix="đề tài"
                                            valueStyle={{ fontSize: 16 }}
                                        />
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                {/* NHẬT KÝ HỆ THỐNG (MỚI) */}
                <Col xs={24} lg={10}>
                    <Card title="Nhật ký hoạt động" bordered={false} extra={<Button type="link">Chi tiết</Button>}>
                        <List
                            size="small"
                            dataSource={stats.recentActivities || [
                                { id: 1, text: 'Admin đã cập nhật tài liệu hướng dẫn mới', time: '10 phút trước' },
                                { id: 2, text: 'Hệ thống tự động nhắc hạn nộp thuyết minh', time: '1 giờ trước' },
                                { id: 3, text: 'Giảng viên Nguyễn Văn A đã duyệt 1 đề tài', time: '3 giờ trước' }
                            ]}
                            renderItem={(item: any) => (
                                <List.Item>
                                    <Space>
                                        <Text type="secondary" style={{ fontSize: 12 }}>[{item.time}]</Text>
                                        <Text>{item.text}</Text>
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;