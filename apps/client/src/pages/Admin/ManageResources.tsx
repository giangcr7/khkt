import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Upload,
    message,
    Select,
    Tag,
    Popconfirm,
    Card,
    Space,
    Typography
} from 'antd';

import {
    UploadOutlined,
    DeleteOutlined,
    EditOutlined,
    BookOutlined,
    FormOutlined,
    SafetyCertificateOutlined,
    BarChartOutlined
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

    // =========================
    // FETCH DATA
    // =========================
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

    useEffect(() => {
        fetchResources();
    }, []);

    // =========================
    // OPEN MODAL
    // =========================
    const handleOpenModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);

            form.setFieldsValue({
                title: record.title,
                type: record.type,
                description: record.description
            });
        } else {
            setEditingId(null);
            form.resetFields();
            setFileList([]);
        }

        setIsModalOpen(true);
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (values: any) => {
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append('title', values.title);
            formData.append('type', values.type);
            formData.append('description', values.description || '');

            if (fileList.length > 0) {
                formData.append('file', fileList[0].originFileObj);
            } else if (!editingId) {
                message.warning('Vui lòng chọn tệp tài liệu!');
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
        } catch (err) {
            message.error('Thao tác thất bại!');
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // DELETE
    // =========================
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/resources/${id}`);
            message.success('Đã xóa tài liệu');

            fetchResources();
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    // =========================
    // FILE ICON
    // =========================
    const getFileIcon = (type: string) => {
        switch (type) {
            case 'REFERENCE':
                return <BookOutlined style={{ fontSize: 22, color: '#1677ff' }} />;

            case 'TEMPLATE':
                return <FormOutlined style={{ fontSize: 22, color: '#13c2c2' }} />;

            case 'GUIDE':
                return <SafetyCertificateOutlined style={{ fontSize: 22, color: '#52c41a' }} />;

            case 'STATISTICS':
                return <BarChartOutlined style={{ fontSize: 22, color: '#722ed1' }} />;

            default:
                return <UploadOutlined style={{ fontSize: 22 }} />;
        }
    };

    // =========================
    // TABLE COLUMNS
    // =========================
    const columns = [
        {
            title: 'Tài liệu',
            key: 'resource',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <div
                        style={{
                            width: 45,
                            height: 45,
                            borderRadius: 8,
                            background: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {getFileIcon(record.type)}
                    </div>

                    <Space direction="vertical" size={0}>
                        <Text strong>{record.title}</Text>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.description}
                        </Text>
                    </Space>
                </Space>
            )
        },

        {
            title: 'Phân loại',
            dataIndex: 'type',
            width: 220,

            render: (type: string) => {
                const config: any = {
                    REFERENCE: {
                        color: 'blue',
                        label: 'Tài liệu tham khảo',
                        icon: <BookOutlined />
                    },

                    TEMPLATE: {
                        color: 'cyan',
                        label: 'Mẫu biểu',
                        icon: <FormOutlined />
                    },

                    GUIDE: {
                        color: 'green',
                        label: 'Quy định - Hướng dẫn',
                        icon: <SafetyCertificateOutlined />
                    },

                    STATISTICS: {
                        color: 'purple',
                        label: 'Phân tích thống kê',
                        icon: <BarChartOutlined />
                    }
                };

                const item = config[type] || {
                    color: 'default',
                    label: type,
                    icon: null
                };

                return (
                    <Tag icon={item.icon} color={item.color}>
                        {item.label}
                    </Tag>
                );
            }
        },

        {
            title: 'Hành động',
            key: 'action',
            align: 'right' as const,
            width: 150,

            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(record)}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xác nhận xóa?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button
                            type="link"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                        alignItems: 'center'
                    }}
                >
                    <div>
                        <Title level={2} style={{ margin: 0 }}>
                            Quản trị Học liệu
                        </Title>

                        <Text type="secondary">
                            Phân loại: Tài liệu tham khảo - Mẫu biểu - Quy định - Thống kê
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<UploadOutlined />}
                        onClick={() => handleOpenModal()}
                        style={{ borderRadius: 8 }}
                    >
                        Thêm tài liệu mới
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
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        {editingId
                            ? '✍️ Chỉnh sửa tài liệu'
                            : 'Tải lên tài liệu mới'}
                    </Title>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={loading}
                width={550}
                okText="Xác nhận"
                cancelText="Hủy bỏ"
                destroyOnClose
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        name="title"
                        label="Tên tài liệu"
                        rules={[
                            {
                                required: true,
                                message: 'Nhập tiêu đề!'
                            }
                        ]}
                    >
                        <Input placeholder="Mẫu báo cáo, Quy định thực tập..." />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="Phân loại tài liệu"
                        rules={[
                            {
                                required: true,
                                message: 'Chọn loại tài liệu!'
                            }
                        ]}
                    >
                        <Select placeholder="-- Chọn phân loại --">
                            <Select.Option value="REFERENCE">
                                Tài liệu tham khảo
                            </Select.Option>

                            <Select.Option value="TEMPLATE">
                                Mẫu biểu chuẩn
                            </Select.Option>

                            <Select.Option value="GUIDE">
                                Quy định & hướng dẫn 
                            </Select.Option>

                            <Select.Option value="STATISTICS">
                                Phân tích thống kê
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả ngắn">
                        <Input.TextArea
                            placeholder="Ghi chú nhanh về tài liệu..."
                            rows={2}
                        />
                    </Form.Item>

                    <Form.Item label="Tệp tài liệu (PDF/Docx)">
                        <Upload.Dragger
                            maxCount={1}
                            beforeUpload={() => false}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>

                            <p className="ant-upload-text">
                                Kéo thả file vào đây
                            </p>
                        </Upload.Dragger>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageResources;