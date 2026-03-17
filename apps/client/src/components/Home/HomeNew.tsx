import React from 'react';
import { Row, Col, Card, Tag, Typography, Button, Tooltip, Space, message } from 'antd';
import { 
    CalendarOutlined, 
    ArrowRightOutlined, 
    DownloadOutlined, 
    EyeOutlined, 
    FilePdfOutlined, 
    FileWordOutlined,
    FileImageOutlined,
    FileUnknownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface HomeNewsProps {
    posts: any[];
}

const HomeNews: React.FC<HomeNewsProps> = ({ posts }) => {
    const navigate = useNavigate();

    // 1. Hàm tải file chuẩn tên (Blob xử lý để tránh tên file vvi9w...)
    const handleDownload = async (url: string, title: string) => {
        const hide = message.loading('Đang chuẩn bị tệp tin...', 0);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const extension = url.split('.').pop()?.split('?')[0] || 'file';
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title.replace(/[/\\?%*:|"<>]/g, '-')}.${extension}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            hide();
            message.success('Tải xuống thành công');
        } catch (error) {
            hide();
            window.open(url, '_blank');
        }
    };

    // 2. Hàm render ảnh bìa - THÔNG MINH HƠN CHO MỌI LOẠI FILE
    const renderCardCover = (item: any) => {
        const thumbnailUrl = item.thumbnail;
        const fileUrl = (item.externalLink || "").toLowerCase();
        
        // Kiểm tra loại file đính kèm
        const isPDF = fileUrl.endsWith('.pdf');
        const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png)$/) != null;
        const isWord = fileUrl.match(/\.(doc|docx)$/) != null;

        const coverStyle: React.CSSProperties = {
            height: 220, // Tăng chiều cao lên chút cho đẹp
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#f0f2f5',
        };

        const defaultCoverImage = "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop";

        // ƯU TIÊN 1: Nếu admin có upload ảnh bìa thủ công
        if (thumbnailUrl && thumbnailUrl !== "null" && thumbnailUrl.trim() !== "") {
            return (
                <div style={coverStyle}>
                    <img src={thumbnailUrl} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            );
        }

        // ƯU TIÊN 2: NẾU KHÔNG CÓ THUMBNAIL, xử lý dựa trên File đính kèm
        if (fileUrl) {
            // NẾU LÀ ẢNH -> Lấy luôn làm ảnh bìa
            if (isImage) {
                return (
                    <div style={coverStyle}>
                        <img src={item.externalLink} alt="attachment-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', borderRadius: '50%', padding: 4, display: 'flex' }}>
                            <FileImageOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                        </div>
                    </div>
                );
            }

            // NẾU LÀ PDF -> Dùng Cloudinary để lấy ảnh trang đầu
            if (isPDF && fileUrl.includes('cloudinary')) {
                const pdfThumb = item.externalLink.replace(/\.pdf$/i, '.jpg');
                return (
                    <div style={coverStyle}>
                        <img 
                            src={pdfThumb} 
                            alt="PDF Preview" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = defaultCoverImage; // Fallback về ảnh mặc định nếu Cloudinary lỗi
                            }}
                        />
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.1)' }}></div>
                        <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', borderRadius: '50%', padding: 4, display: 'flex' }}>
                            <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                        </div>
                    </div>
                );
            }

            // NẾU LÀ FILE KHÁC (WORD, EXCEL...) -> Hiện ảnh mặc định + Icon nhận diện
            return (
                <div style={coverStyle}>
                    <img src={defaultCoverImage} alt="default" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)' }}></div>
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', borderRadius: '50%', padding: 4, display: 'flex' }}>
                        {isWord ? <FileWordOutlined style={{ fontSize: 20, color: '#1890ff' }} /> : <FileUnknownOutlined style={{ fontSize: 20, color: '#faad14' }} />}
                    </div>
                </div>
            );
        }

        // MẶC ĐỊNH: Nếu không có ảnh, cũng không đính kèm file gì cả
        return (
            <div style={coverStyle}>
                <img src={defaultCoverImage} alt="default" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)' }}></div>
            </div>
        );
    };

    return (
        <div style={{ padding: '80px 0', background: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                    <Title level={2} style={{ margin: 0, color: '#1a3353' }}>📰 TIN TỨC & HƯỚNG DẪN MỚI</Title>
                    <Button type="primary" ghost onClick={() => navigate('/news')} icon={<ArrowRightOutlined />}>Xem tất cả</Button>
                </div>

                <Row gutter={[24, 24]}>
                    {posts.map((item: any) => (
                        <Col xs={24} sm={12} md={8} key={item.id}>
                            <Card
                                hoverable
                                style={{ borderRadius: 12, overflow: 'hidden', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                bodyStyle={{ padding: '20px' }}
                                cover={renderCardCover(item)}
                                actions={[
                                    <Tooltip title="Xem chi tiết" key="view">
                                        <EyeOutlined onClick={() => navigate(`/news/${item.id}`)} style={{ fontSize: 18 }} />
                                    </Tooltip>,
                                    item.externalLink && (
                                        <Tooltip title="Tải xuống tài liệu đính kèm" key="download">
                                            <DownloadOutlined 
                                                style={{ color: '#1890ff', fontSize: 18 }} 
                                                onClick={() => handleDownload(item.externalLink, item.title)}
                                            />
                                        </Tooltip>
                                    )
                                ]}
                            >
                                <Tag color={item.type === 'ANNOUNCEMENT' ? 'volcano' : 'blue'} style={{ marginBottom: 12 }}>
                                    {item.type === 'ANNOUNCEMENT' ? 'THÔNG BÁO' : 'TIN TỨC'}
                                </Tag>
                                <Card.Meta
                                    title={<Text strong style={{ fontSize: 16, height: 48, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</Text>}
                                    description={
                                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                            <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>{item.content || 'Xem chi tiết...'}</Paragraph>
                                            <Text type="secondary" style={{ fontSize: 12 }}><CalendarOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
                                        </Space>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    );
};

export default HomeNews;