import React from 'react';
import { List, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Item } = List;

const HomeGuide: React.FC = () => {
    const navigate = useNavigate();

    const guideSummary = [
        { t: 'Xác định vấn đề', d: 'Cách xác định vấn đề nghiên cứu từ thực tiễn.' },
        { t: 'Tìm kiếm tài liệu', d: 'Khai thác Google Scholar và thư viện số.' },
        { t: 'Phân tích dữ liệu', d: 'Sử dụng SPSS, Excel để xử lý thống kê.' }
    ];

    return (
        <>
            <List
                dataSource={guideSummary}
                renderItem={(item) => (
                    <Item actions={[
                        <Button type="link" onClick={() => navigate('/guide')}>
                            Xem hướng dẫn
                        </Button>
                    ]}>
                        <Item.Meta
                            title={<b>{item.t}</b>}
                            description={item.d}
                        />
                    </Item>
                )}
            />
            <Button
                block
                size="large"
                onClick={() => navigate('/guide')}
                style={{ marginTop: 20 }}
            >
                Xem chi tiết 10 bước nghiên cứu
            </Button>
        </>
    );
};

export default HomeGuide;