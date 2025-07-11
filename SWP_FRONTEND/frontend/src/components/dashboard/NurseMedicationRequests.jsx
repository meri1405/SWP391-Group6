import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  message,
  Descriptions,
  Divider,
  Tooltip,
  Typography,
  Image,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { nurseApi } from "../../api/nurseApi";
import "../../styles/NurseMedicationComponents.css";

const { TextArea } = Input;
const { Title, Text } = Typography;

const NurseMedicationRequests = () => {
  const [loading, setLoading] = useState(false);
  const [medicationRequests, setMedicationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [approveCustomMessage, setApproveCustomMessage] = useState("");
  const [rejectCustomMessage, setRejectCustomMessage] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectionLoading, setRejectionLoading] = useState(false);

  // Image preview states
  const [imageLoading, setImageLoading] = useState({});

  // Medication schedules states
  const [medicationSchedules, setMedicationSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleDetailModalVisible, setScheduleDetailModalVisible] =
    useState(false);

  // Expand/collapse states for medication groups
  const [expandedGroups, setExpandedGroups] = useState({});

  // ReactQuill configuration for custom message editor
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "color",
    "background",
  ];

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await nurseApi.getPendingMedicationRequests();
      if (response.success) {
        setMedicationRequests(response.data);
      } else {
        message.error("Không thể tải danh sách yêu cầu thuốc");
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      message.error("Không thể tải danh sách yêu cầu thuốc");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch medication schedules from API
  const fetchMedicationSchedules = useCallback(async () => {
    try {
      setScheduleLoading(true);
      // Get all schedules using the new API endpoint
      const response = await nurseApi.getAllMedicationSchedules();

      if (response.success) {
        console.log("Medication schedules from API:", response.data);

        // Ensure data is an array and has the expected structure
        const schedulesData = Array.isArray(response.data) ? response.data : [];

        // Map the data to ensure consistent structure
        const mappedSchedules = schedulesData.map((schedule) => ({
          id: schedule.id,
          studentName: schedule.studentName || schedule.student?.name || "N/A",
          className: schedule.className || schedule.student?.className || "N/A",
          medicationName: schedule.medicationName || "N/A",
          dosage: schedule.dosage ? `${schedule.dosage} ${schedule.unit || "đơn vị"}` : "N/A",
          frequency: schedule.frequency || 1,
          scheduleTimes: schedule.scheduledTime
            ? [schedule.scheduledTime]
            : Array.isArray(schedule.scheduleTimes)
            ? schedule.scheduleTimes
            : schedule.times
            ? schedule.times.split(",")
            : ["N/A"],
          startDate:
            schedule.scheduledDate || schedule.startDate || schedule.start_date,
          endDate:
            schedule.endDate || schedule.end_date || schedule.scheduledDate,
          status: schedule.status || "PENDING",
          parentNote: schedule.parentNote || schedule.parent_note || "",
          nurseNote: schedule.nurseNote || schedule.nurse_note || "",
          approvedBy: schedule.nurseName || schedule.approved_by || "",
          approvedDate:
            schedule.administeredTime || schedule.approved_date || "",
          itemRequestId: schedule.itemRequestId,
          nurseId: schedule.nurseId,
          ...schedule, // Keep any additional fields
        }));

        setMedicationSchedules(mappedSchedules);

        // Hiển thị thông báo nếu có message (như trường hợp 401)
        if (response.message && schedulesData.length === 0) {
          message.warning(response.message);
        }
      } else {
        console.error(
          "Failed to fetch medication schedules:",
          response.message
        );
        message.error(
          response.message || "Không thể tải danh sách lịch uống thuốc"
        );
        setMedicationSchedules([]);
      }
    } catch (error) {
      console.error("Error fetching medication schedules:", error);
      message.error("Không thể tải danh sách lịch uống thuốc");
      setMedicationSchedules([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingRequests();
    fetchMedicationSchedules();
  }, [fetchPendingRequests, fetchMedicationSchedules]);
  const handleApprove = async () => {
    try {
      setApprovalLoading(true);
      console.log("Approving medication request:", selectedRequest.id);

      const response = await nurseApi.approveMedicationRequest(
        selectedRequest.id,
        approveNote.trim(),
        approveCustomMessage.trim()
      );

      console.log("Approve response:", response);

      if (response.success) {
        message.success(
          response.message || "Đã duyệt yêu cầu thuốc thành công"
        );

        // Update local state
        setMedicationRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );

        setApproveModalVisible(false);
        setSelectedRequest(null);
        setApproveNote("");
        setApproveCustomMessage("");
      } else {
        message.error(response.message || "Có lỗi xảy ra khi duyệt yêu cầu");
      }
    } catch (error) {
      console.error("Error approving request:", error);

      // Xử lý lỗi chi tiết
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);

        if (error.response.status === 401) {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        } else if (error.response.status === 403) {
          message.error("Bạn không có quyền thực hiện hành động này.");
        } else if (error.response.status === 404) {
          message.error("Không tìm thấy yêu cầu thuốc này.");
        } else {
          message.error(
            error.response.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu"
          );
        }
      } else {
        message.error("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setApprovalLoading(false);
    }
  };

  const showApproveModal = (request) => {
    setSelectedRequest(request);
    setApproveNote("");
    setApproveCustomMessage("");
    setApproveModalVisible(true);
  };
  const showRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectNote("");
    setRejectCustomMessage("");
    setRejectModalVisible(true);
  };

  // Medication schedule handlers
  const handleViewScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleDetailModalVisible(true);
  };

  const handleCloseScheduleModal = () => {
    setScheduleDetailModalVisible(false);
    setSelectedSchedule(null);
  };

  // Toggle expand/collapse for medication groups
  const toggleGroupExpansion = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      message.error("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      setRejectionLoading(true);
      const response = await nurseApi.rejectMedicationRequest(
        selectedRequest.id,
        rejectNote.trim(),
        rejectCustomMessage.trim()
      );

      if (response.success) {
        message.success(response.message || "Đã từ chối yêu cầu thuốc");

        // Update local state
        setMedicationRequests((prev) =>
          prev.filter((req) => req.id !== selectedRequest.id)
        );

        setRejectModalVisible(false);
        setSelectedRequest(null);
        setRejectNote("");
        setRejectCustomMessage("");
      } else {
        message.error("Có lỗi xảy ra khi từ chối yêu cầu");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("Có lỗi xảy ra khi từ chối yêu cầu");
    } finally {
      setRejectionLoading(false);
    }
  };

  const showDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            Chờ thực hiện
          </Tag>
        );
      case "APPROVED":
        return (
          <Tag icon={<CheckOutlined />} color="success">
            Đã duyệt
          </Tag>
        );
      case "REJECTED":
        return (
          <Tag icon={<CloseOutlined />} color="error">
            Từ chối
          </Tag>
        );
      case "TAKEN":
        return (
          <Tag icon={<CheckOutlined />} color="success">
            Đã uống thuốc
          </Tag>
        );
      case "SKIPPED":
        return (
          <Tag icon={<CloseOutlined />} color="error">
            Đã bỏ lỡ
          </Tag>
        );
      case "SCHEDULED":
        return (
          <Tag icon={<CalendarOutlined />} color="blue">
            Đã lên lịch
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Image loading functions
  const handleImageLoad = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageLoadStart = (imageId) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: true }));
  };

  // Function to render item type tag with colors
  const getItemTypeTag = (itemType) => {
    const typeConfig = {
      CREAM: { color: "red", label: "Kem" },
      DROPS: { color: "green", label: "Giọt" },
      TABLET: { color: "blue", label: "Viên" },
      SPOONFUL: { color: "cyan", label: "Thìa" },
      SPRAY: { color: "magenta", label: "Xịt" },
      CAPSULE: { color: "orange", label: "Viên nang" },
      LIQUID: { color: "purple", label: "Dung dịch" },
      INJECTION: { color: "volcano", label: "Tiêm" },
      POWDER: { color: "geekblue", label: "Bột" },
    };

    const config = typeConfig[itemType] || {
      color: "default",
      label: itemType,
    };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const columns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thời gian sử dụng",
      key: "period",
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format("DD/MM/YYYY")} -{" "}
          {dayjs(record.endDate).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Số loại thuốc",
      key: "medicationCount",
      render: (_, record) => (
        <span>{record.itemRequests?.length || 0} loại</span>
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
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>{" "}
          <Tooltip title="Duyệt yêu cầu">
            <Button
              type="link"
              icon={<CheckOutlined />}
              style={{ color: "#52c41a" }}
              onClick={() => showApproveModal(record)}
            />
          </Tooltip>
          <Tooltip title="Từ chối yêu cầu">
            <Button
              type="link"
              icon={<CloseOutlined />}
              danger
              onClick={() => showRejectModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Medication schedule columns
  const scheduleColumns = [
    {
      title: "Học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: "12px", color: "#666" }}>
            <UserOutlined style={{ marginRight: "4px" }} />
            {record.className}
          </div>
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medicationName",
      key: "medicationName",
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.dosage}</div>
        </div>
      ),
    },
    {
      title: "Thời gian uống",
      key: "scheduleTimes",
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: "4px" }}>
            <CalendarOutlined style={{ marginRight: "4px" }} />
            {record.frequency} lần/ngày
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.scheduleTimes.join(", ")}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian điều trị",
      key: "treatmentPeriod",
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            đến {dayjs(record.endDate).format("DD/MM/YYYY")}
          </div>
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
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewScheduleDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div className="nurse-medication-container">
      <Card className="nurse-medication-card">
        {" "}
        <Title level={3} className="nurse-medication-title">
          <MedicineBoxOutlined
            style={{ marginRight: "8px", color: "#1890ff" }}
          />
          Quản lý yêu cầu thuốc từ phụ huynh
        </Title>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Danh sách yêu cầu chờ xử lý ({medicationRequests.length})
          </Title>
          <Space>
            <Button onClick={fetchPendingRequests} loading={loading}>
              Làm mới
            </Button>
          </Space>
        </div>
        <Table
          className="medication-requests-table"
          dataSource={medicationRequests}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Không có yêu cầu thuốc nào chờ xử lý" }}
        />
      </Card>

      {/* Medication Schedules Section */}
      <Card className="nurse-medication-card" style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Title
            level={3}
            className="nurse-medication-title"
            style={{ margin: 0 }}
          >
            <CalendarOutlined
              style={{ marginRight: "8px", color: "#1890ff" }}
            />
            Danh sách lịch uống thuốc
          </Title>
          <Button
            onClick={fetchMedicationSchedules}
            loading={scheduleLoading}
            icon={<ClockCircleOutlined />}
          >
            Làm mới
          </Button>
        </div>

        <Tabs
          defaultActiveKey="all"
          type="card"
          items={[
            {
              key: "all",
              label: `Tất cả (${medicationSchedules.length})`,
              children: (
                <div className="medication-schedules-grouped">
                  {Object.entries(
                    medicationSchedules.reduce((groups, schedule) => {
                      const key = `${schedule.studentName}-${schedule.className}`;
                      if (!groups[key]) {
                        groups[key] = {
                          studentName: schedule.studentName,
                          className: schedule.className,
                          schedules: [],
                        };
                      }
                      groups[key].schedules.push(schedule);
                      return groups;
                    }, {})
                  ).map(([key, group]) => (
                    <Card
                      key={key}
                      className="student-medication-group"
                      style={{ marginBottom: "16px" }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>
                            <UserOutlined
                              style={{ marginRight: "8px", color: "#1890ff" }}
                            />
                            <strong>{group.studentName}</strong>
                            <span
                              style={{
                                marginLeft: "8px",
                                color: "#666",
                                fontSize: "14px",
                              }}
                            >
                              ({group.className})
                            </span>
                          </span>
                          <span style={{ fontSize: "14px", color: "#666" }}>
                            {group.schedules.length} lịch uống thuốc
                          </span>
                        </div>
                      }
                    >
                      <div className="medication-schedules-list">
                        {/* Group schedules by medication */}
                        {Object.entries(
                          group.schedules.reduce((medGroups, schedule) => {
                            const medKey = schedule.medicationName;
                            if (!medGroups[medKey]) {
                              medGroups[medKey] = {
                                medicationName: schedule.medicationName,
                                dosage: schedule.dosage,
                                frequency: schedule.frequency,
                                schedules: [],
                              };
                            }
                            medGroups[medKey].schedules.push(schedule);
                            return medGroups;
                          }, {})
                        ).map(([medKey, medGroup]) => (
                          <div
                            key={medKey}
                            className="medication-item-group"
                            style={{ marginBottom: "16px" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                                padding: "8px 12px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <div>
                                <strong style={{ color: "#1890ff" }}>
                                  {medGroup.medicationName}
                                </strong>
                                <span
                                  style={{ marginLeft: "8px", color: "#666" }}
                                >
                                  {medGroup.dosage} • {medGroup.frequency}{" "}
                                  lần/ngày
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                {medGroup.schedules.length} lịch
                                <span style={{ marginLeft: "8px" }}>
                                  (
                                  {
                                    medGroup.schedules.filter(
                                      (s) => s.status === "PENDING"
                                    ).length
                                  }{" "}
                                  chờ thực hiện)
                                </span>
                              </div>
                            </div>

                            {/* Show schedules with expand/collapse logic */}
                            <div className="schedule-items">
                              {(() => {
                                const groupKey = `${group.studentName}-${group.className}-${medGroup.medicationName}`;
                                const isExpanded = expandedGroups[groupKey];
                                const schedulesToShow = isExpanded
                                  ? medGroup.schedules
                                  : medGroup.schedules.slice(0, 3);

                                return (
                                  <>
                                    {schedulesToShow.map((schedule) => (
                                      <div
                                        key={schedule.id}
                                        className="schedule-item"
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          padding: "8px 12px",
                                          marginBottom: "4px",
                                          backgroundColor: "#fff",
                                          border: "1px solid #e8e8e8",
                                          borderRadius: "4px",
                                        }}
                                      >
                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: "13px" }}>
                                            <CalendarOutlined
                                              style={{ marginRight: "4px" }}
                                            />
                                            {dayjs(schedule.startDate).format(
                                              "DD/MM/YYYY"
                                            )}
                                            <span style={{ margin: "0 8px" }}>
                                              •
                                            </span>
                                            <ClockCircleOutlined
                                              style={{ marginRight: "4px" }}
                                            />
                                            {schedule.scheduleTimes.join(", ")}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "#666",
                                              marginTop: "2px",
                                            }}
                                          >
                                            đến{" "}
                                            {dayjs(schedule.endDate).format(
                                              "DD/MM/YYYY"
                                            )}
                                          </div>
                                        </div>

                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          {getStatusTag(schedule.status)}
                                          <Space size="small">
                                            <Tooltip title="Xem chi tiết">
                                              <Button
                                                type="text"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() =>
                                                  handleViewScheduleDetail(
                                                    schedule
                                                  )
                                                }
                                              />
                                            </Tooltip>
                                          </Space>
                                        </div>
                                      </div>
                                    ))}

                                    {/* Show expand/collapse button if there are more than 3 schedules */}
                                    {medGroup.schedules.length > 3 && (
                                      <div
                                        style={{
                                          textAlign: "center",
                                          marginTop: "8px",
                                        }}
                                      >
                                        <Button
                                          type="link"
                                          size="small"
                                          onClick={() =>
                                            toggleGroupExpansion(groupKey)
                                          }
                                        >
                                          {isExpanded
                                            ? "Thu gọn"
                                            : `Xem thêm ${
                                                medGroup.schedules.length - 3
                                              } lịch`}
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}

                  {medicationSchedules.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#666",
                      }}
                    >
                      Không có lịch uống thuốc nào
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "pending",
              label: `Chờ thực hiện (${
                medicationSchedules.filter((s) => s.status === "PENDING").length
              })`,
              children: (
                <Table
                  className="medication-schedules-table"
                  dataSource={medicationSchedules.filter(
                    (s) => s.status === "PENDING"
                  )}
                  columns={scheduleColumns}
                  rowKey="id"
                  loading={scheduleLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: "Không có lịch uống thuốc nào chờ thực hiện",
                  }}
                />
              ),
            },
            {
              key: "taken",
              label: `Đã uống thuốc (${
                medicationSchedules.filter((s) => s.status === "TAKEN").length
              })`,
              children: (
                <Table
                  className="medication-schedules-table"
                  dataSource={medicationSchedules.filter(
                    (s) => s.status === "TAKEN"
                  )}
                  columns={scheduleColumns}
                  rowKey="id"
                  loading={scheduleLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: "Không có lịch uống thuốc nào đã hoàn thành",
                  }}
                />
              ),
            },
            {
              key: "skipped",
              label: `Đã bỏ lỡ (${
                medicationSchedules.filter((s) => s.status === "SKIPPED").length
              })`,
              children: (
                <Table
                  className="medication-schedules-table"
                  dataSource={medicationSchedules.filter(
                    (s) => s.status === "SKIPPED"
                  )}
                  columns={scheduleColumns}
                  rowKey="id"
                  loading={scheduleLoading}
                  pagination={{ pageSize: 10 }}
                  locale={{
                    emptyText: "Không có lịch uống thuốc nào bị bỏ lỡ",
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thuốc"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedRequest(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedRequest && (
          <div className="request-detail">
            <Descriptions
              title="Thông tin cơ bản"
              bordered
              size="small"
              column={2}
            >
              <Descriptions.Item label="Học sinh">
                {selectedRequest.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian sử dụng">
                {dayjs(selectedRequest.startDate).format("DD/MM/YYYY")} -{" "}
                {dayjs(selectedRequest.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú của phụ huynh" span={2}>
                {selectedRequest.note || "Không có ghi chú"}
              </Descriptions.Item>
            </Descriptions>

            {/* Prescription Images Display */}
            {selectedRequest.prescriptionImages &&
              selectedRequest.prescriptionImages.length > 0 && (
                <div
                  className="prescription-images-section"
                  style={{ marginTop: "16px" }}
                >
                  <h4>
                    <strong>
                      Ảnh đơn thuốc ({selectedRequest.prescriptionImages.length}
                      )
                    </strong>
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "8px",
                    }}
                  >
                    <Image.PreviewGroup>
                      {selectedRequest.prescriptionImages.map(
                        (imageUrl, index) => (
                          <div key={index} style={{ position: "relative" }}>
                            {imageLoading[`detail-${index}`] && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  zIndex: 1,
                                }}
                              >
                                <div className="ant-spin ant-spin-spinning">
                                  <span className="ant-spin-dot ant-spin-dot-spin">
                                    <i className="ant-spin-dot-item"></i>
                                    <i className="ant-spin-dot-item"></i>
                                    <i className="ant-spin-dot-item"></i>
                                    <i className="ant-spin-dot-item"></i>
                                  </span>
                                </div>
                              </div>
                            )}
                            <Image
                              src={
                                imageUrl ||
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
                              }
                              alt={`Đơn thuốc ${index + 1}`}
                              width={100}
                              height={100}
                              style={{
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #d9d9d9",
                                cursor: "pointer",
                              }}
                              onLoad={() => handleImageLoad(`detail-${index}`)}
                              onLoadStart={() =>
                                handleImageLoadStart(`detail-${index}`)
                              }
                              onError={(e) => {
                                e.target.style.border = "2px solid red";
                                handleImageLoad(`detail-${index}`);
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                left: "2px",
                                backgroundColor: "rgba(0,0,0,0.6)",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "2px",
                                fontSize: "10px",
                              }}
                            >
                              {index + 1}
                            </div>
                          </div>
                        )
                      )}
                    </Image.PreviewGroup>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    Click vào ảnh để xem kích thước đầy đủ
                  </div>
                </div>
              )}

            <Divider />

            <Title level={5}>
              Danh sách thuốc ({selectedRequest.itemRequests?.length || 0} loại)
            </Title>
            {selectedRequest.itemRequests &&
            selectedRequest.itemRequests.length > 0 ? (
              <div className="medication-items">
                {selectedRequest.itemRequests.map((item, index) => (
                  <Card
                    key={item.id || index}
                    size="small"
                    className="medication-item"
                  >
                    <div className="item-header">
                      <Title level={5}>
                        {index + 1}. {item.itemName}
                      </Title>
                      <p>
                        <strong>Loại: </strong>
                        {getItemTypeTag(item.itemType)}
                      </p>
                    </div>
                    <div className="item-details">
                      <p>
                        <strong>Mục đích:</strong> {item.purpose}
                      </p>
                      <p>
                        <strong>Liều lượng:</strong> {item.dosage} {item.unit || "đơn vị"}
                      </p>{" "}
                      <p>
                        <strong>Tần suất:</strong> {item.frequency} lần/ngày
                      </p>
                      <p>
                        <strong>Thời gian uống:</strong>{" "}
                        {(() => {
                          let scheduleTimes = [];

                          // First try to get scheduleTimes directly from the item
                          if (
                            Array.isArray(item.scheduleTimes) &&
                            item.scheduleTimes.length > 0
                          ) {
                            scheduleTimes = item.scheduleTimes;
                          }
                          // If not found, try to parse from note
                          else if (item.note) {
                            const scheduleTimeMatch = item.note.match(
                              /scheduleTimeJson:(\{[^}]+\})/
                            );
                            if (scheduleTimeMatch) {
                              try {
                                const scheduleTimeJson = JSON.parse(
                                  scheduleTimeMatch[1]
                                );
                                if (
                                  Array.isArray(scheduleTimeJson.scheduleTimes)
                                ) {
                                  scheduleTimes =
                                    scheduleTimeJson.scheduleTimes;
                                }
                              } catch (e) {
                                console.error(
                                  "Error parsing schedule times from note:",
                                  e
                                );
                              }
                            }
                          }

                          // Sort time slots for consistent display
                          scheduleTimes = scheduleTimes
                            .map((time) => dayjs(time, "HH:mm"))
                            .sort((a, b) =>
                              a.isBefore(b) ? -1 : a.isAfter(b) ? 1 : 0
                            )
                            .map((time) => time.format("HH:mm"));

                          return scheduleTimes.length > 0 ? (
                            <span className="medication-schedule-times">
                              {scheduleTimes.map((time, timeIndex) => (
                                <Tag
                                  key={timeIndex}
                                  color="blue"
                                  style={{
                                    marginRight: "4px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {time}
                                </Tag>
                              ))}
                            </span>
                          ) : (
                            <span className="no-schedule-times">
                              Chưa thiết lập
                            </span>
                          );
                        })()}
                      </p>
                      {item.note && (
                        <p>
                          <strong>Ghi chú:</strong>{" "}
                          {(() => {
                            // Show cleaned note without schedule times JSON
                            let displayNote = item.note;
                            if (displayNote) {
                              // Remove scheduleTimeJson part if exists
                              displayNote = displayNote
                                .replace(/scheduleTimeJson:.*?($|\s)/, "")
                                .trim();
                            }
                            return displayNote || "Không có ghi chú";
                          })()}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Không có thông tin thuốc</p>
            )}
          </div>
        )}{" "}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Duyệt yêu cầu thuốc"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedRequest(null);
          setApproveNote("");
          setApproveCustomMessage("");
        }}
        okText="Duyệt"
        cancelText="Hủy"
        confirmLoading={approvalLoading}
        okButtonProps={{
          style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
        }}
      >
        <p>Bạn có chắc muốn duyệt yêu cầu thuốc này không?</p>
        <p>
          <strong>Học sinh:</strong> {selectedRequest?.studentName}
        </p>
        <p>
          <strong>Ngày yêu cầu:</strong>{" "}
          {selectedRequest &&
            dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
        </p>
        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
          >
            Ghi chú của y tá khi duyệt (tùy chọn)
          </label>
          <TextArea
            rows={3}
            value={approveNote}
            onChange={(e) => setApproveNote(e.target.value)}
            placeholder="Nhập ghi chú của y tá về việc duyệt yêu cầu (nếu có)..."
            maxLength={500}
          />
          <small style={{ color: "#666" }}>
            Ghi chú này sẽ được lưu vào hồ sơ yêu cầu thuốc để theo dõi.
          </small>
        </div>

        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
          >
            Thông báo gửi phụ huynh (tùy chọn)
          </label>
          <ReactQuill
            value={approveCustomMessage}
            onChange={setApproveCustomMessage}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Nhập thông báo tùy chỉnh gửi cho phụ huynh (nếu có). Để trống sẽ gửi thông báo mặc định..."
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
            }}
            theme="snow"
          />
          <small style={{ color: "#666", marginTop: 8, display: "block" }}>
            Nếu để trống, hệ thống sẽ gửi thông báo mặc định về việc duyệt yêu
            cầu thuốc.
          </small>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu thuốc"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedRequest(null);
          setRejectNote("");
          setRejectCustomMessage("");
        }}
        okText="Từ chối"
        cancelText="Hủy"
        confirmLoading={rejectionLoading}
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn từ chối yêu cầu thuốc này không?</p>
        <p>
          <strong>Học sinh:</strong> {selectedRequest?.studentName}
        </p>
        <p>
          <strong>Ngày yêu cầu:</strong>{" "}
          {selectedRequest &&
            dayjs(selectedRequest.requestDate).format("DD/MM/YYYY")}
        </p>{" "}
        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
          >
            Ghi chú của y tá khi từ chối <span style={{ color: "red" }}>*</span>
          </label>
          <TextArea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu thuốc..."
            maxLength={500}
          />
          <small style={{ color: "#666" }}>
            Ghi chú này sẽ được lưu vào hồ sơ yêu cầu thuốc để theo dõi.
          </small>
        </div>
        <div style={{ marginTop: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}
          >
            Thông báo gửi phụ huynh (tùy chọn)
          </label>
          <ReactQuill
            value={rejectCustomMessage}
            onChange={setRejectCustomMessage}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Nhập thông báo tùy chỉnh gửi cho phụ huynh (nếu có). Để trống sẽ gửi thông báo mặc định kèm lý do từ chối..."
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
            }}
            theme="snow"
          />
          <small style={{ color: "#666", marginTop: 8, display: "block" }}>
            Nếu để trống, hệ thống sẽ gửi thông báo mặc định kèm lý do từ chối.
          </small>
        </div>
      </Modal>

      {/* Medication Schedule Detail Modal */}
      <Modal
        title="Chi tiết lịch uống thuốc"
        open={scheduleDetailModalVisible}
        onCancel={handleCloseScheduleModal}
        footer={null}
        width={700}
      >
        {selectedSchedule && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Học sinh">
                {selectedSchedule.studentName}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedSchedule.className}
              </Descriptions.Item>
              <Descriptions.Item label="Tên thuốc">
                {selectedSchedule.medicationName}
              </Descriptions.Item>
              <Descriptions.Item label="Liều dùng">
                {selectedSchedule.dosage}
              </Descriptions.Item>
              <Descriptions.Item label="Tần suất">
                {selectedSchedule.frequency} lần/ngày
              </Descriptions.Item>
              <Descriptions.Item label="Giờ uống">
                {selectedSchedule.scheduleTimes.join(", ")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {dayjs(selectedSchedule.startDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {dayjs(selectedSchedule.endDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedSchedule.status)}
              </Descriptions.Item>
              {selectedSchedule.approvedBy && (
                <Descriptions.Item label="Người duyệt">
                  {selectedSchedule.approvedBy}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Title level={4}>Ghi chú từ phụ huynh</Title>
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              <Text>{selectedSchedule.parentNote || "Không có ghi chú"}</Text>
            </div>

            {selectedSchedule.nurseNote && (
              <>
                <Title level={4}>Ghi chú từ y tá</Title>
                <div
                  style={{
                    backgroundColor: "#e6f7ff",
                    padding: "12px",
                    borderRadius: "4px",
                    marginBottom: "16px",
                  }}
                >
                  <Text>{selectedSchedule.nurseNote}</Text>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NurseMedicationRequests;
