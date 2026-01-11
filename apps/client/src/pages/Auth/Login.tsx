import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { LoginDTO } from '../../types/auth.types';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: LoginDTO) => {
        setLoading(true);
        try {
            // 1. Gọi API đăng nhập
            const response = await authService.login(values);

            // 2. Lưu thông tin (Truyền đủ 3 tham số: Token, Role, và đối tượng User)
            authService.saveToken(
                response.accessToken,
                response.user.role,
                response.user
            );

            message.success(`Xin chào, ${response.user.fullName}!`);

            // 3. Điều hướng dựa trên vai trò (Role)
            const userRole = response.user.role?.toUpperCase();

            if (userRole === 'LECTURER') {
                navigate('/lecturer');
            } else if (userRole === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/student');
            }

        } catch (error: any) {
            console.error('Lỗi đăng nhập:', error);
            const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f0f2f5'
        }}>
            <Card
                style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '12px' }}
                bordered={false}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontSize: 40, color: '#1890ff', marginBottom: 10 }}>
                        <LoginOutlined />
                    </div>
                    <Title level={3} style={{ margin: 0 }}>Đăng nhập hệ thống</Title>
                    <Text type="secondary">Cổng thông tin NCKH & Luận văn</Text>
                </div>

                <Form
                    name="login_form"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Email (sv@school.edu.vn)"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{ height: '45px', fontSize: '16px', borderRadius: '6px' }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>

                    <Divider plain>Hoặc</Divider>

                    <div style={{ textAlign: 'center' }}>
                        <Text>Chưa có tài khoản? <a href="/register" style={{ fontWeight: '500' }}>Đăng ký ngay</a></Text>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;