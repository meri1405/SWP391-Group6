import React, { useState, useEffect, useCallback, useRef } from "react";
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
  AutoComplete,
  message,
  Tag,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  AlertOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  BugOutlined,
  FireOutlined,
  CarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllStudents } from "../../api/medicalEventApi";
import "../../styles/MedicalEventManagement.css";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const MedicalEventManagement = () => {
  // States
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    urgent: 0,
  });

  // Ref to prevent duplicate API calls
  const studentsLoadedRef = useRef(false);

  // Event Types with icons and colors
  const eventTypes = [
    {
      value: "accident",
      label: "Tai nạn",
      icon: <CarOutlined />,
      color: "#ff4d4f",
    },
    {
      value: "illness",
      label: "Bệnh tật",
      icon: <BugOutlined />,
      color: "#faad14",
    },
    { value: "fever", label: "Sốt", icon: <FireOutlined />, color: "#fa8c16" },
    {
      value: "injury",
      label: "Chấn thương",
      icon: <ThunderboltOutlined />,
      color: "#f50",
    },
    {
      value: "allergy",
      label: "Dị ứng",
      icon: <ExclamationCircleOutlined />,
      color: "#722ed1",
    },
    {
      value: "poisoning",
      label: "Ngộ độc",
      icon: <AlertOutlined />,
      color: "#eb2f96",
    },
    {
      value: "emergency",
      label: "Cấp cứu",
      icon: <HeartOutlined />,
      color: "#ff0000",
    },
    {
      value: "checkup",
      label: "Khám định kỳ",
      icon: <SafetyOutlined />,
      color: "#52c41a",
    },
  ];

  // Status options
  const statusOptions = [
    { value: "pending", label: "Chờ xử lý", color: "#faad14" },
    { value: "in-progress", label: "Đang xử lý", color: "#1890ff" },
    { value: "completed", label: "Hoàn thành", color: "#52c41a" },
    { value: "follow-up", label: "Theo dõi", color: "#722ed1" },
    { value: "referred", label: "Chuyển viện", color: "#fa541c" },
  ];

  // Severity levels
  const severityLevels = [
    { value: 1, label: "Nhẹ", color: "#52c41a" },
    { value: 2, label: "Trung bình", color: "#faad14" },
    { value: 3, label: "Nặng", color: "#fa541c" },
    { value: 4, label: "Rất nặng", color: "#f50" },
    { value: 5, label: "Nguy kịch", color: "#ff0000" },
  ];

  // Mock data for demonstration - UPDATED TO USE REAL STUDENTS FROM DATABASE
  const mockEvents = [
    {
      id: "EV001",
      eventCode: "EV001",
      timestamp: "2024-03-15T09:30:00",
      studentId: 1, // Real student ID from database
      studentName: "Lý Ngọc Lily", // Real student name from database
      studentClass: "3B", // Real class from database
      eventType: "injury",
      severity: 2,
      description: "Học sinh té ngã ở sân trường, bị trầy xước đầu gối",
      initialTreatment: "Sơ cứu, rửa vết thương, băng bó",
      status: "completed",
      location: "Sân trường",
      symptoms: ["Trầy xước", "Đau đầu gối"],
      vitals: {
        temperature: 36.5,
        heartRate: 85,
        bloodPressure: "120/80",
      },
      treatmentHistory: [
        {
          timestamp: "2024-03-15T09:35:00",
          action: "Sơ cứu ban đầu",
          notes: "Rửa vết thương bằng nước muối sinh lý",
        },
        {
          timestamp: "2024-03-15T09:45:00",
          action: "Băng bó",
          notes: "Băng bó vết thương và hướng dẫn chăm sóc",
        },
      ],
      followUp: {
        required: true,
        date: "2024-03-17T14:00:00",
        notes: "Kiểm tra lại vết thương sau 2 ngày",
      },
      parentNotified: true,
      documentsAttached: ["photo1.jpg", "report1.pdf"],
      createdBy: "nurse_001",
      updatedAt: "2024-03-15T10:00:00",
    },
    {
      id: "EV002",
      eventCode: "EV002",
      timestamp: "2024-03-15T11:15:00",
      studentId: 2, // Real student ID from database
      studentName: "Lý Tiểu Long", // Real student name from database
      studentClass: "3B", // Real class from database
      eventType: "fever",
      severity: 3,
      description: "Học sinh sốt cao, đau đầu, mệt mỏi",
      initialTreatment: "Đo nhiệt độ, cho nghỉ ngơi, thông báo phụ huynh",
      status: "in-progress",
      location: "Phòng y tế",
      symptoms: ["Sốt cao", "Đau đầu", "Mệt mỏi", "Buồn nôn"],
      vitals: {
        temperature: 38.5,
        heartRate: 95,
        bloodPressure: "110/70",
      },
      treatmentHistory: [
        {
          timestamp: "2024-03-15T11:20:00",
          action: "Đo nhiệt độ",
          notes: "Nhiệt độ 38.5°C",
        },
        {
          timestamp: "2024-03-15T11:25:00",
          action: "Cho nghỉ ngơi",
          notes: "Học sinh nằm nghỉ tại phòng y tế",
        },
      ],
      followUp: {
        required: true,
        date: "2024-03-15T15:00:00",
        notes: "Theo dõi nhiệt độ mỗi 2 giờ",
      },
      parentNotified: true,
      documentsAttached: [],
      createdBy: "nurse_001",
      updatedAt: "2024-03-15T11:30:00",
    },
  ];

  const mockStudents = [
    { id: "ST001", name: "Nguyễn Văn An", class: "3A", phone: "0123456789" },
    { id: "ST002", name: "Trần Thị Lan", class: "5B", phone: "0123456788" },
    { id: "ST003", name: "Lê Văn Minh", class: "2A", phone: "0123456787" },
    { id: "ST004", name: "Phạm Thị Mai", class: "4C", phone: "0123456786" },
    { id: "ST005", name: "Hoàng Văn Nam", class: "1A", phone: "0123456785" },
    { id: "ST006", name: "Võ Thị Hoa", class: "5A", phone: "0123456784" },
  ];

  // Initialize data
  useEffect(() => {
    loadEvents();
    loadStudents();
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      calculateStatistics(mockEvents);
    } catch (error) {
      message.error("Không thể tải dữ liệu sự kiện");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    // Prevent duplicate API calls
    if (studentsLoadedRef.current) {
      console.log("Students already loaded, skipping...");
      return;
    }

    try {
      console.log("Starting to load students...");
      studentsLoadedRef.current = true; // Set flag before API call

      const response = await getAllStudents();
      console.log("Raw API response:", response);

      // Handle different response formats
      const studentsData = Array.isArray(response)
        ? response
        : response.students || response.data || [];

      if (studentsData.length > 0) {
        console.log(
          "Successfully loaded",
          studentsData.length,
          "students from API"
        );
        setStudents(studentsData);
        message.success(`Đã tải ${studentsData.length} học sinh từ database`);
      } else {
        console.log("API returned empty data, using mock data");
        setStudents(mockStudents);
        message.warning("Database trống, sử dụng dữ liệu mẫu");
      }
    } catch (error) {
      console.error("Error loading students:", error);

      // Check specific error types
      if (error.message.includes("401")) {
        message.error(
          "Không có quyền truy cập dữ liệu học sinh. Đang sử dụng dữ liệu mẫu."
        );
      } else if (error.message.includes("404")) {
        message.warning("API chưa được triển khai. Đang sử dụng dữ liệu mẫu.");
      } else {
        message.warning(
          "Không thể kết nối database. Đang sử dụng dữ liệu mẫu."
        );
      }

      // Always fallback to mock data
      console.log("Using mock data as fallback");
      setStudents(mockStudents);
    }
  }, []);

  const calculateStatistics = (eventData) => {
    const stats = {
      total: eventData.length,
      inProgress: eventData.filter((e) => e.status === "in-progress").length,
      completed: eventData.filter((e) => e.status === "completed").length,
      urgent: eventData.filter((e) => e.severity >= 4).length,
    };
    setStatistics(stats);
  };

  // Filter and search functionality
  useEffect(() => {
    filterEvents();
  }, [events, searchText, filterStatus, filterType, dateRange]);

  const filterEvents = () => {
    let filtered = [...events];

    // Text search
    if (searchText) {
      filtered = filtered.filter(
        (event) =>
          event.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
          event.eventCode.toLowerCase().includes(searchText.toLowerCase()) ||
          event.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((event) => event.status === filterStatus);
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.eventType === filterType);
    }

    // Date range filter
    if (dateRange.length === 2) {
      filtered = filtered.filter((event) => {
        const eventDate = dayjs(event.timestamp);
        return (
          eventDate.isAfter(dateRange[0]) && eventDate.isBefore(dateRange[1])
        );
      });
    }

    setFilteredEvents(filtered);
  };

  const handleAddEvent = () => {
    form.resetFields();
    setSelectedEvent(null);
    setModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    form.setFieldsValue({
      ...event,
      timestamp: dayjs(event.timestamp),
      studentId: event.studentId,
      symptoms: event.symptoms,
    });
    setModalVisible(true);
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, status: newStatus } : event
      );

      setEvents(updatedEvents);

      const statusText = newStatus === "completed" ? "đã xử lý" : "chưa xử lý";
      message.success(`Đã cập nhật trạng thái sự kiện thành "${statusText}"`);
    } catch (error) {
      message.error("Không thể cập nhật trạng thái sự kiện");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const eventData = {
        ...values,
        id: selectedEvent ? selectedEvent.id : `EV${Date.now()}`,
        eventCode: selectedEvent
          ? selectedEvent.eventCode
          : `EV${String(events.length + 1).padStart(3, "0")}`,
        timestamp: values.timestamp.toISOString(),
        createdBy: "current_nurse",
        updatedAt: new Date().toISOString(),
        treatmentHistory: selectedEvent ? selectedEvent.treatmentHistory : [],
        parentNotified: false,
        documentsAttached: [],
      };

      if (selectedEvent) {
        // Update existing event
        const updatedEvents = events.map((e) =>
          e.id === selectedEvent.id ? eventData : e
        );
        setEvents(updatedEvents);
        message.success("Đã cập nhật sự kiện thành công");
      } else {
        // Add new event
        setEvents([eventData, ...events]);
        message.success("Đã thêm sự kiện mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu sự kiện");
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeConfig = (type) => {
    return eventTypes.find((t) => t.value === type) || eventTypes[0];
  };

  const getStatusConfig = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  const getSeverityConfig = (severity) => {
    return (
      severityLevels.find((s) => s.value === severity) || severityLevels[0]
    );
  };

  // Table columns for events
  const columns = [
    {
      title: "Mã sự kiện",
      dataIndex: "eventCode",
      key: "eventCode",
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 140,
      render: (text) => dayjs(text).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Học sinh",
      key: "student",
      width: 180,
      render: (_, record) => (
        <div>
          <Text strong>{record.studentName}</Text>
          <br />
          <Text type="secondary">{record.studentClass}</Text>
        </div>
      ),
    },
    {
      title: "Loại sự kiện",
      dataIndex: "eventType",
      key: "eventType",
      width: 120,
      align: "center",
      render: (type) => {
        const config = getEventTypeConfig(type);
        return (
          <Text
            style={{
              color: config.color,
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {config.label}
          </Text>
        );
      },
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      width: 120,
      align: "center",
      render: (severity) => {
        const getSeverityDisplay = (level) => {
          if (level >= 4) {
            return { color: "#dc143c", label: "Nặng" }; // Đỏ đô
          } else if (level >= 2) {
            return { color: "#ffd700", label: "Trung bình" }; // Vàng
          } else {
            return { color: "#1890ff", label: "Nhẹ" }; // Xanh dương
          }
        };

        const display = getSeverityDisplay(severity);
        return (
          <Text
            style={{
              color: display.color,
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {display.label}
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => {
        return (
          <Text
            style={{
              color: "#1890ff",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            Đang xử lý
          </Text>
        );
      },
    },
    {
      title: "Mô tả tình trạng",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <Text
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "13px",
              lineHeight: "1.4",
            }}
          >
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => {
        const isProcessed = record.status === "completed";

        return (
          <Button
            size="small"
            type={isProcessed ? "default" : "primary"}
            style={{
              backgroundColor: isProcessed ? "#f6ffed" : "#ff4d4f",
              borderColor: isProcessed ? "#b7eb8f" : "#ff4d4f",
              color: isProcessed ? "#52c41a" : "#fff",
              fontWeight: "bold",
              minWidth: "100px",
            }}
            onClick={() => {
              const newStatus = isProcessed ? "in-progress" : "completed";
              handleUpdateEventStatus(record.id, newStatus);
            }}
          >
            {isProcessed ? "Đã xử lý" : "Chưa xử lý"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="medical-event-management">
      {/* Header Statistics */}
      <Row gutter={[16, 16]} className="statistics-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số sự kiện"
              value={statistics.total}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={statistics.inProgress}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics.completed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cấp cứu"
              value={statistics.urgent}
              prefix={<AlertOutlined style={{ color: "#f50" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="main-content-card">
        <div className="header-section">
          <Title level={3}>
            <MedicineBoxOutlined /> Ghi nhận và xử lý sự kiện y tế
          </Title>

          {/* Action Buttons */}
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEvent}
            >
              Thêm sự kiện y tế
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo tên học sinh, mã sự kiện..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Trạng thái"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: "100%" }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                {statusOptions.map((status) => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
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
                    {type.icon} {type.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
          className="events-table"
        />
      </Card>

      {/* Add/Edit Event Modal */}
      <Modal
        title={
          selectedEvent ? "Chỉnh sửa sự kiện y tế" : "Thêm sự kiện y tế mới"
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        confirmLoading={loading}
        className="event-modal"
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="timestamp"
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
                <AutoComplete
                  options={students.map((student) => ({
                    value: student.studentID || student.id,
                    label: `${student.firstName} ${student.lastName} - ${student.className}`,
                  }))}
                  placeholder="Tìm và chọn học sinh"
                  filterOption={(inputValue, option) =>
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                />
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
                      {type.icon} {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="severity"
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
            <Col xs={24} sm={12}>
              <Form.Item
                name="location"
                label="Địa điểm xảy ra"
                rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
              >
                <Input placeholder="Ví dụ: Sân trường, Phòng học 101..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  {statusOptions.map((status) => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Mô tả chi tiết"
                rules={[{ required: true, message: "Vui lòng mô tả sự kiện" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả chi tiết về sự kiện, triệu chứng, hoàn cảnh xảy ra..."
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="initialTreatment"
                label="Xử lý ban đầu"
                rules={[
                  { required: true, message: "Vui lòng mô tả cách xử lý" },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Mô tả các biện pháp xử lý, sơ cứu đã thực hiện..."
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="temperature" label="Nhiệt độ (°C)">
                <Input placeholder="36.5" type="number" step="0.1" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="heartRate" label="Nhịp tim (lần/phút)">
                <Input placeholder="85" type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="bloodPressure" label="Huyết áp">
                <Input placeholder="120/80" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="symptoms" label="Triệu chứng">
                <Select
                  mode="tags"
                  placeholder="Nhập và chọn các triệu chứng"
                  options={[
                    { value: "Đau đầu", label: "Đau đầu" },
                    { value: "Sốt", label: "Sốt" },
                    { value: "Buồn nôn", label: "Buồn nôn" },
                    { value: "Chóng mặt", label: "Chóng mặt" },
                    { value: "Đau bụng", label: "Đau bụng" },
                    { value: "Khó thở", label: "Khó thở" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicalEventManagement;
