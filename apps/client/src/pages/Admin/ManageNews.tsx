import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Card, Typography, Popconfirm, message, Image, Upload, Row, Col, Tag } from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined,
    PictureOutlined, UploadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { uploadService } from '../../services/upload.service';

const { Title, Text, Paragraph } = Typography;

const ManageNews: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [currentRecord, setCurrentRecord] = useState<any>(null);

    const [thumbList, setThumbList] = useState<any[]>([]);
    const [fileAttachmentList, setFileAttachmentList] = useState<any[]>([]);

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

    useEffect(() => {
        fetchPosts();
    }, []);

    const openModal = (record?: any) => {
        setEditingId(record ? record.id : null);
        setCurrentRecord(record ? record : null);
        setThumbList([]);
        setFileAttachmentList([]);

        if (record) {
            form.setFieldsValue({
                title: record.title,
                externalLink: record.externalLink,
                content: record.content
            });

            if (record.thumbnail) {
                setThumbList([{ uid: '-1', name: 'Ảnh bìa hiện tại', status: 'done', url: record.thumbnail }]);
            }
            if (record.externalLink) {
                setFileAttachmentList([{ uid: '-2', name: 'Tài liệu đã đính kèm', status: 'done', url: record.externalLink }]);
            }
        } else {
            form.resetFields();
        }

        setIsModalOpen(true);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        const hide = message.loading('Đang xử lý tải tệp lên...', 0);

        try {
            let finalThumbUrl = currentRecord?.thumbnail || "";
            let finalFileUrl = values.externalLink || currentRecord?.externalLink || "";

            // Nếu có Upload ảnh bìa mới
            if (thumbList.length > 0 && thumbList[0].originFileObj) {
                finalThumbUrl = await uploadService.uploadFile(thumbList[0].originFileObj, 'posts/thumbs');
            } else if (thumbList.length === 0) {
                finalThumbUrl = ""; 
            }

            // Nếu có Upload file PDF/Docx mới
            if (fileAttachmentList.length > 0 && fileAttachmentList[0].originFileObj) {
                finalFileUrl = await uploadService.uploadFile(fileAttachmentList[0].originFileObj, 'posts/documents');
            } else if (fileAttachmentList.length === 0 && !values.externalLink) {
                finalFileUrl = ""; 
            }

            // Đóng gói JSON thuần túy gửi xuống Backend
            const payload = {
                title: values.title,
                content: values.content,
                type: 'NEWS', // <-- GẮN CỨNG MẶC ĐỊNH LÀ NEWS ĐỂ BACKEND KHÔNG BÁO LỖI
                thumbnail: String(finalThumbUrl),
                externalLink: String(finalFileUrl)
            };

            if (editingId) {
                await api.patch(`/posts/${editingId}`, payload);
                message.success('Cập nhật bài viết thành công');
            } else {
                await api.post('/posts', payload);
                message.success('Đăng bài thành công');
            }

            setIsModalOpen(false);
            fetchPosts();

        } catch (error: any) {
            console.error(error);
            message.error(error.response?.data?.message || 'Lỗi khi lưu bài viết');
        } finally {
            hide();
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/posts/${id}`);
            message.success('Đã xóa bài viết');
            fetchPosts();
        } catch {
            message.error('Lỗi khi xóa bài viết');
        }
    };

    const columns = [
        {
            title: 'Bài viết',
            key: 'content',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <div style={{ position: 'relative' }}>
                        {record.thumbnail ? (
                            <Image
                                src={record.thumbnail}
                                width={70} height={50}
                                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                            />
                        ) : (
                            <div style={{ width: 70, height: 50, borderRadius: 8, background: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <PictureOutlined style={{ color: '#ccc', fontSize: 20 }} />
                            </div>
                        )}
                    </div>
                    <Space direction="vertical" size={0}>
                        <Text strong style={{ fontSize: 14 }}>{record.title}</Text>
                        <Paragraph type="secondary" ellipsis style={{ marginBottom: 0, maxWidth: 300 }}>
                            {record.content}
                        </Paragraph>
                        {record.externalLink && (
                            <Tag icon={<LinkOutlined />} color="blue" style={{ borderRadius: 10, marginTop: 4, cursor: 'pointer' }} onClick={() => window.open(record.externalLink)}>
                                Tài liệu đính kèm
                            </Tag>
                        )}
                    </Space>
                </Space>
            )
        },
        // ĐÃ XÓA CỘT PHÂN LOẠI Ở ĐÂY CHO GỌN BẢNG
        {
            title: 'Thao tác',
            align: 'right' as const,
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button type="text" shape="circle" icon={<EditOutlined style={{ color: '#1890ff' }} />} onClick={() => openModal(record)} />
                    <Popconfirm title="Xóa bài viết này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" shape="circle" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', minHeight: '100vh' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Quản trị Tin tức</Title>
                        <Text type="secondary">Cập nhật tin tức từ nhà trường</Text>
                    </div>
                    <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => openModal()} style={{ borderRadius: 8 }}>
                        Bài viết mới
                    </Button>
                </div>

                <Table
                    dataSource={posts}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                />
            </Card>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>{editingId ? "✍️ Cập nhật bài viết" : "🚀 Soạn thảo bài viết"}</Title>}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                width={850}
                confirmLoading={loading}
                okText="Xác nhận lưu"
                cancelText="Hủy bỏ"
                style={{ top: 20 }}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
                    <Row gutter={24}>
                        <Col span={15}>
                            <Form.Item name="title" label="Tiêu đề bài viết" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}>
                                <Input size="large" placeholder="Nhập tên bài viết..." style={{ borderRadius: 8 }} />
                            </Form.Item>

                            <Form.Item name="content" label="Nội dung chi tiết" rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}>
                                <Input.TextArea rows={10} placeholder="Viết nội dung chi tiết tại đây..." style={{ borderRadius: 8 }} />
                            </Form.Item>
                        </Col>

                        <Col span={9}>
                            <Form.Item label="Ảnh đại diện (Thumbnail)">
                                <Upload.Dragger
                                    listType="picture"
                                    maxCount={1}
                                    fileList={thumbList}
                                    beforeUpload={() => false}
                                    onChange={({ fileList }) => setThumbList(fileList)}
                                    style={{ borderRadius: 12, background: '#fafafa' }}
                                >
                                    <p className="ant-upload-drag-icon"><PictureOutlined /></p>
                                    <p className="ant-upload-text" style={{ fontSize: 13 }}>Kéo thả hoặc Click để chọn ảnh</p>
                                </Upload.Dragger>
                            </Form.Item>

                            <Form.Item label="Tài liệu đính kèm (PDF/Word)">
                                <Upload
                                    maxCount={1}
                                    fileList={fileAttachmentList}
                                    beforeUpload={() => false}
                                    onChange={({ fileList }) => setFileAttachmentList(fileList)}
                                >
                                    <Button icon={<UploadOutlined />} block style={{ borderRadius: 8 }}>Chọn file từ máy</Button>
                                </Upload>
                                <Form.Item name="externalLink" noStyle>
                                    <Input placeholder="Hoặc dán URL tại đây..." style={{ marginTop: 8, borderRadius: 8 }} />
                                </Form.Item>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageNews;