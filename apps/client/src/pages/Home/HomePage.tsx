import React, { useEffect, useState } from 'react';
import { Layout, Spin, message } from 'antd';
import api from '../../services/api';

import HomeHero from '../../components/Home/HomeHero';
import HomeStats from '../../components/Home/HomeStats';
import HomeTimeline from '../../components/Home/HomeTimeline'; 
import HomeFAQ from '../../components/Home/HomeFAQ';
import Footer from '../../components/Shared/Footer';
import HomeResources from '../../components/Home/HomeResources';
import HomeNews from '../../components/Home/HomeNew';

const { Content } = Layout;

const HomePage: React.FC = () => {
    // 👇 KIỂM TRA NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP CHƯA
    const isLoggedIn = !!localStorage.getItem('token');

    const [data, setData] = useState<any>({
        stats: null,
        events: [],   
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
                    api.get('/events'),
                    api.get('/faqs'),
                    api.get('/posts'),
                    api.get('/resources') 
                ]);

                const sortedPosts = resPosts.data.reverse();

                setData({
                    stats: resStats.data,
                    events: resEvents.data, 
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
                <HomeTimeline events={data.events} /> 

                {/* Khu vực 4: Tin tức & Thông báo mới nhất */}
                <HomeNews posts={data.posts} />

                {/* 👇 KHU VỰC 5: CHỈ HIỂN THỊ KHI ĐÃ ĐĂNG NHẬP 👇 */}
                {isLoggedIn && (
                    <HomeResources resources={data.resources} /> 
                )}

                {/* Khu vực 6: Hỏi đáp thường gặp */}
                <HomeFAQ faqs={data.faqs} />
            </Content>
            <Footer />
        </Layout>
    );
};

export default HomePage;