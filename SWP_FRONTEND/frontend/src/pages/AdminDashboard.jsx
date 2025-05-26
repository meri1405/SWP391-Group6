import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      role: "PARENT",
      status: "Active",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "b@example.com",
      role: "PARENT",
      status: "Active",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "c@example.com",
      role: "STUDENT",
      status: "Inactive",
    },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);

      // Check if user has ADMIN role (must be uppercase)
      if (parsedUser.roleName !== "ADMIN") {
        alert(
          "Bạn không có quyền truy cập vào trang quản trị. Chỉ ADMIN mới có thể truy cập."
        );
        navigate("/login");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user data:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Tổng quan" },
    { id: "users", label: "Quản lý người dùng" },
    { id: "health", label: "Hồ sơ sức khỏe" },
    { id: "settings", label: "Cài đặt" },
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
      <div className="dashboard-content">
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
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Quản lý người dùng</h2>
        <button className="btn-primary">Thêm người dùng</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Tìm kiếm người dùng..." />
        <button className="btn-search">Tìm kiếm</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view" title="Xem">
                      Xem
                    </button>
                    <button className="btn-action edit" title="Sửa">
                      Sửa
                    </button>
                    <button className="btn-action delete" title="Xóa">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Health Records Management Component
  const HealthRecordsManagement = () => (
    <div className="dashboard-content">
      <div className="content-header">
        <h2>Quản lý hồ sơ sức khỏe</h2>
        <button className="btn-primary">Thêm hồ sơ</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Tìm kiếm hồ sơ..." />
        <button className="btn-search">Tìm kiếm</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên học sinh</th>
              <th>Ngày khám</th>
              <th>Bác sĩ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Nguyễn Văn D</td>
              <td>2024-01-15</td>
              <td>Dr. Smith</td>
              <td>
                <span className="status completed">Completed</span>
              </td>
              <td>
                <div className="action-buttons">
                  <button className="btn-action view" title="Xem">
                    Xem
                  </button>
                  <button className="btn-action edit" title="Sửa">
                    Sửa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Settings Component
  const SettingsManagement = () => (
    <div className="dashboard-content">
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

  if (!user) return null;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-label">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="main-header">
          <h1>Quản Trị Hệ Thống</h1>
        </header>

        <main className="content-area">{renderContent()}</main>
      </div>

      {/* Styles */}
      <style jsx>{`
        .admin-dashboard {
          display: flex;
          min-height: 100vh;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
        }

        .sidebar {
          width: 280px;
          background: #1976d2;
          color: white;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar-header {
          padding: 2rem 1.5rem 1rem 1.5rem;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
        }

        .nav-item {
          width: 100%;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: white;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          font-size: 0.95rem;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active {
          background: rgba(255, 255, 255, 0.15);
          border-right: 3px solid white;
          font-weight: 500;
        }

        .nav-label {
          flex: 1;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logout-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .main-header {
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid #e9ecef;
        }

        .main-header h1 {
          margin: 0;
          color: #1976d2;
          font-size: 1.8rem;
          font-weight: 500;
        }

        .content-area {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .dashboard-content h2 {
          margin: 0 0 2rem 0;
          color: #333;
          font-size: 1.8rem;
          font-weight: 600;
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
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 2rem;
          color: #1976d2;
          font-weight: bold;
        }

        .stat-info p {
          margin: 0.5rem 0 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .charts-section {
          margin: 3rem 0;
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
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e9ecef;
        }

        .chart-container h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .chart-wrapper {
          height: 300px;
          position: relative;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
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
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          background: #1565c0;
        }

        .search-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-bar input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .btn-search {
          background: #6c757d;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        .data-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.active {
          background: #d4edda;
          color: #155724;
        }

        .status.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .status.completed {
          background: #d1ecf1;
          color: #0c5460;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }

        .btn-action.view {
          background: #17a2b8;
          color: white;
        }

        .btn-action.edit {
          background: #ffc107;
          color: #212529;
        }

        .btn-action.delete {
          background: #dc3545;
          color: white;
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
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

        @media (max-width: 768px) {
          .admin-dashboard {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            height: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .chart-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
