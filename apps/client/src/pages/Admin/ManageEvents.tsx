import React, { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input, DatePicker,
    Upload, message, Space, Tag, Switch, Typography, Card, Popconfirm,
    Col, Row, Tooltip
} from 'antd';
import {
    PlusOutlined, UploadOutlined, DeleteOutlined,
    EditOutlined, CalendarOutlined, ExclamationCircleOutlined,
    QuestionCircleOutlined, DownloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ManageEvents: React.FC = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events');
            setEvents(res.data);
        } catch (err) {
            message.error('Không thể tải danh sách sự kiện');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleOpenModal = (record?: any) => {
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({
                title: record.title,
                description: record.description,
                dates: [dayjs(record.startDate), record.endDate ? dayjs(record.endDate) : null],
                isImportant: record.isImportant,
            });
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setFileList([]);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('startDate', values.dates[0].toISOString());
        if (values.dates[1]) {
            formData.append('endDate', values.dates[1].toISOString());
        }
        formData.append('isImportant', String(values.isImportant || false));

        // Lấy đúng file thực tế từ originFileObj
        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append('file', fileList[0].originFileObj);
        }

        setLoading(true);
        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (editingId) {
                await api.patch(`/events/${editingId}`, formData, config);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/events', formData, config);
                message.success('Thêm mới thành công');
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err) {
            message.error('Lỗi khi lưu dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/events/${id}`);
            message.success('Đã xóa mốc thời gian');
            fetchEvents();
        } catch (err) {
            message.error('Lỗi khi xóa');
        }
    };

    const columns = [
        {
            title: 'Thời gian',
            key: 'time',
            width: 220,
            render: (record: any) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{dayjs(record.startDate).format('DD/MM/YYYY')}</Text>
                    {record.endDate && <Text type="secondary" style={{ fontSize: '12px' }}>đến {dayjs(record.endDate).format('DD/MM/YYYY')}</Text>}
                </Space>
            )
        },
        {
            title: 'Sự kiện',
            key: 'content',
            render: (record: any) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <Text strong>{record.title}</Text>
                        {record.isImportant && <Tag color="error">Quan trọng</Tag>}
                    </Space>
                    <Text type="secondary" style={{ fontSize: '13px' }}>{record.description}</Text>
                </Space>
            )
        },
        {
            title: 'File mẫu',
            key: 'file',
            render: (record: any) => record.fileName ? (
                <Tag color="blue" icon={<DownloadOutlined />}>{record.fileName}</Tag>
            ) : <Text disabled>Không có</Text>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (record: any) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Xóa mốc này?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card title={<Title level={3}>Quản lý Lộ trình NCKH</Title>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm mốc</Button>}>
                <Table dataSource={events} columns={columns} rowKey="id" loading={loading} />
            </Card>
            <Modal title={editingId ? "Sửa" : "Thêm"} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="dates" label="Thời gian" rules={[{ required: true }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
                    <Form.Item label="File mẫu">
                        <Upload beforeUpload={() => false} maxCount={1} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item name="isImportant" label="Quan trọng" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageEvents;