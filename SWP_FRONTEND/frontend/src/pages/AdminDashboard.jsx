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
    <div className="health-records">
      <div className="section-header">
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
          padding: 16px 20px;
          overflow-y: auto;
          background: #f8f9fa;
        }

        .content-body > * {
          background: white;
          border-radius: 12px;
          padding: 16px;
          margin: 8px;
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
          margin-bottom: 2rem;
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
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .data-table th {
          background: #f5f5f5;
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
          background: #1976d2;
          color: white;
        }

        .btn-action.edit {
          background: #ff9800;
          color: white;
        }

        .btn-action.delete {
          background: #f44336;
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

        @media (max-width: 768px) {
          .admin-dashboard {
            flex-direction: column;
            margin: 80px 10px 10px 10px;
            min-height: calc(100vh - 120px);
          }

          .sidebar {
            width: 100%;
            max-width: none;
            position: relative;
            border-radius: 0;
          }

          .sidebar-header {
            padding: 12px 16px;
            border-radius: 0;
          }

          .sidebar-header h3 {
            font-size: 20px;
          }

          .sidebar-nav {
            display: flex;
            overflow-x: auto;
            padding: 10px 0;
          }

          .nav-item {
            min-width: 140px;
            flex-direction: column;
            text-align: center;
            padding: 10px 5px;
          }

          .nav-icon {
            margin-right: 0;
            margin-bottom: 5px;
            font-size: 18px;
          }

          .nav-label {
            font-size: 12px;
          }

          .content-header {
            padding: 12px 16px;
            border-radius: 12px 12px 0 0;
          }

          .content-header h1 {
            font-size: 20px;
          }

          .content-header p {
            font-size: 12px;
          }

          .content-body {
            padding: 12px 16px;
          }

          .content-body > * {
            border-radius: 10px;
            padding: 12px;
            margin: 6px;
            transition: none;
          }

          .content-body > *:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            transform: none;
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
