import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Tag, Button, Typography, Spin, Result } from 'antd';
import {
    FileDoneOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Text } = Typography;

const LecturerDashboard: React.FC = () => {
    const navigate = useNavigate();
    
    const [pendingProjects, setPendingProjects] = useState<any[]>([]);
    const [pendingReports, setPendingReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Gọi API lấy toàn bộ đề tài giảng viên đang quản lý
                const res = await api.get('/projects/managed');
                const projectList = Array.isArray(res.data) ? res.data : (res.data.data || []);
                
                // 1. LỌC: Các đề tài ĐANG CHỜ DUYỆT (PENDING)
                const pending = projectList.filter((p: any) => p.status === 'PENDING');
                setPendingProjects(pending);

                // 2. LỌC: Các đề tài CÓ BÁO CÁO MỚI NỘP (Cần nhận xét)
                // Giả sử dữ liệu trả về có mảng `progress` chứa các báo cáo, và báo cáo chưa có `feedback` là báo cáo mới
                let reportsToGrade: any[] = [];
                projectList.forEach((project: any) => {
                    if (project.progress && project.progress.length > 0) {
                        const unreadProgress = project.progress.filter((pr: any) => !pr.feedback);
                        if (unreadProgress.length > 0) {
                            // Gắn thêm tên đề tài vào báo cáo để hiển thị cho dễ
                            const mappedReports = unreadProgress.map((pr: any) => ({
                                ...pr,
                                projectName: project.name,
                                projectId: project.id,
                                studentName: project.author?.fullName || project.student?.fullName || 'Sinh viên'
                            }));
                            reportsToGrade = [...reportsToGrade, ...mappedReports];
                        }
                    }
                });
                setPendingReports(reportsToGrade);

            } catch (error) {
                console.error("Lỗi tải dữ liệu Dashboard giảng viên:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Cột cho Bảng Đề tài chờ duyệt
    const projectColumns = [
        {
            title: 'Tên đề tài',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text || 'Chưa có tên'}</Text>
        },
        {
            title: 'Người đăng ký',
            key: 'student',
            render: (_: any, record: any) => record.author?.fullName || record.student?.fullName || 'Chưa cập nhật'
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Button type="primary" onClick={() => navigate(`/lecturer/manage-projects/${record.id}`)}>
                    Xem & Phê duyệt
                </Button>
            ),
        },
    ];

    // Cột cho Bảng Báo cáo chờ nhận xét
    const reportColumns = [
        {
            title: 'Tên đề tài',
            dataIndex: 'projectName',
            key: 'projectName',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Báo cáo Tuần / Giai đoạn',
            dataIndex: 'week',
            key: 'week',
            render: (week: number) => <Tag color="blue">Tuần {week}</Tag>
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <Button type="default" onClick={() => navigate(`/lecturer/manage-projects/${record.projectId}`)}>
                    Chấm bài
                </Button>
            ),
        },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" tip="Đang đồng bộ công việc..." /></div>;

    // KIỂM TRA XEM CÓ VIỆC ĐỂ LÀM KHÔNG
    const hasWorkToDo = pendingProjects.length > 0 || pendingReports.length > 0;

    return (
        <div style={{ padding: '24px' }}>
            {!hasWorkToDo ? (
                // TRẠNG THÁI TRỐNG: KHI KHÔNG CÓ VIỆC GÌ CẦN XỬ LÝ
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginTop: '40px' }}>
                    <Result
                        status="success"
                        title="Tất cả đã hoàn tất!"
                        subTitle="Hiện tại không có đề tài nào chờ duyệt và không có báo cáo nào cần nhận xét."
                        extra={[
                            <Button type="primary" key="console" onClick={() => navigate('/lecturer/manage-projects')}>
                                Xem danh sách toàn bộ đề tài
                            </Button>
                        ]}
                    />
                </Card>
            ) : (
                // TRẠNG THÁI CÓ VIỆC: HIỂN THỊ CÁC BẢNG CÔNG VIỆC CẦN XỬ LÝ
                <Row gutter={[24, 24]}>
                    
                    {/* 1. KHỐI ĐỀ TÀI CHỜ DUYỆT (Chỉ hiện khi có data) */}
                    {pendingProjects.length > 0 && (
                        <Col xs={24}>
                            <Card
                                title={<span><ClockCircleOutlined style={{ color: '#faad14', marginRight: 8 }} /> Đề tài đang chờ phê duyệt</span>}
                                style={{ borderRadius: '12px', borderTop: '4px solid #faad14', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            >
                                <Table
                                    columns={projectColumns}
                                    dataSource={pendingProjects}
                                    pagination={false}
                                    rowKey="id"
                                />
                            </Card>
                        </Col>
                    )}

                    {/* 2. KHỐI BÁO CÁO CẦN NHẬN XÉT (Chỉ hiện khi có học sinh nộp bài) */}
                    {pendingReports.length > 0 && (
                        <Col xs={24}>
                            <Card
                                title={<span><FileDoneOutlined style={{ color: '#1890ff', marginRight: 8 }} /> Báo cáo mới cần chấm/nhận xét</span>}
                                style={{ borderRadius: '12px', borderTop: '4px solid #1890ff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                            >
                                <Table
                                    columns={reportColumns}
                                    dataSource={pendingReports}
                                    pagination={false}
                                    rowKey="id"
                                />
                            </Card>
                        </Col>
                    )}
                </Row>
            )}
        </div>
    );
};

export default LecturerDashboard;