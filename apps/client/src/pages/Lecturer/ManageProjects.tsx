import React, { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Input, Timeline, Card, message,
    Empty, Space, Divider, Select, InputNumber, Tooltip, Row, Col, Statistic, Typography, Upload
} from 'antd';
import {
    EyeOutlined, MessageOutlined, CheckCircleOutlined,
    CheckOutlined, StarOutlined, FilePdfOutlined, DownloadOutlined,
    CloseCircleOutlined, InfoCircleOutlined,
    CalendarOutlined, UploadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { uploadService } from '../../services/upload.service';

const { Title, Paragraph, Text } = Typography;

const ManageProjects: React.FC = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    // States cho phần nhận xét
    const [activeProgressId, setActiveProgressId] = useState<number | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackFile, setFeedbackFile] = useState<any[]>([]); // Thêm state lưu file đính kèm

    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [approveData, setApproveData] = useState({ status: 'APPROVED', feedback: '', score: 0 });

    const fetchManagedProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/projects/managed');
            setProjects(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách đề tài');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchManagedProjects(); }, []);

    const handleViewDetail = async (id: number) => {
        try {
            const res = await api.get(`/projects/${id}`);
            setSelectedProject(res.data);
            setIsDetailOpen(true);
        } catch (error) {
            message.error('Không thể lấy chi tiết đề tài');
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await api.patch(`/projects/${selectedProject.id}/status`, approveData);
            message.success('Cập nhật trạng thái đề tài thành công');
            setIsApproveModalOpen(false);
            setIsDetailOpen(false);
            fetchManagedProjects();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    // HÀM NHẬN XÉT ĐÃ ĐƯỢC NÂNG CẤP
    const submitFeedback = async () => {
        if (!activeProgressId) return;
        if (!feedbackText && feedbackFile.length === 0) {
            message.warning('Vui lòng nhập nhận xét hoặc đính kèm file!');
            return;
        }

        const hide = message.loading('Đang gửi nhận xét và tải file lên...', 0);

        try {
            let finalFeedbackText = feedbackText;

            // Nếu có file đính kèm, upload lên Cloudinary và chèn link vào nội dung text
            if (feedbackFile.length > 0 && feedbackFile[0].originFileObj) {
                const fileUrl = await uploadService.uploadFile(feedbackFile[0].originFileObj, 'feedbacks');
                finalFeedbackText += `\n\n📁 [Tài liệu Giảng viên gửi kèm]: ${fileUrl}`;
            }

            await api.patch(`/projects/progress/${activeProgressId}/feedback`, { feedback: finalFeedbackText });
            
            message.success('Đã gửi nhận xét đến sinh viên');
            
            // Reset form nhận xét
            setFeedbackText('');
            setFeedbackFile([]);
            setActiveProgressId(null);
            
            // Load lại chi tiết đề tài
            handleViewDetail(selectedProject.id);
        } catch (error) {
            message.error('Lỗi khi gửi nhận xét');
        } finally {
            hide();
        }
    };

    const renderFeedbackContent = (text: string) => {
        // Tách link file (nếu có) ra khỏi text để hiển thị thành nút Download cho đẹp
        const parts = text.split('📁 [Tài liệu Giảng viên gửi kèm]: ');
        if (parts.length > 1) {
            return (
                <div>
                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{parts[0]}</Paragraph>
                    <div style={{ marginTop: 8 }}>
                        <Button type="dashed" size="small" icon={<DownloadOutlined />} href={parts[1].trim()} target="_blank">
                            Tải tài liệu sửa lỗi
                        </Button>
                    </div>
                </div>
            );
        }
        return <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{text}</Paragraph>;
    };

    const columns = [
        {
            title: 'Tên đề tài',
            dataIndex: 'name',
            key: 'name',
            render: (t: string) => <Text strong>{t}</Text>
        },
        { title: 'Sinh viên', dataIndex: ['student', 'fullName'], key: 'student' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (s: string) => {
                const colors: any = {
                    'PENDING': 'orange',
                    'APPROVED': 'blue',
                    'IN_PROGRESS': 'cyan',
                    'COMPLETED': 'green',
                    'REJECTED': 'red'
                };
                return <Tag color={colors[s] || 'default'}>{s}</Tag>;
            }
        },
        {
            title: 'Tiến độ',
            dataIndex: 'progress',
            key: 'progress',
            render: (p: number) => (
                <Space>
                    <span style={{ fontSize: '12px' }}>{p}%</span>
                    <Tag color={p === 100 ? 'green' : 'blue'} style={{ margin: 0 }}>
                        {p === 100 ? 'Đã xong' : 'Đang làm'}
                    </Tag>
                </Space>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>
                    Theo dõi & Duyệt
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Title level={3}>Quản lý Đề tài hướng dẫn</Title>
                <Paragraph type="secondary">Phê duyệt đăng ký, theo dõi nhật ký tiến độ và chấm điểm nghiệm thu cho sinh viên.</Paragraph>
                <Table dataSource={projects} columns={columns} rowKey="id" loading={loading} />
            </Card>

            <Modal
                title={<span><InfoCircleOutlined style={{ color: '#1890ff' }} /> Chi tiết đề tài & Nhật ký thực hiện</span>}
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                width={1000}
                centered
                footer={[
                    <Button key="close" onClick={() => setIsDetailOpen(false)}>Đóng</Button>,
                    
                    selectedProject?.status === 'PENDING' && (
                        <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={() => {
                            setApproveData({ status: 'APPROVED', feedback: '', score: 0 });
                            setIsApproveModalOpen(true);
                        }}>
                            Phê duyệt đề tài
                        </Button>
                    ),

                    (selectedProject?.status === 'APPROVED' || selectedProject?.status === 'IN_PROGRESS') && 
                    selectedProject?.progress === 100 && (
                        <Button key="complete" type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} icon={<StarOutlined />} onClick={() => {
                            setApproveData({ status: 'COMPLETED', feedback: '', score: 10 });
                            setIsApproveModalOpen(true);
                        }}>
                            Nghiệm thu & Chấm điểm
                        </Button>
                    ),
                    
                    (selectedProject?.status === 'APPROVED' || selectedProject?.status === 'IN_PROGRESS') && 
                    selectedProject?.progress < 100 && (
                        <Text type="secondary" style={{ marginLeft: 16, fontStyle: 'italic' }}>
                            *Chỉ có thể nghiệm thu khi sinh viên báo cáo tiến độ đạt 100%.
                        </Text>
                    )
                ]}
            >
                {selectedProject && (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '12px' }}>
                        <Card size="small" style={{ marginBottom: 20, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                            <Row gutter={16}>
                                <Col span={16}>
                                    <p><Text strong>Đề tài:</Text> {selectedProject.name}</p>
                                    <p><Text strong>Sinh viên:</Text> {selectedProject.student?.fullName} ({selectedProject.student?.email})</p>
                                    <p><Text strong>Lĩnh vực:</Text> <Tag color="geekblue">{selectedProject.topic?.name}</Tag></p>
                                </Col>
                                <Col span={8} style={{ textAlign: 'right' }}>
                                    {selectedProject.score && (
                                        <Statistic title="Điểm cuối cùng" value={selectedProject.score} suffix="/ 10" valueStyle={{ color: '#cf1322' }} />
                                    )}
                                </Col>
                            </Row>
                        </Card>

                        <Divider orientation={"left" as any}>Nhật ký tiến độ & File đính kèm</Divider>

                        {selectedProject.progressLogs?.length > 0 ? (
                            <Timeline style={{ marginTop: '20px' }}>
                                {selectedProject.progressLogs.map((log: any) => (
                                    <Timeline.Item key={log.id} color={log.feedback ? "green" : "blue"}>
                                        <Card size="small" style={{ marginBottom: 16, borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Text type="secondary"><CalendarOutlined /> {new Date(log.createdAt).toLocaleDateString('vi-VN')}</Text>
                                                <Tag color="orange">{log.percent}% tiến độ</Tag>
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <Text strong>{log.title}</Text>
                                                <Paragraph style={{ marginTop: 8 }}>{log.content}</Paragraph>
                                            </div>

                                            {log.fileUrl && (
                                                <div style={{ margin: '12px 0', padding: '10px', background: '#f0f5ff', border: '1px dashed #adc6ff', borderRadius: '4px' }}>
                                                    <Space>
                                                        <FilePdfOutlined style={{ fontSize: '18px', color: '#1d39c4' }} />
                                                        <Text>Minh chứng: <Text strong>{log.fileName || 'Tài liệu đính kèm'}</Text></Text>
                                                        <Tooltip title="Tải về xem">
                                                            <Button size="small" type="primary" shape="circle" icon={<DownloadOutlined />} href={log.fileUrl} target="_blank" />
                                                        </Tooltip>
                                                    </Space>
                                                </div>
                                            )}

                                            {log.feedback ? (
                                                <div style={{ background: '#f6ffed', padding: '10px', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                                                    <Space align="start">
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />
                                                        <div>
                                                            <Text strong>Giảng viên nhận xét:</Text>
                                                            {renderFeedbackContent(log.feedback)}
                                                        </div>
                                                    </Space>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: 10 }}>
                                                    {activeProgressId === log.id ? (
                                                        <div style={{ background: '#fffbe6', padding: '12px', borderRadius: '8px', border: '1px solid #ffe58f' }}>
                                                            <Input.TextArea
                                                                rows={3}
                                                                placeholder="Ghi chú các lỗi cần sửa..."
                                                                value={feedbackText}
                                                                onChange={e => setFeedbackText(e.target.value)}
                                                                style={{ marginBottom: 10 }}
                                                            />
                                                            
                                                            {/* NÚT UPLOAD FILE ĐÍNH KÈM Ở ĐÂY */}
                                                            <Upload
                                                                beforeUpload={() => false}
                                                                fileList={feedbackFile}
                                                                onChange={({ fileList }) => setFeedbackFile(fileList)}
                                                                maxCount={1}
                                                            >
                                                                <Button icon={<UploadOutlined />} style={{ marginBottom: 10 }}>
                                                                    Đính kèm file Word/PDF đã sửa
                                                                </Button>
                                                            </Upload>

                                                            <div style={{ display: 'flex', gap: 8 }}>
                                                                <Button type="primary" onClick={submitFeedback}>Gửi nhận xét</Button>
                                                                <Button onClick={() => {
                                                                    setActiveProgressId(null);
                                                                    setFeedbackText('');
                                                                    setFeedbackFile([]);
                                                                }}>Hủy</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <Button type="dashed" icon={<MessageOutlined />} onClick={() => setActiveProgressId(log.id)}>
                                                            Viết nhận xét & Gửi file
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        ) : <Empty description="Sinh viên chưa cập nhật nhật ký tiến độ" />}
                    </div>
                )}
            </Modal>

            <Modal
                title={approveData.status === 'COMPLETED' ? "Chấm điểm nghiệm thu" : "Phê duyệt đăng ký"}
                open={isApproveModalOpen}
                onCancel={() => setIsApproveModalOpen(false)}
                onOk={handleUpdateStatus}
                okText="Xác nhận lưu"
                width={500}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '16px' }}>
                    <div>
                        <Text strong>Trạng thái mới:</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            value={approveData.status}
                            onChange={(val) => setApproveData({ ...approveData, status: val })}
                            disabled={approveData.status === 'COMPLETED'} 
                        >
                            <Select.Option value="APPROVED">Chấp nhận đề tài</Select.Option>
                            <Select.Option value="REJECTED">Từ chối đề tài</Select.Option>
                            {approveData.status === 'COMPLETED' && (
                                <Select.Option value="COMPLETED">Nghiệm thu & Kết thúc</Select.Option>
                            )}
                        </Select>
                    </div>

                    {approveData.status === 'COMPLETED' && (
                        <div>
                            <Text strong>Điểm số (thang điểm 10):</Text>
                            <InputNumber
                                min={0} max={10} step={0.1}
                                style={{ width: '100%', marginTop: 8 }}
                                value={approveData.score}
                                onChange={(val) => setApproveData({ ...approveData, score: val || 0 })}
                            />
                        </div>
                    )}

                    <div>
                        <Text strong>Nhận xét tổng kết:</Text>
                        <Input.TextArea
                            rows={4}
                            style={{ marginTop: 8 }}
                            placeholder="Nội dung phản hồi cho sinh viên..."
                            value={approveData.feedback}
                            onChange={(e) => setApproveData({ ...approveData, feedback: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ManageProjects;