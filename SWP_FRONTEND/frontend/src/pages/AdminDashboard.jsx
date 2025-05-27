import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Descriptions,
  Tag,
  Space,
  message,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // User Management States
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add, view, edit
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Health Records Management States
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [healthModalMode, setHealthModalMode] = useState("add"); // add, view, edit
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null);
  const [healthSearchTerm, setHealthSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showHealthDeleteConfirm, setShowHealthDeleteConfirm] = useState(false);
  const [healthRecordToDelete, setHealthRecordToDelete] = useState(null);

  // Sample data
  const [stats, setStats] = useState({
    totalUsers: 1234,
    totalParents: 856,
    totalStudents: 2341,
    totalHealthRecords: 1567,
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "a@example.com",
      phone: "0123456789",
      role: "PARENT",
      status: "Active",
      createdAt: "2024-01-15",
      address: "123 Đường ABC, Quận 1, TP.HCM",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b@example.com",
      phone: "0987654321",
      role: "PARENT",
      status: "Active",
      createdAt: "2024-01-10",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "c@example.com",
      phone: "0555666777",
      role: "STUDENT",
      status: "Inactive",
      createdAt: "2024-01-05",
      address: "789 Đường DEF, Quận 3, TP.HCM",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "d@example.com",
      phone: "0111222333",
      role: "NURSE",
      status: "Active",
      createdAt: "2024-01-20",
      address: "321 Đường GHI, Quận 4, TP.HCM",
    },
  ]);

  // Sample health records data
  const [healthRecords, setHealthRecords] = useState([
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      studentId: "SV001",
      examDate: "2024-01-15",
      doctor: "BS. Trần Thị Lan",
      height: "165",
      weight: "55",
      bloodPressure: "120/80",
      heartRate: "72",
      temperature: "36.5",
      diagnosis: "Sức khỏe tốt",
      notes: "Học sinh có sức khỏe ổn định",
      status: "Completed",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      studentName: "Trần Thị B",
      studentId: "SV002",
      examDate: "2024-01-20",
      doctor: "BS. Lê Văn Nam",
      height: "158",
      weight: "48",
      bloodPressure: "110/70",
      heartRate: "68",
      temperature: "36.3",
      diagnosis: "Thiếu máu nhẹ",
      notes: "Cần bổ sung dinh dưỡng",
      status: "Pending",
      createdAt: "2024-01-20",
    },
    {
      id: 3,
      studentName: "Lê Văn C",
      studentId: "SV003",
      examDate: "2024-01-25",
      doctor: "BS. Phạm Thị Hoa",
      height: "170",
      weight: "62",
      bloodPressure: "125/85",
      heartRate: "75",
      temperature: "36.7",
      diagnosis: "Huyết áp hơi cao",
      notes: "Cần theo dõi huyết áp định kỳ",
      status: "Completed",
      createdAt: "2024-01-25",
    },
  ]);

  // Form state for user modal
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "PARENT",
    status: "Active",
    address: "",
  });

  // Form state for health record modal
  const [healthForm, setHealthForm] = useState({
    studentName: "",
    studentId: "",
    examDate: "",
    doctor: "",
    height: "",
    weight: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    diagnosis: "",
    notes: "",
    status: "Pending",
  });

  // Ant Design form instances
  const [userFormInstance] = Form.useForm();
  const [healthFormInstance] = Form.useForm();

  useEffect(() => {
    // Simple check - AdminProtectedRoute already verified ADMIN access
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("AdminDashboard loaded for user:", user);
    console.log("User role:", user.roleName);
  }, [user, navigate]);

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // User Management Functions
  const resetUserForm = () => {
    userFormInstance.resetFields();
    setUserForm({
      name: "",
      email: "",
      phone: "",
      role: "PARENT",
      status: "Active",
      address: "",
    });
  };

  const openAddUserModal = () => {
    resetUserForm();
    setModalMode("add");
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const openViewUserModal = (user) => {
    setSelectedUser(user);
    setModalMode("view");
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
    userFormInstance.setFieldsValue(user);
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const values = await userFormInstance.validateFields();

      if (modalMode === "add") {
        const newUser = {
          ...values,
          id: Math.max(...users.map((u) => u.id)) + 1,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setUsers((prev) => [...prev, newUser]);
        setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
        message.success("Thêm người dùng thành công!");
      } else if (modalMode === "edit") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...values,
                  id: selectedUser.id,
                  createdAt: selectedUser.createdAt,
                }
              : u
          )
        );
        message.success("Cập nhật người dùng thành công!");
      }

      setShowUserModal(false);
      resetUserForm();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleDeleteUser = (user) => {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    message.success("Xóa người dùng thành công!");
  };

  // Health Records Management Functions
  const resetHealthForm = () => {
    healthFormInstance.resetFields();
    setHealthForm({
      studentName: "",
      studentId: "",
      examDate: "",
      doctor: "",
      height: "",
      weight: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      diagnosis: "",
      notes: "",
      status: "Pending",
    });
  };

  const openAddHealthModal = () => {
    resetHealthForm();
    setHealthModalMode("add");
    setSelectedHealthRecord(null);
    setShowHealthModal(true);
  };

  const openViewHealthModal = (record) => {
    setSelectedHealthRecord(record);
    setHealthForm(record);
    setHealthModalMode("view");
    setShowHealthModal(true);
  };

  const openEditHealthModal = (record) => {
    setSelectedHealthRecord(record);
    setHealthModalMode("edit");
    healthFormInstance.setFieldsValue(record);
    setShowHealthModal(true);
  };

  const handleHealthFormChange = (e) => {
    const { name, value } = e.target;
    setHealthForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveHealthRecord = async () => {
    try {
      const values = await healthFormInstance.validateFields();

      if (healthModalMode === "add") {
        const newRecord = {
          ...values,
          id: Math.max(...healthRecords.map((r) => r.id)) + 1,
          createdAt: new Date().toISOString().split("T")[0],
        };
        setHealthRecords((prev) => [...prev, newRecord]);
        setStats((prev) => ({
          ...prev,
          totalHealthRecords: prev.totalHealthRecords + 1,
        }));
        message.success("Thêm hồ sơ sức khỏe thành công!");
      } else if (healthModalMode === "edit") {
        setHealthRecords((prev) =>
          prev.map((r) =>
            r.id === selectedHealthRecord.id
              ? {
                  ...values,
                  id: selectedHealthRecord.id,
                  createdAt: selectedHealthRecord.createdAt,
                }
              : r
          )
        );
        message.success("Cập nhật hồ sơ sức khỏe thành công!");
      }

      setShowHealthModal(false);
      resetHealthForm();
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleDeleteHealthRecord = (record) => {
    setHealthRecords((prev) => prev.filter((r) => r.id !== record.id));
    setStats((prev) => ({
      ...prev,
      totalHealthRecords: prev.totalHealthRecords - 1,
    }));
    message.success("Xóa hồ sơ sức khỏe thành công!");
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredHealthRecords = healthRecords.filter((record) => {
    const matchesSearch =
      record.studentName
        .toLowerCase()
        .includes(healthSearchTerm.toLowerCase()) ||
      record.studentId.toLowerCase().includes(healthSearchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(healthSearchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: "📊" },
    { id: "users", label: "Quản lý người dùng", icon: "👥" },
    { id: "health", label: "Hồ sơ sức khỏe", icon: "🏥" },
    { id: "settings", label: "Cài đặt", icon: "⚙️" },
  ];

  // Dashboard Overview Component
  const DashboardOverview = () => {
    // Chart data
    const barChartData = {
      labels: [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
      ],
      datasets: [
        {
          label: "Số lượng khám sức khỏe",
          data: [120, 190, 300, 500, 200, 300],
          backgroundColor: "rgba(25, 118, 210, 0.8)",
          borderColor: "rgba(25, 118, 210, 1)",
          borderWidth: 1,
        },
      ],
    };

    const doughnutChartData = {
      labels: ["Phụ huynh", "Học sinh", "Giáo viên", "Y tá"],
      datasets: [
        {
          data: [856, 2341, 120, 15],
          backgroundColor: [
            "rgba(25, 118, 210, 0.8)",
            "rgba(76, 175, 80, 0.8)",
            "rgba(255, 193, 7, 0.8)",
            "rgba(156, 39, 176, 0.8)",
          ],
          borderColor: [
            "rgba(25, 118, 210, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(255, 193, 7, 1)",
            "rgba(156, 39, 176, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    };

    return (
      <div className="dashboard-overview">
        <h2>Tổng quan hệ thống</h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Tổng người dùng</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalParents}</h3>
              <p>Phụ huynh</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalStudents}</h3>
              <p>Học sinh</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalHealthRecords}</h3>
              <p>Hồ sơ sức khỏe</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-container">
              <h3>Thống kê hoạt động theo tháng</h3>
              <div className="chart-wrapper">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h3>Phân bố người dùng</h3>
              <div className="chart-wrapper">
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // User Management Component
  const UserManagement = () => (
    <div className="user-management">
      <div className="section-header">
        <h2>Quản lý người dùng</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddUserModal}
          size="large"
        >
          Thêm người dùng
        </Button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search">🔍 Tìm kiếm</button>
        </div>

        <div className="filter-bar">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="PARENT">Phụ huynh</option>
            <option value="STUDENT">Học sinh</option>
            <option value="NURSE">Y tá</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </div>

      <div className="users-stats">
        <span>
          Hiển thị {filteredUsers.length} / {users.length} người dùng
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <Space size="small">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => openViewUserModal(user)}
                      title="Xem chi tiết"
                    />
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => openEditUserModal(user)}
                      title="Chỉnh sửa"
                    />
                    <Popconfirm
                      title="Xác nhận xóa"
                      description={`Bạn có chắc chắn muốn xóa người dùng ${user.name}?`}
                      onConfirm={() => handleDeleteUser(user)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okType="danger"
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        title="Xóa"
                      />
                    </Popconfirm>
                  </Space>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-data">
            <p>Không tìm thấy người dùng nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      <Modal
        title={
          modalMode === "add"
            ? "Thêm người dùng mới"
            : modalMode === "view"
            ? "Thông tin người dùng"
            : "Chỉnh sửa người dùng"
        }
        open={showUserModal}
        onCancel={() => setShowUserModal(false)}
        footer={
          modalMode === "view"
            ? [
                <Button key="close" onClick={() => setShowUserModal(false)}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setShowUserModal(false)}>
                  Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSaveUser}>
                  {modalMode === "add" ? "Thêm" : "Cập nhật"}
                </Button>,
              ]
        }
        width={900}
        destroyOnClose
      >
        {modalMode === "view" ? (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="ID người dùng" span={1}>
              {selectedUser?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên" span={1}>
              {selectedUser?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={1}>
              {selectedUser?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại" span={1}>
              {selectedUser?.phone || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò" span={1}>
              <Tag
                color={
                  selectedUser?.role === "PARENT"
                    ? "blue"
                    : selectedUser?.role === "STUDENT"
                    ? "green"
                    : selectedUser?.role === "NURSE"
                    ? "purple"
                    : "red"
                }
              >
                {selectedUser?.role === "PARENT" && "Phụ huynh"}
                {selectedUser?.role === "STUDENT" && "Học sinh"}
                {selectedUser?.role === "NURSE" && "Y tá"}
                {selectedUser?.role === "ADMIN" && "Quản trị viên"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag
                color={selectedUser?.status === "Active" ? "success" : "error"}
              >
                {selectedUser?.status === "Active"
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedUser?.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {selectedUser?.address || "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form
            form={userFormInstance}
            layout="vertical"
            initialValues={{
              role: "PARENT",
              status: "Active",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                  { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  {
                    pattern: /^\d{10}$/,
                    message: "Số điện thoại phải có 10 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="Vai trò"
                name="role"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Select.Option value="PARENT">Phụ huynh</Select.Option>
                  <Select.Option value="STUDENT">Học sinh</Select.Option>
                  <Select.Option value="NURSE">Y tá</Select.Option>
                  <Select.Option value="ADMIN">Quản trị viên</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="Active">Hoạt động</Select.Option>
                  <Select.Option value="Inactive">
                    Không hoạt động
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="Địa chỉ" name="address">
              <Input.TextArea
                placeholder="Nhập địa chỉ"
                rows={3}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );

  // Health Records Management Component
  const HealthRecordsManagement = () => (
    <div className="health-records">
      <div className="section-header">
        <h2>Quản lý hồ sơ sức khỏe</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openAddHealthModal}
          size="large"
        >
          Thêm hồ sơ
        </Button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh, mã SV hoặc bác sĩ..."
            value={healthSearchTerm}
            onChange={(e) => setHealthSearchTerm(e.target.value)}
          />
          <button className="btn-search">🔍 Tìm kiếm</button>
        </div>

        <div className="filter-bar">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Đang chờ</option>
            <option value="Completed">Hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="records-stats">
        <span>
          Hiển thị {filteredHealthRecords.length} / {healthRecords.length} hồ sơ
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên học sinh</th>
              <th>Mã SV</th>
              <th>Ngày khám</th>
              <th>Bác sĩ</th>
              <th>Chẩn đoán</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredHealthRecords.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.studentName}</td>
                <td>{record.studentId}</td>
                <td>{record.examDate}</td>
                <td>{record.doctor}</td>
                <td>{record.diagnosis}</td>
                <td>
                  <span className={`status ${record.status.toLowerCase()}`}>
                    {record.status === "Completed" ? "Hoàn thành" : "Đang chờ"}
                  </span>
                </td>
                <td>
                  <Space size="small">
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => openViewHealthModal(record)}
                      title="Xem chi tiết"
                    />
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => openEditHealthModal(record)}
                      title="Chỉnh sửa"
                    />
                    <Popconfirm
                      title="Xác nhận xóa"
                      description={`Bạn có chắc chắn muốn xóa hồ sơ của ${record.studentName}?`}
                      onConfirm={() => handleDeleteHealthRecord(record)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okType="danger"
                    >
                      <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        title="Xóa"
                      />
                    </Popconfirm>
                  </Space>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredHealthRecords.length === 0 && (
          <div className="no-data">
            <p>Không tìm thấy hồ sơ nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Health Record Modal */}
      <Modal
        title={
          healthModalMode === "add"
            ? "Thêm hồ sơ sức khỏe mới"
            : healthModalMode === "view"
            ? "Thông tin hồ sơ sức khỏe"
            : "Chỉnh sửa hồ sơ sức khỏe"
        }
        open={showHealthModal}
        onCancel={() => setShowHealthModal(false)}
        footer={
          healthModalMode === "view"
            ? [
                <Button key="close" onClick={() => setShowHealthModal(false)}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setShowHealthModal(false)}>
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={handleSaveHealthRecord}
                >
                  {healthModalMode === "add" ? "Thêm" : "Cập nhật"}
                </Button>,
              ]
        }
        width={900}
        destroyOnClose
      >
        {healthModalMode === "view" ? (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="ID hồ sơ" span={1}>
              {selectedHealthRecord?.id}
            </Descriptions.Item>
            <Descriptions.Item label="Tên học sinh" span={1}>
              {selectedHealthRecord?.studentName}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sinh viên" span={1}>
              {selectedHealthRecord?.studentId}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày khám" span={1}>
              {selectedHealthRecord?.examDate}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ khám" span={1}>
              {selectedHealthRecord?.doctor}
            </Descriptions.Item>
            <Descriptions.Item label="Chiều cao (cm)" span={1}>
              {selectedHealthRecord?.height}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng (kg)" span={1}>
              {selectedHealthRecord?.weight}
            </Descriptions.Item>
            <Descriptions.Item label="Huyết áp" span={1}>
              {selectedHealthRecord?.bloodPressure}
            </Descriptions.Item>
            <Descriptions.Item label="Nhịp tim" span={1}>
              {selectedHealthRecord?.heartRate}
            </Descriptions.Item>
            <Descriptions.Item label="Nhiệt độ (°C)" span={1}>
              {selectedHealthRecord?.temperature}
            </Descriptions.Item>
            <Descriptions.Item label="Chẩn đoán" span={2}>
              {selectedHealthRecord?.diagnosis}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedHealthRecord?.notes || "Không có ghi chú"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag
                color={
                  selectedHealthRecord?.status === "Completed"
                    ? "success"
                    : "warning"
                }
              >
                {selectedHealthRecord?.status === "Completed"
                  ? "Hoàn thành"
                  : "Đang chờ"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedHealthRecord?.createdAt}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form
            form={healthFormInstance}
            layout="vertical"
            initialValues={{
              status: "Pending",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label="Tên học sinh"
                name="studentName"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học sinh!" },
                  { min: 2, message: "Tên học sinh phải có ít nhất 2 ký tự!" },
                ]}
              >
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>

              <Form.Item
                label="Mã sinh viên"
                name="studentId"
                rules={[
                  { required: true, message: "Vui lòng nhập mã sinh viên!" },
                  {
                    pattern: /^SV\d{3,}$/,
                    message: "Mã sinh viên phải có định dạng SV001, SV002...",
                  },
                ]}
              >
                <Input placeholder="Nhập mã sinh viên (VD: SV001)" />
              </Form.Item>

              <Form.Item
                label="Ngày khám"
                name="examDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày khám!" },
                ]}
              >
                <Input type="date" />
              </Form.Item>

              <Form.Item
                label="Bác sĩ khám"
                name="doctor"
                rules={[
                  { required: true, message: "Vui lòng nhập tên bác sĩ!" },
                ]}
              >
                <Input placeholder="Nhập tên bác sĩ" />
              </Form.Item>

              <Form.Item
                label="Chiều cao (cm)"
                name="height"
                rules={[
                  {
                    pattern: /^\d{2,3}$/,
                    message: "Chiều cao phải là số từ 2-3 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập chiều cao" />
              </Form.Item>

              <Form.Item
                label="Cân nặng (kg)"
                name="weight"
                rules={[
                  {
                    pattern: /^\d{2,3}$/,
                    message: "Cân nặng phải là số từ 2-3 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập cân nặng" />
              </Form.Item>

              <Form.Item
                label="Huyết áp"
                name="bloodPressure"
                rules={[
                  {
                    pattern: /^\d{2,3}\/\d{2,3}$/,
                    message: "Huyết áp phải có định dạng 120/80!",
                  },
                ]}
              >
                <Input placeholder="Nhập huyết áp (VD: 120/80)" />
              </Form.Item>

              <Form.Item
                label="Nhịp tim (bpm)"
                name="heartRate"
                rules={[
                  {
                    pattern: /^\d{2,3}$/,
                    message: "Nhịp tim phải là số từ 2-3 chữ số!",
                  },
                ]}
              >
                <Input placeholder="Nhập nhịp tim" />
              </Form.Item>

              <Form.Item
                label="Nhiệt độ (°C)"
                name="temperature"
                rules={[
                  {
                    pattern: /^\d{2}\.\d$/,
                    message: "Nhiệt độ phải có định dạng 36.5!",
                  },
                ]}
              >
                <Input placeholder="Nhập nhiệt độ (VD: 36.5)" />
              </Form.Item>

              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Select.Option value="Pending">Đang chờ</Select.Option>
                  <Select.Option value="Completed">Hoàn thành</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="Chẩn đoán"
              name="diagnosis"
              rules={[{ required: true, message: "Vui lòng nhập chẩn đoán!" }]}
            >
              <Input.TextArea
                placeholder="Nhập chẩn đoán"
                rows={2}
                showCount
                maxLength={200}
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea
                placeholder="Nhập ghi chú (tùy chọn)"
                rows={3}
                showCount
                maxLength={300}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );

  // Settings Component
  const SettingsManagement = () => (
    <div className="settings-management">
      <h2>Cài đặt hệ thống</h2>
      <div className="settings-sections">
        <div className="settings-section">
          <h3>Cài đặt chung</h3>
          <div className="setting-item">
            <label>Tên hệ thống</label>
            <input type="text" defaultValue="Hệ Thống Quản Lý Y Tế Học Đường" />
          </div>
          <div className="setting-item">
            <label>Email liên hệ</label>
            <input type="email" defaultValue="admin@school-health.com" />
          </div>
        </div>

        <div className="settings-section">
          <h3>Cài đặt bảo mật</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Yêu cầu xác thực 2 bước
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Ghi log hoạt động
            </label>
          </div>
        </div>
      </div>

      <button className="btn-primary">Lưu cài đặt</button>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "health":
        return <HealthRecordsManagement />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  // AdminProtectedRoute already verified ADMIN access, so we can render directly
  if (!user) return null;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Quản Lý</h3>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div className="content-header">
          <h1>Admin</h1>
        </div>
        <div className="content-body">{renderContent()}</div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .admin-dashboard {
          display: flex;
          min-height: calc(100vh - 140px);
          margin: 90px 20px 20px 20px;
          background-color: #f8f9fa;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .sidebar {
          width: 260px;
          background: #0d5ec2;
          border-right: none;
          box-shadow: 2px 0 4px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          border-radius: 16px 0 0 16px;
        }

        .sidebar-header {
          padding: 16px 24px;
          border-bottom: 1px solid #1565c0;
          background: #0d5ec2;
          border-radius: 16px 0 0;
          position: sticky;
          top: 0;
          z-index: 5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .sidebar-header h3 {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 22px;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 0;
        }

        .nav-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 12px 16px;
          border: none;
          background: none;
          color: #fff;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          font-size: 13px;
          text-align: left;
        }

        .nav-item:hover {
          background-color: #1565c0;
          color: #fff;
        }

        .nav-item.active {
          background-color: #1976d2;
          color: #fff;
          border-right: 3px solid #fff;
          font-weight: 500;
        }

        .nav-icon {
          margin-right: 12px;
          width: 20px;
          font-size: 16px;
        }

        .nav-label {
          flex: 1;
        }

        .dashboard-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .content-header {
          background: white;
          padding: 16px 24px;
          border-bottom: 1px solid #e8e8e8;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
          border-radius: 0px 16px 0 0;
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }

        .content-header h1 {
          color: #1976d2;
          margin: 0 0 4px 0;
          font-size: 22px;
          font-weight: 600;
        }

        .user-info {
          color: #666;
          font-size: 13px;
        }

        .content-body {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .content-body > * {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin: 0 0 20px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e8e8e8;
          transition: all 0.2s ease;
        }

        .content-body > *:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .content-body > *:last-child {
          margin-bottom: 0;
        }

        .dashboard-overview,
        .user-management,
        .health-records,
        .settings-management {
          /* Inherits styles from content-body > * */
        }

        .dashboard-overview h2,
        .user-management h2,
        .health-records h2,
        .settings-management h2 {
          margin: 0 0 2rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
          border-left: 4px solid #1976d2;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-info h3 {
          margin: 0;
          font-size: 2rem;
          color: #1976d2;
          font-weight: 700;
        }

        .stat-info p {
          margin: 0.5rem 0 0 0;
          color: #666;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .charts-section {
          margin: 2rem 0;
        }

        .chart-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          text-align: center;
        }

        .chart-wrapper {
          height: 300px;
          position: relative;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #1565c0;
          transform: translateY(-1px);
        }

        .search-bar input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
        }

        .btn-search {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .btn-search:hover {
          background: #1565c0;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 0.75rem 1rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
          vertical-align: middle;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #dee2e6;
        }

        .data-table td {
          font-size: 0.9rem;
        }

        .data-table tr:hover {
          background-color: #f8f9fa;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.active {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .status.inactive {
          background: #ffebee;
          color: #c62828;
        }

        .status.completed {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status.pending {
          background: #fff3e0;
          color: #f57c00;
        }

        .action-buttons {
          display: flex;
          gap: 0.25rem;
          justify-content: center;
        }

        .btn-action {
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s ease;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .btn-action.view {
          background: #1976d2;
          color: white;
        }

        .btn-action.view:hover {
          background: #1565c0;
        }

        .btn-action.edit {
          background: #ff9800;
          color: white;
        }

        .btn-action.edit:hover {
          background: #f57c00;
        }

        .btn-action.delete {
          background: #f44336;
          color: white;
        }

        .btn-action.delete:hover {
          background: #d32f2f;
        }

        .settings-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .settings-section {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
        }

        .setting-item {
          margin-bottom: 1.5rem;
        }

        .setting-item label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .setting-item input[type="text"],
        .setting-item input[type="email"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .setting-item input[type="checkbox"] {
          margin-right: 0.5rem;
        }

        /* User Management Enhancements */
        .filters-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          align-items: flex-end;
          justify-content: space-between;
        }

        .search-bar {
          display: flex;
          gap: 0.5rem;
          flex: 1;
          max-width: 500px;
        }

        .filter-bar {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .role-filter,
        .status-filter {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          min-width: 180px;
        }

        .users-stats,
        .records-stats {
          margin-bottom: 1rem;
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .role-badge.parent {
          background: #e3f2fd;
          color: #1976d2;
        }

        .role-badge.student {
          background: #e8f5e8;
          color: #2e7d32;
        }

        .role-badge.nurse {
          background: #fff3e0;
          color: #f57c00;
        }

        .role-badge.admin {
          background: #fce4ec;
          color: #c2185b;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          padding: 20px;
          pointer-events: none;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          width: 80%;
          height: 80%;
          display: flex;
          flex-direction: column;
          animation: modalSlideIn 0.3s ease;
          overflow: hidden;
          cursor: default;
          pointer-events: auto;
          position: relative;
        }

        .modal-content.small {
          width: 400px;
          height: auto;
          max-height: 300px;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          flex-shrink: 0;
          background: white;
          border-radius: 12px 12px 0 0;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.25rem;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #f5f5f5;
          color: #333;
        }

        .modal-body {
          padding: 1.5rem;
          flex: 1;
          min-height: 0;
          overflow: visible;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background: #f5f5f5;
          color: #666;
          cursor: not-allowed;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
          max-height: 120px;
        }

        /* User Info Display Styles */
        .user-info-display {
          padding: 1rem 0;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .info-row.full-width {
          grid-template-columns: 1fr;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .info-item label {
          font-weight: 600;
          color: #495057;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          font-size: 1rem;
          color: #212529;
          min-height: 45px;
          display: flex;
          align-items: center;
        }

        .info-value .role-badge,
        .info-value .status {
          margin: 0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e0e0e0;
          background: #f8f9fa;
          border-radius: 0 0 12px 12px;
          flex-shrink: 0;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #5a6268;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-danger:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .warning-text {
          color: #dc3545;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
