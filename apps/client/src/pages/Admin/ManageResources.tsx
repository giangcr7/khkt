import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Select, Tag, Popconfirm, Card, Space, Tooltip, Typography } from 'antd';
import {
    UploadOutlined, DeleteOutlined, EditOutlined, LinkOutlined,
    VideoCameraOutlined, EyeOutlined, FilePdfOutlined, FileWordOutlined, DownloadOutlined,
    BookOutlined, FormOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ManageResources: React.FC = () => {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);

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

    // --- MỞ MODAL (ĐÃ SỬA LỖI) ---
    const handleOpenModal = (record?: any) => {
        setFileList([]); // Reset danh sách file cũ
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({
                title: record.title,
                type: record.type,
                description: record.description,
                link: record.type === 'VIDEO' ? record.fileUrl : '',
            });
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ type: 'REFERENCE' }); // Mặc định là Tài liệu tham khảo
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('type', values.type); 
            formData.append('description', values.description || '');

            if (values.type === 'VIDEO') {
                formData.append('link', values.link);
            } else if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            } else if (!editingId) {
                message.warning('Vui lòng chọn tệp tin hoặc nhập link video!');
                setLoading(false);
                return;
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
            message.error('Thao tác thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/resources/${id}`);
            message.success('Đã xóa tài liệu');
            fetchResources();
        } catch (error) { message.error('Lỗi khi xóa'); }
    };

    const columns = [
        {
            title: 'Tài liệu',
            key: 'resource',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <div style={{ width: 45, height: 45, borderRadius: 8, background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
            width: 200,
            render: (type: string) => {
                const config: any = { 
                    REFERENCE: { color: 'blue', label: 'Tài liệu tham khảo', icon: <BookOutlined /> },
                    TEMPLATE: { color: 'cyan', label: 'Mẫu biểu', icon: <FormOutlined /> },
                    GUIDE: { color: 'green', label: 'Quy định - Hướng dẫn', icon: <SafetyCertificateOutlined /> },
                    VIDEO: { color: 'volcano', label: 'Video', icon: <VideoCameraOutlined /> }
                };
                const item = config[type] || { color: 'default', label: type, icon: null };
                return <Tag icon={item.icon} color={item.color}>{item.label}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'right' as const,
            width: 150,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Sửa</Button>
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Quản trị Học liệu</Title>
                        <Text type="secondary">Phân loại: Tài liệu tham khảo - Mẫu biểu - Quy định</Text>
                    </div>
                    <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => handleOpenModal()} style={{ borderRadius: 8 }}>
                        Thêm tài liệu mới
                    </Button>
                </div>

                <Table dataSource={resources} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 7 }} />
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
                destroyOnClose // Tự động xóa dữ liệu cũ khi đóng modal
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true, message: 'Nhập tiêu đề!' }]}>
                        <Input placeholder="Mẫu báo cáo, Quy định thực tập..." />
                    </Form.Item>

                    <Form.Item name="type" label="Phân loại tài liệu" rules={[{ required: true, message: 'Chọn loại tài liệu!' }]}>
                        <Select placeholder="-- Chọn phân loại --">
                            <Select.Option value="REFERENCE">📚 Tài liệu tham khảo</Select.Option>
                            <Select.Option value="TEMPLATE">📝 Mẫu biểu chuẩn</Select.Option>
                            <Select.Option value="GUIDE">⚖️ Quy định - Hướng dẫn</Select.Option>
                            <Select.Option value="VIDEO">🎬 Video bài giảng/quy trình</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea placeholder="Ghi chú nhanh về tài liệu..." rows={2} />
                    </Form.Item>

                    {typeValue === 'VIDEO' ? (
                        <Form.Item name="link" label="Đường dẫn Video (Youtube/Drive)" rules={[{ required: true, message: 'Nhập URL!' }]}>
                            <Input prefix={<LinkOutlined />} placeholder="https://..." />
                        </Form.Item>
                    ) : (
                        <Form.Item label="Tệp tài liệu (PDF/Docx)">
                            <Upload.Dragger 
                                maxCount={1} 
                                beforeUpload={() => false} 
                                fileList={fileList} 
                                onChange={({ fileList }) => setFileList(fileList)}
                            >
                                <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                <p className="ant-upload-text">Kéo thả file vào đây</p>
                            </Upload.Dragger>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default ManageResources;