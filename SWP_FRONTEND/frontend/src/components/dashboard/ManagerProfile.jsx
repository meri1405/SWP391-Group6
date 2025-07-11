import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Avatar,
  Spin,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import managerApi from "../../api/managerApi";
import "../../styles/ProfileSection.css";

const { Title, Text } = Typography;

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerProfile();
  }, []);

  const fetchManagerProfile = async () => {
    setLoading(true);
    try {
      const data = await managerApi.getManagerProfile();
      setProfile(data);
      console.log(data);
    } catch (error) {
      message.error("Không thể tải thông tin hồ sơ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert Java LocalDateTime array to JavaScript Date
  const convertJavaDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) {
      return null;
    }
    
    try {
      // Java array format: [year, month, day, hour, minute, second, nanosecond]
      // Note: Java month is 1-based, JavaScript month is 0-based
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
      return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error("Error converting date array:", dateArray, error);
      return null;
    }
  };

  // Helper function to convert Java LocalDate array to JavaScript Date
  const convertJavaLocalDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) {
      return null;
    }
    
    try {
      // Java LocalDate array format: [year, month, day]
      // Note: Java month is 1-based, JavaScript month is 0-based
      const [year, month, day] = dateArray;
      return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error("Error converting date array:", dateArray, error);
      return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Text type="secondary">Không thể tải thông tin hồ sơ</Text>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
            styles={{ body: { padding: 32 } }}
          >
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                backgroundColor: "#ff6b35",
                marginBottom: 16,
              }}
            />
            <Title level={3} style={{ margin: "16px 0 8px 0", color: "#333" }}>
              {profile.fullName}
            </Title>
            <Tag
              color="orange"
              style={{
                fontSize: 14,
                padding: "4px 12px",
                borderRadius: 20,
                marginBottom: 16,
              }}
            >
              {profile.roleName === "MANAGER" ? "Quản lý" : profile.roleName}
            </Tag>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserOutlined style={{ color: "#ff6b35" }} />
                <span>Thông tin cá nhân</span>
              </div>
            }
            style={{
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{
                fontWeight: 600,
                color: "#555",
                width: "140px",
              }}
              contentStyle={{
                color: "#333",
              }}
            >
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Tên đăng nhập
                  </span>
                }
              >
                {profile.username}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Họ
                  </span>
                }
              >
                {profile.lastName}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Tên
                  </span>
                }
              >
                {profile.firstName}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Ngày sinh
                  </span>
                }
              >
                {convertJavaLocalDateArray(profile.dob)?.format("DD/MM/YYYY") || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Giới tính
                  </span>
                }
              >
                {profile.gender === "M" ? "Nam" : "Nữ"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Số điện thoại
                  </span>
                }
              >
                {profile.phone || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Email
                  </span>
                }
                span={2}
              >
                {profile.email || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <HomeOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Địa chỉ
                  </span>
                }
                span={2}
              >
                {profile.address}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <TeamOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Chức vụ
                  </span>
                }
              >
                {profile.jobTitle}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    <ClockCircleOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
                    Trạng thái
                  </span>
                }
              >
                <Tag color={profile.enabled ? "green" : "red"}>
                  {profile.enabled ? "Hoạt động" : "Bị khóa"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5} style={{ color: "#555", marginBottom: 16 }}>
              <ClockCircleOutlined style={{ marginRight: 8, color: "#ff6b35" }} />
              Thông tin hệ thống
            </Title>

            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{
                fontWeight: 600,
                color: "#555",
                width: "140px",
              }}
              contentStyle={{
                color: "#333",
              }}
            >
              <Descriptions.Item label="Ngày tạo tài khoản">
                {convertJavaDateArray(profile.createdDate)?.format("HH:mm DD/MM/YYYY") || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {convertJavaDateArray(profile.lastModifiedDate)?.format("HH:mm DD/MM/YYYY") || "Chưa cập nhật"}
              </Descriptions.Item>

              <Descriptions.Item label="Lần đầu đăng nhập">
                <Tag color={profile.firstLogin ? "orange" : "green"}>
                  {profile.firstLogin ? "Chưa đổi mật khẩu" : "Đã hoàn thành"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerProfile;
