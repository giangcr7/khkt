import React, { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input, DatePicker,
    Upload, message, Space, Tag, Switch, Typography, Card, Popconfirm,
    Col, Row, Tooltip
} from 'antd';
import {
    PlusOutlined, UploadOutlined, DeleteOutlined,
    EditOutlined, CalendarOutlined, DownloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { uploadService } from '../../services/upload.service';
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
        setFileList([]); // Reset file list
        if (record) {
            setEditingId(record.id);
            form.setFieldsValue({
                title: record.title,
                description: record.description,
                dates: [dayjs(record.startDate), record.endDate ? dayjs(record.endDate) : null],
                isImportant: record.isImportant,
                fileUrl: record.fileUrl, // Giữ link file cũ nếu có
                fileName: record.fileName
            });
            if (record.fileUrl) {
                setFileList([{ uid: '-1', name: record.fileName || 'file_cu', status: 'done', url: record.fileUrl }]);
            }
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    // 2. XỬ LÝ LƯU DỮ LIỆU JSON (TÍCH HỢP BƯỚC UPLOAD)
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            let finalFileUrl = values.fileUrl || null;
            let finalFileName = values.fileName || null;

            // BƯỚC 1: Nếu có file mới được chọn, upload lên thư mục 'events'
            if (fileList.length > 0 && fileList[0].originFileObj) {
                message.loading({ content: 'Đang tải file lên Cloudinary...', key: 'up' });
                finalFileUrl = await uploadService.uploadFile(fileList[0].originFileObj, 'events');
                finalFileName = fileList[0].name;
                message.success({ content: 'Tải file thành công!', key: 'up' });
            }

            // BƯỚC 2: GỬI JSON THUẦN (application/json)
            const payload = {
                title: values.title,
                description: values.description || '',
                startDate: values.dates[0].toISOString(),
                endDate: values.dates[1] ? values.dates[1].toISOString() : null,
                isImportant: !!values.isImportant,
                fileUrl: finalFileUrl, // URL string nhận về
                fileName: finalFileName
            };

            if (editingId) {
                await api.patch(`/events/${editingId}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/events', payload);
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

    // ... Giữ nguyên handleDelete và columns ...
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
            width: 200,
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
            render: (record: any) => record.fileUrl ? (
                <a href={record.fileUrl} target="_blank" rel="noreferrer">
                    <Tag color="blue" icon={<DownloadOutlined />} style={{ cursor: 'pointer' }}>{record.fileName || 'Tải xuống'}</Tag>
                </a>
            ) : <Text disabled>Không có</Text>
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
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
            <Modal title={editingId ? "Sửa mốc thời gian" : "Thêm mốc mới"} open={isModalOpen} onOk={() => form.submit()} onCancel={() => setIsModalOpen(false)} confirmLoading={loading}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="dates" label="Thời gian" rules={[{ required: true }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="description" label="Mô tả"><Input.TextArea /></Form.Item>
                    
                    {/* THAY ĐỔI COMPONENT UPLOAD */}
                    <Form.Item label="File mẫu (PDF, Word, Ảnh)">
                        <Upload 
                            beforeUpload={() => false} 
                            maxCount={1} 
                            fileList={fileList} 
                            onChange={({ fileList }) => setFileList(fileList)}
                        >
                            <Button icon={<UploadOutlined />} block>Chọn file từ máy tính</Button>
                        </Upload>
                        {/* Lưu URL và Name cũ khi sửa */}
                        <Form.Item name="fileUrl" noStyle><Input type="hidden" /></Form.Item>
                        <Form.Item name="fileName" noStyle><Input type="hidden" /></Form.Item>
                    </Form.Item>

                    <Form.Item name="isImportant" label="Đánh dấu quan trọng" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageEvents;