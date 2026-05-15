import React from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Button,
  Tooltip,
  Space,
  message,
} from "antd";

import {
  CalendarOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

interface HomeNewsProps {
  posts: any[];
}

const HomeNews: React.FC<HomeNewsProps> = ({ posts }) => {
  const navigate = useNavigate();

  // =========================
  // DOWNLOAD FILE
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
  // PREVIEW URL
  // =========================
  const getPreviewUrl = (url: string) => {
    if (!url) return "";

    const API_BASE = import.meta.env.VITE_API_URL;
    const isCloudinary = url.includes("cloudinary.com");

    // Ảnh có extension -> qua proxy để hiển thị inline
    if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `${API_BASE}/proxy/file?url=${encodeURIComponent(url)}`;
    }

    // PDF có extension -> qua proxy
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
    // vì có thể là Word/Excel/PDF, Viewer hỗ trợ tất cả
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
  // CARD COVER
  // =========================
  const renderCardCover = (item: any) => {
    const thumbnailUrl = item.thumbnail;
    const fileUrl = (item.externalLink || "").toLowerCase();
    const isPDF = fileUrl.endsWith(".pdf");
    const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    const isWord = fileUrl.match(/\.(doc|docx)$/i) != null;

    const coverStyle: React.CSSProperties = {
      height: 220,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      overflow: "hidden",
      background: "#f0f2f5",
    };

    const defaultCoverImage =
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop";

    // THUMBNAIL
    if (thumbnailUrl && thumbnailUrl !== "null" && thumbnailUrl.trim() !== "") {
      return (
        <div style={coverStyle}>
          <img
            src={thumbnailUrl}
            alt="thumbnail"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      );
    }

    if (fileUrl) {
      // IMAGE
      if (isImage) {
        return (
          <div style={coverStyle}>
            <img
              src={item.externalLink}
              alt="attachment"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#fff",
                borderRadius: "50%",
                padding: 6,
                display: "flex",
              }}
            >
              <FileImageOutlined style={{ fontSize: 20, color: "#52c41a" }} />
            </div>
          </div>
        );
      }

      // PDF
      if (isPDF && fileUrl.includes("cloudinary")) {
        const pdfThumb = item.externalLink.replace(/\.pdf$/i, ".jpg");
        return (
          <div style={coverStyle}>
            <img
              src={pdfThumb}
              alt="PDF Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultCoverImage;
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.12)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "#fff",
                borderRadius: "50%",
                padding: 6,
                display: "flex",
              }}
            >
              <FilePdfOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
            </div>
          </div>
        );
      }

      // OTHER FILES
      return (
        <div style={coverStyle}>
          <img
            src={defaultCoverImage}
            alt="default"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              borderRadius: "50%",
              padding: 6,
              display: "flex",
            }}
          >
            {isWord ? (
              <FileWordOutlined style={{ fontSize: 20, color: "#1677ff" }} />
            ) : (
              <FileUnknownOutlined style={{ fontSize: 20, color: "#faad14" }} />
            )}
          </div>
        </div>
      );
    }

    // DEFAULT COVER
    return (
      <div style={coverStyle}>
        <img
          src={defaultCoverImage}
          alt="default"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
          }}
        />
      </div>
    );
  };

  return (
    <div style={{ padding: "80px 0", background: "#f8f9fa" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Title level={2} style={{ margin: 0, color: "#1a3353" }}>
            CHIA SẺ KINH NGHIỆM
          </Title>

          <Button
            type="primary"
            ghost
            icon={<ArrowRightOutlined />}
            onClick={() => navigate("/news")}
          >
            Xem tất cả
          </Button>
        </div>

        {/* LIST */}
        <Row gutter={[24, 24]}>
          {posts.map((item: any) => (
            <Col xs={24} sm={12} md={8} key={item.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  height: "100%",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                }}
                styles={{ body: { padding: 20 } }}
                cover={renderCardCover(item)}
                actions={[
                  // VIEW
                  <Tooltip title="Xem tài liệu" key="view">
                    <EyeOutlined
                      style={{
                        fontSize: 18,
                        color: "#1677ff",
                        cursor: "pointer",
                      }}
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
                        style={{
                          color: "#52c41a",
                          fontSize: 18,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleDownload(item.externalLink, item.title)
                        }
                      />
                    </Tooltip>
                  ),
                ]}
              >
                {/* TAG */}
                <Tag
                  color={item.type === "ANNOUNCEMENT" ? "volcano" : "blue"}
                  style={{ marginBottom: 12 }}
                >
                  {item.type === "ANNOUNCEMENT" ? "THÔNG BÁO" : "TIN TỨC"}
                </Tag>

                {/* META */}
                <Card.Meta
                  title={
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 48,
                      }}
                    >
                      {item.title}
                    </Text>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: 8 }}
                      >
                        {item.content || "Xem chi tiết..."}
                      </Paragraph>

                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined />{" "}
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </Text>
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
