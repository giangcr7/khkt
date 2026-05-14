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
} from "antd";
import {
  BulbOutlined,
  CalendarOutlined,
  UserOutlined,
  DownloadOutlined,
  EyeOutlined,
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
          (post: any) =>
            post.type === "BLOG" &&
            post.isPublished !== false
        );

        const sortedPosts = experiencePosts.sort(
          (a: any, b: any) =>
            dayjs(b.createdAt).unix() -
            dayjs(a.createdAt).unix()
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

  // URL download riêng
  const getDownloadUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("cloudinary.com")) {
      // Xóa fl_inline nếu có trước, rồi thêm fl_attachment
      let downloadUrl = url
        .replace("/fl_inline/", "/")
        .replace("/fl_inline", "");

      return downloadUrl.replace(
        "/upload/",
        "/upload/fl_attachment/"
      );
    }

    return url;
  };

  // URL preview riêng
  const getPreviewUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("cloudinary.com")) {
      // Xóa fl_attachment nếu có
      let previewUrl = url
        .replace("/fl_attachment/", "/")
        .replace("/fl_attachment", "");

      // Thêm fl_inline cho PDF để hiển thị trong tab thay vì tải về
      if (previewUrl.match(/\.pdf(\?.*)?$/i)) {
        previewUrl = previewUrl.replace(
          "/upload/",
          "/upload/fl_inline/"
        );
      }

      return previewUrl;
    }

    return url;
  };

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 100,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#f5f7fa",
        minHeight: "100vh",
        paddingBottom: 60,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          textAlign: "center",
          padding: "50px 20px",
        }}
      >
        <Title
          level={1}
          style={{
            color: "#1677ff",
            fontWeight: 700,
          }}
        >
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
          Những kinh nghiệm thực tiễn giúp sinh viên
          hình thành góc nhìn toàn diện và định hướng
          rõ ràng trong quá trình nghiên cứu khoa học.
        </Paragraph>
      </div>

      {/* BLOG LIST */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
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
                    boxShadow:
                      "0 6px 18px rgba(0,0,0,0.06)",
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
                  cover={
                    <div
                      style={{
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        navigate(`/post/${item.id}`)
                      }
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: 220,
                          objectFit: "cover",
                          transition: "0.3s",
                        }}
                      />
                    </div>
                  }
                  actions={[
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      href={getDownloadUrl(
                        item.externalLink
                      )}
                      target="_blank"
                      disabled={!item.externalLink}
                    >
                      Tải
                    </Button>,

                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      disabled={!item.externalLink}
                      onClick={() => {
                        if (item.externalLink) {
                          window.open(
                            getPreviewUrl(
                              item.externalLink
                            ),
                            "_blank"
                          );
                        } else {
                          navigate(`/post/${item.id}`);
                        }
                      }}
                    >
                      Xem
                    </Button>,
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
                    style={{
                      marginBottom: 12,
                      lineHeight: 1.4,
                      minHeight: 60,
                    }}
                  >
                    {item.title}
                  </Title>

                  {/* DESCRIPTION */}
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{
                      color: "#666",
                      flex: 1,
                      marginBottom: 20,
                    }}
                  >
                    {item.content ||
                      "Xem chi tiết bài viết..."}
                  </Paragraph>

                  {/* FOOTER */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      borderTop:
                        "1px solid #f0f0f0",
                      paddingTop: 12,
                      marginTop: "auto",
                      fontSize: 13,
                    }}
                  >
                    <Text type="secondary">
                      <UserOutlined />{" "}
                      {item.author?.fullName ||
                        "Admin"}
                    </Text>

                    <Text type="secondary">
                      <CalendarOutlined />{" "}
                      {dayjs(
                        item.createdAt
                      ).format("DD/MM/YYYY")}
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
