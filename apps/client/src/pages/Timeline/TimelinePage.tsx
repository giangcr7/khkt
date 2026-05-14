import React, { useEffect, useState } from "react";
import {
  Timeline,
  Typography,
  Card,
  Button,
  Empty,
  Spin,
  Badge,
} from "antd";

import {
  ClockCircleOutlined,
  DownloadOutlined,
  StarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

import api from "../../services/api";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;

const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      try {
        const res = await api.get("/events");

        const eventData = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setEvents(eventData);
      } catch (err) {
        console.error("Lỗi khi tải lộ trình:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Xác định trạng thái sự kiện
  const getEventStatus = (
    startDate: string,
    endDate?: string
  ) => {
    const now = dayjs();

    const start = dayjs(startDate);

    const end = endDate
      ? dayjs(endDate)
      : start.endOf("day");

    if (now.isAfter(end)) {
      return "PAST";
    }

    if (now.isBetween(start, end, "day", "[]")) {
      return "CURRENT";
    }

    return "FUTURE";
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        background: "#f5f7fa",
        minHeight: "100vh",
        marginTop: "64px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
            }}
          >
            <Spin
              size="large"
              tip="Đang đồng bộ lộ trình..."
            />
          </div>
        ) : events.length > 0 ? (
          <Card
            style={{
              borderRadius: "16px",
              border: "none",
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.03)",
              padding: "20px 0",
            }}
          >
            <Timeline mode="alternate">
              {events.map((ev: any) => {
                const status = getEventStatus(
                  ev.startDate,
                  ev.endDate
                );

                const isPast = status === "PAST";

                const isCurrent =
                  status === "CURRENT";

                // Dot mặc định
                let dotIcon = (
                  <ClockCircleOutlined
                    style={{ fontSize: "16px" }}
                  />
                );

                let dotColor = "blue";

                // Đã hoàn thành
                if (isPast) {
                  dotIcon = (
                    <CheckCircleOutlined
                      style={{ fontSize: "18px" }}
                    />
                  );

                  dotColor = "green";
                }

                // Đang diễn ra
                else if (isCurrent) {
                  dotIcon = (
                    <PlayCircleOutlined
                      style={{ fontSize: "20px" }}
                    />
                  );

                  dotColor = "#faad14";
                }

                // Quan trọng
                else if (ev.isImportant) {
                  dotIcon = (
                    <StarOutlined
                      style={{ fontSize: "18px" }}
                    />
                  );

                  dotColor = "red";
                }

                // Format ngày
                const startDateFormatted =
                  dayjs(ev.startDate).format(
                    "DD/MM/YYYY"
                  );

                const endDateFormatted = ev.endDate
                  ? dayjs(ev.endDate).format(
                      "DD/MM/YYYY"
                    )
                  : null;

                const sameDate =
                  startDateFormatted ===
                  endDateFormatted;

                return (
                  <Timeline.Item
                    key={ev.id}
                    color={dotColor}
                    dot={dotIcon}
                  >
                    <Badge.Ribbon
                      text={
                        isCurrent
                          ? "Đang diễn ra"
                          : ev.isImportant &&
                              !isPast
                            ? "Quan trọng"
                            : ""
                      }
                      color={
                        isCurrent
                          ? "#faad14"
                          : "red"
                      }
                      style={{
                        display:
                          isCurrent ||
                          (ev.isImportant &&
                            !isPast)
                            ? "block"
                            : "none",
                      }}
                    >
                      <Card
                        size="small"
                        hoverable={!isPast}
                        style={{
                          borderRadius: "14px",

                          border: isCurrent
                            ? "2px solid #faad14"
                            : "1px solid #f0f0f0",

                          background: isPast
                            ? "#fafafa"
                            : "#fff",

                          opacity: isPast
                            ? 0.9
                            : 1,

                          transition:
                            "all 0.3s ease",
                        }}
                      >
                        {/* Title */}
                        <Title
                          level={5}
                          style={{
                            margin: "0 0 10px 0",

                            color: isPast
                              ? "#434343"
                              : "#262626",

                            fontWeight: isPast
                              ? 700
                              : 600,

                            opacity: isPast
                              ? 0.9
                              : 1,
                          }}
                        >
                          {ev.title}
                        </Title>

                        {/* Date */}
                        <Text
                          type="secondary"
                          style={{
                            display: "block",

                            marginBottom: "12px",

                            fontWeight: isPast
                              ? 700
                              : 500,

                            color: isPast
                              ? "#595959"
                              : undefined,
                          }}
                        >
                          <CalendarOutlined
                            style={{
                              marginRight: "6px",
                            }}
                          />

                          {startDateFormatted}

                          {/* Chỉ hiện ngày kết thúc nếu khác ngày bắt đầu */}
                          {ev.endDate &&
                            !sameDate &&
                            ` - ${endDateFormatted}`}
                        </Text>

                        {/* Description */}
                        <Paragraph
                          style={{
                            marginBottom: "16px",

                            color: "#595959",

                            fontWeight: isPast
                              ? 500
                              : 400,

                            opacity: isPast
                              ? 0.9
                              : 1,

                            lineHeight: 1.7,
                          }}
                        >
                          {ev.description}
                        </Paragraph>

                        {/* File */}
                        {ev.fileUrl && !isPast && (
                          <Button
                            type="dashed"
                            size="small"
                            icon={
                              <DownloadOutlined />
                            }
                            href={`http://localhost:3000${ev.fileUrl}`}
                            target="_blank"
                          >
                            Tải tài liệu đính kèm
                          </Button>
                        )}
                      </Card>
                    </Badge.Ribbon>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>
        ) : (
          <Empty
            image={
              Empty.PRESENTED_IMAGE_SIMPLE
            }
            description="Hiện chưa có thông báo về lộ trình mới trong năm học này."
          />
        )}
      </div>
    </div>
  );
};

export default TimelinePage;