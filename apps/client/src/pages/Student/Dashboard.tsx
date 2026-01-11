import React, { useEffect, useState } from 'react';
import { Typography, Steps, Card, Row, Col, Statistic, Button, Progress, List, Tag, Avatar, Space, Badge, Empty, Spin } from 'antd';
import {
    FileSearchOutlined, TeamOutlined, FileProtectOutlined, CheckCircleOutlined,
    CalendarOutlined, ProjectOutlined, BellOutlined,
    MessageOutlined, UserAddOutlined, FireOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();

    // State quản lý dữ liệu từ CSDL
    const [project, setProject] = useState<any>(null);
    const [recruitments, setRecruitments] = useState([]);
    const [deadline, setDeadline] = useState<{ days: number; date: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Lấy đề tài cá nhân
                const projectRes = await api.get('/projects/my-project');
                setProject(projectRes.data);

                // 2. Lấy danh sách tìm đồng đội thực tế từ CSDL
                const recruitRes = await api.get('/recruitments?limit=3');
                setRecruitments(recruitRes.data);

                // 3. Lấy Timeline để tính toán deadline tự động
                const eventsRes = await api.get('/events');
                const nextReport = eventsRes.data
                    .filter((ev: any) => ev.title.toLowerCase().includes('báo cáo') && dayjs(ev.startDate).isAfter(dayjs()))
                    .sort((a: any, b: any) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix())[0];

                if (nextReport) {
                    setDeadline({
                        days: dayjs(nextReport.startDate).diff(dayjs(), 'day'),
                        date: dayjs(nextReport.startDate).format('DD/MM/YYYY')
                    });
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusStep = (status: string) => {
        const steps: any = { 'PENDING': 0, 'APPROVED': 1, 'IN_PROGRESS': 2, 'SUBMITTED': 3, 'COMPLETED': 4 };
        return steps[status] || 0;
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang đồng bộ dữ liệu..." /></div>;

    return (
        <div style={{ padding: '20px' }}>
            {/* Header Dashboard */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <Title level={3}>Bảng điều khiển Sinh viên</Title>
                    <Paragraph type="secondary">Hệ thống tự động cập nhật lộ trình dựa trên dữ liệu thời gian thực.</Paragraph>
                </div>
                <Badge count={recruitments.length} dot>
                    <Button icon={<BellOutlined />} shape="circle" />
                </Badge>
            </div>

            <Row gutter={[24, 24]}>
                {/* CỘT TRÁI: DỮ LIỆU ĐỀ TÀI CÁ NHÂN */}
                <Col xs={24} lg={16}>
                    <Card
                        title="Đề tài của tôi"
                        extra={<Button type="link" onClick={() => navigate('/student/my-project')}>Chi tiết hồ sơ</Button>}
                        style={{ marginBottom: 24, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    >
                        {project ? (
                            <Row align="middle" gutter={24}>
                                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                                    <Progress
                                        type="circle"
                                        percent={project.progress || 0}
                                        width={120}
                                        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                    />
                                </Col>
                                <Col xs={24} sm={16}>
                                    <Title level={4}>{project.name}</Title>
                                    <Space direction="vertical" size={0}>
                                        <Text><Text strong>Hướng dẫn:</Text> {project.mentor?.fullName || 'Đang chờ phân công'}</Text>
                                        <Text><Text strong>Trạng thái hệ thống:</Text> <Tag color="blue" style={{ marginLeft: 8 }}>{project.status}</Tag></Text>
                                    </Space>
                                </Col>
                            </Row>
                        ) : (
                            <Empty description="Bạn hiện chưa tham gia đề tài nào trong kỳ này.">
                                <Button type="primary" icon={<ProjectOutlined />} onClick={() => navigate('/student/my-project')}>Đăng ký đề tài mới</Button>
                            </Empty>
                        )}
                    </Card>

                    <Card title="Tiến độ thực hiện theo quy trình" style={{ borderRadius: '12px' }}>
                        <Steps
                            current={project ? getStatusStep(project.status) : -1}
                            size="small"
                            items={[
                                { title: 'Đăng ký', icon: <FileSearchOutlined /> },
                                { title: 'Duyệt', icon: <TeamOutlined /> },
                                { title: 'Thực hiện', icon: <ProjectOutlined /> },
                                { title: 'Báo cáo', icon: <FileProtectOutlined /> },
                                { title: 'Kết thúc', icon: <CheckCircleOutlined /> },
                            ]}
                        />
                    </Card>
                </Col>

                {/* CỘT PHẢI: KẾT NỐI VÀ DEADLINE */}
                <Col xs={24} lg={8}>
                    {/* Mục tìm đồng đội lấy từ CSDL Recruitment */}
                    <Card
                        title={<span><FireOutlined style={{ color: '#ff4d4f' }} /> Tìm đồng đội thực tế</span>}
                        style={{ marginBottom: 24, borderRadius: '12px' }}
                        extra={<Button type="link" onClick={() => navigate('/find-team')}>Tất cả</Button>}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={recruitments}
                            locale={{ emptyText: "Không có yêu cầu ghép nhóm nào." }}
                            renderItem={(item: any) => (
                                <List.Item actions={[<Button type="text" icon={<MessageOutlined />} />]}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={item.author?.avatar}>{item.author?.fullName[0]}</Avatar>}
                                        title={<Text strong>{item.title}</Text>}
                                        description={<Text type="secondary" style={{ fontSize: '12px' }}>Bởi: {item.author?.fullName}</Text>}
                                    />
                                </List.Item>
                            )}
                        />
                        <Button block icon={<UserAddOutlined />} style={{ marginTop: 10 }} onClick={() => navigate('/find-team/create')}>
                            Đăng tin tuyển quân
                        </Button>
                    </Card>

                    {/* Deadline tự động dựa trên bảng Events */}
                    <Card style={{ borderRadius: '12px', textAlign: 'center', background: deadline && deadline.days < 7 ? '#fff1f0' : '#fff' }}>
                        <Statistic
                            title="Hạn nộp báo cáo tiếp theo"
                            value={deadline ? deadline.days : '--'}
                            suffix="ngày"
                            valueStyle={{ color: deadline && deadline.days < 7 ? '#cf1322' : '#3f8600', fontWeight: 'bold' }}
                        />
                        <Text type="secondary">Hạn chót: {deadline ? deadline.date : 'Chưa có lịch'}</Text>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;