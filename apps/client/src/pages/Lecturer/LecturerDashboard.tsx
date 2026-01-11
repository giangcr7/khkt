import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, Typography, List, Avatar, Spin, Empty } from 'antd';
import {
    UserOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EditOutlined,
    RocketOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalGroups: 0, pendingApprovals: 0, completed: 0 });
    const [pendingProjects, setPendingProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLecturerData = async () => {
            setLoading(true);
            try {
                // 1. Lấy thống kê tổng quát của giảng viên này
                const resStats = await api.get('/projects/lecturer/stats');
                setStats(resStats.data);

                // 2. Lấy danh sách đề tài sinh viên đăng ký đang chờ giảng viên duyệt
                const resPending = await api.get('/projects/lecturer/pending-list');
                setPendingProjects(resPending.data);
            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard giảng viên:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLecturerData();
    }, []);

    const columns = [
        {
            title: 'Tên đề tài',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Trưởng nhóm',
            dataIndex: ['student', 'fullName'],
            key: 'student',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color="warning">Đang chờ duyệt</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/lecturer/manage-projects`)}
                >
                    Xem & Duyệt
                </Button>
            ),
        },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin tip="Đang tải dữ liệu giảng viên..." /></div>;

    return (
        <div style={{ padding: '20px' }}>
            <Title level={3}>Xin chào, Giảng viên!</Title>
            <Text type="secondary">Hệ thống quản lý các nhóm sinh viên đang thực hiện NCKH dưới sự hướng dẫn của bạn.</Text>

            {/* Khối thống kê thực tế */}
            <Row gutter={[16, 16]} style={{ marginTop: 24, marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Đang hướng dẫn"
                            value={stats.totalGroups}
                            prefix={<RocketOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Đề tài chờ duyệt"
                            value={stats.pendingApprovals}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <Statistic
                            title="Nhóm đã hoàn thành"
                            value={stats.completed}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Danh sách đề tài chờ duyệt */}
                <Col xs={24} lg={16}>
                    <Card
                        title={<span><NotificationOutlined /> Đề tài cần phê duyệt mới nhất</span>}
                        extra={<Button type="link" onClick={() => navigate('/lecturer/manage-projects')}>Xem tất cả</Button>}
                        style={{ borderRadius: '12px' }}
                    >
                        <Table
                            columns={columns}
                            dataSource={pendingProjects}
                            pagination={{ pageSize: 5 }}
                            locale={{ emptyText: <Empty description="Không có đề tài nào đang chờ duyệt" /> }}
                            rowKey="id"
                        />
                    </Card>
                </Col>

                {/* Hoạt động & Nhắc lịch */}
                <Col xs={24} lg={8}>
                    <Card title="Ghi chú & Nhắc nhở" style={{ borderRadius: '12px' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={[
                                { title: 'Hạn cuối duyệt đề tài đợt 1', date: '30/10/2026', urgent: true },
                                { title: 'Họp hội đồng nghiệm thu cơ sở', date: '15/11/2026', urgent: false },
                            ]}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<EditOutlined />} style={{ backgroundColor: item.urgent ? '#fff1f0' : '#e6f7ff', color: item.urgent ? '#f5222d' : '#1890ff' }} />}
                                        title={<Text strong>{item.title}</Text>}
                                        description={`Thời gian: ${item.date}`}
                                    />
                                </List.Item>
                            )}
                        />
                        <Button type="dashed" block style={{ marginTop: 16 }}>+ Thêm ghi chú</Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LecturerDashboard;