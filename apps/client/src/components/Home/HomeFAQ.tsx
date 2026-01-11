import React from 'react';
import { Typography, Collapse, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const HomeFAQ: React.FC<{ faqs: any[] }> = ({ faqs }) => {
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: '900px', margin: '80px auto', textAlign: 'center' }}>
            <Title level={3}>CÂU HỎI THƯỜNG GẶP</Title>
            <Collapse accordion ghost style={{ textAlign: 'left', marginTop: 30 }}>
                {faqs.slice(0, 3).map(f => (
                    <Panel header={<b>{f.question}</b>} key={f.id}>
                        <Paragraph>{f.answer}</Paragraph>
                    </Panel>
                ))}
            </Collapse>
            <Button type="link" onClick={() => navigate('/faq')} style={{ marginTop: 20 }}>
                Xem tất cả câu hỏi & gửi thắc mắc
            </Button>
        </div>
    );
};

export default HomeFAQ;