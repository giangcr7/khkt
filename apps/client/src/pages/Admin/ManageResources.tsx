import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Select, Tag, Popconfirm, Card, Space, Tooltip, Typography } from 'antd';
import {
    UploadOutlined, DeleteOutlined, EditOutlined, LinkOutlined,
    VideoCameraOutlined, EyeOutlined, FilePdfOutlined, FileWordOutlined, DownloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ManageResources: React.FC = () => {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [currentRecord, setCurrentRecord] = useState<any>(null);

    const [form] = Form.useForm();
    const typeValue = Form.useWatch('type', form);

    // --- LOGIC XỬ LÝ DỮ LIỆU ---
    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await api.get('/resources');
            setResources(res.data);
        } catch (err) {
            message.error('Lỗi tải dữ liệu kho tài liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResources(); }, []);

    const getFileIcon = (type: string, url: string) => {
        if (type === 'VIDEO') return <VideoCameraOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />;
        const isPDF = url?.toLowerCase().endsWith('.pdf');
        if (isPDF) return <FilePdfOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
        return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
    };

    // --- HANDLERS ---
    const openModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);
            setCurrentRecord(record);
            form.setFieldsValue({
                title: record.title,
                type: record.type,
                description: record.description,
                link: record.type === 'VIDEO' ? record.fileUrl : '',
            });
        } else {
            setEditingId(null);
            setCurrentRecord(null);
            form.resetFields();
        }
        setFileList([]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('type', values.type); // Lúc này type chỉ gửi TEMPLATE hoặc VIDEO
            formData.append('description', values.description || '');

            if (values.type === 'VIDEO') {
                formData.append('link', values.link);
            } else if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            }

            if (editingId) {
                await api.patch(`/resources/${editingId}`, formData);
                message.success('Cập nhật thành công!');
            } else {
                await api.post('/resources/upload', formData);
                message.success('Đăng tải tài liệu thành công!');
            }
            setIsModalOpen(false);
            fetchResources();
        } catch (err: any) {
            console.error(err);
            message.error('Thao tác thất bại, vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Tài liệu',
            key: 'resource',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <div style={{ 
                        width: 45, height: 45, borderRadius: 8, background: '#f5f5f5',
                        display: 'flex', justifyContent: 'center', alignItems: 'center' 
                    }}>
                        {getFileIcon(record.type, record.fileUrl)}
                    </div>
                    <Space direction="vertical" size={0}>
                        <Text strong>{record.title}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Phân loại',
            dataIndex: 'type',
            width: 120,
            render: (type: string) => {
                const colors: Record<string, string> = { TEMPLATE: 'blue', VIDEO: 'volcano' };
                const labels: Record<string, string> = { TEMPLATE: 'Biểu mẫu', VIDEO: 'Video' };
                return <Tag color={colors[type] || 'default'}>{labels[type] || type}</Tag>;
            }
        },
        {
            title: 'Xem / Tải',
            dataIndex: 'fileUrl',
            width: 100,
            align: 'center' as const,
            render: (url: string) => (
                <Space>
                    <Tooltip title="Xem trực tiếp">
                        <Button type="text" icon={<EyeOutlined />} href={url} target="_blank" />
                    </Tooltip>
                    <Tooltip title="Tải về máy">
                        <Button type="text" icon={<DownloadOutlined />} href={url} download />
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            align: 'right' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>Sửa</Button>
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/resources/${id}`);
            message.success('Đã xóa tài liệu');
            fetchResources();
        } catch (error) { message.error('Lỗi khi xóa'); }
    };

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Kho học liệu số</Title>
                        <Text type="secondary">Quản lý và lưu trữ tài liệu nghiên cứu khoa học</Text>
                    </div>
                    <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => openModal()} style={{ borderRadius: 8 }}>
                        Đăng tải mới
                    </Button>
                </div>

                <Table 
                    dataSource={resources} 
                    columns={columns} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 7 }}
                />
            </Card>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{editingId ? "✍️ Chỉnh sửa tài liệu" : "🚀 Tải lên tài liệu mới"}</Title>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={550}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
                        <Input placeholder="Mẫu báo cáo, Form đăng ký..." />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả ngắn gọn nội dung..." rows={3} />
                    </Form.Item>

                    <Form.Item name="type" label="Loại tài nguyên" rules={[{ required: true, message: 'Chọn loại tài liệu!' }]}>
                        <Select placeholder="-- Chọn phân loại --">
                            {/* Đã gỡ bỏ lựa chọn Hướng dẫn (GUIDE) */}
                            <Select.Option value="TEMPLATE">DOC/PDF</Select.Option>
                            <Select.Option value="VIDEO">Video bài giảng</Select.Option>
                        </Select>
                    </Form.Item>

                    {typeValue === 'VIDEO' ? (
                        <Form.Item name="link" label="Đường dẫn Video (URL)" rules={[{ required: true, message: 'Nhập URL video!' }]}>
                            <Input prefix={<LinkOutlined />} placeholder="Youtube, Drive..." />
                        </Form.Item>
                    ) : (
                        <Form.Item label="Tệp tài liệu (PDF/Docx)">
                            <Upload.Dragger
                                maxCount={1}
                                beforeUpload={() => false}
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                style={{ background: '#fafafa', borderRadius: 8 }}
                            >
                                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                <p className="ant-upload-text">Kéo thả hoặc click để chọn file</p>
                            </Upload.Dragger>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default ManageResources;