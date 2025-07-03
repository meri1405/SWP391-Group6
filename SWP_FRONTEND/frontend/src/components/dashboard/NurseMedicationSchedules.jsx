import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { nurseApi } from "../../api/nurseApi";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  Table,
  Card,
  Button,
  Select,
  DatePicker,
  Space,
  Tag,
  message,
  Modal,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Badge,
  Input,
  Collapse,
  Alert,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  MedicineBoxFilled,
  AlertOutlined,
  NumberOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "../../styles/NurseMedicationComponents.css";
import "../../styles/NurseMedicationCards.css";
import "../../styles/MedicationNotes.css";

const { Title, Text } = Typography;
const { Option } = Select;

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);

const NurseMedicationSchedules = () => {
  const { refreshSession } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editNoteModalVisible, setEditNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // Function to check if schedule can be updated based on current time
  const canUpdateSchedule = (scheduledDate, scheduledTime) => {
    const now = dayjs();
    const scheduleDateTime = dayjs(
      `${scheduledDate} ${scheduledTime}`,
      "YYYY-MM-DD HH:mm"
    );

    // Allow updates only from scheduled time onwards or future dates
    // Future dates are allowed for planning purposes
    if (dayjs(scheduledDate).isAfter(now, "day")) {
      return true;
    }

    // For today's schedules, only allow updates if we've reached or passed the time slot
    if (dayjs(scheduledDate).isSame(now, "day")) {
      return now.isSameOrAfter(scheduleDateTime);
    }

    // For past dates, allow updates if we're at or past the scheduled time
    return now.isAfter(scheduleDateTime) || now.isSame(scheduleDateTime);
  };

  // Function to get time remaining until schedule time
  const getTimeUntilSchedule = (scheduledDate, scheduledTime) => {
    const now = dayjs();
    const scheduleDateTime = dayjs(
      `${scheduledDate} ${scheduledTime}`,
      "YYYY-MM-DD HH:mm"
    );

    // For future dates, return the full date and time
    if (dayjs(scheduledDate).isAfter(now, "day")) {
      return `vào ${dayjs(scheduledDate).format(
        "DD/MM/YYYY"
      )} ${scheduledTime}`;
    }

    // For today's dates or past dates
    if (now.isAfter(scheduleDateTime) || now.isSame(scheduleDateTime)) {
      return null; // Can update now
    }

    // Calculate remaining time
    const diffMinutes = scheduleDateTime.diff(now, "minute");
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Status mapping
  const statusConfig = {
    PENDING: {
      color: "orange",
      text: "Chưa uống",
      icon: <ClockCircleOutlined />,
    },
    TAKEN: { color: "green", text: "Đã uống", icon: <CheckCircleOutlined /> },
    SKIPPED: { color: "red", text: "Bỏ lỡ", icon: <CloseCircleOutlined /> },
  };

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      refreshSession();

      let data;
      if (selectedStudent) {
        // If a student is selected, get all their schedules
        const response = await nurseApi.getSchedulesForStudent(selectedStudent);
        data = response.success ? response.data : [];
      } else {
        // Otherwise, filter by date and status
        // Ensure date is valid before formatting
        const params = {};
        if (selectedDate && dayjs.isDayjs(selectedDate)) {
          params.date = selectedDate.format("YYYY-MM-DD");
        } else {
          params.date = dayjs().format("YYYY-MM-DD"); // Default to today
        }

        // Only include status if it's not 'ALL'
        if (selectedStatus && selectedStatus !== "ALL") {
          params.status = selectedStatus;
        }

        const response = await nurseApi.getSchedulesByDate(params);
        data = response.success ? response.data : [];
      }

      // Backend already filters for APPROVED requests only
      // Additional frontend validation and user feedback
      if (!Array.isArray(data)) {
        console.warn("Unexpected data format received:", data);
        data = [];
      }

      // Validate schedule data integrity
      const validSchedules = data.filter((schedule) => {
        const isValid =
          schedule &&
          schedule.studentId &&
          schedule.studentName &&
          schedule.medicationName &&
          schedule.scheduledDate &&
          schedule.scheduledTime &&
          schedule.status;

        if (!isValid) {
          console.warn("Invalid schedule data found:", schedule);
        }

        return isValid;
      });

      setSchedules(validSchedules);

      // Extract unique students for filter, with null checks
      const uniqueStudents = [
        ...new Map(
          validSchedules
            .filter((schedule) => schedule.studentId && schedule.studentName) // Filter out invalid entries
            .map((schedule) => [
              schedule.studentId,
              {
                id: schedule.studentId,
                name: schedule.studentName,
                className: schedule.className || "N/A",
              },
            ])
        ).values(),
      ];

      setStudents(uniqueStudents);

      // Show informative message if no approved schedules found
      if (validSchedules.length === 0) {
        const selectedDateStr = selectedDate
          ? selectedDate.format("DD/MM/YYYY")
          : "hôm nay";
        if (selectedStudent) {
          message.info(
            "Không có lịch uống thuốc được duyệt nào cho học sinh này"
          );
        } else {
          message.info(
            `Không có lịch uống thuốc được duyệt nào cho ngày ${selectedDateStr}`
          );
        }
      }
    } catch (error) {
      console.error("Error loading schedules:", error);

      // Enhanced error handling
      if (error.response?.status === 404) {
        message.info("Không tìm thấy lịch uống thuốc được duyệt");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập thông tin này");
      } else {
        message.error(
          "Không thể tải danh sách lịch uống thuốc. Vui lòng thử lại sau."
        );
      }

      setSchedules([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus, selectedStudent, refreshSession]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleStatusUpdate = async (scheduleId, newStatus) => {
    // Find the schedule to check time validation
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      message.error("Không tìm thấy lịch uống thuốc");
      return;
    }

    // Check if update is allowed based on time
    if (!canUpdateSchedule(schedule.scheduledDate, schedule.scheduledTime)) {
      const timeRemaining = getTimeUntilSchedule(
        schedule.scheduledDate,
        schedule.scheduledTime
      );
      message.warning(
        `Chỉ có thể cập nhật trạng thái từ thời gian uống thuốc trở đi. Còn lại: ${timeRemaining}`
      );
      return;
    }
    try {
      refreshSession(); // Refresh session timer
      const response = await nurseApi.updateScheduleStatus(
        scheduleId,
        newStatus
      );

      if (response.success) {
        // Update local state optimistically
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.id === scheduleId
              ? { ...schedule, status: newStatus }
              : schedule
          )
        );

        message.success(response.message || "Cập nhật trạng thái thành công");
      } else {
        message.error("Có lỗi xảy ra khi cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response?.status === 401) {
        message.error("Phiên làm việc hết hạn, vui lòng đăng nhập lại");
      } else {
        message.error("Không thể cập nhật trạng thái");
      }
    }
  };

  const openEditNoteModal = (schedule) => {
    const now = dayjs();
    const scheduleDateTime = dayjs(
      `${schedule.scheduledDate} ${schedule.scheduledTime}`,
      "YYYY-MM-DD HH:mm"
    );

    // Kiểm tra nếu là ngày trong tương lai
    if (dayjs(schedule.scheduledDate).isAfter(now, "day")) {
      message.warning(
        `Chỉ có thể cập nhật ghi chú cho ngày hiện tại hoặc ngày đã qua`
      );
      return;
    }

    // Kiểm tra giờ uống thuốc
    if (
      dayjs(schedule.scheduledDate).isSame(now, "day") &&
      now.isBefore(scheduleDateTime)
    ) {
      const timeRemaining = getTimeUntilSchedule(
        schedule.scheduledDate,
        schedule.scheduledTime
      );
      message.warning(
        `Chỉ có thể chỉnh sửa ghi chú từ thời gian uống thuốc trở đi. Còn lại: ${timeRemaining}`
      );
      return;
    }

    setEditingScheduleId(schedule.id);
    setCurrentNote(schedule.nurseNote || "");
    setEditNoteModalVisible(true);
  };

  const handleUpdateNote = async () => {
    try {
      setLoading(true);

      // Find the schedule
      const schedule = schedules.find((s) => s.id === editingScheduleId);
      if (!schedule) {
        message.error("Không tìm thấy lịch uống thuốc");
        setLoading(false);
        return;
      }

      // Check if there's a valid token before making the API call
      const token = localStorage.getItem("token");
      if (!token) {
        message.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      // Try to refresh the session
      const sessionRefreshed = refreshSession();
      if (!sessionRefreshed) {
        message.error("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }
      // Call the API to update the note
      const response = await nurseApi.updateScheduleNote(
        editingScheduleId,
        currentNote
      );

      if (response.success) {
        // Update local states optimistically
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.id === editingScheduleId
              ? { ...schedule, nurseNote: currentNote }
              : schedule
          )
        );

        // Update selectedSchedule if we're editing from detail modal
        if (selectedSchedule && selectedSchedule.id === editingScheduleId) {
          setSelectedSchedule((prev) => ({
            ...prev,
            nurseNote: currentNote,
          }));
        }

        message.success(response.message || "Cập nhật ghi chú thành công");
        setEditNoteModalVisible(false);

        // Reload schedules to ensure fresh data from the server
        loadSchedules();
      } else {
        message.error("Có lỗi xảy ra khi cập nhật ghi chú");
      }
    } catch (error) {
      console.error("Error updating note:", error);

      // Check for specific error types
      if (error.response) {
        if (error.response.status === 401) {
          message.error("Phiên làm việc hết hạn, vui lòng đăng nhập lại");
          // Force logout on 401
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("loginTimestamp");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else if (error.response.status === 403) {
          message.error("Bạn không có quyền thực hiện hành động này");
        } else {
          message.error(
            `Không thể cập nhật ghi chú: ${
              error.response.data?.message || error.message
            }`
          );
        }
      } else {
        message.error("Không thể cập nhật ghi chú: Lỗi kết nối");
      }
    } finally {
      setLoading(false);
    }
  };

  const showScheduleDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setDetailModalVisible(true);
  };

  // Function to process data for row merging
  const processDataForMerging = (data) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Group by student, date, and time for merging student cells only
    const groups = {};
    data.forEach((item, index) => {
      // Skip invalid items
      if (
        !item ||
        !item.studentName ||
        !item.scheduledDate ||
        !item.scheduledTime
      ) {
        console.warn("Invalid schedule item:", item);
        return;
      }

      const key = `${item.studentName}_${item.scheduledDate}_${item.scheduledTime}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push({ ...item, originalIndex: index });
    });

    // Process groups to add rowSpan information for student column only
    const processedData = [];
    Object.entries(groups)
      .filter(([, group]) => Array.isArray(group) && group.length > 0)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Ensure consistent ordering
      .forEach(([key, group]) => {
        group.forEach((item, groupIndex) => {
          processedData.push({
            ...item,
            groupKey: key,
            studentRowSpan: groupIndex === 0 ? group.length : 0,
            isFirstInGroup: groupIndex === 0,
            groupSize: group.length,
          });
        });
      });

    return processedData;
  };

  const columns = [
    {
      title: "Học sinh",
      key: "student",
      render: (_, record) => (
        <div className="student-info-cell">
          <div className="student-name">
            {record.studentName} - {record.className}
          </div>
        </div>
      ),
      onCell: (record) => ({
        rowSpan: record.studentRowSpan,
        className: record.studentRowSpan > 0 ? "merged-student-cell" : "",
      }),
      width: 180,
    },
    {
      title: "Tên thuốc",
      key: "medicationName",
      render: (_, record) => (
        <div className="medication-name-cell">
          <div className="medication-name-main">{record.medicationName}</div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Ghi chú",
      key: "nurseNote",
      render: (_, record) => (
        <div className="medication-notes-cell">
          {record.nurseNote ? (
            <div className="medication-notes">{record.nurseNote}</div>
          ) : (
            <span className="no-notes">-</span>
          )}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              openEditNoteModal(record);
            }}
            className="edit-note-button"
          />
        </div>
      ),
      width: 150,
    },
    {
      title: "Thời gian",
      dataIndex: "scheduledTime",
      key: "scheduledTime",
      render: (time) => (
        <div style={{ textAlign: "center", fontWeight: "bold" }}>{time}</div>
      ),
      width: 80,
      align: "center",
    },
    {
      title: "Ngày",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
      render: (date) => (
        <div style={{ textAlign: "center" }}>
          {dayjs(date).format("DD/MM/YYYY")}
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <div className="status-tag-container">
          <Tag
            color={statusConfig[status].color}
            icon={statusConfig[status].icon}
          >
            {statusConfig[status].text}
          </Tag>
        </div>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="action-cell">
          <Space direction="vertical" size="small">
            <Button
              size="small"
              onClick={() => showScheduleDetail(record)}
              style={{ width: "80px" }}
            >
              Chi tiết
            </Button>
            {record.status === "PENDING" && (
              <Space size="small">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => handleStatusUpdate(record.id, "TAKEN")}
                  style={{ width: "60px" }}
                >
                  Uống
                </Button>
                <Button
                  size="small"
                  danger
                  onClick={() => handleStatusUpdate(record.id, "SKIPPED")}
                  style={{ width: "60px" }}
                >
                  Bỏ lỡ
                </Button>
              </Space>
            )}
            {record.status !== "PENDING" && (
              <Button
                size="small"
                onClick={() => handleStatusUpdate(record.id, "PENDING")}
                style={{ width: "80px" }}
              >
                Đặt lại
              </Button>
            )}
          </Space>
        </div>
      ),
      width: 140,
      align: "center",
    },
  ];

  const getStatusSummary = () => {
    const summary = schedules.reduce((acc, schedule) => {
      acc[schedule.status] = (acc[schedule.status] || 0) + 1;
      return acc;
    }, {});

    return summary;
  };

  const statusSummary = getStatusSummary();
  // Reset filters safely
  const resetFilters = () => {
    setSelectedDate(dayjs());
    setSelectedStatus("ALL");
    setSelectedStudent(null);
    loadSchedules();
  };

  // DatePicker with built-in validation
  const DatePickerWithValidation = ({ value, onChange, disabled }) => {
    const handleChange = (date) => {
      if (!date) {
        onChange(dayjs()); // Default to today if cleared
        return;
      }
      onChange(date);
    };

    return (
      <DatePicker
        value={value}
        onChange={handleChange}
        format="DD/MM/YYYY"
        style={{ width: "100%" }}
        disabled={disabled}
        disabledDate={(current) => {
          // Can't select days after today
          return current && current.isAfter(dayjs(), "day");
        }}
      />
    );
  };

  return (
    <div className="nurse-medication-container">
      <Card className="nurse-medication-card">
        <div className="medication-dashboard-header">
          <MedicineBoxFilled
            style={{ fontSize: "24px", color: "#1890ff", marginRight: "10px" }}
          />
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: "20px" }}>
            Quản lý lịch uống thuốc
          </h2>
        </div>
        {/* Filters */}
        <div className="filter-container">
          <div className="filter-item">
            <div className="filter-label">Ngày:</div>
            <DatePickerWithValidation
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                if (selectedStudent) {
                  setSelectedStudent(null); // Reset student filter when date changes
                }
              }}
              disabled={selectedStudent !== null}
            />
          </div>

          <div className="filter-item">
            <div className="filter-label">Trạng thái:</div>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: "100%" }}
              popupMatchSelectWidth={false}
            >
              <Option value="ALL">Tất cả</Option>
              <Option value="PENDING">Chưa uống</Option>
              <Option value="TAKEN">Đã uống</Option>
              <Option value="SKIPPED">Bỏ lỡ</Option>
            </Select>
          </div>

          <div className="filter-item">
            <div className="filter-label">Học sinh:</div>
            <Select
              value={selectedStudent}
              onChange={(value) => {
                setSelectedStudent(value);
                if (value) {
                  setSelectedStatus("ALL"); // Reset status filter when student is selected
                }
              }}
              placeholder="Chọn học sinh"
              style={{ width: "100%" }}
              allowClear
              popupMatchSelectWidth={false}
            >
              {students.map((student) => (
                <Option key={student.id} value={student.id}>
                  {student.name} - {student.className}
                </Option>
              ))}
            </Select>
          </div>

          <div
            className="filter-item"
            style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
          >
            <Button type="primary" onClick={loadSchedules}>
              Làm mới
            </Button>
            <Button onClick={resetFilters}>Đặt lại bộ lọc</Button>
          </div>
        </div>{" "}
        {/* Status Summary */}
        <div className="medication-status-grid">
          <div className="status-card status-card-pending">
            <div className="status-card-icon">
              <ClockCircleOutlined />
            </div>
            <div className="status-count">{statusSummary.PENDING || 0}</div>
            <div className="status-label">Chưa uống</div>
          </div>

          <div className="status-card status-card-taken">
            <div className="status-card-icon">
              <CheckCircleOutlined />
            </div>
            <div className="status-count">{statusSummary.TAKEN || 0}</div>
            <div className="status-label">Đã uống</div>
          </div>

          <div className="status-card status-card-missed">
            <div className="status-card-icon">
              <AlertOutlined />
            </div>
            <div className="status-count">{statusSummary.SKIPPED || 0}</div>
            <div className="status-label">Bỏ lỡ</div>
          </div>

          <div className="status-card status-card-total">
            <div className="status-card-icon">
              <NumberOutlined />
            </div>
            <div className="status-count">{schedules.length || 0}</div>
            <div className="status-label">Tổng số</div>
          </div>
        </div>
        {/* Schedules Table */}
        <Spin spinning={loading}>
          {" "}
          <Table
            className="schedules-table"
            columns={columns}
            dataSource={processDataForMerging(schedules)}
            rowKey="id"
            size="small"
            bordered
            pagination={{
              total: schedules.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} lịch uống thuốc`,
              size: "small",
            }}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
            }}
          />
        </Spin>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết lịch uống thuốc"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedSchedule && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Học sinh:</Text>
                <br />
                <Text>{selectedSchedule.studentName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Lớp:</Text>
                <br />
                <Text>{selectedSchedule.className}</Text>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Tên thuốc:</Text>
                <br />
                <Text>{selectedSchedule.medicationName}</Text>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Ngày:</Text>
                <br />
                <Text>
                  {dayjs(selectedSchedule.scheduledDate).format("DD/MM/YYYY")}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Thời gian:</Text>
                <br />
                <Text>{selectedSchedule.scheduledTime}</Text>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              {" "}
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Tag
                  color={statusConfig[selectedSchedule.status]?.color}
                  icon={statusConfig[selectedSchedule.status]?.icon}
                >
                  {statusConfig[selectedSchedule.status]?.text}
                </Tag>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>Ghi chú:</Text>{" "}
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      openEditNoteModal(selectedSchedule);
                    }}
                  >
                    Sửa
                  </Button>
                </div>
                {selectedSchedule.nurseNote ? (
                  <div>
                    <Text>{selectedSchedule.nurseNote}</Text>
                  </div>
                ) : (
                  <Text type="secondary" italic>
                    Không có ghi chú
                  </Text>
                )}
              </Col>
            </Row>
          </div>
        )}{" "}
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        title="Chỉnh sửa ghi chú thuốc"
        open={editNoteModalVisible}
        onCancel={() => setEditNoteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditNoteModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdateNote}
          >
            Lưu
          </Button>,
        ]}
      >
        <Input.TextArea
          placeholder="Nhập ghi chú về thuốc..."
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          rows={4}
          maxLength={200}
          showCount
        />
      </Modal>
    </div>
  );
};

export default NurseMedicationSchedules;
