import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Tooltip,
  message,
  Tag,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getMedicalEvents,
  createMedicalEvent,
  getMedicalEventById,
  updateMedicalEventStatus,
  getAllStudents,
} from "../../../../api/medicalEventApi";
import { medicalSupplyApi } from "../../../../api/medicalSupplyApi";
import "../../../../styles/MedicalEventManagement.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MedicalEventManagement = () => {
  // States
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterProcessed, setFilterProcessed] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [students, setStudents] = useState([]);
  const [medicalSupplies, setMedicalSupplies] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    processed: 0,
  });

  // Backend EventType enum values (từ backend)
  const eventTypes = [
    { value: "ACCIDENT", label: "Tai nạn", color: "#ff4d4f" },
    { value: "FEVER", label: "Sốt", color: "#fa8c16" },
    { value: "FALL", label: "Té ngã", color: "#faad14" },
    { value: "EPIDEMIC", label: "Dịch bệnh", color: "#722ed1" },
    { value: "OTHER_EMERGENCY", label: "Cấp cứu khác", color: "#eb2f96" },
  ];

  // Backend SeverityLevel enum values (từ backend)
  const severityLevels = [
    { value: "MILD", label: "Nhẹ", color: "#52c41a" },
    { value: "MODERATE", label: "Trung bình", color: "#faad14" },
    { value: "SEVERE", label: "Nặng", color: "#ff4d4f" },
  ];

  // Load data on component mount
  useEffect(() => {
    loadEvents();
    loadStudents();
    loadMedicalSupplies();
  }, []);

  // Filter events when search or filter changes
  useEffect(() => {
    filterEvents();
  }, [
    events,
    searchText,
    filterProcessed,
    filterType,
    filterSeverity,
    dateRange,
  ]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMedicalEvents();
      console.log("Events API Response:", response);
      const eventsData = Array.isArray(response) ? response : [];
      setEvents(eventsData);
      calculateStatistics(eventsData);
    } catch (error) {
      console.error("Error loading medical events:", error);
      message.error("Không thể tải danh sách sự kiện y tế");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const response = await getAllStudents();
      console.log("Students API Response:", response);
      // Handle different response formats
      const studentsData = response?.students || response || [];
      console.log("Processed students data:", studentsData);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      console.error("Error loading students:", error);
      message.error("Không thể tải danh sách học sinh");
    }
  }, []);

  const loadMedicalSupplies = useCallback(async () => {
    try {
      const response = await medicalSupplyApi.getAllSupplies();
      console.log("Medical Supplies API Response:", response);
      let suppliesData = Array.isArray(response) ? response : [];

      // Lọc bỏ vật tư đã hết hạn
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

      suppliesData = suppliesData.filter((supply) => {
        const expirationDate = new Date(supply.expirationDate);
        expirationDate.setHours(0, 0, 0, 0);
        return expirationDate >= today; // Chỉ giữ lại vật tư chưa hết hạn
      });

      // Sắp xếp vật tư y tế theo ngày hết hạn
      suppliesData = suppliesData.sort((a, b) => {
        const dateA = new Date(a.expirationDate);
        const dateB = new Date(b.expirationDate);

        // Nếu tên thuốc giống nhau, ưu tiên cái gần hết hạn hơn
        if (a.name === b.name) {
          return dateA - dateB; // Gần hết hạn nhất lên đầu
        }

        // Nếu tên khác nhau, vẫn sắp xếp theo ngày hết hạn (gần nhất đến xa nhất)
        return dateA - dateB;
      });

      console.log(
        "Filtered and sorted medical supplies (excluding expired):",
        suppliesData
      );
      setMedicalSupplies(suppliesData);
    } catch (error) {
      console.error("Error loading medical supplies:", error);
      message.error("Không thể tải danh sách vật tư y tế");
    }
  }, []);

  const calculateStatistics = (eventData) => {
    const total = eventData.length;
    const pending = eventData.filter((event) => !event.processed).length;
    const processed = eventData.filter((event) => event.processed).length;

    setStatistics({
      total,
      pending,
      processed,
    });
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (event) =>
          `${event.student?.firstName} ${event.student?.lastName}`
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchText.toLowerCase()) ||
          event.symptoms?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Processed status filter
    if (filterProcessed !== "all") {
      filtered = filtered.filter((event) => {
        if (filterProcessed === "pending") return !event.processed;
        if (filterProcessed === "processed") return event.processed;
        return true;
      });
    }

    // Event type filter
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.eventType === filterType);
    }

    // Severity filter
    if (filterSeverity !== "all") {
      filtered = filtered.filter(
        (event) => event.severityLevel === filterSeverity
      );
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      filtered = filtered.filter((event) => {
        const eventDate = dayjs(event.occurrenceTime);
        return (
          eventDate.isAfter(dateRange[0]) && eventDate.isBefore(dateRange[1])
        );
      });
    }

    setFilteredEvents(filtered);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalVisible(true);
    // Reset form after modal is opened to avoid the warning
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const handleViewEvent = async (eventId) => {
    try {
      const event = await getMedicalEventById(eventId);
      setSelectedEvent(event);
      setViewModalVisible(true);
    } catch (error) {
      console.error("Error loading event details:", error);
      message.error("Không thể tải chi tiết sự kiện");
    }
  };

  const handleProcessEvent = async (eventId) => {
    try {
      setLoading(true);
      // Backend endpoint /process chỉ cần eventId, không cần status parameter
      await updateMedicalEventStatus(eventId);
      message.success("Đã đánh dấu sự kiện là đã xử lý");
      loadEvents();
    } catch (error) {
      console.error("Error processing event:", error);
      message.error("Không thể cập nhật trạng thái sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format suppliesUsed data according to backend DTO
      const suppliesUsed = values.suppliesUsed || [];
      const formattedSuppliesUsed = suppliesUsed.map((supply) => ({
        medicalSupplyId: parseInt(supply.medicalSupplyId),
        quantityUsed: parseInt(supply.quantityUsed),
      }));

      // Format data according to backend DTO
      const eventData = {
        eventType: values.eventType,
        occurrenceTime: values.occurrenceTime.toISOString(),
        location: values.location,
        symptoms: values.symptoms || "",
        severityLevel: values.severityLevel,
        firstAidActions: values.firstAidActions || "",
        studentId: parseInt(values.studentId),
        suppliesUsed: formattedSuppliesUsed,
      };

      console.log("Sending event data:", eventData);

      // Create new event
      const response = await createMedicalEvent(eventData);
      console.log("Create event response:", response);

      message.success("Đã thêm sự kiện mới thành công");
      setModalVisible(false);
      form.resetFields();
      loadEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      message.error("Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type) => {
    return eventTypes.find((t) => t.value === type) || eventTypes[0];
  };

  const getSeverityConfig = (severity) => {
    return (
      severityLevels.find((s) => s.value === severity) || severityLevels[0]
    );
  };

  const getSupplyName = (supplyId, supplyObject = null) => {
    console.log("Debug getSupplyName:", {
      supplyId,
      supplyObject,
      medicalSupplies,
    });

    // Ưu tiên sử dụng thông tin từ backend response trước
    if (supplyObject?.medicalSupply?.name) {
      console.log("Using backend supply info:", supplyObject.medicalSupply);
      return {
        name: supplyObject.medicalSupply.name,
        unit: supplyObject.medicalSupply.unit || "",
      };
    }

    // Tìm từ danh sách medicalSupplies
    const supplyInfo = medicalSupplies.find((s) => s.id === supplyId);
    if (supplyInfo) {
      console.log("Using supply info:", supplyInfo);
      return {
        name: supplyInfo.name,
        unit: supplyInfo.unit,
      };
    }

    // Fallback
    console.log("Using fallback for supply ID:", supplyId);
    return {
      name: `Vật tư ID: ${supplyId}`,
      unit: "",
    };
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (text) => <Text strong>#{text}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "occurrenceTime",
      key: "occurrenceTime",
      width: 140,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Học sinh",
      key: "student",
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong>
            {record.student?.firstName} {record.student?.lastName}
          </Text>
          <br />
          <Text type="secondary">{record.student?.className}</Text>
        </div>
      ),
    },
    {
      title: "Loại sự kiện",
      dataIndex: "eventType",
      key: "eventType",
      width: 140,
      render: (type) => {
        const config = getEventTypeConfig(type);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severityLevel",
      key: "severityLevel",
      width: 120,
      render: (severity) => {
        const config = getSeverityConfig(severity);
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "processed",
      key: "processed",
      width: 120,
      render: (processed, record) => (
        <div>
          <Tag color={processed ? "green" : "orange"}>
            {processed ? "Đã xử lý" : "Chờ xử lý"}
          </Tag>
          {processed && record.processedTime && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {dayjs(record.processedTime).format("DD/MM HH:mm")}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewEvent(record.id)}
              size="small"
            />
          </Tooltip>
          {!record.processed && (
            <Popconfirm
              title="Đánh dấu đã xử lý?"
              description="Bạn có chắc chắn muốn đánh dấu sự kiện này là đã xử lý?"
              onConfirm={() => handleProcessEvent(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Tooltip title="Đánh dấu đã xử lý">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ color: "#52c41a" }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="medical-event-management">
      {/* Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số sự kiện"
              value={statistics.total}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.pending}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã xử lý"
              value={statistics.processed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="header-section">
          <Title level={3}>
            <MedicineBoxOutlined /> Quản lý sự kiện y tế
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddEvent}
          >
            Thêm sự kiện y tế
          </Button>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tìm kiếm học sinh, địa điểm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={filterProcessed}
                onChange={setFilterProcessed}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả</Option>
                <Option value="pending">Chờ xử lý</Option>
                <Option value="processed">Đã xử lý</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Loại sự kiện"
                value={filterType}
                onChange={setFilterType}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả loại</Option>
                {eventTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Mức độ"
                value={filterSeverity}
                onChange={setFilterSeverity}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả mức độ</Option>
                {severityLevels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={setDateRange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
          </Row>
        </div>

        {/* Events Table */}
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredEvents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sự kiện`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add Event Modal */}
      <Modal
        title="Thêm sự kiện y tế mới"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
        }}
        width={800}
        confirmLoading={loading}
        destroyOnClose
        forceRender
        className="event-modal"
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="occurrenceTime"
                label="Thời gian xảy ra"
                rules={[{ required: true, message: "Vui lòng chọn thời gian" }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="studentId"
                label="Học sinh"
                rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
              >
                <Select
                  placeholder="Chọn học sinh"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {Array.isArray(students) &&
                    students.map((student) => (
                      <Option
                        key={student.studentID || student.id}
                        value={student.studentID || student.id}
                      >
                        {student.firstName} {student.lastName} -{" "}
                        {student.className}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="eventType"
                label="Loại sự kiện"
                rules={[
                  { required: true, message: "Vui lòng chọn loại sự kiện" },
                ]}
              >
                <Select placeholder="Chọn loại sự kiện">
                  {eventTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="severityLevel"
                label="Mức độ nghiêm trọng"
                rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
              >
                <Select placeholder="Chọn mức độ">
                  {severityLevels.map((level) => (
                    <Option key={level.value} value={level.value}>
                      <Tag color={level.color}>{level.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="location"
                label="Địa điểm xảy ra"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
              >
                <Input placeholder="Ví dụ: Sân trường, Phòng học 101..." />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="symptoms" label="Triệu chứng">
                <TextArea
                  rows={3}
                  placeholder="Mô tả các triệu chứng của học sinh..."
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="firstAidActions" label="Xử lý ban đầu">
                <TextArea
                  rows={3}
                  placeholder="Mô tả các biện pháp xử lý, sơ cứu đã thực hiện..."
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="suppliesUsed" label="Vật tư y tế đã sử dụng">
                <Form.List name="suppliesUsed">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <div
                          key={key}
                          style={{ display: "flex", marginBottom: 8, gap: 8 }}
                        >
                          <Form.Item
                            {...restField}
                            name={[name, "medicalSupplyId"]}
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "Chọn vật tư" }]}
                          >
                            <Select placeholder="Chọn vật tư y tế">
                              {medicalSupplies.map((supply) => {
                                const expirationDate = dayjs(
                                  supply.expirationDate
                                );
                                const today = dayjs();
                                const daysUntilExpiry = expirationDate.diff(
                                  today,
                                  "day"
                                );

                                // Xác định trạng thái hết hạn (chỉ cho vật tư chưa hết hạn)
                                let expiryStatus = "";
                                let expiryColor = "";

                                if (daysUntilExpiry <= 30) {
                                  expiryStatus = `(Còn ${daysUntilExpiry} ngày)`;
                                  expiryColor = "#faad14";
                                } else if (daysUntilExpiry <= 90) {
                                  expiryStatus = `(Còn ${daysUntilExpiry} ngày)`;
                                  expiryColor = "#1890ff";
                                }

                                return (
                                  <Option key={supply.id} value={supply.id}>
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span>
                                        {supply.name} - Còn:{" "}
                                        {supply.quantity ||
                                          supply.availableQuantity ||
                                          0}{" "}
                                        {supply.unit}
                                      </span>
                                      {expiryStatus && (
                                        <span
                                          style={{
                                            color: expiryColor,
                                            fontSize: "12px",
                                            marginLeft: "8px",
                                          }}
                                        >
                                          {expiryStatus}
                                        </span>
                                      )}
                                    </div>
                                  </Option>
                                );
                              })}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "quantityUsed"]}
                            style={{ width: 120 }}
                            rules={[
                              { required: true, message: "Nhập số lượng" },
                            ]}
                          >
                            <Input
                              type="number"
                              placeholder="Số lượng"
                              min={1}
                            />
                          </Form.Item>
                          <Button
                            type="text"
                            danger
                            onClick={() => remove(name)}
                            style={{ marginTop: 4 }}
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                      <Button type="dashed" onClick={() => add()} block>
                        + Thêm vật tư y tế
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Event Details Modal */}
      <Modal
        title="Chi tiết sự kiện y tế"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedEvent && (
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>ID sự kiện:</Text> #{selectedEvent.id}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Thời gian:</Text>{" "}
                {dayjs(selectedEvent.occurrenceTime).format("DD/MM/YYYY HH:mm")}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Học sinh:</Text> {selectedEvent.student?.firstName}{" "}
                {selectedEvent.student?.lastName}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Lớp:</Text> {selectedEvent.student?.className}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Loại sự kiện:</Text>{" "}
                <Tag color={getEventTypeConfig(selectedEvent.eventType).color}>
                  {getEventTypeConfig(selectedEvent.eventType).label}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Mức độ:</Text>{" "}
                <Tag
                  color={getSeverityConfig(selectedEvent.severityLevel).color}
                >
                  {getSeverityConfig(selectedEvent.severityLevel).label}
                </Tag>
              </Col>
              <Col xs={24}>
                <Text strong>Địa điểm:</Text> {selectedEvent.location}
              </Col>
              <Col xs={24}>
                <Text strong>Triệu chứng:</Text>{" "}
                {selectedEvent.symptoms || "Không có"}
              </Col>
              <Col xs={24}>
                <Text strong>Xử lý ban đầu:</Text>{" "}
                {selectedEvent.firstAidActions || "Không có"}
              </Col>
              <Col xs={24}>
                <Text strong>Trạng thái:</Text>{" "}
                <Tag color={selectedEvent.processed ? "green" : "orange"}>
                  {selectedEvent.processed ? "Đã xử lý" : "Chờ xử lý"}
                </Tag>
              </Col>
              {selectedEvent.processed && (
                <>
                  <Col xs={24} sm={12}>
                    <Text strong>Thời gian xử lý:</Text>{" "}
                    {dayjs(selectedEvent.processedTime).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Col>
                  <Col xs={24} sm={12}>
                    <Text strong>Người xử lý:</Text>{" "}
                    {selectedEvent.processedBy?.fullName}
                  </Col>
                </>
              )}
              <Col xs={24} sm={12}>
                <Text strong>Người tạo:</Text>{" "}
                {selectedEvent.createdBy?.fullName}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Ngày tạo:</Text>{" "}
                {dayjs(selectedEvent.createdAt).format("DD/MM/YYYY HH:mm")}
              </Col>
              {selectedEvent.suppliesUsed &&
                selectedEvent.suppliesUsed.length > 0 && (
                  <Col xs={24}>
                    <Text strong>Vật tư y tế đã sử dụng:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedEvent.suppliesUsed.map((supply, index) => {
                        const supplyInfo = getSupplyName(
                          supply.medicalSupplyId,
                          supply
                        );

                        return (
                          <div key={index} style={{ marginBottom: 4 }}>
                            <Text>
                              • {supplyInfo.name} - Số lượng:{" "}
                              {supply.quantityUsed}
                              {supplyInfo.unit && ` ${supplyInfo.unit}`}
                            </Text>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalEventManagement;
