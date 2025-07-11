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
import {
  healthCheckApi,
  CAMPAIGN_STATUS_LABELS,
} from "../../../api/healthCheckApi";

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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`,
  });

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, dateRange, refreshTrigger]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let data;

      if (filterStatus === "ALL") {
        // Fetch campaigns created by current nurse only
        data = await healthCheckApi.getAllNurseCampaigns();
      } else {
        // Try to fetch campaigns by specific status using manager endpoint
        try {
          data = await healthCheckApi.getAllCampaignsByStatus(filterStatus);
        } catch (error) {
          // If unauthorized, fallback to nurse campaigns and filter locally
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            console.warn(
              "Unauthorized to fetch campaigns by status, falling back to nurse campaigns"
            );
            const allCampaigns = await healthCheckApi.getAllNurseCampaigns();
            data = allCampaigns.filter(
              (campaign) => campaign.status === filterStatus
            );
          } else {
            throw error;
          }
        }
      }

      // Apply date range filter if selected
      let filteredData = Array.isArray(data) ? [...data] : [];
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].startOf("day");
        const endDate = dateRange[1].endOf("day");
        filteredData = filteredData.filter((campaign) => {
          const campaignStartDate = dayjs(campaign.startDate);
          return (
            campaignStartDate.isAfter(startDate) &&
            campaignStartDate.isBefore(endDate)
          );
        });
      }

      // Sort campaigns by creation date (newest first)
      filteredData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Update campaigns state
      setCampaigns(filteredData);

      // Update pagination total
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
        current: 1, // Reset to first page when data changes
      }));
    } catch (error) {
      message.error("Không thể tải danh sách đợt khám sức khỏe");
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
        current: 1,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;

    // Note: The backend doesn't have a delete endpoint yet
    // For now, we'll just show a message that deletion is not supported
    message.warning(
      "Tính năng xóa đợt khám chưa được hỗ trợ. Vui lòng liên hệ quản lý để hủy đợt khám."
    );
    setConfirmDeleteModal(false);

    // If delete is implemented in the future, uncomment below:
    /*
    setLoading(true);
    try {
      await healthCheckApi.deleteCampaign(selectedCampaign.id);
      message.success('Đã xóa đợt khám sức khỏe');
      setConfirmDeleteModal(false);
      fetchCampaigns();
    } catch (error) {
      message.error('Không thể xóa đợt khám. Chỉ có thể xóa đợt khám ở trạng thái CHƯA DUYỆT.');
      console.error('Error deleting campaign:', error);
    } finally {
      setLoading(false);
    }
    */
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
    const label = CAMPAIGN_STATUS_LABELS[status] || status;
    switch (status) {
      case "PENDING":
        return <Tag color="orange">{label}</Tag>;
      case "APPROVED":
        return <Tag color="green">{label}</Tag>;
      case "REJECTED":
        return <Tag color="red">{label}</Tag>;
      case "IN_PROGRESS":
        return <Tag color="processing">{label}</Tag>;
      case "COMPLETED":
        return <Tag color="success">{label}</Tag>;
      case "SCHEDULED":
        return <Tag color="blue">{label}</Tag>;
      default:
        return <Tag color="default">{label}</Tag>;
    }
  };

  const columns = [
    {
      title: "Tên đợt khám",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thời gian bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      render: (date) => {
        if (!date || date === "null" || date === "undefined") {
          return "Chưa có thông tin";
        }
        const dayjsDate = dayjs(date);
        return dayjsDate.isValid()
          ? dayjsDate.format("DD/MM/YYYY")
          : "Chưa có thông tin";
      },
    },
    {
      title: "Thời gian kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => {
        if (!date || date === "null" || date === "undefined") {
          return "Chưa có thông tin";
        }
        const dayjsDate = dayjs(date);
        return dayjsDate.isValid()
          ? dayjsDate.format("DD/MM/YYYY")
          : "Chưa có thông tin";
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "action",
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
              disabled={record.status !== "PENDING"}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.status !== "PENDING"}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
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
      >
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Space>
            <Select
              defaultValue="ALL"
              style={{ width: 150 }}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Bị từ chối</Option>
              <Option value="IN_PROGRESS">Đang tiến hành</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
              <Option value="SCHEDULED">Đã lên lịch</Option>
            </Select>
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              format="DD/MM/YYYY"
            />
          </Space>
          <Button onClick={fetchCampaigns}>Làm mới</Button>
        </div>

        <Table
          columns={columns}
          dataSource={campaigns.map((campaign) => ({
            ...campaign,
            key: campaign.id,
          }))}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowClassName={(record) =>
            record.status === "CANCELED" ? "cancelled-row" : ""
          }
        />
      </Card>

      <Modal
        title="Xác nhận xóa đợt khám"
        open={confirmDeleteModal}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteModal(false)}
        confirmLoading={loading}
      >
        <p>
          Bạn có chắc chắn muốn xóa đợt khám{" "}
          <strong>{selectedCampaign?.name}</strong>?
        </p>
        <p style={{ color: "orange" }}>
          Lưu ý: Hiện tại chức năng xóa chưa được hỗ trợ bởi hệ thống backend.
        </p>
      </Modal>
    </>
  );
};

export default HealthCheckCampaignList;
