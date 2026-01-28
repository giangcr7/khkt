import React, { useEffect, useState } from 'react';
// Thêm Upload vào danh sách import
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Card, Typography, Popconfirm, message, Tooltip, Image, Upload } from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined,
    RocketOutlined, BellOutlined, TrophyOutlined, LinkOutlined,
    PictureOutlined, UploadOutlined // Thêm Icon Upload
} from '@ant-design/icons';
import api from '../../services/api';
// IMPORT SERVICE UPLOAD
import { uploadService } from '../../services/upload.service';

const { Title, Text } = Typography;

const ManageNews: React.FC = () => {
    // ... Giữ nguyên các state cũ ...
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    
    // THÊM STATE ĐỂ QUẢN LÝ FILE UPLOAD
    const [fileList, setFileList] = useState<any[]>([]);

    // 1. Tải danh sách bài viết (Giữ nguyên)
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

    // 2. Mở Modal (Cập nhật để hiển thị ảnh cũ nếu có)
    const openModal = (record?: any) => {
        setFileList([]); // Reset file list mỗi khi mở modal
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({
                title: record.title,
                type: record.type,
                thumbnail: record.thumbnail, // Vẫn giữ field này ẩn để lưu URL
                externalLink: record.externalLink,
                content: record.content,
            });
            // Nếu có ảnh cũ, hiển thị vào danh sách preview của Upload
            if (record.thumbnail) {
                setFileList([{ uid: '-1', name: 'image.png', status: 'done', url: record.thumbnail }]);
            }
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ type: 'NEWS' });
        }
        setIsModalOpen(true);
    };

    // 3. XỬ LÝ LƯU DỮ LIỆU (TÍCH HỢP BƯỚC UPLOAD)
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            let finalImageUrl = values.thumbnail;

            // BƯỚC 1: Nếu có file mới được chọn, tiến hành upload lên Cloudinary
            if (fileList.length > 0 && fileList[0].originFileObj) {
                message.loading({ content: 'Đang tải ảnh lên Cloudinary...', key: 'up' });
                // Truyền folder 'posts' để Cloudinary tự phân loại
                finalImageUrl = await uploadService.uploadFile(fileList[0].originFileObj, 'posts');
                message.success({ content: 'Tải ảnh thành công!', key: 'up' });
            }

            // BƯỚC 2: GỬI JSON (application/json)
            const payload = {
                title: values.title,
                content: values.content,
                thumbnail: finalImageUrl, // Đây là URL string nhận về từ bước 1
                type: values.type,
                externalLink: values.externalLink,
            };

            if (editingId) {
                await api.patch(`/posts/${editingId}`, payload);
                message.success('Cập nhật bài viết thành công');
            } else {
                await api.post('/posts', payload);
                message.success('Đăng bài viết mới thành công');
            }
            setIsModalOpen(false);
            fetchPosts();
        } catch (error: any) {
            message.error('Lỗi khi lưu bài viết');
        } finally {
            setLoading(false);
        }
    };

    // ... Giữ nguyên handleDelete và columns ...
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
                <Table dataSource={posts} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} bordered />
            </Card>

            <Modal
                title={editingId ? "Cập nhật bài viết" : "Thêm bài viết mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={850}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true }]}>
                        <Input placeholder="Tiêu đề bài viết..." />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="type" label="Phân loại" rules={[{ required: true }]} style={{ flex: 1 }}>
                            <Select>
                                <Select.Option value="NEWS">Tin tức</Select.Option>
                                <Select.Option value="GUIDE">Hướng dẫn</Select.Option>
                                <Select.Option value="BLOG">Blog</Select.Option>
                                <Select.Option value="CONTEST">Cuộc thi</Select.Option>
                            </Select>
                        </Form.Item>

                        {/* THAY THẾ Ô INPUT BẰNG COMPONENT UPLOAD */}
                        <Form.Item label="Ảnh đại diện (Upload lên Cloudinary)" style={{ flex: 1 }}>
                            <Upload
                                listType="picture"
                                maxCount={1}
                                fileList={fileList}
                                beforeUpload={() => false} // Không cho tự động upload, để onFinish xử lý
                                onChange={({ fileList }) => setFileList(fileList)}
                            >
                                <Button icon={<UploadOutlined />} block>Chọn ảnh từ máy tính</Button>
                            </Upload>
                            {/* Input ẩn để giữ giá trị URL cũ khi sửa */}
                            <Form.Item name="thumbnail" noStyle><Input type="hidden" /></Form.Item>
                        </Form.Item>
                    </div>

                    <Form.Item name="externalLink" label="Liên kết đính kèm">
                        <Input placeholder="https://..." prefix={<LinkOutlined />} />
                    </Form.Item>

                    <Form.Item name="content" label="Nội dung" rules={[{ required: true }]}>
                        <Input.TextArea rows={10} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageNews;