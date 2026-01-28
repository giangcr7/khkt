import React, { useEffect, useState } from 'react';
// SỬA: Bổ sung Row, Col vào danh sách import
import { Table, Tag, Space, Button, Input, Select, Popconfirm, message, Modal, Form, Tooltip, Switch, Upload, Image, Row, Col } from 'antd';
import {
    DeleteOutlined, EditOutlined, SearchOutlined, PlusOutlined,
    LockOutlined, UnlockOutlined, ReloadOutlined, UserOutlined,
    MailOutlined, KeyOutlined, UploadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { uploadService } from '../../services/upload.service';

const { Option } = Select;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [form] = Form.useForm();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/all');
            setUsers(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openModal = (user?: any) => {
        setFileList([]);
        if (user) {
            setEditingUser(user);
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                avatar: user.avatar,
                password: '',
            });
            if (user.avatar) {
                setFileList([{ uid: '-1', name: 'avatar.png', status: 'done', url: user.avatar }]);
            }
        } else {
            setEditingUser(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true, role: 'STUDENT' });
        }
        setIsModalOpen(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setModalLoading(true);

            let finalAvatarUrl = values.avatar || null;

            if (fileList.length > 0 && fileList[0].originFileObj) {
                message.loading({ content: 'Đang tải ảnh...', key: 'up' });
                finalAvatarUrl = await uploadService.uploadFile(fileList[0].originFileObj, 'users');
                message.success({ content: 'Tải ảnh thành công!', key: 'up' });
            }

            const payload = { ...values, avatar: finalAvatarUrl };
            if (!payload.password) delete payload.password;

            if (editingUser) {
                await api.patch(`/users/${editingUser.id}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/users', payload);
                message.success('Thêm người dùng thành công');
            }

            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
            message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleActive = async (user: any) => {
        try {
            const newStatus = !user.isActive;
            await api.patch(`/users/${user.id}`, { isActive: newStatus });
            message.success(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản`);
            fetchUsers();
        } catch (err) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    const columns = [
        { 
            title: 'Avatar', 
            dataIndex: 'avatar', 
            width: 80,
            render: (src: string) => src ? (
                <Image src={src} width={40} height={40} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            ) : <UserOutlined style={{ fontSize: 24, color: '#ccc' }} />
        },
        { title: 'Họ tên', dataIndex: 'fullName', render: (t: string) => <b>{t}</b> },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Vai trò', dataIndex: 'role',
            render: (role: string) => {
                let color = role === 'ADMIN' ? 'red' : role === 'LECTURER' ? 'purple' : 'green';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Trạng thái', dataIndex: 'isActive',
            render: (active: boolean) => (
                <Tag color={active ? 'success' : 'error'}>{active ? 'Hoạt động' : 'Đã khóa'}</Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    <Popconfirm title="Thay đổi trạng thái?" onConfirm={() => handleToggleActive(record)}>
                        <Button 
                            danger={record.isActive} 
                            size="small" 
                            icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />} 
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredData = users.filter((u: any) => 
        (u.fullName?.toLowerCase().includes(searchText.toLowerCase()) || u.email?.toLowerCase().includes(searchText.toLowerCase())) &&
        (roleFilter === 'ALL' || u.role === roleFilter)
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} onChange={e => setSearchText(e.target.value)} style={{ width: 250 }} />
                    <Select defaultValue="ALL" style={{ width: 150 }} onChange={setRoleFilter}>
                        <Option value="ALL">Tất cả vai trò</Option>
                        <Option value="STUDENT">Sinh viên</Option>
                        <Option value="LECTURER">Giảng viên</Option>
                        <Option value="ADMIN">Quản trị viên</Option>
                    </Select>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>Thêm người dùng</Button>
            </div>

            <Table columns={columns} dataSource={filteredData} rowKey="id" loading={loading} />

            <Modal
                title={editingUser ? "Cập nhật thông tin" : "Thêm người dùng mới"}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={modalLoading}
            >
                <Form form={form} layout="vertical" onFinish={handleModalOk}>
                    <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true }]}><Input prefix={<UserOutlined />} /></Form.Item>
                    
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                                <Input prefix={<MailOutlined />} disabled={!!editingUser} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Ảnh đại diện">
                                <Upload 
                                    listType="picture-card" 
                                    maxCount={1} 
                                    fileList={fileList} 
                                    beforeUpload={() => false} 
                                    onChange={({ fileList }) => setFileList(fileList)}
                                >
                                    {fileList.length < 1 && <div><PlusOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
                                </Upload>
                                <Form.Item name="avatar" noStyle><Input type="hidden" /></Form.Item>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="password" label={editingUser ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu"} rules={[{ required: !editingUser }]}>
                        <Input.Password prefix={<KeyOutlined />} />
                    </Form.Item>

                    <Space size="large">
                        <Form.Item name="role" label="Vai trò" rules={[{ required: true }]}>
                            <Select style={{ width: 150 }}>
                                <Option value="STUDENT">Sinh viên</Option>
                                <Option value="LECTURER">Giảng viên</Option>
                                <Option value="ADMIN">Quản trị viên</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    </Space>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;