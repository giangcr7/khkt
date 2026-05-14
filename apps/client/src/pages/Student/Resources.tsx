import React, { useEffect, useState } from "react";
import {
  List,
  Card,
  Button,
  Tabs,
  message,
  Typography,
  Tooltip,
  Empty,
} from "antd";

import {
  DownloadOutlined,
  FileWordOutlined,
  EyeOutlined,
  FileTextOutlined,
  BookOutlined,
  FormOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

import api from "../../services/api";

const { Title, Text } = Typography;

const ResourcesPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await api.get("/resources");
        setData(res.data);
      } catch (error) {
        message.error("Không thể tải tài liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =========================
  // OPTIMIZE CLOUDINARY
  // =========================
  const optimizeImage = (url: string) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    return url.replace(
      "/upload/",
      "/upload/w_400,h_250,c_fill,q_auto,f_auto/"
    );
  };

  // =========================
  // DOWNLOAD URL
  // =========================
  const getDownloadUrl = (url: string) => {
    if (!url) return "";

    if (url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }

    return url;
  };

  // =========================
  // RENDER COVER
  // =========================
  const renderCardCover = (item: any) => {
    const url = item.fileUrl || "";
    const isPDF = url.toLowerCase().endsWith(".pdf");

    const coverStyle: React.CSSProperties = {
      height: "180px",
      borderRadius: "16px 16px 0 0",
      overflow: "hidden",
      background: "#f5f5f5",
    };

    if (isPDF) {
      const thumbnailUrl = url.replace(/\.pdf$/i, ".jpg");

      return (
        <div style={coverStyle}>
          <img
            src={optimizeImage(thumbnailUrl)}
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            onError={(e) => {
              (e.target as any).src =
                "https://placehold.co/400x500/1890ff/ffffff?text=Document";
            }}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          ...coverStyle,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #91d5ff, #40a9ff)",
        }}
      >
        <FileWordOutlined style={{ fontSize: 48, color: "#fff" }} />
      </div>
    );
  };

  // =========================
  // RENDER LIST
  // =========================
  const renderResourceList = (type: string) => (
    <List
      grid={{
        gutter: 20,
        xs: 1,
        sm: 2,
        md: 2,
        lg: 2,
      }}
      dataSource={data.filter((d: any) => d.type === type)}
      loading={loading}
      locale={{
        emptyText: (
          <Empty description={`Chưa có ${type.toLowerCase()} nào`} />
        ),
      }}
      renderItem={(item: any) => (
        <List.Item>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.3s",
            }}
            bodyStyle={{ flex: 1 }}
            cover={renderCardCover(item)}
            actions={[
              <Button
                type="link"
                icon={<DownloadOutlined />}
                href={getDownloadUrl(item.fileUrl)}
                download
              >
                Tải
              </Button>,

              <Button
                type="text"
                icon={<EyeOutlined />}
                href={item.fileUrl}
                target="_blank"
              >
                Xem
              </Button>,
            ]}
            onMouseEnter={(e) => {
              (e.currentTarget as any).style.transform =
                "translateY(-5px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as any).style.transform =
                "translateY(0)";
            }}
          >
            <Card.Meta
              title={
                <Tooltip title={item.title}>
                  <Text strong style={{ fontSize: 14 }} ellipsis>
                    {item.title}
                  </Text>
                </Tooltip>
              }
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  📅{" "}
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          marginBottom: 32,
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: 16,
        }}
      >
        <Title level={2}>
          <FileTextOutlined /> Kho Tài liệu
        </Title>
      </div>

      <Tabs
        type="card"
        defaultActiveKey="REFERENCE"
        items={[
          {
            key: "REFERENCE",

            label: (
              <span>
                <BookOutlined /> Tài liệu tham khảo
              </span>
            ),

            children: renderResourceList("REFERENCE"),
          },

          {
            key: "TEMPLATE",

            label: (
              <span>
                <FormOutlined /> Mẫu biểu
              </span>
            ),

            children: renderResourceList("TEMPLATE"),
          },

          {
            key: "GUIDE",

            label: (
              <span>
                <SafetyCertificateOutlined /> Quy định & hướng dẫn 
              </span>
            ),

            children: renderResourceList("GUIDE"),
          },

          {
            key: "STATISTICS",

            label: (
              <span>
                <BarChartOutlined /> Phân tích thống kê
              </span>
            ),

            children: renderResourceList("STATISTICS"),
          },
        ]}
      />
    </div>
  );
};

export default ResourcesPage;