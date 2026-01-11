import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Divider, Row, Col } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SaveOutlined, BulbOutlined, ToolOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Paragraph } = Typography;

const AdminGuideManager: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Lấy dữ liệu hiện tại từ CSDL để hiển thị lên Form
    useEffect(() => {
        api.get('/guides/research').then(res => {
            if (res.data) {
                form.setFieldsValue(res.data);
            }
        }).catch(() => message.info("Bắt đầu tạo nội dung cẩm nang mới."));
    }, [form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Đảm bảo các trường mảng luôn tồn tại để tránh lỗi Prisma missing argument
            const payload = {
                ...values,
                steps: values.steps || [],
                tools: values.tools || [],
                skills: values.skills || []
            };

            await api.post('/guides/research', payload);
            message.success('Cập nhật dữ liệu cẩm nang thành công!');
        } catch (error) {
            console.error(error);
            message.error('Lỗi khi lưu dữ liệu lên máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Title level={3}><BulbOutlined /> Quản lý Nội dung Cẩm nang Dữ liệu Động</Title>
                <Paragraph type="secondary">Cập nhật lộ trình, công cụ và kỹ năng nghiên cứu cho sinh viên tại đây.</Paragraph>

                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="mainTitle" label="Tiêu đề chính cẩm nang" rules={[{ required: true }]}>
                                <Input placeholder="VD: Hướng dẫn Nghiên cứu Khoa học TLU" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="subTitle" label="Mô tả ngắn">
                                <Input placeholder="VD: Lộ trình từ ý tưởng đến báo cáo..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* SECTION 1: CÁC GIAI ĐOẠN */}
                    <Divider orientation={"left" as any} ><BulbOutlined /> Quy trình các Giai đoạn</Divider>
                    <Form.List name="steps">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'title']} rules={[{ required: true, message: 'Nhập tên giai đoạn' }]}>
                                            <Input placeholder="Tên giai đoạn" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'description']} rules={[{ required: true, message: 'Nhập nội dung' }]}>
                                            <Input placeholder="Mô tả công việc" style={{ width: 500 }} />
                                        </Form.Item>
                                        <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm giai đoạn nghiên cứu</Button>
                            </>
                        )}
                    </Form.List>

                    {/* SECTION 2: CÔNG CỤ TÌM KIẾM */}
                    <Divider orientation={"left" as any} style={{ marginTop: 40 }}><ToolOutlined /> Công cụ tìm kiếm tài liệu</Divider>
                    <Form.List name="tools">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Nhập tên công cụ' }]}>
                                            <Input placeholder="Tên công cụ (VD: Google Scholar)" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'desc']} rules={[{ required: true, message: 'Nhập mô tả' }]}>
                                            <Input placeholder="Mô tả công cụ" style={{ width: 500 }} />
                                        </Form.Item>
                                        <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm công cụ học thuật</Button>
                            </>
                        )}
                    </Form.List>

                    {/* SECTION 3: KỸ NĂNG PHẢN BIỆN */}
                    <Divider orientation={"left" as any} style={{ marginTop: 40 }}><TeamOutlined /> Kỹ năng phản biện & Bảo vệ</Divider>
                    <Form.List name="skills">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 12 }} align="baseline">
                                        <Form.Item {...restField} name={[name, 'header']} rules={[{ required: true, message: 'Nhập tiêu đề kỹ năng' }]}>
                                            <Input placeholder="Tiêu đề (VD: Lưu ý Slide)" style={{ width: 250 }} />
                                        </Form.Item>
                                        <Form.Item {...restField} name={[name, 'content']} rules={[{ required: true, message: 'Nhập nội dung kỹ năng' }]}>
                                            <Input.TextArea placeholder="Nội dung chi tiết" autoSize style={{ width: 500 }} />
                                        </Form.Item>
                                        <Button type="text" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />} />
                                    </Space>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm hướng dẫn kỹ năng</Button>
                            </>
                        )}
                    </Form.List>

                    <Divider />
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large" block style={{ marginTop: 20, height: '50px' }}>
                        Lưu và Cập nhật toàn hệ thống
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AdminGuideManager;