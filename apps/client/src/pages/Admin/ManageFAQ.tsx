import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Card, Typography, Popconfirm, message, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ManageFAQ: React.FC = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    // 1. Tải danh sách FAQ từ Backend
    const fetchFaqs = async () => {
        setLoading(true);
        try {
            // Lưu ý: Đảm bảo Backend có endpoint /faqs
            const res = await api.get('/faqs');
            setFaqs(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách câu hỏi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFaqs(); }, []);

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

    // 3. Xử lý Lưu dữ liệu
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (editingId) {
                await api.patch(`/faqs/${editingId}`, values);
                message.success('Cập nhật câu hỏi thành công');
            } else {
                await api.post('/faqs', values);
                message.success('Thêm câu hỏi mới thành công');
            }
            setIsModalOpen(false);
            fetchFaqs();
        } catch (error) {
            message.error('Không thể lưu dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // 4. Xử lý Xóa
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/faqs/${id}`);
            message.success('Đã xóa câu hỏi');
            fetchFaqs();
        } catch (error) {
            message.error('Lỗi khi xóa dữ liệu');
        }
    };

    const columns = [
        {
            title: 'Câu hỏi',
            dataIndex: 'question',
            key: 'question',
            width: '35%',
            render: (text: string) => <Text strong><QuestionCircleOutlined /> {text}</Text>
        },
        {
            title: 'Câu trả lời',
            dataIndex: 'answer',
            key: 'answer',
            render: (text: string) => <Text type="secondary" ellipsis={{ tooltip: text }}>{text}</Text>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(record)} size="small" />
                    </Tooltip>
                    <Popconfirm title="Xóa câu hỏi này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Tooltip title="Xóa">
                            <Button danger icon={<DeleteOutlined />} size="small" />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={<Title level={3} style={{ margin: 0 }}>Quản lý Câu hỏi thường gặp (FAQ)</Title>}
                extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm FAQ mới</Button>}
                variant="borderless"
            >
                <div style={{ marginBottom: 16 }}>
                    <Tag color="blue">Mẹo:</Tag>
                    <Text type="secondary">Các câu hỏi này sẽ hiển thị ở trang chủ để sinh viên tra cứu nhanh, giúp giảm tải việc hỗ trợ trực tiếp.</Text>
                </div>
                <Table
                    dataSource={faqs}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            <Modal
                title={editingId ? "Sửa câu hỏi FAQ" : "Thêm câu hỏi FAQ mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={700}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        name="question"
                        label="Nội dung câu hỏi"
                        rules={[{ required: true, message: 'Vui lòng nhập câu hỏi' }]}
                    >
                        <Input.TextArea rows={2} placeholder="Ví dụ: Làm thế nào để đăng ký đề tài NCKH?" />
                    </Form.Item>
                    <Form.Item
                        name="answer"
                        label="Nội dung câu trả lời"
                        rules={[{ required: true, message: 'Vui lòng nhập câu trả lời' }]}
                    >
                        <Input.TextArea rows={6} placeholder="Nhập hướng dẫn chi tiết cho sinh viên..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageFAQ;