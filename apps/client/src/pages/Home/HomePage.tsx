import React, { useEffect, useState } from 'react';
import { Layout, Spin, message } from 'antd';
import api from '../../services/api';

// Đảm bảo bạn đã import HomeTimeline ở đây
import HomeHero from '../../components/Home/HomeHero';
import HomeStats from '../../components/Home/HomeStats';
import HomeTimeline from '../../components/Home/HomeTimeline'; // <-- IMPORT MỚI
import HomeFAQ from '../../components/Home/HomeFAQ';
import Footer from '../../components/Shared/Footer';
import HomeResources from '../../components/Home/HomeResources';
import HomeNews from '../../components/Home/HomeNew';

const { Content } = Layout;

const HomePage: React.FC = () => {
    const [data, setData] = useState<any>({
        stats: null,
        events: [],    // Sẽ chứa dữ liệu Lộ trình (Timeline)
        faqs: [],
        posts: [],
        resources: [], 
        loading: true
    });

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [resStats, resEvents, resFaqs, resPosts, resResources] = await Promise.all([
                    api.get('/projects/stats'),
                    api.get('/events'), // Lấy sự kiện cho Timeline
                    api.get('/faqs'),
                    api.get('/posts'),
                    api.get('/resources') 
                ]);

                const sortedPosts = resPosts.data.reverse();

                setData({
                    stats: resStats.data,
                    events: resEvents.data, // Lưu mảng sự kiện vào state
                    faqs: resFaqs.data,
                    posts: sortedPosts.slice(0, 3), 
                    resources: resResources.data.slice(0, 4), 
                    loading: false
                });
            } catch (error) {
                message.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                setData((prev: any) => ({ ...prev, loading: false }));
            }
        };

        fetchHomeData();
    }, []);

    if (data.loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;

    return (
        <Layout style={{ background: '#fff' }}>
            <Content>
                {/* Khu vực 1: Banner & Tìm kiếm */}
                <HomeHero />

                {/* Khu vực 2: Thống kê số liệu nổi bật */}
                <HomeStats stats={data.stats} />

                {/* Khu vực 3: LỘ TRÌNH SỰ KIỆN (TIMELINE) */}
                {/* Đặt ở đây để sinh viên thấy ngay các mốc thời gian quan trọng */}
                <HomeTimeline events={data.events} /> 

                {/* Khu vực 4: Tin tức & Thông báo mới nhất */}
                <HomeNews posts={data.posts} />

                {/* Khu vực 5: Kho tài liệu biểu mẫu */}
                <HomeResources resources={data.resources} /> 

                {/* Khu vực 6: Hỏi đáp thường gặp */}
                <HomeFAQ faqs={data.faqs} />
            </Content>
            <Footer />
        </Layout>
    );
};

export default HomePage;