import React, { useEffect, useState } from 'react';
import { Card, Tag, List, Typography, Button, Space, message, Empty, Modal, Form, Input, Select, InputNumber } from 'antd';
import { TeamOutlined, RocketOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Title, Text, Paragraph } = Typography;

const RecruitmentList: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const fetchRecruitments = async () => {
        try {
            const res = await api.get('/recruitment');
            setData(res.data);
        } catch (error) {
            message.error('Không thể tải danh sách tuyển dụng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecruitments(); }, []);

    // 1. Hàm Xử lý Đăng tin
    const handleCreate = async (values: any) => {
        try {
            await api.post('/recruitment', {
                ...values,
                skills: values.skills || []
            });
            message.success('Đăng tin tuyển thành công!');
            setIsModalOpen(false);
            form.resetFields();
            fetchRecruitments();
        } catch (error) {
            message.error('Lỗi: Kiểm tra lại thông tin hoặc quyền hạn');
        }
    };

    // 2. Hàm Xử lý Liên hệ
    const handleContact = (author: any) => {
        if (!author) return message.warning('Thông tin tác giả đang cập nhật');
        Modal.info({
            title: `Thông tin liên hệ: ${author.fullName}`,
            content: (
                <div style={{ marginTop: 10 }}>
                    <p><MailOutlined /> <b>Email:</b> {author.email || 'N/A'}</p>
                    <p><i>Hãy copy email và liên hệ trực tiếp để trao đổi về nhóm nhé!</i></p>
                </div>
            ),
        });
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3}><TeamOutlined /> Tìm đồng đội nghiên cứu</Title>
                <Button 
                    type="primary" 
                    icon={<RocketOutlined />} 
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                >
                    Đăng tin tuyển
                </Button>
            </div>

            {/* MODAL ĐĂNG TIN */}
            <Modal
                title="Đăng tin tìm đồng đội"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Đăng tin ngay"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item 
                        name="title" 
                        label="Tiêu đề tin tuyển" 
                        rules={[{ required: true, message: 'Nhập tiêu đề đề tài/nhóm!' }]}
                    >
                        <Input placeholder="VD: Tìm bạn làm đề tài IoT" />
                    </Form.Item>

                    <Form.Item 
                        name="content" 
                        label="Yêu cầu chi tiết" 
                        rules={[{ required: true, message: 'Nhập mô tả!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả kỹ năng cần thiết..." />
                    </Form.Item>

                    <Form.Item name="skills" label="Kỹ năng yêu cầu (Nhấn Enter)">
                        <Select mode="tags" placeholder="VD: React, Python..." />
                    </Form.Item>

                    <Form.Item 
                        name="targetAmount" 
                        label="Số lượng cần tuyển" 
                        initialValue={1}
                        rules={[{ required: true }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* DANH SÁCH TIN TUYỂN DỤNG */}
            <List
                grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                dataSource={data}
                loading={loading}
                renderItem={(item) => (
                    <List.Item>
                        <Card 
                            hoverable 
                            actions={[
                                <Button type="link" onClick={() => navigate(`/student/recruitment/${item.id}`)}>Chi tiết</Button>,
                                <Button type="primary" ghost onClick={() => handleContact(item.author)}>Liên hệ</Button>
                            ]}
                        >
                            <Tag color={item.status === 'OPEN' ? 'green' : 'red'} style={{ marginBottom: 8 }}>
                                {item.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}
                            </Tag>
                            <Title level={5} ellipsis={{ rows: 1 }}>{item.title}</Title>
                            <Paragraph ellipsis={{ rows: 2 }} type="secondary">{item.content}</Paragraph>
                            <div style={{ marginBottom: 12 }}>
                                {item.skills?.map((skill: string) => (
                                    <Tag key={skill} color="blue">{skill}</Tag>
                                ))}
                            </div>
                            <Space split={<Text type="secondary">|</Text>}>
                                <Text style={{ fontSize: '11px' }} type="secondary">Bởi: {item.author?.fullName}</Text>
                                <Text style={{ fontSize: '11px' }} type="secondary">{dayjs(item.createdAt).fromNow()}</Text>
                            </Space>
                        </Card>
                    </List.Item>
                )}
                locale={{ emptyText: <Empty description="Chưa có tin tuyển dụng nào" /> }}
            />
        </div>
    );
};

export default RecruitmentList;