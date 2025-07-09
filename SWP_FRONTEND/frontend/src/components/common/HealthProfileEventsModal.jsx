import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Table,
  Tag,
  Typography,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Button,
  message,
  Empty,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  HistoryOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { nurseApi } from "../../api/nurseApi";
import {
  getHealthProfileEvents,
  getAllHealthProfileEvents,
  getHealthProfileEventStatistics,
  HEALTH_PROFILE_ACTION_TYPES,
  ACTION_TYPE_LABELS,
  ACTION_TYPE_COLORS,
} from "../../api/healthProfileEventApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const HealthProfileEventsModal = ({
  visible,
  onCancel,
  healthProfileId = null, // If provided, show events for specific health profile
  title = "Lịch sử thay đổi Hồ sơ Sức khỏe",
  useNurseApi = false, // Use nurse API instead of general API
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);

  // Filter states
  const [dateRange, setDateRange] = useState([]);
  const [actionTypeFilter, setActionTypeFilter] = useState("");

  // Load events when modal opens or filters change
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (healthProfileId) {
        // Load events for specific health profile using nurse API if specified
        if (useNurseApi) {
          const response = await nurseApi.getHealthProfileEvents(healthProfileId);
          if (response.success) {
            data = response.data;
          } else {
            throw new Error(response.message);
          }
        } else {
          data = await getHealthProfileEvents(healthProfileId);
        }
        setEvents(data);
        setTotalEvents(data.length);
      } else {
        // Load all events with pagination and filters
        const filterOptions = {
          page: currentPage - 1,
          size: pageSize,
          startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null,
          endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null,
          actionType: actionTypeFilter || null,
          healthProfileId: healthProfileId || null,
        };

        const response = await getAllHealthProfileEvents(filterOptions);
        setEvents(response.content || response);
        setTotalEvents(response.totalElements || response.length);
      }
    } catch (error) {
      message.error(error.message);
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setLoading(false);
    }
  }, [healthProfileId, useNurseApi, currentPage, pageSize, dateRange, actionTypeFilter]);

  const loadStatistics = useCallback(async () => {
    try {
      const statsOptions = {
        startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : null,
        endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : null,
        groupBy: "ACTION_TYPE",
      };

      const stats = await getHealthProfileEventStatistics(statsOptions);
      
      // Handle nested statistics structure from backend
      if (stats && typeof stats === 'object') {
        if (stats.byActionType) {
          // Use the byActionType nested object
          setStatistics(stats.byActionType);
        } else {
          // Fallback: try to extract action type stats directly
          const actionTypeStats = {};
          Object.entries(stats).forEach(([key, value]) => {
            // Skip metadata fields
            if (!['totalEvents', 'startDate', 'endDate'].includes(key)) {
              if (typeof value === 'number') {
                actionTypeStats[key] = value;
              } else if (typeof value === 'object' && value !== null && 'count' in value) {
                actionTypeStats[key] = value.count;
              }
            }
          });
          setStatistics(actionTypeStats);
        }
      } else {
        setStatistics({});
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
      setStatistics({});
    }
  }, [dateRange]);

  useEffect(() => {
    if (visible) {
      loadEvents();
      loadStatistics();
    }
  }, [visible, loadEvents, loadStatistics]);

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadEvents();
    loadStatistics();
  };

  const clearFilters = () => {
    setDateRange([]);
    setActionTypeFilter("");
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "modifiedAt",
      key: "modifiedAt",
      width: 150,
      render: (date) => (
        <div>
          <div>{dayjs(date).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format("HH:mm:ss")}
          </Text>
        </div>
      ),
      sorter: (a, b) => dayjs(a.modifiedAt).unix() - dayjs(b.modifiedAt).unix(),
    },
    {
      title: "Hành động",
      dataIndex: "actionType",
      key: "actionType",
      width: 120,
      render: (actionType) => (
        <Tag color={ACTION_TYPE_COLORS[actionType]}>
          {ACTION_TYPE_LABELS[actionType] || actionType}
        </Tag>
      ),
      filters: Object.values(HEALTH_PROFILE_ACTION_TYPES).map(type => ({
        text: ACTION_TYPE_LABELS[type],
        value: type,
      })),
      onFilter: (value, record) => record.actionType === value,
    },
    {
      title: "Người thực hiện",
      key: "modifiedBy",
      width: 150,
      render: (_, record) => (
        <div>
          <UserOutlined style={{ marginRight: 8 }} />
          <span>{record.modifiedByUserName}</span>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.modifiedByUser?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Trường thay đổi",
      dataIndex: "fieldChanged",
      key: "fieldChanged",
      width: 120,
      render: (field) => field ? <Tag color="blue">{field}</Tag> : "-",
    },
    {
      title: "Giá trị cũ",
      dataIndex: "oldValue",
      key: "oldValue",
      width: 150,
      render: (value) => (
        <Text style={{ fontSize: 12, wordBreak: "break-word" }}>
          {value || "-"}
        </Text>
      ),
    },
    {
      title: "Giá trị mới",
      dataIndex: "newValue",
      key: "newValue",
      width: 150,
      render: (value) => (
        <Text style={{ fontSize: 12, wordBreak: "break-word" }}>
          {value || "-"}
        </Text>
      ),
    },
  ];

  if (!healthProfileId) {
    // Add health profile ID column for general view
    columns.splice(1, 0, {
      title: "ID Hồ sơ",
      dataIndex: "healthProfileId",
      key: "healthProfileId",
      width: 100,
      render: (id) => <Text code>{id}</Text>,
    });
  }

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          {title}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="close" onClick={onCancel}>
          Đóng
        </Button>
      ]}
    >
      {/* Statistics Section */}
      {statistics && Object.keys(statistics).length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="Tổng số sự kiện"
                value={totalEvents}
                prefix={<HistoryOutlined />}
              />
            </Col>
            {Object.entries(statistics).map(([actionType, count]) => {
              // Ensure count is a number and handle various formats
              let countValue = 0;
              if (typeof count === 'number') {
                countValue = count;
              } else if (typeof count === 'object' && count !== null) {
                countValue = count.count || count.value || 0;
              } else if (typeof count === 'string' && !isNaN(count)) {
                countValue = parseInt(count, 10);
              }
              
              return (
                <Col span={6} key={actionType}>
                  <Statistic
                    title={ACTION_TYPE_LABELS[actionType] || actionType}
                    value={countValue}
                    valueStyle={{ color: ACTION_TYPE_COLORS[actionType] || '#1890ff' }}
                  />
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* Filters Section */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="bottom">
          <Col span={8}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Khoảng thời gian:
              </Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                Loại hành động:
              </Text>
              <Select
                value={actionTypeFilter}
                onChange={setActionTypeFilter}
                style={{ width: "100%" }}
                placeholder="Chọn loại hành động"
                allowClear
              >
                {Object.values(HEALTH_PROFILE_ACTION_TYPES).map(type => (
                  <Option key={type} value={type}>
                    {ACTION_TYPE_LABELS[type]}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
          <Col span={10}>
            <div style={{ paddingTop: 24 }}>
              <Space>
                <Button type="primary" onClick={handleFilterChange}>
                  Lọc
                </Button>
                <Button onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
                <Button icon={<ReloadOutlined />} onClick={loadEvents}>
                  Làm mới
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Events Table */}
      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalEvents,
          onChange: setCurrentPage,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sự kiện`,
        }}
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <Empty
              description="Không có sự kiện nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    </Modal>
  );
};

export default HealthProfileEventsModal;
