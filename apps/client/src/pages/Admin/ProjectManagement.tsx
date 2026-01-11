import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, message, Modal, Select, Avatar, Card, Input, Row, Col, Typography } from 'antd'; // Thêm Typography vào đây
import { UserOutlined, EditOutlined, FolderOutlined, SearchOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';

// XÓA dòng: import Title from 'antd/es/skeleton/Title';
const { Title, Text } = Typography; // Khai báo Title từ Typography chuẩn

const AdminProjectManagement: React.FC = () => {
    const [projects, setProjects] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
    const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resProjects, resLecturers] = await Promise.all([
                api.get('/projects/admin/all'),
                api.get('/users/lecturers')
            ]);
            setProjects(resProjects.data);
            setLecturers(resLecturers.data);
        } catch (error) {
            message.error('Lỗi tải dữ liệu từ máy chủ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssign = async () => {
        if (!currentProjectId || !selectedMentorId) {
            message.warning('Vui lòng chọn giảng viên!');
            return;
        }
        try {
            await api.patch(`/projects/${currentProjectId}/assign`, { mentorId: selectedMentorId });
            message.success('Phân công giảng viên thành công!');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            message.error('Lỗi khi thực hiện phân công');
        }
    };

    const filteredProjects = projects.filter((p: any) => {
        const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) ||
            p.student?.fullName?.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = filterStatus ? p.status === filterStatus : true;
        return matchSearch && matchStatus;
    });

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        {
            title: 'Thông tin Đề tài',
            key: 'name',
            render: (_: any, record: any) => (
                <div style={{ maxWidth: 300 }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>{record.name}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        <FolderOutlined /> Lĩnh vực: {record.topic?.name || 'N/A'}
                    </div>
                </div>
            )
        },
        {
            title: 'Sinh viên',
            key: 'student',
            render: (_: any, record: any) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span>{record.student?.fullName || 'N/A'}</span>
                </Space>
            )
        },
        {
            title: 'GV Hướng dẫn',
            key: 'mentor',
            render: (_: any, record: any) => (
                record.mentor ?
                    <Tag color="geekblue" icon={<UserOutlined />}>{record.mentor.fullName}</Tag> :
                    <Tag color="default" style={{ fontStyle: 'italic' }}>Chờ phân công</Tag>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status: string) => {
                const map: any = {
                    PENDING: { color: 'orange', text: 'Chờ duyệt' },
                    APPROVED: { color: 'blue', text: 'Đã duyệt' },
                    IN_PROGRESS: { color: 'cyan', text: 'Đang làm' },
                    COMPLETED: { color: 'green', text: 'Hoàn thành' },
                    REJECTED: { color: 'red', text: 'Từ chối' }
                };
                const config = map[status] || { color: 'default', text: status };
                return <Tag color={config.color} style={{ fontWeight: 'bold' }}>{config.text}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: any, record: any) => (
                <Button type="primary" ghost icon={<EditOutlined />} onClick={() => {
                    setCurrentProjectId(record.id);
                    setSelectedMentorId(record.mentorId || null);
                    setIsModalOpen(true);
                }}>
                    Phân công
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={
                    <Row justify="space-between" align="middle">
                        <Col>
                            {/* Title ở đây bây giờ đã là Typography.Title hợp lệ */}
                            <Title level={3} style={{ margin: 0 }}>Quản lý & Phân công Đề tài</Title>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<ReloadOutlined />} onClick={fetchData}>Làm mới</Button>
                                <Button type="primary" icon={<FileExcelOutlined />} style={{ background: '#1d743f', borderColor: '#1d743f' }}>
                                    Xuất báo cáo
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                }
                bordered={false}
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
                <Row gutter={16} style={{ marginBottom: 20 }}>
                    <Col span={12}>
                        <Input
                            placeholder="Tìm tên đề tài hoặc sinh viên..."
                            prefix={<SearchOutlined />}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={8}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Lọc theo trạng thái"
                            allowClear
                            onChange={val => setFilterStatus(val)}
                        >
                            <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                            <Select.Option value="APPROVED">Đã duyệt</Select.Option>
                            <Select.Option value="IN_PROGRESS">Đang thực hiện</Select.Option>
                            <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
                        </Select>
                    </Col>
                </Row>

                <Table
                    dataSource={filteredProjects}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    bordered
                />
            </Card>

            <Modal
                title={<b>Phân công Giảng viên Hướng dẫn</b>}
                open={isModalOpen}
                onOk={handleAssign}
                onCancel={() => setIsModalOpen(false)}
                okText="Xác nhận lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>Chọn giảng viên chịu trách nhiệm hướng dẫn chuyên môn cho đề tài này.</div>
                <Select
                    style={{ width: '100%' }}
                    placeholder="Tìm giảng viên..."
                    showSearch
                    optionFilterProp="label"
                    value={selectedMentorId}
                    onChange={(value) => setSelectedMentorId(value)}
                    options={lecturers.map((lec: any) => ({
                        value: lec.id,
                        label: `${lec.fullName} (${lec.email})`,
                        content: (
                            <Space>
                                <Avatar src={lec.avatar} icon={<UserOutlined />} size="small" />
                                {lec.fullName} <small style={{ color: '#bfbfbf' }}>- {lec.email}</small>
                            </Space>
                        )
                    }))}
                    optionRender={(option) => option.data.content}
                />
            </Modal>
        </div>
    );
};

export default AdminProjectManagement;