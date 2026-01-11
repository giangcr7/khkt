import React, { useEffect, useState } from 'react';
import { Layout, Divider, Typography, Row, Col, Spin, message } from 'antd';
import { RocketOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';

// Import các components đã tách
import HomeHero from '../../components/Home/HomeHero';
import HomeStats from '../../components/Home/HomeStats';
import HomeTimeline from '../../components/Home/HomeTimeline';
import HomeFAQ from '../../components/Home/HomeFAQ';
import Footer from '../../components/Shared/Footer';
import HomeGuide from '../../components/Home/HomeGuide';
import HomeResources from '../../components/Home/HomeResources';

const { Content } = Layout;
const { Title } = Typography;

const HomePage: React.FC = () => {
    const [data, setData] = useState<any>({
        stats: null,
        events: [],
        faqs: [],
        loading: true
    });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Sử dụng Promise.all để gọi đồng thời các API, tối ưu tốc độ tải trang
                const [resStats, resEvents, resFaqs] = await Promise.all([
                    api.get('/projects/stats'),
                    api.get('/events'),
                    api.get('/faqs')
                ]);

                setData({
                    stats: resStats.data,
                    events: resEvents.data,
                    faqs: resFaqs.data,
                    loading: false
                });
            } catch (error) {
                console.error("Lỗi tải trang chủ:", error);
                message.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                setData((prev: any) => ({ ...prev, loading: false }));
            }
        };

        fetchHomeData();
    }, []);

    // Hiển thị trạng thái đang tải toàn trang
    if (data.loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
                <Spin size="large" tip="Đang khởi tạo hành trình khoa học..." />
            </div>
        );
    }

    return (
        <Layout style={{ background: '#fff' }}>
            <Content>
                {/* 1. Phần tiêu đề & Tìm kiếm */}
                <HomeHero />

                {/* 2. Các con số thống kê */}
                <HomeStats stats={data.stats} />

                {/* 3. Nội dung chính: Cẩm nang & Lộ trình */}
                <div style={{ maxWidth: '1200px', margin: '80px auto', padding: '0 20px' }}>
                    <Row gutter={[60, 40]}>
                        {/* Cẩm nang nghiên cứu (Trái) */}
                        <Col xs={24} lg={14}>
                            <Divider orientation={"left" as any} >
                                <Title level={3}><RocketOutlined /> CẨM NANG NGHIÊN CỨU</Title>
                            </Divider>
                            <HomeGuide />
                        </Col>

                        {/* Lộ trình sự kiện (Phải) */}
                        <Col xs={24} lg={10}>
                            <Divider orientation={"left" as any}>
                                <Title level={3}><QuestionCircleOutlined /> LỘ TRÌNH DỰ KIẾN</Title>
                            </Divider>
                            <HomeTimeline events={data.events} />
                        </Col>
                    </Row>
                </div>

                {/* 4. Khu vực Kho tài liệu */}
                <HomeResources />

                {/* 5. Câu hỏi thường gặp */}
                <HomeFAQ faqs={data.faqs} />
            </Content>

            {/* 6. Chân trang dùng chung */}
            <Footer />
        </Layout>
    );
};

export default HomePage;