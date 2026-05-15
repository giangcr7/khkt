import React, { useEffect, useState } from 'react';
import { Card, Typography, List, Space, Tag, Spin, message, Tooltip } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined, EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileImageOutlined, FileUnknownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

const NewsListPage: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const res = await api.get('/posts');
                const sortedPosts = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPosts(sortedPosts);
            } catch (error) {
                message.error('Không thể tải danh sách tin tức');
            } finally {
                setLoading(false);
            }
        };
        fetchAllPosts();
    }, []);

    // =========================
    // PREVIEW URL
    // =========================
    const getPreviewUrl = (url: string) => {
        if (!url) return "";

        const API_BASE = import.meta.env.VITE_API_URL;
        const isCloudinary = url.includes("cloudinary.com");

        // Ảnh -> proxy
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return `${API_BASE}/proxy/file?url=${encodeURIComponent(url)}`;
        }

        // PDF -> proxy
        if (url.match(/\.pdf$/i)) {
            return `${API_BASE}/proxy/file?url=${encodeURIComponent(url)}`;
        }

        // Word/Excel/PPT có extension -> Google Docs Viewer
        if (url.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i)) {
            let cleanUrl = url;
            if (isCloudinary) {
                cleanUrl = url
                    .replace("/fl_attachment/", "/")
                    .replace("/fl_attachment", "");
            }
            return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
        }

        // Cloudinary raw upload (không có extension) -> Google Docs Viewer
        if (isCloudinary && url.includes("/raw/upload/")) {
            return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        }

        return url;
    };

    // =========================
    // PREVIEW
    // =========================
    const handlePreview = (url: string) => {
        const previewUrl = getPreviewUrl(url);
        window.open(previewUrl, "_blank");
    };

    // =========================
    // DOWNLOAD
    // =========================
    const handleDownload = async (url: string, title: string) => {
        const hide = message.loading("Đang chuẩn bị tệp tin...", 0);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const extension = url.split(".").pop()?.split("?")[0] || "file";
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${title.replace(/[/\\?%*:|"<>]/g, "-")}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            hide();
            message.success("Tải xuống thành công");
        } catch (error) {
            hide();
            window.open(url, "_blank");
        }
    };

    // =========================
    // CARD COVER
    // =========================
    const renderCover = (item: any) => {
        const fileUrl = (item.externalLink || "").toLowerCase();
        const isPDF = fileUrl.endsWith(".pdf");
        const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
        const isWord = fileUrl.match(/\.(doc|docx)$/i) != null;

        const defaultCoverImage =
            "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop";

        const coverStyle: React.CSSProperties = {
            height: 200,
            background: "#f0f2f5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
        };

        // Thumbnail ưu tiên cao nhất
        if (item.thumbnail && item.thumbnail !== "null" && item.thumbnail.trim() !== "") {
            return (
                <div style={coverStyle}>
                    <img src={item.thumbnail} alt="thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
            );
        }

        if (fileUrl) {
            if (isImage) {
                return (
                    <div style={coverStyle}>
                        <img src={item.externalLink} alt="attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", borderRadius: "50%", padding: 6, display: "flex" }}>
                            <FileImageOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                        </div>
                    </div>
                );
            }

            if (isPDF && fileUrl.includes("cloudinary")) {
                const pdfThumb = item.externalLink.replace(/\.pdf$/i, ".jpg");
                return (
                    <div style={coverStyle}>
                        <img
                            src={pdfThumb}
                            alt="PDF Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                            onError={(e) => { (e.target as HTMLImageElement).src = defaultCoverImage; }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.12)" }} />
                        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", borderRadius: "50%", padding: 6, display: "flex" }}>
                            <FilePdfOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
                        </div>
                    </div>
                );
            }

            return (
                <div style={coverStyle}>
                    <img src={defaultCoverImage} alt="default" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
                    <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", borderRadius: "50%", padding: 6, display: "flex" }}>
                        {isWord
                            ? <FileWordOutlined style={{ fontSize: 20, color: "#1677ff" }} />
                            : <FileUnknownOutlined style={{ fontSize: 20, color: "#faad14" }} />
                        }
                    </div>
                </div>
            );
        }

        return (
            <div style={coverStyle}>
                <img src={defaultCoverImage} alt="default" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
            </div>
        );
    };

    return (
        <div style={{ padding: '40px 20px', background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
                    <ArrowLeftOutlined
                        style={{ fontSize: 24, cursor: 'pointer', marginRight: 16, color: '#1890ff' }}
                        onClick={() => navigate(-1)}
                    />
                    <Title level={2} style={{ margin: 0, color: '#1a3353' }}>TẤT CẢ TIN TỨC & THÔNG BÁO</Title>
                </div>

                {/* DANH SÁCH */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
                ) : (
                    <List
                        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        dataSource={posts}
                        pagination={{ pageSize: 9, align: 'center' }}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 12, overflow: 'hidden', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    styles={{ body: { padding: 20 } }}
                                    cover={renderCover(item)}
                                    actions={[
                                        // VIEW
                                        <Tooltip title="Xem tài liệu" key="view">
                                            <EyeOutlined
                                                style={{ fontSize: 18, color: "#1677ff", cursor: "pointer" }}
                                                onClick={() => {
                                                    if (item.externalLink) {
                                                        handlePreview(item.externalLink);
                                                    } else {
                                                        navigate(`/news/${item.id}`);
                                                    }
                                                }}
                                            />
                                        </Tooltip>,

                                        // DOWNLOAD
                                        item.externalLink && (
                                            <Tooltip title="Tải xuống tài liệu" key="download">
                                                <DownloadOutlined
                                                    style={{ color: "#52c41a", fontSize: 18, cursor: "pointer" }}
                                                    onClick={() => handleDownload(item.externalLink, item.title)}
                                                />
                                            </Tooltip>
                                        ),
                                    ]}
                                >
                                    <Tag color={item.type === 'ANNOUNCEMENT' ? 'volcano' : 'blue'} style={{ marginBottom: 12 }}>
                                        {item.type === 'ANNOUNCEMENT' ? 'THÔNG BÁO' : 'TIN TỨC'}
                                    </Tag>
                                    <Card.Meta
                                        title={
                                            <Text strong style={{ fontSize: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.title}
                                            </Text>
                                        }
                                        description={
                                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                                                    {item.content}
                                                </Paragraph>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    <CalendarOutlined /> {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
};

export default NewsListPage;
