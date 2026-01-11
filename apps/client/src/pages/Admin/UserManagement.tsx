import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Input, Select, Popconfirm, message, Modal, Form, Tooltip, Switch } from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    SearchOutlined,
    PlusOutlined,
    LockOutlined,     // Icon khóa
    UnlockOutlined,   // Icon mở khóa (Mới)
    ReloadOutlined,
    UserOutlined,
    MailOutlined,
    KeyOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [form] = Form.useForm();

    // 1. Tải danh sách
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            message.error('Lỗi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // 2. Mở Modal Thêm/Sửa
    const openModal = (user?: any) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                password: '',
            });
        } else {
            setEditingUser(null);
            form.resetFields();
            form.setFieldsValue({ isActive: true, role: 'STUDENT' });
        }
        setIsModalOpen(true);
    };

    // 3. Xử lý Submit Modal
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            setModalLoading(true);

            if (editingUser) {
                const payload = { ...values };
                if (!payload.password) delete payload.password;
                await api.patch(`/users/${editingUser.id}`, payload);
                message.success('Cập nhật thành công');
            } else {
                await api.post('/users', values);
                message.success('Thêm người dùng thành công');
            }

            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
            message.error(errorMsg);
        } finally {
            setModalLoading(false);
        }
    };

    // 4. Xử lý Khóa/Mở khóa nhanh (Nút hình ổ khóa)
    const handleToggleActive = async (user: any) => {
        try {
            const newStatus = !user.isActive;
            await api.patch(`/users/${user.id}`, { isActive: newStatus });
            message.success(`Đã ${newStatus ? 'mở khóa' : 'khóa'} tài khoản ${user.fullName}`);
            fetchUsers();
        } catch (err) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    // 5. Xóa người dùng
    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/users/${id}`);
            message.success('Đã xóa người dùng');
            fetchUsers();
        } catch (err) {
            message.error('Không thể xóa người dùng này');
        }
    };

    // 6. Lọc dữ liệu hiển thị
    const filteredData = users.filter((u: any) => {
        const matchesSearch = u.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchText.toLowerCase());
        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60, sorter: (a: any, b: any) => a.id - b.id },
        { title: 'Họ tên', dataIndex: 'fullName', render: (t: string) => <b>{t}</b> },
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Vai trò', dataIndex: 'role',
            render: (role: string) => {
                let color = 'geekblue';
                if (role === 'ADMIN') color = 'red';
                if (role === 'LECTURER') color = 'purple';
                if (role === 'STUDENT') color = 'green';
                return <Tag color={color}>{role}</Tag>;
            }
        },
        {
            title: 'Trạng thái', dataIndex: 'isActive',
            render: (active: boolean) => (
                active ? <Tag color="success">Hoạt động</Tag> : <Tag color="error">Đã khóa</Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="small">
                    {/* Nút Sửa */}
                    <Tooltip title="Sửa thông tin">
                        <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => openModal(record)} />
                    </Tooltip>

                    {/* Nút Khóa/Mở Khóa */}
                    <Popconfirm
                        title={record.isActive ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
                        onConfirm={() => handleToggleActive(record)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Tooltip title={record.isActive ? "Khóa truy cập" : "Mở khóa truy cập"}>
                            <Button
                                type={record.isActive ? "default" : "dashed"}
                                danger={record.isActive} // Nếu đang active -> Nút màu đỏ (cảnh báo khóa)
                                style={!record.isActive ? { borderColor: 'green', color: 'green' } : {}} // Nếu đang khóa -> Nút màu xanh (mở)
                                size="small"
                                icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>

                    {/* Nút Xóa */}
                    <Popconfirm title="Xóa vĩnh viễn?" onConfirm={() => handleDelete(record.id)}>
                        <Tooltip title="Xóa vĩnh viễn">
                            <Button danger size="small" icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <Space>
                    <Input
                        placeholder="Tìm theo tên, email..."
                        prefix={<SearchOutlined />}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Select defaultValue="ALL" style={{ width: 150 }} onChange={setRoleFilter}>
                        <Option value="ALL">Tất cả vai trò</Option>
                        <Option value="STUDENT">Sinh viên</Option>
                        <Option value="LECTURER">Giảng viên</Option>
                        <Option value="ADMIN">Quản trị viên</Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={fetchUsers} />
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                    Thêm người dùng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingUser ? "Cập nhật thông tin" : "Thêm người dùng mới"}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={modalLoading}
                okText="Lưu lại"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Nhập tên' }]}>
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}>
                        <Input prefix={<MailOutlined />} disabled={!!editingUser} />
                    </Form.Item>

                    <Form.Item name="password" label={editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"} rules={[{ required: !editingUser }]}>
                        <Input.Password prefix={<KeyOutlined />} />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="role" label="Vai trò" style={{ flex: 1 }} rules={[{ required: true }]}>
                            <Select>
                                <Option value="STUDENT">Sinh viên</Option>
                                <Option value="LECTURER">Giảng viên</Option>
                                <Option value="ADMIN">Quản trị viên</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                            <Switch checkedChildren="Hoạt động" unCheckedChildren="Đã khóa" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;