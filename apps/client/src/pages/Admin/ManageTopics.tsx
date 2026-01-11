import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Card, Typography, Popconfirm, message, Space, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BookOutlined, NumberOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ManageTopics: React.FC = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    // 1. Tải danh sách lĩnh vực từ Backend
    const fetchTopics = async () => {
        setLoading(true);
        try {
            // Khớp với endpoint bạn đang gọi ở MyProjectPage
            const res = await api.get('/projects/topics');
            setTopics(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách lĩnh vực');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTopics(); }, []);

    // 2. Mở Modal Thêm/Sửa
    const openModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue(record);
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý lưu dữ liệu
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (editingId) {
                // Update topic
                await api.patch(`/projects/topics/${editingId}`, values);
                message.success('Cập nhật lĩnh vực thành công');
            } else {
                // Create new topic
                await api.post('/projects/topics', values);
                message.success('Thêm lĩnh vực mới thành công');
            }
            setIsModalOpen(false);
            fetchTopics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi lưu dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // 4. Xóa lĩnh vực
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/projects/topics/${id}`);
            message.success('Đã xóa lĩnh vực');
            fetchTopics();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Không thể xóa (Lĩnh vực này có thể đang có đề tài)');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => <Tag icon={<NumberOutlined />}>{id}</Tag>
        },
        {
            title: 'Tên lĩnh vực nghiên cứu',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Số lượng đề tài',
            dataIndex: '_count',
            key: 'count',
            render: (count: any) => count?.projects || 0
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(record)} size="small" />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa lĩnh vực?"
                        description="Hành động này có thể ảnh hưởng đến các đề tài liên quan."
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={<Title level={3} style={{ margin: 0 }}><BookOutlined /> Quản lý Lĩnh vực nghiên cứu</Title>}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm lĩnh vực mới</Button>}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">Danh sách này được dùng để sinh viên chọn khi đăng ký đề tài và phân loại trên Dashboard.</Text>
                </div>
                <Table
                    dataSource={topics}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingId ? "Cập nhật lĩnh vực" : "Thêm lĩnh vực mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        label="Tên lĩnh vực"
                        rules={[{ required: true, message: 'Vui lòng nhập tên lĩnh vực' }]}
                    >
                        <Input placeholder="Ví dụ: Công nghệ thông tin, Kinh tế học, Năng lượng sạch..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageTopics;