import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  Spin,
  message,
  Tag,
  Row,
  Col,
  Empty,
  Button,
  Tooltip,
  Space,
} from "antd";
import {
  BulbOutlined,
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import api from "../services/api";

const { Title, Paragraph, Text } = Typography;

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);

      try {
        const res = await api.get("/posts");

        const allPosts = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        const experiencePosts = allPosts.filter(
          (post: any) => post.type === "BLOG" && post.isPublished !== false,
        );

        const sortedPosts = experiencePosts.sort(
          (a: any, b: any) =>
            dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
        );

        setBlogs(sortedPosts);
      } catch (error) {
        console.error(error);
        message.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // =========================
  // DOWNLOAD FILE LOGIC
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
      // Nếu không tải ngầm được thì mở sang tab mới cho trình duyệt tự tải
      const downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
      window.open(downloadUrl, "_blank");
    }
  };

  // =========================
  // PREVIEW URL LOGIC
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
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        cleanUrl,
      )}&embedded=true`;
    }

    // Cloudinary raw upload (không có extension) -> Google Docs Viewer
    if (isCloudinary && url.includes("/raw/upload/")) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        url,
      )}&embedded=true`;
    }

    return url;
  };

  // =========================
  // CARD COVER RENDERER
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
      cursor: "pointer",
    };

    const defaultCoverImage =
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=800&auto=format&fit=crop";

    // THUMBNAIL TỰ NHẬP
    if (thumbnailUrl && thumbnailUrl !== "null" && thumbnailUrl.trim() !== "") {
      return (
        <div style={coverStyle} onClick={() => navigate(`/post/${item.id}`)}>
          <img
            src={thumbnailUrl}
            alt="thumbnail"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      );
    }

    if (fileUrl) {
      // NẾU FILE LÀ IMAGE
      if (isImage) {
        return (
          <div style={coverStyle} onClick={() => navigate(`/post/${item.id}`)}>
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

      // NẾU FILE LÀ PDF -> CHUYỂN THÀNH JPG ĐỂ LÀM ẢNH BÌA
      if (isPDF && fileUrl.includes("cloudinary")) {
        const pdfThumb = item.externalLink.replace(/\.pdf$/i, ".jpg");
        return (
          <div style={coverStyle} onClick={() => navigate(`/post/${item.id}`)}>
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
        <div style={coverStyle} onClick={() => navigate(`/post/${item.id}`)}>
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

    // DEFAULT
    return (
      <div style={coverStyle} onClick={() => navigate(`/post/${item.id}`)}>
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{ background: "#f5f7fa", minHeight: "100vh", paddingBottom: 60 }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <Title level={1} style={{ color: "#1677ff", fontWeight: 700 }}>
          <BulbOutlined /> Góc Kinh Nghiệm
        </Title>

        <Paragraph
          style={{
            maxWidth: 650,
            margin: "0 auto",
            fontSize: 16,
            color: "#555",
          }}
        >
          Những kinh nghiệm thực tiễn giúp sinh viên hình thành góc nhìn toàn
          diện và định hướng rõ ràng trong quá trình nghiên cứu khoa học.
        </Paragraph>
      </div>

      {/* BLOG LIST */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        {blogs.length === 0 ? (
          <Empty description="Chưa có bài viết" />
        ) : (
          <Row gutter={[24, 24]}>
            {blogs.map((item: any) => (
              <Col xs={24} sm={24} md={12} key={item.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease",
                  }}
                  styles={{
                    body: {
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    },
                  }}
                  cover={renderCardCover(item)}
                  actions={[
                    // BUTTON XEM
                    <Tooltip title="Xem tài liệu" key="view">
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          if (item.externalLink) {
                            window.open(
                              getPreviewUrl(item.externalLink),
                              "_blank",
                            );
                          } else {
                            navigate(`/post/${item.id}`);
                          }
                        }}
                      >
                        Xem
                      </Button>
                    </Tooltip>,

                    // BUTTON TẢI (chỉ hiện nếu có link)
                    item.externalLink ? (
                      <Tooltip title="Tải xuống tài liệu" key="download">
                        <Button
                          type="link"
                          icon={
                            <DownloadOutlined style={{ color: "#52c41a" }} />
                          }
                          onClick={() =>
                            handleDownload(item.externalLink, item.title)
                          }
                        >
                          Tải
                        </Button>
                      </Tooltip>
                    ) : (
                      // Nếu không có link, render một element trống hoặc disabled button để giữ form của Card.actions
                      <Button type="link" disabled icon={<DownloadOutlined />}>
                        Tải
                      </Button>
                    ),
                  ]}
                >
                  {/* TAG */}
                  <Tag
                    color="purple"
                    style={{
                      width: "fit-content",
                      borderRadius: 20,
                      padding: "2px 10px",
                      marginBottom: 12,
                    }}
                  >
                    Kinh nghiệm
                  </Tag>

                  {/* TITLE */}
                  <Title
                    level={4}
                    style={{ marginBottom: 12, lineHeight: 1.4, minHeight: 56 }}
                  >
                    {item.title}
                  </Title>

                  {/* DESCRIPTION */}
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{ color: "#666", flex: 1, marginBottom: 20 }}
                  >
                    {item.content || "Xem chi tiết bài viết..."}
                  </Paragraph>

                  {/* FOOTER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: 12,
                      marginTop: "auto",
                      fontSize: 13,
                    }}
                  >
                    <Text type="secondary">
                      <UserOutlined /> {item.author?.fullName || "Admin"}
                    </Text>

                    <Text type="secondary">
                      <CalendarOutlined />{" "}
                      {dayjs(item.createdAt).format("DD/MM/YYYY")}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
