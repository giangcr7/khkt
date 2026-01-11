import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Card, Typography, Popconfirm, message, Tooltip, Image } from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
    RocketOutlined, BellOutlined, TrophyOutlined, LinkOutlined,
    PictureOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

const ManageNews: React.FC = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    // 1. Tải danh sách bài viết từ Backend
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    // 2. Mở Modal Thêm/Sửa
    const openModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);
            // Chỉ truyền các giá trị cần thiết vào Form, tránh truyền cả Object 'author'
            form.setFieldsValue({
                title: record.title,
                type: record.type,
                thumbnail: record.thumbnail,
                externalLink: record.externalLink,
                content: record.content,
            });
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ type: 'NEWS' });
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý lưu dữ liệu (Thêm mới hoặc Cập nhật)
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // "LÀM SẠCH" dữ liệu trước khi gửi lên Backend để khớp với DTO
            const payload = {
                title: values.title,
                content: values.content,
                thumbnail: values.thumbnail,
                type: values.type,
                externalLink: values.externalLink,
            };

            if (editingId) {
                // Cập nhật bài viết hiện có
                await api.patch(`/posts/${editingId}`, payload);
                message.success('Cập nhật bài viết thành công');
            } else {
                // Đăng bài viết mới
                await api.post('/posts', payload);
                message.success('Đăng bài viết mới thành công');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (error: any) {
            // Hiển thị chi tiết lỗi từ Backend (DTO Validation)
            const errorMsg = error.response?.data?.message;
            message.error(Array.isArray(errorMsg) ? errorMsg[0] : (errorMsg || 'Lỗi khi lưu dữ liệu'));
        } finally {
            setLoading(false);
        }
    };

    // 4. Xử lý xóa bài viết
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/posts/${id}`);
            message.success('Đã xóa bài viết vĩnh viễn');
            fetchPosts();
        } catch (error) {
            message.error('Lỗi khi thực hiện lệnh xóa');
        }
    };

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            width: 100,
            render: (src: string) => src ? (
                <Image src={src} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
            ) : (
                <div style={{ width: 50, height: 50, background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }}>
                    <PictureOutlined style={{ fontSize: 20, color: '#bfbfbf' }} />
                </div>
            )
        },
        {
            title: 'Thông tin bài viết',
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    {record.externalLink && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <LinkOutlined /> <a href={record.externalLink} target="_blank" rel="noreferrer">{record.externalLink}</a>
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Phân loại',
            dataIndex: 'type',
            key: 'type',
            width: 140,
            render: (type: string) => {
                const config: any = {
                    NEWS: { color: 'blue', text: 'Tin tức', icon: <BellOutlined /> },
                    GUIDE: { color: 'green', text: 'Hướng dẫn', icon: <RocketOutlined /> },
                    BLOG: { color: 'purple', text: 'Góc chia sẻ', icon: <FileTextOutlined /> },
                    CONTEST: { color: 'volcano', text: 'Cuộc thi', icon: <TrophyOutlined /> }
                };
                const item = config[type] || config.NEWS;
                return <Tag color={item.color} icon={item.icon}>{item.text}</Tag>;
            }
        },
        {
            title: 'Tác giả',
            dataIndex: ['author', 'fullName'],
            key: 'author',
            width: 150,
            render: (name: string) => name || 'Quản trị viên'
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 120,
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => openModal(record)} size="small" />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa bài viết?"
                        description="Hành động này sẽ xóa dữ liệu vĩnh viễn."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa bài">
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
                title={<Title level={3} style={{ margin: 0 }}>Quản trị Nội dung Tin tức & Blog</Title>}
                extra={<Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()}>Đăng bài mới</Button>}
                variant="borderless"
            >
                <Table
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    bordered
                />
            </Card>

            <Modal
                title={editingId ? "Cập nhật bài viết" : "Thêm bài viết mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={850}
                confirmLoading={loading}
                okText={editingId ? "Lưu thay đổi" : "Đăng bài ngay"}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}>
                        <Input placeholder="Ví dụ: Cẩm nang thực hiện Nghiên cứu khoa học dành cho Tân sinh viên..." />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="type" label="Chuyên mục phân loại" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select placeholder="Chọn loại bài viết">
                                <Select.Option value="NEWS">Tin tức - Thông báo mới nhất</Select.Option>
                                <Select.Option value="GUIDE">Hướng dẫn làm NCKH (A-Z)</Select.Option>
                                <Select.Option value="BLOG">Góc chia sẻ kinh nghiệm (Blog)</Select.Option>
                                <Select.Option value="CONTEST">Học bổng - Cuộc thi - Sự kiện</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="thumbnail" label="Đường dẫn ảnh đại diện (Thumbnail URL)" style={{ flex: 1 }}>
                            <Input placeholder="https://example.com/image.jpg" prefix={<PictureOutlined />} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="externalLink"
                        label="Liên kết đính kèm (URL)"
                        extra="Sử dụng để dẫn link Google Drive tài liệu mẫu, link Video Youtube hướng dẫn, hoặc link bài báo gốc."
                    >
                        <Input placeholder="https://drive.google.com/... hoặc https://youtube.com/..." prefix={<LinkOutlined />} />
                    </Form.Item>

                    <Form.Item name="content" label="Nội dung chi tiết" rules={[{ required: true, message: 'Nội dung bài viết không được để trống' }]}>
                        <Input.TextArea rows={12} placeholder="Nội dung bài viết trình bày chi tiết tại đây..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageNews;