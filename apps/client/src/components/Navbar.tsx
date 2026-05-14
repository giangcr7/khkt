import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Space,
  Typography,
  Dropdown,
  Tag,
  Avatar,
  Badge,
} from "antd";
import {
  HomeOutlined,
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  ReadOutlined,
  ProjectOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  BellOutlined,
  BulbOutlined,
  CalculatorOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const { Header } = Layout;
const { Title, Text } = Typography;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState<string | null>(localStorage.getItem("role"));
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem("user") || "{}"),
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotis = async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await api.get("/notifications/my");
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Lỗi tải thông báo Navbar");
    }
  };

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    if (localStorage.getItem("token")) {
      fetchUnreadNotis();
    }
    window.addEventListener("notificationRead", fetchUnreadNotis);
    return () => {
      window.removeEventListener("notificationRead", fetchUnreadNotis);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setUser({});
    setUnreadCount(0);
    navigate("/");
    window.location.reload();
  };

  const getNavItems = () => {
    const items: any[] = [
      {
        key: "/",
        label: "Trang chủ",
        icon: <HomeOutlined />,
        onClick: () => navigate("/"),
      },
      {
        key: "/timeline",
        label: "Lộ trình",
        icon: <CalendarOutlined />,
        onClick: () => navigate("/timeline"),
      },
      {
        key: "/resources",
        label: "Tài liệu",
        icon: <ReadOutlined />,
        onClick: () => navigate("/resources"),
      },
      {
        key: "/kinh-nghiem",
        label: "Kinh nghiệm",
        icon: <BulbOutlined />,
        onClick: () => navigate("/kinh-nghiem"),
      },
      {
        key: "/thong-ke",
        label: "Thống kê",
        icon: <CalculatorOutlined />,
        onClick: () => navigate("/thong-ke"),
      },
      {
        key: "/phan-tich-hoi-quy",
        label: "Hồi quy",
        icon: <LineChartOutlined />,
        onClick: () => navigate("/phan-tich-hoi-quy"),
      },
      {
        key: "/faq",
        label: "Hỏi đáp",
        icon: <QuestionCircleOutlined />,
        onClick: () => navigate("/faq"),
      },
    ];

    const currentRole = role?.toUpperCase();
    if (currentRole === "STUDENT") {
      items.push({
        key: "/student/my-project",
        label: "Đề tài của tôi",
        icon: <ProjectOutlined />,
        onClick: () => navigate("/student/my-project"),
      });
      items.push({
        key: "/student/notifications",
        label: "Thông báo",
        icon: <BellOutlined />,
        onClick: () => navigate("/student/notifications"),
      });
    } else if (currentRole === "LECTURER") {
      items.push({
        key: "/lecturer/manage-projects",
        label: "Quản lý hướng dẫn",
        icon: <ProjectOutlined />,
        onClick: () => navigate("/lecturer/manage-projects"),
      });
    } else if (currentRole === "ADMIN") {
      items.push({
        key: "/admin/user-management",
        label: "Quản trị hệ thống",
        icon: <TeamOutlined />,
        onClick: () => navigate("/admin/user-management"),
      });
    }

    return items;
  };

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#001529",
        padding: "0 24px",
        height: "64px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
        onClick={() => navigate("/")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="https://res.cloudinary.com/dth3letd8/image/upload/w_80,h_80,c_fill,q_auto,f_auto/v1774770913/z7669734280250_65dcbb05cbcc772483378c29928bf6b4_xlx5hp.jpg"
            alt="logo"
            style={{
              width: 42,
              height: 42,
              objectFit: "cover",
              borderRadius: "50%",
              background: "#fff",
              padding: 3,
              marginRight: 12,
              border: "2px solid #1890ff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />

          <Title
            level={4}
            style={{
              color: "#fff",
              margin: 0,
              whiteSpace: "nowrap",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            NCKH TLS
          </Title>
        </div>
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={getNavItems()}
        style={{ flex: 1, minWidth: 0, marginLeft: "20px", border: "none" }}
      />

      <div
        style={{
          flexShrink: 0,
          marginLeft: "10px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {role && (
          <div
            style={{ marginRight: "20px", cursor: "pointer" }}
            onClick={() =>
              navigate(
                role.toLowerCase() === "student"
                  ? "/student/notifications"
                  : "#",
              )
            }
          >
            <Badge count={unreadCount} overflowCount={99} size="small">
              <BellOutlined style={{ color: "#fff", fontSize: "20px" }} />
            </Badge>
          </div>
        )}

        {!role ? (
          <Button
            type="primary"
            shape="round"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </Button>
        ) : (
          <Dropdown
            placement="bottomRight"
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "dash",
                  label: "Bảng điều khiển (Dashboard)",
                  icon: <DashboardOutlined />,
                  onClick: () => {
                    const r = role.toLowerCase();
                    if (r === "admin") navigate("/admin");
                    else if (r === "lecturer") navigate("/lecturer");
                    else navigate("/student");
                  },
                },
                { type: "divider" },
                {
                  key: "logout",
                  label: "Đăng xuất tài khoản",
                  icon: <LogoutOutlined />,
                  danger: true,
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Space style={{ cursor: "pointer", padding: "0 8px" }}>
              <div style={{ textAlign: "right", lineHeight: "1.2" }}>
                <Text
                  strong
                  style={{
                    color: "#fff",
                    display: "block",
                    maxWidth: "120px",
                  }}
                  ellipsis
                >
                  {user.fullName || "Người dùng"}
                </Text>
                <Tag
                  color="blue"
                  style={{
                    fontSize: "10px",
                    margin: 0,
                    border: "none",
                    lineHeight: "1.6",
                  }}
                >
                  {role === "ADMIN"
                    ? "Quản trị viên"
                    : role === "LECTURER"
                      ? "Giảng viên"
                      : "Sinh viên"}
                </Tag>
              </div>
              <Avatar
                src={user.avatar}
                icon={<UserOutlined />}
                style={{
                  border: "2px solid #1890ff",
                  backgroundColor: "#87d068",
                }}
              />
            </Space>
          </Dropdown>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
