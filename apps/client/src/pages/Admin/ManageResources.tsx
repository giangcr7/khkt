import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Select, Tag, Popconfirm, Card, Space, Tooltip, Typography } from 'antd';
import {
    UploadOutlined, DeleteOutlined, EditOutlined, LinkOutlined,
    FileTextOutlined, VideoCameraOutlined, InfoCircleOutlined,
    EyeOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const ManageResources: React.FC = () => {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [currentRecord, setCurrentRecord] = useState<any>(null);

    const [form] = Form.useForm();
    const typeValue = Form.useWatch('type', form);

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

    const openModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);
            setCurrentRecord(record);
            form.setFieldsValue({
                title: record.title,
                type: record.type,
                description: record.description, // Bổ sung trường mô tả
                link: record.type === 'VIDEO' ? record.fileUrl : '',
            });
            setFileList([]);
        } else {
            setEditingId(null);
            setCurrentRecord(null);
            form.resetFields();
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('type', values.type);
            formData.append('description', values.description || '');

            if (values.type === 'VIDEO') {
                if (!values.link) return message.error('Vui lòng nhập Link Video (Youtube/Drive)!');
                formData.append('link', values.link);
            } else {
                if (fileList.length > 0) {
                    formData.append('file', fileList[0].originFileObj);
                } else {
                    if (editingId && currentRecord?.type === 'VIDEO') {
                        return message.error('Vui lòng Upload file mới khi chuyển từ Video sang Tài liệu!');
                    }
                    if (!editingId) return message.error('Vui lòng chọn File tài liệu!');
                }
            }

            setLoading(true);
            if (editingId) {
                await api.patch(`/resources/${editingId}`, formData);
                message.success('Cập nhật tài liệu thành công!');
            } else {
                await api.post('/resources/upload', formData);
                message.success('Thêm tài liệu vào kho thành công!');
            }

            setIsModalOpen(false);
            fetchResources();
        } catch (err) {
            message.error('Có lỗi xảy ra trong quá trình lưu dữ liệu!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/resources/${id}`);
            message.success('Đã xóa tài liệu khỏi hệ thống');
            fetchResources();
        } catch (error) { message.error('Lỗi khi thực hiện lệnh xóa'); }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
            align: 'center' as const
        },
        {
            title: 'Tên tài liệu',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {record.description && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            width: 150,
            render: (type: string) => {
                const config: any = {
                    TEMPLATE: { color: 'blue', icon: <FileTextOutlined />, text: 'Biểu mẫu' },
                    GUIDE: { color: 'green', icon: <InfoCircleOutlined />, text: 'Hướng dẫn' },
                    VIDEO: { color: 'red', icon: <VideoCameraOutlined />, text: 'Video' }
                };
                const item = config[type] || config.TEMPLATE;
                return <Tag color={item.color} icon={item.icon}>{item.text}</Tag>;
            }
        },
        {
            title: 'Link/File',
            dataIndex: 'fileUrl',
            width: 100,
            align: 'center' as const,
            render: (url: string) => {
                const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
                return (
                    <Tooltip title="Xem nội dung">
                        <Button type="link" icon={<EyeOutlined />} href={fullUrl} target="_blank" />
                    </Tooltip>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="primary" ghost size="small" icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa tài liệu?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card bordered={false} className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Quản lý Kho Tài liệu & Video</Title>
                        <Text type="secondary">Quản lý các biểu mẫu, hướng dẫn và video đào tạo NCKH</Text>
                    </div>
                    <Button type="primary" size="large" icon={<UploadOutlined />} onClick={() => openModal()}>
                        Thêm mới tài liệu
                    </Button>
                </div>

                <Table
                    dataSource={resources}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                />
            </Card>

            <Modal
                title={editingId ? "Cập nhật tài liệu" : "Đăng tải tài liệu mới"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                okText={editingId ? "Lưu thay đổi" : "Đăng tải ngay"}
                cancelText="Đóng"
                width={600}
            >
                <Form form={form} onFinish={handleSubmit} layout="vertical" initialValues={{ type: 'TEMPLATE' }}>
                    <Form.Item name="title" label="Tiêu đề hiển thị" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề tài liệu' }]}>
                        <Input placeholder="Ví dụ: Mẫu thuyết minh đề tài NCKH 2025" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả ngắn gọn">
                        <Input.TextArea placeholder="Thông tin tóm tắt về tài liệu này..." rows={2} />
                    </Form.Item>

                    <Form.Item name="type" label="Phân loại" rules={[{ required: true }]}>
                        <Select onChange={() => {
                            setFileList([]);
                            form.setFieldValue('link', '');
                        }}>
                            <Select.Option value="TEMPLATE">📄 Biểu mẫu chuẩn (Template)</Select.Option>
                            <Select.Option value="GUIDE">📘 Tài liệu hướng dẫn (Guide)</Select.Option>
                            <Select.Option value="VIDEO">🎬 Video bài giảng/hướng dẫn (Video)</Select.Option>
                        </Select>
                    </Form.Item>

                    {typeValue === 'VIDEO' ? (
                        <Form.Item
                            name="link"
                            label="Đường dẫn Video"
                            rules={[{ required: true, message: 'Vui lòng nhập URL!' }]}
                            extra="Hỗ trợ link Youtube, Google Drive hoặc Vimeo."
                        >
                            <Input prefix={<LinkOutlined />} placeholder="https://www.youtube.com/watch?v=..." />
                        </Form.Item>
                    ) : (
                        <Form.Item
                            label={editingId && currentRecord?.type !== 'VIDEO' ? "Tải File mới (Để trống nếu giữ file cũ)" : "Tải lên File tài liệu"}
                            required={!editingId || currentRecord?.type === 'VIDEO'}
                        >
                            <Upload.Dragger
                                maxCount={1}
                                beforeUpload={() => false}
                                fileList={fileList}
                                onChange={({ fileList }) => setFileList(fileList)}
                                style={{ background: '#fafafa', borderRadius: '8px' }}
                            >
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
                                <p className="ant-upload-hint">Hỗ trợ định dạng .doc, .docx, .pdf, .xls (Tối đa 20MB)</p>
                            </Upload.Dragger>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

const { Title, Text } = Typography;
export default ManageResources;