import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Badge,
  Space,
  Modal,
  message,
  Descriptions,
  Input,
  Tag,
  Tabs,
  Typography,
  Popconfirm,
  Form,
  Spin,
  Tooltip,
  Alert,
} from "antd";
import notificationEventService from "../../services/notificationEventService";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import managerApi from "../../api/managerApi";
import { formatDate } from "../../utils/timeUtils";
import {
  validateManagerCampaignAction,
  getTimeValidationStatus,
  formatTimeRemaining,
  shouldShowReminderWarning,
} from "../../utils/vaccinationTimeValidation";
import "../../styles/ManagerVaccination.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const ManagerVaccinationManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchStatistics = async () => {
    try {
      const stats = await managerApi.getVaccinationCampaignStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const fetchPendingCampaigns = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await managerApi.getPendingVaccinationCampaigns(
        page - 1,
        size
      );
      setPendingCampaigns(response.content || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: response.totalElements || 0,
      }));
    } catch (error) {
      message.error("Lỗi khi tải danh sách chiến dịch chờ duyệt");
      console.error("Error fetching pending campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCampaignsByStatus = useCallback(
    async (status, page = 1, size = 10) => {
      setLoading(true);
      try {
        // Convert status from tab key to backend format
        const backendStatus = status.toUpperCase();
        const response = await managerApi.getVaccinationCampaignsByStatus(
          backendStatus,
          page - 1,
          size
        );
        console.log(response);
        setAllCampaigns(response.content || []);
        console.log("Fetched campaigns:", response.content);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.totalElements || 0,
        }));
      } catch (error) {
        message.error(
          `Lỗi khi tải danh sách chiến dịch với trạng thái ${status}`
        );
        console.error(`Error fetching campaigns with status ${status}:`, error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchStatistics();
    fetchPendingCampaigns();
  }, [fetchPendingCampaigns]);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingCampaigns();
    } else {
      fetchCampaignsByStatus(activeTab);
    }
  }, [activeTab, fetchPendingCampaigns, fetchCampaignsByStatus]);

  const handleApproveCampaign = async (campaignId) => {
    // Find the campaign to validate timing
    const campaign = getCurrentData().find(c => c.id === campaignId);
    if (campaign) {
      const validation = validateManagerCampaignAction(campaign.createdDate);
      if (!validation.canAct) {
        message.error(validation.message);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await managerApi.approveVaccinationCampaign(campaignId);
      if (response.success) {
        message.success("Phê duyệt chiến dịch thành công!");
        
        // Trigger notification refresh for navbar
        notificationEventService.triggerRefresh();
        
        fetchStatistics();
        if (activeTab === "pending") {
          fetchPendingCampaigns(pagination.current, pagination.pageSize);
        } else {
          fetchCampaignsByStatus(
            activeTab,
            pagination.current,
            pagination.pageSize
          );
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi phê duyệt chiến dịch";
      message.error(errorMessage);
      console.error("Error approving campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await managerApi.completeCampaign(campaignId);
      if (response.success) {
        message.success("Đánh dấu hoàn thành chiến dịch thành công!");
        fetchStatistics();
        console.log(response);
        // Refresh current tab data
        if (activeTab === "pending") {
          fetchPendingCampaigns(pagination.current, pagination.pageSize);
        } else {
          fetchCampaignsByStatus(
            activeTab,
            pagination.current,
            pagination.pageSize
          );
        }
      }
    } catch (error) {
      message.error(
        "Lỗi khi hoàn thành chiến dịch: " +
          (error.response?.data?.message || error.message)
      );
      console.error("Error completing campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCampaign = async (campaignId, reason) => {
    // Find the campaign to validate timing
    const campaign = getCurrentData().find(c => c.id === campaignId) || selectedCampaign;
    if (campaign) {
      const validation = validateManagerCampaignAction(campaign.createdDate);
      if (!validation.canAct) {
        message.error(validation.message);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await managerApi.rejectVaccinationCampaign(
        campaignId,
        reason
      );
      if (response.success) {
        message.success("Từ chối chiến dịch thành công!");
        
        // Trigger notification refresh for navbar
        notificationEventService.triggerRefresh();
        
        setRejectModalVisible(false);
        form.resetFields();
        fetchStatistics();
        if (activeTab === "pending") {
          fetchPendingCampaigns(pagination.current, pagination.pageSize);
        } else {
          fetchCampaignsByStatus(
            activeTab,
            pagination.current,
            pagination.pageSize
          );
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lỗi khi từ chối chiến dịch";
      message.error(errorMessage);
      console.error("Error rejecting campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const showCampaignDetail = async (campaignId) => {
    try {
      const campaign = await managerApi.getVaccinationCampaignById(campaignId);
      setSelectedCampaign(campaign);
      console.log("Selected campaign:", campaign);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Lỗi khi tải thông tin chi tiết chiến dịch");
      console.error("Error fetching campaign details:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: "processing", text: "Chờ duyệt" },
      APPROVED: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Bị từ chối" },
      IN_PROGRESS: { color: "warning", text: "Đang tiến hành" },
      COMPLETED: { color: "default", text: "Hoàn thành" },
    };
    const statusInfo = statusMap[status] || { color: "default", text: status };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Helper function to render time-sensitive action buttons
  const renderTimeValidatedActions = (record) => {
    const validation = validateManagerCampaignAction(record.createdDate);
    const timeStatus = getTimeValidationStatus(validation);
    const showWarning = shouldShowReminderWarning(record.createdDate, record.reminderSent);

    return (
      <Space size="small" wrap>
        <Button
          type="default"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => showCampaignDetail(record.id)}
          style={{ borderRadius: 4 }}
          title="Xem chi tiết"
        >
        </Button>
        
        {record.status === "PENDING" && (
          <>
            {/* Time warning indicator */}
            {(showWarning || !validation.canAct) && (
              <Tooltip 
                title={
                  !validation.canAct 
                    ? validation.message 
                    : `Đã gửi nhắc nhở sau 12 giờ. ${validation.message}`
                }
              >
                <Tag 
                  color={!validation.canAct ? "red" : "orange"}
                  icon={!validation.canAct ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />}
                  style={{ margin: 0, fontSize: "11px", padding: "2px 6px" }}
                >
                  {!validation.canAct ? "Hết hạn" : `${formatTimeRemaining(validation.remainingHours)} còn lại`}
                </Tag>
              </Tooltip>
            )}

            <Popconfirm
              title="Phê duyệt chiến dịch"
              description={
                <div>
                  <p>Bạn có chắc chắn muốn phê duyệt chiến dịch này?</p>
                  {!validation.canAct && (
                    <Alert
                      message="Cảnh báo: Đã quá thời hạn phê duyệt (24 giờ)"
                      type="error"
                      size="small"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              }
              onConfirm={() => handleApproveCampaign(record.id)}
              okText="Phê duyệt"
              cancelText="Hủy"
              placement="topRight"
              disabled={!validation.canAct}
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                disabled={!validation.canAct}
                style={{
                  borderRadius: 4,
                  backgroundColor: validation.canAct ? "#52c41a" : "#d9d9d9",
                  borderColor: validation.canAct ? "#52c41a" : "#d9d9d9",
                }}
                title={validation.canAct ? "Duyệt chiến dịch" : validation.message}
              >
              </Button>
            </Popconfirm>
            
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              disabled={!validation.canAct}
              onClick={() => {
                if (validation.canAct) {
                  setSelectedCampaign(record);
                  setRejectModalVisible(true);
                } else {
                  message.error(validation.message);
                }
              }}
              style={{ borderRadius: 4 }}
              title={validation.canAct ? "Từ chối chiến dịch" : validation.message}
            >
            </Button>
          </>
        )}
        
        {record.status === "IN_PROGRESS" && (
          <Popconfirm
            title="Hoàn thành chiến dịch"
            description={
              <div>
                <p>
                  Bạn có chắc chắn muốn đánh dấu chiến dịch này là hoàn thành?
                </p>
                <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            }
            onConfirm={() => handleCompleteCampaign(record.id)}
            okText="Hoàn thành"
            cancelText="Hủy"
            placement="topRight"
            okButtonProps={{ danger: false, type: "primary" }}
          >
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              size="small"
              style={{
                borderRadius: 4,
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
              }}
              title="Đánh dấu chiến dịch hoàn thành (chỉ Manager)"
            >
            </Button>
          </Popconfirm>
        )}
      </Space>
    );
  };

  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text) => (
        <Text
          strong
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
          }}
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      render: (status) => getStatusBadge(status),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      width: "15%",
      render: (date) => formatDate(date),
    },
    {
      title: "Độ tuổi",
      key: "ageRange",
      width: "12%",
      render: (_, record) => {
        return (record.minAge !== undefined && record.minAge !== null && 
                record.maxAge !== undefined && record.maxAge !== null)
          ? `${Math.floor(record.minAge / 12)} - ${Math.floor(
              record.maxAge / 12
            )} tuổi`
          : "N/A";
      },
    },
    {
      title: "Người tạo",
      dataIndex: "createdByName",
      key: "createdByName",
      width: "12%",
      render: (text) => text || "N/A",
    },
    {
      title: "Người duyệt",
      dataIndex: "approvedByName",
      key: "approvedByName",
      width: "12%",
      render: (text) => text || "Chưa duyệt",
    },
    {
      title: "Thời hạn",
      key: "timeRemaining",
      width: "15%",
      render: (_, record) => {
        if (record.status !== "PENDING") {
          return <Text type="secondary">-</Text>;
        }
        
        const validation = validateManagerCampaignAction(record.createdDate);
        const showWarning = shouldShowReminderWarning(record.createdDate, record.reminderSent);
        
        if (!validation.canAct) {
          return (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>
              Đã hết hạn
            </Tag>
          );
        }
        
        if (showWarning) {
          return (
            <Tooltip title="Đã gửi nhắc nhở sau 12 giờ">
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                {formatTimeRemaining(validation.remainingHours)}
              </Tag>
            </Tooltip>
          );
        }
        
        return (
          <Tag color="green">
            {formatTimeRemaining(validation.remainingHours)}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "280px",
      fixed: "right",
      render: (_, record) => renderTimeValidatedActions(record),
    },
  ];

  const getCurrentData = () => {
    return activeTab === "pending" ? pendingCampaigns : allCampaigns;
  };

  return (
    <div className="dashboard-overview">
      <Title level={3} style={{ marginBottom: "32px", color: "#333" }}>
        Quản lý chiến dịch tiêm chủng
      </Title>

      <Spin spinning={loading}>
        {/* Statistics Cards */}
        <div className="stats-grid" style={{ marginBottom: 32 }}>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.pending || 0}</h3>
              <p>Chiến dịch chờ duyệt</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.approved || 0}</h3>
              <p>Chiến dịch đã duyệt</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.rejected || 0}</h3>
              <p>Chiến dịch bị từ chối</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.inProgress || 0}</h3>
              <p>Đang tiến hành</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.completed || 0}</h3>
              <p>Đã hoàn thành</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{statistics.total || 0}</h3>
              <p>Tổng chiến dịch</p>
            </div>
          </div>
        </div>
      </Spin>

      {/* Campaign Management Table */}
      <div className="table-container" style={{ marginTop: 24 }}>
        <div className="section-header">
          <Title level={4} style={{ margin: 0, color: "#333" }}>
            Danh sách chiến dịch
          </Title>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          style={{
            marginBottom: 0,
            marginTop: 16,
            background: "#fff",
            padding: "0 24px",
            borderRadius: "8px 8px 0 0",
          }}
          items={[
            {
              key: "pending",
              label: (
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Chờ duyệt
                </span>
              ),
            },
            {
              key: "approved",
              label: (
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Đã duyệt
                </span>
              ),
            },
            {
              key: "rejected",
              label: (
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Bị từ chối
                </span>
              ),
            },
            {
              key: "in_progress",
              label: (
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Đang tiến hành
                </span>
              ),
            },
            {
              key: "completed",
              label: (
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Hoàn thành
                </span>
              ),
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={getCurrentData()}
          loading={loading}
          rowKey="id"
          size="middle"
          bordered={false}
          className="data-table"
          scroll={{ x: 1200 }}
          style={{
            background: "#fff",
            borderRadius: 8,
            marginTop: 16,
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => (
              <span style={{ color: "#666", fontSize: "14px" }}>
                {range[0]}-{range[1]} của {total} chiến dịch
              </span>
            ),
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
              if (activeTab === "pending") {
                fetchPendingCampaigns(page, pageSize);
              } else {
                fetchCampaignsByStatus(activeTab, page, pageSize);
              }
            },
          }}
        />
      </div>

      {/* Campaign Detail Modal */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0, color: "#262626" }}>
            Chi tiết chiến dịch tiêm chủng
          </Title>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModalVisible(false)}
            style={{ borderRadius: 8 }}
          >
            Đóng
          </Button>,
          selectedCampaign?.status === "PENDING" && (() => {
            const validation = validateManagerCampaignAction(selectedCampaign.createdDate);
            return [
              <Button
                key="reject"
                danger
                disabled={!validation.canAct}
                onClick={() => {
                  if (validation.canAct) {
                    setDetailModalVisible(false);
                    setRejectModalVisible(true);
                  } else {
                    message.error(validation.message);
                  }
                }}
                style={{ borderRadius: 8 }}
                title={validation.canAct ? "Từ chối chiến dịch" : validation.message}
              >
                Từ chối
              </Button>,
              <Popconfirm
                key="approve"
                title="Phê duyệt chiến dịch"
                description={
                  <div>
                    <p>Bạn có chắc chắn muốn phê duyệt chiến dịch này?</p>
                    {!validation.canAct && (
                      <Alert
                        message="Cảnh báo: Đã quá thời hạn phê duyệt (24 giờ)"
                        type="error"
                        size="small"
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </div>
                }
                onConfirm={() => {
                  handleApproveCampaign(selectedCampaign.id);
                  setDetailModalVisible(false);
                }}
                okText="Phê duyệt"
                cancelText="Hủy"
                disabled={!validation.canAct}
              >
                <Button 
                  type="primary" 
                  style={{ borderRadius: 8 }}
                  disabled={!validation.canAct}
                  title={validation.canAct ? "Phê duyệt chiến dịch" : validation.message}
                >
                  Phê duyệt
                </Button>
              </Popconfirm>
            ];
          })(),
        ]}
        width={900}
        style={{ top: 20 }}
        styles={{ body: { padding: "24px" } }}
      >
        {selectedCampaign && (
          <Descriptions
            column={2}
            bordered
            size="middle"
            styles={{
              label: {
                background: "#fafafa",
                fontWeight: 600,
                color: "#262626",
              },
              content: {
                background: "#fff",
                color: "#595959",
              },
            }}
          >
            <Descriptions.Item label="Tên chiến dịch" span={2}>
              <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                {selectedCampaign.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <div style={{ fontSize: "14px" }}>
                {getStatusBadge(selectedCampaign.status)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Liều số">
              <Text strong style={{ fontSize: "14px", color: "#1890ff" }}>
                Liều {selectedCampaign.doseNumber || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              <Text style={{ fontSize: "14px", fontWeight: 500 }}>
                {formatDate(selectedCampaign.scheduledDate)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              <Text style={{ fontSize: "14px" }}>
                {selectedCampaign.location || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Độ tuổi phù hợp">
              <Tag
                color="green"
                style={{ fontSize: "13px", padding: "4px 8px" }}
              >
                {selectedCampaign.minAge !== undefined && selectedCampaign.maxAge !== undefined
                  ? `${Math.floor(selectedCampaign.minAge / 12)} - ${Math.floor(
                      selectedCampaign.maxAge / 12
                    )} tuổi`
                  : "N/A"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng vaccine">
              <Text style={{ fontSize: "14px", fontWeight: 500 }}>
                {selectedCampaign.estimatedVaccineCount || "N/A"} liều
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              <Text strong style={{ fontSize: "14px" }}>
                {selectedCampaign.createdByName || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              <Text style={{ fontSize: "14px" }}>
                {formatDate(selectedCampaign.createdDate)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người duyệt">
              <Text strong style={{ fontSize: "14px" }}>
                {selectedCampaign.approvedByName || "Chưa duyệt"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày duyệt">
              <Text style={{ fontSize: "14px" }}>
                {formatDate(selectedCampaign.approvedDate)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              <Text style={{ fontSize: "14px", lineHeight: "1.6" }}>
                {selectedCampaign.description || "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Hướng dẫn chăm sóc" span={2}>
              <Text style={{ fontSize: "14px", lineHeight: "1.6" }}>
                {selectedCampaign.prePostCareInstructions || "N/A"}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Campaign Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CloseOutlined />
            <span>Từ chối chiến dịch</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
        onOk={() => {
          form.validateFields().then((values) => {
            handleRejectCampaign(selectedCampaign.id, values.reason);
          });
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
          style: { borderRadius: 6 },
        }}
        cancelButtonProps={{
          style: { borderRadius: 6 },
        }}
        width={600}
        className="reject-modal"
      >
        <div style={{ padding: "8px 0" }}>
          <Text type="secondary" style={{ marginBottom: 16, display: "block" }}>
            Vui lòng nhập lý do từ chối chiến dịch "{selectedCampaign?.name}":
          </Text>
          <Form form={form} layout="vertical">
            <Form.Item
              name="reason"
              label="Lý do từ chối"
              rules={[
                { required: true, message: "Vui lòng nhập lý do từ chối" },
                { min: 10, message: "Lý do phải có ít nhất 10 ký tự" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do từ chối chiến dịch..."
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerVaccinationManagement;
