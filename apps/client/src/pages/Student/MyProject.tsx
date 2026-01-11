import React, { useEffect, useState } from 'react';
import {
    Card, Descriptions, Tag, Button, Timeline, Modal,
    Form, Input, Slider, message, Empty, Result, Select, Spin, Upload, Space as AntSpace
} from 'antd';
import {
    PlusOutlined, CheckCircleOutlined,
    FileAddOutlined, EditOutlined, LoadingOutlined, UserOutlined,
    UploadOutlined, FilePdfOutlined, DeleteOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const MyProjectPage: React.FC = () => {
    const [project, setProject] = useState<any>(null);
    const [topics, setTopics] = useState<any[]>([]);
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const [form] = Form.useForm();
    const [regForm] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/projects');
            const active = res.data?.find((p: any) =>
                p.status === 'PENDING' || p.status === 'APPROVED' || p.status === 'IN_PROGRESS'
            );

            if (active) {
                const detailRes = await api.get(`/projects/${active.id}`);
                setProject(detailRes.data);
            } else {
                setProject(null);
            }

            const [topicsRes, lecturersRes] = await Promise.all([
                api.get('/projects/topics'),
                api.get('/projects/lecturers')
            ]);
            setTopics(topicsRes.data);
            setLecturers(lecturersRes.data);
        } catch (error) {
            message.error("Không thể tải dữ liệu từ máy chủ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HÀM XÓA ĐỀ TÀI (CHỈ KHI PENDING)
    const handleDeleteProject = () => {
        Modal.confirm({
            title: 'Xác nhận hủy đăng ký',
            icon: <DeleteOutlined style={{ color: 'red' }} />,
            content: 'Bạn có chắc chắn muốn xóa đăng ký đề tài này không? Hành động này không thể hoàn tác.',
            okText: 'Xác nhận xóa',
            okType: 'danger',
            cancelText: 'Quay lại',
            onOk: async () => {
                try {
                    await api.delete(`/projects/${project.id}`);
                    message.success('Đã hủy đăng ký đề tài thành công');
                    fetchData(); // Reset lại giao diện về trạng thái chưa đăng ký
                } catch (err: any) {
                    message.error(err.response?.data?.message || 'Không thể xóa đề tài');
                }
            },
        });
    };

    const handleRegisterOrUpdate = async (values: any) => {
        try {
            if (project && project.status === 'PENDING') {
                await api.patch(`/projects/${project.id}/info`, values);
                message.success('Cập nhật thông tin thành công!');
            } else {
                await api.post('/projects', values);
                message.success('Đăng ký đề tài thành công!');
            }
            setIsRegisterModalOpen(false);
            regForm.resetFields();
            fetchData();
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleSubmitProgress = async (values: any) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('percent', values.percent.toString());

        if (fileList.length > 0) {
            formData.append('file', fileList[0].originFileObj);
        }

        try {
            await api.post(`/projects/${project.id}/progress`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Đã cập nhật tiến độ kèm file minh chứng');
            setIsProgressModalOpen(false);
            setFileList([]);
            form.resetFields();
            fetchData();
        } catch (err) {
            message.error('Lỗi khi gửi báo cáo');
        }
    };

    if (loading && !project) {
        return (
            <div style={{ textAlign: 'center', marginTop: 100 }}>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} />
                <p style={{ marginTop: 16 }}>Đang tải dữ liệu đề tài...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Result
                    icon={<FileAddOutlined style={{ color: '#1890ff' }} />}
                    title="Bạn chưa có đề tài nghiên cứu nào"
                    subTitle="Hãy chọn giảng viên và đăng ký đề tài để bắt đầu nghiên cứu."
                    extra={<Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsRegisterModalOpen(true)}>Đăng ký ngay</Button>}
                />
                {renderRegisterModal()}
            </div>
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Thông tin Đề tài thực hiện"
                style={{ marginBottom: 24, borderRadius: 12 }}
                extra={project?.status === 'PENDING' && (
                    <AntSpace>
                        <Button type="dashed" icon={<EditOutlined />} onClick={() => {
                            regForm.setFieldsValue({
                                name: project.name,
                                topicId: project.topicId,
                                mentorId: project.mentorId,
                                description: project.description
                            });
                            setIsRegisterModalOpen(true);
                        }}>Sửa</Button>

                        {/* NÚT XÓA BỔ SUNG TẠI ĐÂY */}
                        <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            onClick={handleDeleteProject}
                        >
                            Hủy đăng ký
                        </Button>
                    </AntSpace>
                )}
            >
                <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }}>
                    <Descriptions.Item label="Tên đề tài" span={3}><b>{project?.name}</b></Descriptions.Item>
                    <Descriptions.Item label="Lĩnh vực"><Tag color="blue">{project?.topic?.name}</Tag></Descriptions.Item>
                    <Descriptions.Item label="GV Hướng dẫn"><Space><UserOutlined />{project?.mentor?.fullName || 'Chờ duyệt'}</Space></Descriptions.Item>
                    <Descriptions.Item label="Trạng thái"><Tag color="orange">{project?.status}</Tag></Descriptions.Item>
                </Descriptions>
            </Card>

            <Card
                title="Nhật ký Tiến độ & Phản hồi"
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsProgressModalOpen(true)} disabled={project?.status === 'PENDING'}>Cập nhật báo cáo</Button>}
            >
                <Timeline mode="left">
                    {project.progressLogs?.map((log: any) => (
                        <Timeline.Item key={log.id} label={new Date(log.createdAt).toLocaleDateString('vi-VN')}>
                            <Card size="small" style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <b>{log.title}</b>
                                    <Tag color="blue">{log.percent}%</Tag>
                                </div>
                                <p style={{ margin: '8px 0' }}>{log.content}</p>

                                {log.fileUrl && (
                                    <div style={{ margin: '8px 0', padding: '4px 8px', background: '#f0f5ff', borderRadius: 4 }}>
                                        <FilePdfOutlined /> <a href={`http://localhost:3000${log.fileUrl}`} target="_blank" rel="noreferrer">
                                            Xem file minh chứng: {log.fileName || 'Tài liệu đính kèm'}
                                        </a>
                                    </div>
                                )}

                                {log.feedback && (
                                    <div style={{ background: '#f6ffed', padding: 8, borderRadius: 4, marginTop: 8 }}>
                                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> <b>GV:</b> {log.feedback}
                                    </div>
                                )}
                            </Card>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Card>

            <Modal title="Báo cáo tiến độ tuần" open={isProgressModalOpen} onCancel={() => setIsProgressModalOpen(false)} onOk={() => form.submit()}>
                <Form form={form} layout="vertical" onFinish={handleSubmitProgress}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input placeholder="VD: Báo cáo tuần 1" /></Form.Item>
                    <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
                    <Form.Item label="File minh chứng (Bản thảo/Kết quả)">
                        <Upload
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Chọn file (PDF, Docx, Zip)</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item name="percent" label="Tiến độ hoàn thành (%)" initialValue={project?.progress}><Slider min={0} max={100} /></Form.Item>
                </Form>
            </Modal>

            {renderRegisterModal()}
        </div>
    );

    function renderRegisterModal() {
        return (
            <Modal title="Đăng ký đề tài" open={isRegisterModalOpen} onCancel={() => setIsRegisterModalOpen(false)} onOk={() => regForm.submit()} width={600}>
                <Form form={regForm} layout="vertical" onFinish={handleRegisterOrUpdate}>
                    <Form.Item name="name" label="Tên đề tài" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Form.Item name="topicId" label="Lĩnh vực" rules={[{ required: true }]}>
                            <Select placeholder="Chọn lĩnh vực">
                                {topics.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="mentorId" label="GV hướng dẫn" rules={[{ required: true }]}>
                            <Select placeholder="Chọn giảng viên">
                                {lecturers.map(gv => <Select.Option key={gv.id} value={gv.id}>{gv.fullName}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </div>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea rows={4} /></Form.Item>
                </Form>
            </Modal>
        );
    }
};

const Space = ({ children }: { children: React.ReactNode }) => <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{children}</div>;

export default MyProjectPage;