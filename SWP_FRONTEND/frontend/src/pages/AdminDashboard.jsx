import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Spin, message } from "antd";
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
  Popconfirm,
  Card,
  Divider,
} from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
  SaveOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import "../styles/Profile.css";
import "../styles/SidebarTrigger.css";
import "../styles/AdminDashboard.css";

const { Header, Sider, Content } = Layout;

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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Quản lý người dùng",
    },
    {
      key: "health",
      icon: <MedicineBoxOutlined />,
      label: "Hồ sơ sức khỏe",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
    setActiveSection(tabKey);

    if (tabKey === "dashboard") {
      navigate("/admin/dashboard");
    } else {
      navigate(`/admin/dashboard?tab=${tabKey}`);
    }
  };

  const getBreadcrumbItems = () => {
    const currentItem = menuItems.find((item) => item.key === activeSection);
    return [
      {
        title: "Admin Dashboard",
      },
      {
        title: currentItem?.label || "Tổng quan",
      },
    ];
  };

  const { user, isAuthenticated, isStaff } = useAuth();

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

  // Ant Design form instances
  const [userFormInstance] = Form.useForm();
  const [healthFormInstance] = Form.useForm();

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isStaff()) {
      message.error("Bạn không có quyền truy cập vào trang này");
      navigate("/");
      return;
    }

    // Set user info from auth context
    setUserInfo(user);
  }, [navigate, isAuthenticated, isStaff, user]);

  // Separate useEffect to handle URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const validTabs = ["dashboard", "users", "health", "profile", "settings"];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      }
    } else {
      // If no tab parameter, default to dashboard
      setActiveSection("dashboard");
    }
  }, [searchParams]);

  // User Management Functions
  const resetUserForm = () => {
    userFormInstance.resetFields();
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
    } catch {
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
  };

  const openAddHealthModal = () => {
    resetHealthForm();
    setHealthModalMode("add");
    setSelectedHealthRecord(null);
    setShowHealthModal(true);
  };

  const openViewHealthModal = (record) => {
    setSelectedHealthRecord(record);
    setHealthModalMode("view");
    setShowHealthModal(true);
  };

  const openEditHealthModal = (record) => {
    setSelectedHealthRecord(record);
    setHealthModalMode("edit");
    healthFormInstance.setFieldsValue(record);
    setShowHealthModal(true);
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
    } catch {
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
            <option value="Pending">Cần theo dõi</option>
            <option value="Completed">Sức khỏe ổn định</option>
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
                    {record.status === "Completed"
                      ? "Sức khỏe ổn định"
                      : "Cần theo dõi"}
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
                  ? "Sức khỏe ổn định"
                  : "Cần theo dõi"}
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
                  <Select.Option value="Pending">Cần theo dõi</Select.Option>
                  <Select.Option value="Completed">
                    Sức khỏe ổn định
                  </Select.Option>
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

  // Admin Profile Component
  const AdminProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const [formData, setFormData] = useState({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      jobTitle: user?.jobTitle || "Quản trị viên hệ thống",
      dateOfBirth: user?.dateOfBirth || "",
      emergencyContact: user?.emergencyContact || "",
      department: user?.department || "Phòng IT",
      employeeId: user?.employeeId || "ADMIN001",
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
      const newErrors = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = "Họ không được để trống";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Tên không được để trống";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email không được để trống";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Số điện thoại không được để trống";
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        message.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      try {
        setLoading(true);
        // API call to update admin profile would go here
        // await adminApi.updateProfile(formData);
        message.success("Cập nhật thông tin thành công");
        setIsEditing(false);
        setErrors({});
      } catch (error) {
        message.error("Có lỗi xảy ra khi cập nhật thông tin");
        console.error("Profile update error:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const beforeUpload = (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Chỉ có thể tải lên file JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
      }
      return isJpgOrPng && isLt2M;
    };

    return (
      <div className="profile-container">
        <div className="profile-header">
          <div className="header-content">
            <h2>👤 Hồ Sơ Cá Nhân</h2>
            <p>Quản lý thông tin tài khoản quản trị viên</p>
          </div>
          <Button
            type={isEditing ? "default" : "primary"}
            icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
            onClick={() => setIsEditing(!isEditing)}
            size="large"
          >
            {isEditing ? "Hủy" : "Chỉnh sửa"}
          </Button>
        </div>

        <div className="profile-content">
          <div className="profile-main-card">
            <div className="profile-card-header">
              <h3>Thông tin cá nhân</h3>
            </div>
            <div className="profile-card-body">
              <div className="profile-avatar-section">
                <div className="avatar-container">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="profile-avatar-large"
                    />
                  ) : (
                    <div className="profile-avatar-large default-avatar">
                      👤
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="avatar-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && beforeUpload(file)) {
                          const reader = new FileReader();
                          reader.onload = () => setAvatarUrl(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: "none" }}
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" className="upload-btn">
                      📷 Đổi ảnh
                    </label>
                  </div>
                )}
                <div className="profile-basic-info">
                  <h3>
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <div className="role-badge admin">🛡️ Quản trị viên</div>
                </div>
              </div>

              <div className="divider"></div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form-enhanced">
                  <div className="form-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Họ *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={errors.firstName ? "error" : ""}
                          placeholder="Nhập họ"
                        />
                        {errors.firstName && (
                          <span className="error-text">{errors.firstName}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Tên *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={errors.lastName ? "error" : ""}
                          placeholder="Nhập tên"
                        />
                        {errors.lastName && (
                          <span className="error-text">{errors.lastName}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={errors.email ? "error" : ""}
                          placeholder="admin@school.edu"
                        />
                        {errors.email && (
                          <span className="error-text">{errors.email}</span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Số điện thoại *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={errors.phone ? "error" : ""}
                          placeholder="0123456789"
                        />
                        {errors.phone && (
                          <span className="error-text">{errors.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mã nhân viên</label>
                        <input
                          type="text"
                          name="employeeId"
                          value={formData.employeeId}
                          onChange={handleChange}
                          placeholder="ADMIN001"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h4>Thông tin công việc</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Chức vụ</label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          placeholder="Quản trị viên hệ thống"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phòng ban</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                        >
                          <option value="Phòng IT">Phòng IT</option>
                          <option value="Phòng Y tế">Phòng Y tế</option>
                          <option value="Phòng Giáo vụ">Phòng Giáo vụ</option>
                          <option value="Phòng Hành chính">
                            Phòng Hành chính
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại khẩn cấp</label>
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="0123456789"
                      />
                    </div>
                  </div>

                  <div className="form-actions-enhanced">
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                      size="large"
                    >
                      Lưu thay đổi
                    </Button>
                    <Button onClick={() => setIsEditing(false)} size="large">
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-enhanced">
                  <div className="info-section">
                    <h4>Thông tin cơ bản</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-icon">👤</div>
                        <div>
                          <label>Họ và tên</label>
                          <span>
                            {formData.firstName} {formData.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">📧</div>
                        <div>
                          <label>Email</label>
                          <span>{formData.email}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">📞</div>
                        <div>
                          <label>Số điện thoại</label>
                          <span>{formData.phone}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">📅</div>
                        <div>
                          <label>Ngày sinh</label>
                          <span>{formData.dateOfBirth || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">🆔</div>
                        <div>
                          <label>Mã nhân viên</label>
                          <span>{formData.employeeId}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="info-section">
                    <h4>Thông tin công việc</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-icon">💼</div>
                        <div>
                          <label>Chức vụ</label>
                          <span>{formData.jobTitle}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">🏢</div>
                        <div>
                          <label>Phòng ban</label>
                          <span>{formData.department}</span>
                        </div>
                      </div>
                      <div className="info-item full-width">
                        <div className="info-icon">🏠</div>
                        <div>
                          <label>Địa chỉ</label>
                          <span>{formData.address || "Chưa cập nhật"}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <div className="info-icon">🚨</div>
                        <div>
                          <label>Số điện thoại khẩn cấp</label>
                          <span>
                            {formData.emergencyContact || "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "health":
        return <HealthRecordsManagement />;
      case "profile":
        return <AdminProfile />;
      case "settings":
        return <SettingsManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  if (!userInfo) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#f4f6fb",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout
      style={{
        minHeight: "calc(100vh - 140px)",
        background: "#f4f6fb",
        margin: "90px 20px 30px 20px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.08)",
      }}
    >
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="admin-sidebar"
        style={{
          borderRight: "1px solid #f0f0f0",
          background: "#fff",
          zIndex: 10,
          paddingTop: 24,
          position: "relative",
        }}
        trigger={null}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#fff2e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fa8c16",
            }}
          >
            <UserOutlined style={{ fontSize: 32, color: "#fa8c16" }} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontWeight: 600,
                color: "#fa8c16",
                fontSize: 18,
                marginTop: 12,
                borderRadius: 20,
                padding: "4px 12px",
                background: "#fff2e8",
              }}
            >
              Quản trị viên
            </span>
          )}
        </div>

        <Menu
          theme="light"
          selectedKeys={[activeSection]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: "none", fontWeight: 500, fontSize: 16 }}
        />

        {/* Custom Sidebar Trigger Button */}
        <div
          className="custom-sidebar-trigger"
          onClick={() => setCollapsed(!collapsed)}
          tabIndex={0}
          role="button"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCollapsed(!collapsed);
            }
          }}
        >
          {collapsed ? (
            <RightOutlined className="icon-right" />
          ) : (
            <LeftOutlined className="icon-left" />
          )}
          {!collapsed && <span className="trigger-text">Thu gọn</span>}
        </div>
      </Sider>

      <Layout style={{ marginLeft: 0 }}>
        <Header
          style={{
            background: "#fff",
            padding: "16px 32px",
            height: "auto",
            lineHeight: "normal",
            minHeight: 80,
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ flex: 1 }}>
            <Breadcrumb
              items={getBreadcrumbItems()}
              style={{ fontSize: 14, marginBottom: 4 }}
            />
            <h1
              style={{
                color: "#fa8c16",
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              Bảng điều khiển quản trị
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#fff2e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #fa8c16",
              }}
            >
              <UserOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.firstName || ""} {userInfo?.lastName || ""}
            </span>
          </div>
        </Header>

        <Content
          style={{
            margin: "16px 24px 24px 24px",
            padding: 0,
            minHeight: "calc(100vh - 260px)",
            background: "transparent",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
