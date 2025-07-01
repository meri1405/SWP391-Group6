import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Tooltip,
  Modal,
  message,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { healthCheckApi } from "../../../api/healthCheckApi";

const { Option } = Select;
const { RangePicker } = DatePicker;

const HealthCheckCampaignList = ({
  onCreateNew,
  onViewDetails,
  refreshTrigger,
}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAllCampaigns, setShowAllCampaigns] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, [filterStatus, dateRange, refreshTrigger, showAllCampaigns]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let data;
      const sourceType = showAllCampaigns ? "ALL_CAMPAIGNS" : "MY_CAMPAIGNS";
      const statusFilter =
        filterStatus !== "ALL" ? filterStatus : "ALL_STATUSES";

      console.log(
        `🔄 Fetching campaigns - Mode: ${sourceType}, Filter: ${statusFilter}`
      );

      if (filterStatus !== "ALL") {
        console.log(`📋 Fetching campaigns by status: ${filterStatus}`);
        data = await healthCheckApi.getCampaignsByStatus(filterStatus);
        console.log(
          `📊 Found ${data.length} campaigns with status ${filterStatus}`
        );
      } else {
        // Toggle between all campaigns and nurse's campaigns
        if (showAllCampaigns) {
          try {
            console.log(
              "🌐 Attempting to fetch ALL campaigns from all nurses..."
            );
            data = await healthCheckApi.getAllCampaigns();
            console.log(
              `✅ Successfully fetched ${data.length} campaigns from all sources`
            );

            // Show breakdown by status for debugging
            const statusBreakdown = data.reduce((acc, campaign) => {
              acc[campaign.status] = (acc[campaign.status] || 0) + 1;
              return acc;
            }, {});
            console.log(
              "📈 Status breakdown (ALL campaigns):",
              statusBreakdown
            );
          } catch (allCampaignsError) {
            console.warn(
              "⚠️ Failed to fetch all campaigns, falling back to nurse campaigns:",
              allCampaignsError.message
            );
            // Fallback to nurse campaigns if getAllCampaigns fails
            data = await healthCheckApi.getNurseCampaigns();
            message.warning(
              "Không thể tải tất cả đợt khám, hiển thị đợt khám của bạn"
            );
            // Update state to reflect what we're actually showing
            setShowAllCampaigns(false);
          }
        } else {
          console.log("👤 Fetching campaigns created by current nurse only...");
          data = await healthCheckApi.getNurseCampaigns();
          console.log(
            `📊 Found ${data.length} campaigns created by current nurse`
          );

          // Show breakdown by status for debugging
          const statusBreakdown = data.reduce((acc, campaign) => {
            acc[campaign.status] = (acc[campaign.status] || 0) + 1;
            return acc;
          }, {});
          console.log("📈 Status breakdown (MY campaigns):", statusBreakdown);

          // Show helpful message if no canceled campaigns found
          const canceledCount = statusBreakdown.CANCELED || 0;
          if (canceledCount === 0) {
            console.log(
              "💡 No canceled campaigns found in 'My campaigns'. Try switching to 'All campaigns' to see campaigns from other nurses."
            );
          }
        }
      }

      // Apply date range filter if selected
      let filteredData = [...data];
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].startOf("day");
        const endDate = dateRange[1].endOf("day");
        const beforeFilter = filteredData.length;
        filteredData = filteredData.filter((campaign) => {
          const campaignStartDate = dayjs(campaign.startDate);
          return (
            campaignStartDate.isAfter(startDate) &&
            campaignStartDate.isBefore(endDate)
          );
        });
        console.log(
          `📅 Date filter applied: ${beforeFilter} → ${filteredData.length} campaigns`
        );
      }

      setCampaigns(filteredData);

      // Enhanced success message with helpful hints
      const totalCount = filteredData.length;
      const sourceText = showAllCampaigns ? "tất cả y tá" : "của bạn";
      const statusText = filterStatus !== "ALL" ? ` (${filterStatus})` : "";

      console.log(
        `📊 Final result: Displaying ${totalCount} campaigns from ${sourceText}${statusText}`
      );

      // Show helpful message for CANCELED status specifically
      if (
        filterStatus === "CANCELED" ||
        (filterStatus === "ALL" && !showAllCampaigns)
      ) {
        const canceledCount = filteredData.filter(
          (c) => c.status === "CANCELED"
        ).length;
        if (canceledCount === 0 && !showAllCampaigns) {
          message.info(
            `Không tìm thấy đợt khám đã hủy trong danh sách của bạn. ` +
              `Để xem tất cả đợt khám đã hủy (từ tất cả y tá), hãy chọn "Tất cả đợt khám" ở trên.`,
            6
          );
        } else if (canceledCount > 0) {
          message.success(
            `Tìm thấy ${canceledCount} đợt khám đã hủy ${
              showAllCampaigns ? "từ tất cả y tá" : "của bạn"
            }`,
            3
          );
        }
      }
    } catch (error) {
      console.error("❌ Error fetching campaigns:", error);
      message.error("Không thể tải danh sách đợt khám sức khỏe");
      // Set mock data for development if needed
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;

    setLoading(true);
    try {
      // Backend currently doesn't support delete, we could implement cancel instead
      const notes = "Cancelled by nurse";
      await healthCheckApi.cancelCampaign(selectedCampaign.id, notes);
      message.success("Đã hủy đợt khám sức khỏe");
      setConfirmDeleteModal(false);
      fetchCampaigns();
    } catch (error) {
      message.error(
        "Không thể hủy đợt khám. Chỉ có thể hủy đợt khám ở trạng thái CHƯA DUYỆT."
      );
      console.error("Error canceling campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    if (campaign.status !== "PENDING") {
      message.warning("Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT");
      return;
    }
    onCreateNew(campaign); // Pass campaign data to edit
  };

  const handleViewDetails = (campaign) => {
    onViewDetails(campaign.id);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Chưa duyệt</Tag>;
      case "APPROVED":
        return <Tag color="green">Đã duyệt</Tag>;
      case "IN_PROGRESS":
        return <Tag color="processing">Đang diễn ra</Tag>;
      case "COMPLETED":
        return <Tag color="success">Đã hoàn thành</Tag>;
      case "CANCELED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Tên đợt khám",
      dataIndex: "name",
      key: "name",
      width: "20%",
      minWidth: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "25%",
      minWidth: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: "12%",
      minWidth: 120,
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: "12%",
      minWidth: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: "15%",
      minWidth: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "10%",
      minWidth: 100,
      render: (status) => getStatusTag(status),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Hành động",
      key: "action",
      width: "16%",
      minWidth: 140,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              disabled={!["DRAFT", "PENDING"].includes(record.status)}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Hủy">
            <Button
              danger
              icon={<CloseCircleOutlined />}
              size="small"
              disabled={
                !["DRAFT", "PENDING", "APPROVED"].includes(record.status)
              }
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  return (
    <div className="health-check-campaign-management">
      <Card
        title="Danh sách đợt khám sức khỏe"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => onCreateNew()}
          >
            Tạo đợt khám mới
          </Button>
        }
        style={{
          width: "100%",
          minHeight: "auto",
        }}
        styles={{
          body: {
            padding: "16px",
            minHeight: "auto",
          },
        }}
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <Space wrap>
            <Select
              value={showAllCampaigns ? "ALL_CAMPAIGNS" : "MY_CAMPAIGNS"}
              style={{ width: 160, minWidth: 140 }}
              onChange={(value) =>
                setShowAllCampaigns(value === "ALL_CAMPAIGNS")
              }
            >
              <Option value="ALL_CAMPAIGNS">🌐 Tất cả đợt khám</Option>
              <Option value="MY_CAMPAIGNS">👤 Đợt khám của tôi</Option>
            </Select>
            <Select
              defaultValue="ALL"
              style={{ width: 150, minWidth: 120 }}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PENDING">Chưa duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="IN_PROGRESS">Đang diễn ra</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELED">🚫 Đã hủy</Option>
            </Select>
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
              style={{ minWidth: 250 }}
              disabledDate={(current) => {
                if (!current) return false;
                // Cho phép filter tất cả dates, không restrict
                return false;
              }}
            />
          </Space>
          <Space>
            {/* Quick action for viewing canceled campaigns */}
            {!showAllCampaigns && (
              <Button
                type="dashed"
                size="small"
                onClick={() => {
                  setShowAllCampaigns(true);
                  setFilterStatus("CANCELED");
                }}
                style={{
                  borderColor: "#ff4d4f",
                  color: "#ff4d4f",
                  fontSize: "12px",
                }}
              >
                🔍 Xem tất cả đợt khám đã hủy
              </Button>
            )}
            <Button onClick={fetchCampaigns}>🔄 Làm mới</Button>
          </Space>
        </div>

        {/* Info banner */}
        {campaigns.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              padding: "8px 12px",
              backgroundColor: showAllCampaigns ? "#e6f7ff" : "#fff2e8",
              border: `1px solid ${showAllCampaigns ? "#91d5ff" : "#ffb366"}`,
              borderRadius: "4px",
              fontSize: "13px",
              color: "#666",
            }}
          >
            📊 Hiện đang hiển thị <strong>{campaigns.length}</strong> đợt khám
            {showAllCampaigns
              ? " từ tất cả y tá trong hệ thống"
              : " do bạn tạo"}
            {filterStatus !== "ALL" && (
              <span>
                {" "}
                với trạng thái <strong>{filterStatus}</strong>
              </span>
            )}
          </div>
        )}

        <Table
          columns={columns}
          dataSource={campaigns.map((campaign) => ({
            ...campaign,
            key: campaign.id,
          }))}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đợt khám`,
            pageSizeOptions: ["10", "20", "50", "100"],
            responsive: true,
          }}
          scroll={{
            x: "max-content",
            y: window.innerHeight > 800 ? "calc(100vh - 400px)" : 400,
          }}
          rowClassName={(record) =>
            record.status === "CANCELED" ? "cancelled-row" : ""
          }
          size="middle"
          tableLayout="auto"
          style={{
            width: "100%",
            overflow: "auto",
          }}
        />
      </Card>

      <Modal
        title="Xác nhận hủy đợt khám"
        open={confirmDeleteModal}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteModal(false)}
        confirmLoading={loading}
      >
        <p>
          Bạn có chắc chắn muốn hủy đợt khám{" "}
          <strong>{selectedCampaign?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default HealthCheckCampaignList;
