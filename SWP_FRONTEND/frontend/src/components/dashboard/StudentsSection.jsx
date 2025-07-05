import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Popconfirm,
  Tag,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AddStudentWithParentsModal from "./AddStudentWithParentsModal";
import ImportStudentsModal from "./ImportStudentsModal";
import "../../styles/StudentManagement.css";
import {
  getAllStudents,
  deleteStudent,
  downloadExcelTemplate,
  filterStudents,
} from "../../api/studentApi";

const StudentsSection = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // Để lưu danh sách đầy đủ cho filter options
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterBirthPlace, setFilterBirthPlace] = useState("");
  const [filterBirthYear, setFilterBirthYear] = useState("");

  // Fetch students data
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      console.log("Fetched students data:", data);
      console.log("First student structure:", data[0]);

      // Sort students by ID in descending order (newest first)
      const sortedData = [...data].sort((a, b) => {
        return b.id - a.id;
      });

      setAllStudents(sortedData); // Lưu dữ liệu đầy đủ để tạo filter options
      setStudents(sortedData); // Hiển thị tất cả ban đầu
      setLastUpdate(Date.now());
    } catch (error) {
      message.error("Không thể tải danh sách học sinh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered students data
  const fetchFilteredStudents = async () => {
    setLoading(true);
    try {
      const filterParams = {
        searchName: searchName || null,
        className: filterClass || null,
        birthPlace: filterBirthPlace || null,
        birthYear: filterBirthYear || null,
      };

      const data = await filterStudents(filterParams);
      console.log("Filtered students data:", data);

      // Sort students by ID in descending order (newest first)
      const sortedData = [...data].sort((a, b) => {
        return b.id - a.id;
      });

      setStudents(sortedData);
      setLastUpdate(Date.now());
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      message.error("Không thể lọc danh sách học sinh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchName("");
    setFilterClass("");
    setFilterBirthPlace("");
    setFilterBirthYear("");
    setCurrentPage(1);
    // Reload all students when clearing filters
    fetchStudents();
  };

  // Apply filters when filter values change
  useEffect(() => {
    // Nếu tất cả filter đều empty, hiển thị tất cả
    if (!searchName && !filterClass && !filterBirthPlace && !filterBirthYear) {
      if (students.length !== allStudents.length) {
        setStudents(allStudents);
      }
    } else {
      // Có filter thì gọi API
      const timeoutId = setTimeout(() => {
        fetchFilteredStudents();
      }, 300); // Debounce 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [searchName, filterClass, filterBirthPlace, filterBirthYear]);

  // Get unique values for filter options
  const getUniqueClasses = () => {
    const classes = allStudents
      .map((student) => student.className)
      .filter(Boolean);
    return [...new Set(classes)].sort();
  };

  const getUniqueBirthPlaces = () => {
    const places = allStudents
      .map((student) => student.birthPlace)
      .filter(Boolean);
    return [...new Set(places)].sort();
  };

  const getUniqueBirthYears = () => {
    const years = allStudents
      .map((student) => {
        if (student.dob) {
          return dayjs(student.dob).year().toString();
        }
        return null;
      })
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStudentStatus = async (student) => {
    try {
      setLoading(true);
      console.log(
        "Toggling status for student:",
        student.id,
        "Current isDisabled:",
        student.isDisabled
      );

      // Call API first
      const response = await deleteStudent(student.id);
      console.log("API response:", response);

      // Show success message based on original status (what we're changing FROM)
      if (student.isDisabled) {
        message.success("Đã kích hoạt lại học sinh thành công");
      } else {
        message.success("Đã vô hiệu hóa học sinh thành công");
      }

      // Force refresh data from server to get the latest state
      await fetchStudents();
    } catch (error) {
      console.error("Error toggling student status:", error);
      message.error("Không thể thay đổi trạng thái học sinh: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Template_Import_Hoc_Sinh.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Tải template thành công");
    } catch (error) {
      message.error("Không thể tải template: " + error.message);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => {
        // Calculate the ordinal number based on current page
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Họ và tên",
      key: "fullName",
      render: (_, record) => `${record.lastName} ${record.firstName}`,
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (gender === "M" ? "Nam" : "Nữ"),
    },
    {
      title: "Nơi sinh",
      dataIndex: "birthPlace",
      key: "birthPlace",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        console.log(
          "Rendering status for student:",
          record.id,
          "isDisabled:",
          record.isDisabled
        );
        console.log("Full record:", record); // Debug full record
        const isDisabled = record.isDisabled || record.disabled || false; // Handle different field names
        return (
          <Tag color={isDisabled ? "red" : "green"}>
            {isDisabled ? "Vô hiệu hóa" : "Hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => {
        const isDisabled = record.isDisabled || record.disabled || false; // Handle different field names
        return (
          <Space size="middle">
            <Popconfirm
              title={
                isDisabled ? "Xác nhận kích hoạt lại" : "Xác nhận vô hiệu hóa"
              }
              description={
                isDisabled
                  ? "Bạn có chắc chắn muốn kích hoạt lại học sinh này?"
                  : "Bạn có chắc chắn muốn vô hiệu hóa học sinh này? Tài khoản phụ huynh cũng sẽ bị vô hiệu hóa."
              }
              onConfirm={() =>
                handleToggleStudentStatus({ ...record, isDisabled })
              }
              okText={isDisabled ? "Kích hoạt" : "Vô hiệu hóa"}
              cancelText="Hủy"
              okType={isDisabled ? "primary" : "danger"}
            >
              <Button
                danger={!isDisabled}
                type={isDisabled ? "primary" : "default"}
                icon={isDisabled ? <CheckCircleOutlined /> : <StopOutlined />}
                size="small"
              >
                {isDisabled ? "Kích hoạt" : "Vô hiệu hóa"}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const handleAddSuccess = () => {
    fetchStudents(); // Refresh data after successful add
  };
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Tải template Excel
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setShowImportModal(true)}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Import Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddModal(true)}
            style={{
              background: "#ff6b35",
              borderColor: "#ff6b35",
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Thêm học sinh
          </Button>{" "}
        </Space>
      </div>

      {/* Filter Controls */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                Tìm kiếm theo tên:
              </label>
            </div>
            <Input
              placeholder="Nhập tên học sinh..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                Lọc theo lớp:
              </label>
            </div>
            <Select
              placeholder="Chọn lớp"
              value={filterClass}
              onChange={setFilterClass}
              style={{ width: "100%" }}
              allowClear
            >
              {getUniqueClasses().map((className) => (
                <Select.Option key={className} value={className}>
                  {className}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                Lọc theo nơi sinh:
              </label>
            </div>
            <Select
              placeholder="Chọn nơi sinh"
              value={filterBirthPlace}
              onChange={setFilterBirthPlace}
              style={{ width: "100%" }}
              allowClear
            >
              {getUniqueBirthPlaces().map((place) => (
                <Select.Option key={place} value={place}>
                  {place}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
                Lọc theo năm sinh:
              </label>
            </div>
            <Select
              placeholder="Chọn năm sinh"
              value={filterBirthYear}
              onChange={setFilterBirthYear}
              style={{ width: "100%" }}
              allowClear
            >
              {getUniqueBirthYears().map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                onClick={clearFilters}
                icon={<ReloadOutlined />}
                style={{
                  borderRadius: 6,
                  fontWeight: 500,
                  border: "1px solid #d9d9d9",
                  background: "#fafafa",
                  color: "#595959",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  height: "32px",
                }}
              >
                Xóa bộ lọc
              </Button>
              <div
                style={{
                  fontSize: 14,
                  color: "#666",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FilterOutlined style={{ color: "#1890ff" }} />
                <span>
                  Hiển thị{" "}
                  <strong style={{ color: "#1890ff" }}>
                    {students.length}
                  </strong>{" "}
                  / {allStudents.length} học sinh
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Students Table */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Table
          key={lastUpdate} // Force re-render when data updates
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: pageSize,
            onChange: (page) => setCurrentPage(page),
            current: currentPage,
          }}
          style={{ borderRadius: 8, overflow: "hidden" }}
        />
      </Card>

      <AddStudentWithParentsModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <ImportStudentsModal
        visible={showImportModal}
        onCancel={() => setShowImportModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default StudentsSection;
