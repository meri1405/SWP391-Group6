import React, { useState } from "react";
import {
  Modal,
  Button,
  Descriptions,
  Tag,
  Alert,
  Input,
  Typography,
  Spin,
  message,
  Dropdown,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const HealthCheckFormModal = ({
  isOpen,
  healthCheckForm,
  onClose,
  onFormUpdated,
  loading,
}) => {
  const [parentNote, setParentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "warning", text: "Chờ phản hồi" },
      CONFIRMED: { color: "success", text: "Đã đồng ý" },
      DECLINED: { color: "error", text: "Từ chối" },
      SCHEDULED: { color: "processing", text: "Đã lên lịch" },
      CHECKED_IN: { color: "cyan", text: "Đã check-in" },
      COMPLETED: { color: "default", text: "Hoàn thành" },
    };
    return (
      <Tag color={statusMap[status]?.color || "default"}>
        {statusMap[status]?.text || status}
      </Tag>
    );
  };

  const handleResponse = async (type) => {
    if (!healthCheckForm?.id) {
      message.warning(
        "Không thể thực hiện hành động này. Vui lòng thử lại sau."
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      if (type === "confirm") {
        await parentApi.confirmHealthCheckForm(
          healthCheckForm.id,
          parentNote,
          token
        );
        message.success("Đã xác nhận đồng ý cho con tham gia khám sức khỏe");
      } else {
        await parentApi.declineHealthCheckForm(
          healthCheckForm.id,
          parentNote,
          token
        );
        message.success("Đã gửi phản hồi từ chối tham gia khám sức khỏe");
      }

      onFormUpdated();
    } catch (error) {
      console.error("Error responding to health check form:", error);
      message.error("Lỗi khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const showResponseConfirm = (type) => {
    Modal.confirm({
      title:
        type === "confirm"
          ? "Xác nhận tham gia khám sức khỏe"
          : "Từ chối tham gia khám sức khỏe",
      content: (
        <div>
          <Alert
            message={
              type === "confirm" ? "Xác nhận đồng ý" : "Xác nhận từ chối"
            }
            description={
              type === "confirm"
                ? `Bạn đang xác nhận đồng ý cho ${
                    healthCheckForm.student?.fullName || "con bạn"
                  } tham gia đợt khám sức khỏe "${
                    healthCheckForm.campaign?.name || ""
                  }".`
                : `Bạn đang từ chối cho ${
                    healthCheckForm.student?.fullName || "con bạn"
                  } tham gia đợt khám sức khỏe "${
                    healthCheckForm.campaign?.name || ""
                  }".`
            }
            type={type === "confirm" ? "success" : "warning"}
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ marginBottom: 8 }}>
            <Text strong>Ghi chú (tuỳ chọn):</Text>
          </div>
          <TextArea
            placeholder={
              type === "confirm"
                ? "Nhập ghi chú nếu có (ví dụ: thời gian phù hợp, yêu cầu đặc biệt...)"
                : "Nhập lý do từ chối (ví dụ: con đang ốm, có lịch trình khác...)"
            }
            value={parentNote}
            onChange={(e) => setParentNote(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>
      ),
      okText: type === "confirm" ? "Đồng ý" : "Từ chối",
      cancelText: "Hủy",
      confirmLoading: submitting,
      onOk: () => handleResponse(type),
      width: 600,
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MedicineBoxOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết thông báo khám sức khỏe</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={[
        healthCheckForm?.status === "PENDING" && healthCheckForm?.id && (
          <Dropdown
            key="response-dropdown"
            menu={{
              items: [
                {
                  key: "confirm",
                  label: "Đồng ý tham gia",
                  icon: <CheckCircleOutlined />,
                  onClick: () => showResponseConfirm("confirm"),
                },
                {
                  key: "decline",
                  label: "Từ chối tham gia",
                  icon: <CloseCircleOutlined />,
                  onClick: () => showResponseConfirm("decline"),
                  danger: true,
                },
              ],
            }}
            placement="topLeft"
          >
            <Button
              type="primary"
              loading={submitting}
              icon={<ExclamationCircleOutlined />}
            >
              Phản hồi <DownOutlined />
            </Button>
          </Dropdown>
        ),
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 12 }}>
            <Text type="secondary">Đang tải thông tin...</Text>
          </div>
        </div>
      ) : (
        healthCheckForm && (
          <div>
            <Alert
              message="Thông báo từ y tá trường"
              description={`Nhà trường đã tổ chức đợt khám sức khỏe cho học sinh ${
                healthCheckForm.student?.fullName || "N/A"
              }. Vui lòng xem xét thông tin chi tiết bên dưới và đưa ra quyết định phù hợp.`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Tên đợt khám
                  </>
                }
              >
                <Text strong style={{ fontSize: 16 }}>
                  {healthCheckForm.campaign?.name || "Đợt khám sức khỏe"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Thông tin từ y tá
                  </>
                }
              >
                <Paragraph style={{ margin: 0 }}>
                  {healthCheckForm.campaign?.description ||
                    "Trường đang tổ chức đợt khám sức khỏe cho học sinh. Vui lòng xác nhận đồng ý hoặc từ chối khám cho con em mình."}
                </Paragraph>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserOutlined style={{ marginRight: 4 }} />
                    Học sinh
                  </>
                }
              >
                <Text strong>{healthCheckForm.student?.fullName || "N/A"}</Text>
                {healthCheckForm.student?.className && (
                  <Text type="secondary">
                    {" "}
                    - Lớp {healthCheckForm.student.className}
                  </Text>
                )}
              </Descriptions.Item>

              {healthCheckForm.campaign?.startDate &&
                healthCheckForm.campaign?.endDate && (
                  <Descriptions.Item
                    label={
                      <>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Thời gian thực hiện
                      </>
                    }
                  >
                    <div>
                      <Text>
                        Từ: {formatDate(healthCheckForm.campaign.startDate)}
                      </Text>
                      <br />
                      <Text>
                        Đến: {formatDate(healthCheckForm.campaign.endDate)}
                      </Text>
                    </div>
                  </Descriptions.Item>
                )}

              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Ngày khám dự kiến
                  </>
                }
              >
                <Text
                  type={
                    healthCheckForm.appointmentTime ? "default" : "secondary"
                  }
                >
                  {formatDateTime(healthCheckForm.appointmentTime)}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <MedicineBoxOutlined style={{ marginRight: 4 }} />
                    Địa điểm khám
                  </>
                }
              >
                <Text>
                  {healthCheckForm.appointmentLocation ||
                    "Tại trường (sẽ thông báo chi tiết sau)"}
                </Text>
              </Descriptions.Item>

              {healthCheckForm.campaign?.targetClasses && (
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined style={{ marginRight: 4 }} />
                      Đối tượng tham gia
                    </>
                  }
                >
                  <Text>Lớp: {healthCheckForm.campaign.targetClasses}</Text>
                  {healthCheckForm.campaign.minAge &&
                    healthCheckForm.campaign.maxAge && (
                      <Text type="secondary">
                        {" "}
                        (Tuổi: {healthCheckForm.campaign.minAge} -{" "}
                        {healthCheckForm.campaign.maxAge})
                      </Text>
                    )}
                </Descriptions.Item>
              )}

              <Descriptions.Item
                label={
                  <>
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Trạng thái
                  </>
                }
              >
                {getStatusTag(healthCheckForm.status)}
                {healthCheckForm.status === "PENDING" && (
                  <Text type="warning" style={{ marginLeft: 8 }}>
                    - Cần phản hồi trước ngày khám
                  </Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Ngày nhận thông báo
                  </>
                }
              >
                <Text type="secondary">
                  {formatDateTime(healthCheckForm.sentAt)}
                </Text>
              </Descriptions.Item>

              {healthCheckForm.parentNote && (
                <Descriptions.Item
                  label={
                    <>
                      <InfoCircleOutlined style={{ marginRight: 4 }} />
                      Ghi chú của phụ huynh
                    </>
                  }
                >
                  <Paragraph
                    style={{
                      margin: 0,
                      padding: 8,
                      backgroundColor: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: 4,
                    }}
                  >
                    {healthCheckForm.parentNote}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>

            {healthCheckForm?.status === "PENDING" && healthCheckForm?.id && (
              <Alert
                message="Cần phản hồi"
                description="Vui lòng xác nhận đồng ý hoặc từ chối tham gia đợt khám sức khỏe này để nhà trường có thể sắp xếp lịch trình phù hợp cho con em mình."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
                action={
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "confirm",
                          label: "Đồng ý tham gia",
                          icon: <CheckCircleOutlined />,
                          onClick: () => showResponseConfirm("confirm"),
                        },
                        {
                          key: "decline",
                          label: "Từ chối tham gia",
                          icon: <CloseCircleOutlined />,
                          onClick: () => showResponseConfirm("decline"),
                          danger: true,
                        },
                      ],
                    }}
                    placement="bottomRight"
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<ExclamationCircleOutlined />}
                    >
                      Phản hồi <DownOutlined />
                    </Button>
                  </Dropdown>
                }
              />
            )}

            {!healthCheckForm?.id && (
              <Alert
                message={
                  healthCheckForm?.error
                    ? "Lỗi tải dữ liệu"
                    : "Thông tin giới hạn"
                }
                description={
                  healthCheckForm?.error
                    ? "Không thể tải thông tin chi tiết từ server. Để xem đầy đủ thông tin và thực hiện hành động, vui lòng truy cập mục 'Thông báo khám sức khỏe' trong menu bên trái."
                    : "Đây là thông báo tổng quát từ hệ thống. Để xem chi tiết đầy đủ và thực hiện hành động xác nhận, vui lòng truy cập mục 'Thông báo khám sức khỏe' trong menu để có đầy đủ chức năng."
                }
                type={healthCheckForm?.error ? "warning" : "info"}
                showIcon
                style={{ marginTop: 16 }}
                action={
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => {
                      onClose();
                      window.location.href =
                        "/parent-dashboard?section=health-check-notifications";
                    }}
                  >
                    Đi đến trang chi tiết
                  </Button>
                }
              />
            )}
          </div>
        )
      )}
    </Modal>
  );
};

export default HealthCheckFormModal; 