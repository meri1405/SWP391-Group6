import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Typography,
  Row,
  Col,
  Alert,
  Input,
  Tabs,
  Badge,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { parentApi } from "../../../api/parentApi";
import { useAuth } from "../../../contexts/AuthContext";
import "../../../styles/HealthCheckNotifications.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const HealthCheckNotifications = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseType, setResponseType] = useState("");
  const [parentNote, setParentNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const { getToken } = useAuth();

  useEffect(() => {
    fetchHealthCheckForms();
  }, [activeTab]);

  const fetchHealthCheckForms = async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === "all") {
        response = await parentApi.getHealthCheckForms(getToken());
      } else {
        response = await parentApi.getHealthCheckFormsByStatus(
          activeTab.toUpperCase(),
          getToken()
        );
      }
      setForms(response || []);

      // Debug: log the response to console
      console.log("Health check forms loaded:", response);
    } catch (error) {
      console.error("Error fetching health check forms:", error);
      message.error("Lỗi khi tải thông tin đợt khám sức khỏe");
      setForms([]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa xác định";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const showDetailModal = (form) => {
    setSelectedForm(form);
    setDetailModalVisible(true);
  };

  const showResponseModal = (form, type) => {
    setSelectedForm(form);
    setResponseType(type);
    setParentNote("");
    setResponseModalVisible(true);
  };

  const handleResponse = async () => {
    if (!selectedForm) return;

    try {
      setSubmitting(true);
      if (responseType === "confirm") {
        await parentApi.confirmHealthCheckForm(
          selectedForm.id,
          parentNote,
          getToken()
        );
        message.success("Đã xác nhận đồng ý cho con tham gia khám sức khỏe");
      } else {
        await parentApi.declineHealthCheckForm(
          selectedForm.id,
          parentNote,
          getToken()
        );
        message.success("Đã gửi phản hồi từ chối tham gia khám sức khỏe");
      }

      setResponseModalVisible(false);
      setParentNote("");
      await fetchHealthCheckForms(); // Refresh the list
    } catch (error) {
      console.error("Error responding to health check form:", error);
      message.error("Lỗi khi gửi phản hồi. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Đợt khám sức khỏe",
      dataIndex: "campaign",
      key: "campaign",
      render: (campaign) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{campaign?.name || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {campaign?.description || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Học sinh",
      dataIndex: "student",
      key: "student",
      render: (student) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {student?.fullName || "N/A"}
        </div>
      ),
    },
    {
      title: "Ngày khám dự kiến",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      render: (dateTime) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {formatDateTime(dateTime)}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => showDetailModal(record)}
          >
            Chi tiết
          </Button>
          {record.status === "PENDING" && (
            <>
              <Popconfirm
                title="Xác nhận đồng ý"
                description="Bạn có đồng ý cho con mình tham gia đợt khám sức khỏe này không?"
                onConfirm={() => showResponseModal(record, "confirm")}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                >
                  Đồng ý
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => showResponseModal(record, "decline")}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getTabCount = (status) => {
    if (status === "all") {
      return forms.length;
    }
    return forms.filter((form) => form.status === status.toUpperCase()).length;
  };

  return (
    <div className="health-check-notifications" style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>
          <MedicineBoxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          Thông báo khám sức khỏe
        </Title>

        <Alert
          message="Thông tin quan trọng"
          description="Đây là các thông báo về đợt khám sức khỏe từ nhà trường. Vui lòng xem xét và phản hồi kịp thời để nhà trường có thể sắp xếp lịch khám phù hợp."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
        >
          <TabPane
            tab={
              <Badge count={getTabCount("pending")} offset={[10, 0]}>
                Chờ phản hồi
              </Badge>
            }
            key="pending"
          />
          <TabPane
            tab={
              <Badge count={getTabCount("confirmed")} offset={[10, 0]}>
                Đã đồng ý
              </Badge>
            }
            key="confirmed"
          />
          <TabPane
            tab={
              <Badge count={getTabCount("declined")} offset={[10, 0]}>
                Đã từ chối
              </Badge>
            }
            key="declined"
          />
          <TabPane
            tab={
              <Badge count={getTabCount("all")} offset={[10, 0]}>
                Tất cả
              </Badge>
            }
            key="all"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={forms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thông báo`,
          }}
          locale={{
            emptyText: "Không có thông báo khám sức khỏe nào",
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MedicineBoxOutlined style={{ color: "#1890ff" }} />
            <span>Chi tiết đợt khám sức khỏe</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          selectedForm?.status === "PENDING" && (
            <Space key="actions">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  showResponseModal(selectedForm, "confirm");
                }}
              >
                Đồng ý tham gia
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  showResponseModal(selectedForm, "decline");
                }}
              >
                Từ chối tham gia
              </Button>
            </Space>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedForm && (
          <div>
            <Alert
              message="Thông tin đợt khám sức khỏe"
              description={`Đây là thông tin chi tiết về đợt khám sức khỏe mà nhà trường đã tổ chức cho học sinh ${
                selectedForm.student?.fullName || "N/A"
              }. Vui lòng xem xét kỹ và đưa ra quyết định phù hợp.`}
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
                  {selectedForm.campaign?.name || "N/A"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <InfoCircleOutlined style={{ marginRight: 4 }} />
                    Mô tả đợt khám
                  </>
                }
              >
                <Paragraph style={{ margin: 0 }}>
                  {selectedForm.campaign?.description ||
                    "Không có mô tả chi tiết"}
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
                <Text strong>{selectedForm.student?.fullName || "N/A"}</Text>
                {selectedForm.student?.className && (
                  <Text type="secondary">
                    {" "}
                    - Lớp {selectedForm.student.className}
                  </Text>
                )}
              </Descriptions.Item>

              {selectedForm.campaign?.startDate &&
                selectedForm.campaign?.endDate && (
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
                        Từ: {formatDate(selectedForm.campaign.startDate)}
                      </Text>
                      <br />
                      <Text>
                        Đến: {formatDate(selectedForm.campaign.endDate)}
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
                  type={selectedForm.appointmentTime ? "default" : "secondary"}
                >
                  {formatDateTime(selectedForm.appointmentTime)}
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
                  {selectedForm.appointmentLocation ||
                    "Tại trường (sẽ thông báo chi tiết sau)"}
                </Text>
              </Descriptions.Item>

              {selectedForm.campaign?.targetClasses && (
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined style={{ marginRight: 4 }} />
                      Đối tượng tham gia
                    </>
                  }
                >
                  <Text>Lớp: {selectedForm.campaign.targetClasses}</Text>
                  {selectedForm.campaign.minAge &&
                    selectedForm.campaign.maxAge && (
                      <Text type="secondary">
                        {" "}
                        (Tuổi: {selectedForm.campaign.minAge} -{" "}
                        {selectedForm.campaign.maxAge})
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
                {getStatusTag(selectedForm.status)}
                {selectedForm.status === "PENDING" && (
                  <Text type="warning" style={{ marginLeft: 8 }}>
                    - Cần phản hồi trước ngày khám
                  </Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    Ngày tạo thông báo
                  </>
                }
              >
                <Text type="secondary">
                  {formatDateTime(selectedForm.createdAt)}
                </Text>
              </Descriptions.Item>

              {selectedForm.parentNote && (
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
                    {selectedForm.parentNote}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedForm.status === "PENDING" && (
              <Alert
                message="Cần phản hồi"
                description="Vui lòng xác nhận đồng ý hoặc từ chối tham gia đợt khám sức khỏe này để nhà trường có thể sắp xếp lịch trình phù hợp."
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
                action={
                  <Space>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        setDetailModalVisible(false);
                        showResponseModal(selectedForm, "confirm");
                      }}
                    >
                      Đồng ý
                    </Button>
                    <Button
                      size="small"
                      danger
                      onClick={() => {
                        setDetailModalVisible(false);
                        showResponseModal(selectedForm, "decline");
                      }}
                    >
                      Từ chối
                    </Button>
                  </Space>
                }
              />
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title={
          responseType === "confirm"
            ? "Xác nhận tham gia khám sức khỏe"
            : "Từ chối tham gia khám sức khỏe"
        }
        open={responseModalVisible}
        onOk={handleResponse}
        onCancel={() => setResponseModalVisible(false)}
        confirmLoading={submitting}
        okText={responseType === "confirm" ? "Đồng ý" : "Từ chối"}
        cancelText="Hủy"
      >
        {selectedForm && (
          <div>
            <Alert
              message={
                responseType === "confirm"
                  ? "Xác nhận đồng ý"
                  : "Xác nhận từ chối"
              }
              description={
                responseType === "confirm"
                  ? `Bạn đang xác nhận đồng ý cho ${
                      selectedForm.student?.fullName || "con bạn"
                    } tham gia đợt khám sức khỏe "${
                      selectedForm.campaign?.name || ""
                    }".`
                  : `Bạn đang từ chối cho ${
                      selectedForm.student?.fullName || "con bạn"
                    } tham gia đợt khám sức khỏe "${
                      selectedForm.campaign?.name || ""
                    }".`
              }
              type={responseType === "confirm" ? "success" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 8 }}>
              <Text strong>Ghi chú (tuỳ chọn):</Text>
            </div>
            <TextArea
              placeholder={
                responseType === "confirm"
                  ? "Nhập ghi chú nếu có (ví dụ: thời gian phù hợp, yêu cầu đặc biệt...)"
                  : "Nhập lý do từ chối (ví dụ: con đang ốm, có lịch trình khác...)"
              }
              value={parentNote}
              onChange={(e) => setParentNote(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckNotifications;
