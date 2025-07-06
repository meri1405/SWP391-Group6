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
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import managerApi from "../../api/managerApi";
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
    setLoading(true);
    try {
      const response = await managerApi.approveVaccinationCampaign(campaignId);
      if (response.success) {
        message.success("Phê duyệt chiến dịch thành công!");
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
      message.error("Lỗi khi phê duyệt chiến dịch");
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
    setLoading(true);
    try {
      const response = await managerApi.rejectVaccinationCampaign(
        campaignId,
        reason
      );
      if (response.success) {
        message.success("Từ chối chiến dịch thành công!");
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
      message.error("Lỗi khi từ chối chiến dịch");
      console.error("Error rejecting campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const showCampaignDetail = async (campaignId) => {
    try {
      const campaign = await managerApi.getVaccinationCampaignById(campaignId);
      setSelectedCampaign(campaign);
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
      title: "Thương hiệu",
      dataIndex: "vaccineBrand",
      key: "vaccineBrand",
      width: "15%",
      render: (text) => text || "N/A",
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
      render: (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Độ tuổi phù hợp",
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
      width: "15%",
      render: (text) => text || "Chưa duyệt",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: "220px",
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showCampaignDetail(record.id)}
            style={{ borderRadius: 4 }}
            title="Xem chi tiết"
          >
            Xem
          </Button>
          {record.status === "PENDING" && (
            <>
              <Popconfirm
                title="Phê duyệt chiến dịch"
                description="Bạn có chắc chắn muốn phê duyệt chiến dịch này?"
                onConfirm={() => handleApproveCampaign(record.id)}
                okText="Phê duyệt"
                cancelText="Hủy"
                placement="topRight"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{
                    borderRadius: 4,
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                  title="Duyệt chiến dịch"
                >
                  Duyệt
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => {
                  setSelectedCampaign(record);
                  setRejectModalVisible(true);
                }}
                style={{ borderRadius: 4 }}
                title="Từ chối chiến dịch"
              >
                Từ chối
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
                Hoàn thành
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
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
          selectedCampaign?.status === "PENDING" && (
            <Button
              key="reject"
              danger
              onClick={() => {
                setDetailModalVisible(false);
                setRejectModalVisible(true);
              }}
              style={{ borderRadius: 8 }}
            >
              Từ chối
            </Button>
          ),
          selectedCampaign?.status === "PENDING" && (
            <Popconfirm
              key="approve"
              title="Phê duyệt chiến dịch"
              description="Bạn có chắc chắn muốn phê duyệt chiến dịch này?"
              onConfirm={() => {
                handleApproveCampaign(selectedCampaign.id);
                setDetailModalVisible(false);
              }}
              okText="Phê duyệt"
              cancelText="Hủy"
            >
              <Button type="primary" style={{ borderRadius: 8 }}>
                Phê duyệt
              </Button>
            </Popconfirm>
          ),
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
              <Text strong style={{ fontSize: "16px", color: "#ff6b35" }}>
                {selectedCampaign.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">
              <Text strong>{selectedCampaign.vaccineBrand || "N/A"}</Text>
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
                {selectedCampaign.scheduledDate
                  ? new Date(selectedCampaign.scheduledDate).toLocaleString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "N/A"}
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
                {selectedCampaign.minAge && selectedCampaign.maxAge
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
                {selectedCampaign.createdDate
                  ? new Date(selectedCampaign.createdDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người duyệt">
              <Text strong style={{ fontSize: "14px" }}>
                {selectedCampaign.approvedByName || "Chưa duyệt"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày duyệt">
              <Text style={{ fontSize: "14px" }}>
                {selectedCampaign.approvedDate
                  ? new Date(selectedCampaign.approvedDate).toLocaleDateString(
                      "vi-VN"
                    )
                  : "N/A"}
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
