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
          (post: any) => post.type === "BLOG" && post.isPublished !== false,
        );

        const sortedPosts = experiencePosts.sort(
          (a: any, b: any) =>
            dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix(),
        );

        setBlogs(sortedPosts);
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const getDownloadUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
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
        <Paragraph style={{ maxWidth: 600, margin: "0 auto", fontSize: 16 }}>
          Những kinh nghiệm thực tiễn giúp sinh viên hình thành góc nhìn toàn
          diện và định hướng rõ ràng trong quá trình nghiên cứu khoa học.
        </Paragraph>
      </div>

      {/* LIST */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        {blogs.length === 0 ? (
          <Empty description="Chưa có bài viết" />
        ) : (
          <Row gutter={[24, 24]}>
            {blogs.map((item: any) => (
              <Col xs={24} md={12} key={item.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s",
                  }}
                  bodyStyle={{
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                  cover={
                    <img
                      src={item.thumbnail}
                      style={{
                        height: 200,
                        objectFit: "cover",
                      }}
                      onClick={() => navigate(`/post/${item.id}`)}
                    />
                  }
                  actions={[
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      href={getDownloadUrl(item.externalLink)}
                      disabled={!item.externalLink}
                    >
                      Tải
                    </Button>,
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() =>
                        item.externalLink
                          ? window.open(item.externalLink)
                          : navigate(`/post/${item.id}`)
                      }
                    >
                      Xem
                    </Button>,
                  ]}
                >
                  <Tag color="purple" style={{ width: "fit-content" }}>
                    Kinh nghiệm
                  </Tag>

                  <Title
                    level={4}
                    style={{
                      marginTop: 10,
                      marginBottom: 10,
                      height: 56,
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </Title>

                  <Paragraph
                    type="secondary"
                    style={{
                      flex: 1,
                      marginBottom: 20,
                      height: 66,
                      overflow: "hidden",
                    }}
                  >
                    {item.content || "Xem chi tiết bài viết..."}
                  </Paragraph>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      borderTop: "1px solid #eee",
                      paddingTop: 10,
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
