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
import { Bar, Doughnut } from "react-chartjs-2";

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

const SchoolNurseDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sample data for the dashboard
  const [stats, setStats] = useState({
    totalMedicineReceived: 156,
    totalMedicalEvents: 89,
    totalVaccinations: 450,
    totalHealthChecks: 1200,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("SchoolNurseDashboard loaded for user:", user);
    console.log("User role:", user.roleName);
  }, [user, navigate]);

  // Navigation items specific to SchoolNurse role
  const navItems = [
    { id: "dashboard", label: "Tổng quan", icon: "📊" },
    { id: "medicine", label: "Nhận thuốc từ phụ huynh", icon: "💊" },
    { id: "medical-events", label: "Ghi nhận sự kiện y tế", icon: "🏥" },
    { id: "inventory", label: "Giám sát tồn kho", icon: "📦" },
    { id: "vaccination", label: "Chiến dịch tiêm chủng", icon: "💉" },
    { id: "health-check", label: "Đợt khám sức khỏe", icon: "👨‍⚕️" },
    { id: "health-records", label: "Hồ sơ y tế học sinh", icon: "📋" },
    { id: "blog-management", label: "Quản lý blog", icon: "📝" },
    { id: "school-health", label: "Thông tin sức khỏe học đường", icon: "🏫" },
  ];

  // Dashboard Overview Component
  const DashboardOverview = () => {
    // Chart data
    const barChartData = {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
      datasets: [
        {
          label: "Số lượng sự kiện y tế",
          data: [12, 19, 15, 25, 22, 30],
          backgroundColor: "rgba(25, 118, 210, 0.8)",
          borderColor: "rgba(25, 118, 210, 1)",
          borderWidth: 1,
        },
      ],
    };

    const doughnutChartData = {
      labels: ["Thuốc đã nhận", "Sự kiện y tế", "Tiêm chủng", "Khám sức khỏe"],
      datasets: [
        {
          data: [156, 89, 450, 1200],
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
        <h2>Tổng quan Y tế Học đường</h2>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalMedicineReceived}</h3>
              <p>Thuốc đã nhận</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalMedicalEvents}</h3>
              <p>Sự kiện y tế</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalVaccinations}</h3>
              <p>Số mũi tiêm chủng</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>{stats.totalHealthChecks}</h3>
              <p>Lượt khám sức khỏe</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-container">
              <h3>Thống kê sự kiện y tế theo tháng</h3>
              <div className="chart-wrapper">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
            <div className="chart-container">
              <h3>Phân bố hoạt động y tế</h3>
              <div className="chart-wrapper">
                <Doughnut data={doughnutChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Placeholder components for each section
  const MedicineReceiving = () => (
    <div className="section">
      <h2>Nhận thuốc từ phụ huynh</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">➕</span> Thêm đơn thuốc mới
          </button>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên học sinh..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="approved">Đã xác nhận</option>
            <option value="completed">Đã cấp phát</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Học sinh</th>
                <th>Tên thuốc</th>
                <th>Liều lượng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MED001</td>
                <td>Nguyễn Văn A</td>
                <td>Paracetamol</td>
                <td>500mg - 2 lần/ngày</td>
                <td>08:00, 14:00</td>
                <td>
                  <span className="status pending">Chờ xác nhận</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Xem</button>
                    <button className="btn-action approve">Xác nhận</button>
                    <button className="btn-action complete">Cấp phát</button>
                  </div>
                </td>
              </tr>
              {/* More medicine records */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const MedicalEvents = () => (
    <div className="section">
      <h2>Ghi nhận và xử lý sự kiện y tế</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">➕</span> Thêm sự kiện y tế
          </button>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tất cả loại sự kiện</option>
            <option value="accident">Tai nạn</option>
            <option value="illness">Dịch bệnh</option>
            <option value="fever">Sốt</option>
            <option value="injury">Té ngã</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã sự kiện</th>
                <th>Thời gian</th>
                <th>Học sinh</th>
                <th>Loại sự kiện</th>
                <th>Mô tả</th>
                <th>Xử lý</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EV001</td>
                <td>15/03/2024 09:30</td>
                <td>Trần Thị B</td>
                <td>Té ngã</td>
                <td>Té ngã ở sân trường</td>
                <td>Sơ cứu, băng bó</td>
                <td>
                  <span className="status in-progress">Đang xử lý</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Chi tiết</button>
                    <button className="btn-action edit">Cập nhật</button>
                    <button className="btn-action complete">Hoàn thành</button>
                  </div>
                </td>
              </tr>
              {/* More medical events */}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .action-buttons {
          margin-bottom: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .btn-primary {
          background: #1976d2;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          background: #1565c0;
          transform: translateY(-1px);
        }

        .search-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .filter-select {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          min-width: 200px;
        }

        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
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

        .status.pending {
          background: #fff3e0;
          color: #e65100;
        }

        .status.approved {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status.completed {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status.in-progress {
          background: #ede7f6;
          color: #4527a0;
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

        .btn-action.approve {
          background: #43a047;
          color: white;
        }

        .btn-action.complete {
          background: #7cb342;
          color: white;
        }

        .btn-action.edit {
          background: #fb8c00;
          color: white;
        }

        .btn-action:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );

  const Inventory = () => (
    <div className="section">
      <h2>Giám sát tồn kho và vật tư y tế</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">📦</span> Yêu cầu nhập thêm
          </button>
          <button className="btn-secondary">
            <span className="icon">📋</span> Xuất báo cáo
          </button>
        </div>

        <div className="search-filters">
          <input
            type="text"
            placeholder="Tìm kiếm vật tư/thuốc..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tất cả danh mục</option>
            <option value="medicine">Thuốc</option>
            <option value="supplies">Vật tư y tế</option>
            <option value="equipment">Thiết bị</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Số lượng tồn</th>
                <th>Đơn vị</th>
                <th>Hạn sử dụng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>MED123</td>
                <td>Paracetamol 500mg</td>
                <td>Thuốc</td>
                <td>150</td>
                <td>Viên</td>
                <td>12/2024</td>
                <td>
                  <span className="status normal">Bình thường</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Chi tiết</button>
                    <button className="btn-action restock">Nhập thêm</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>SUP456</td>
                <td>Băng gạc vô trùng</td>
                <td>Vật tư y tế</td>
                <td>20</td>
                <td>Hộp</td>
                <td>06/2025</td>
                <td>
                  <span className="status low">Sắp hết</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Chi tiết</button>
                    <button className="btn-action restock">Nhập thêm</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const Vaccination = () => (
    <div className="section">
      <h2>Tổ chức chiến dịch tiêm chủng</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">💉</span> Tạo chiến dịch mới
          </button>
          <button className="btn-secondary">
            <span className="icon">📋</span> Xuất danh sách
          </button>
        </div>

        <div className="campaign-cards">
          <div className="campaign-card active">
            <div className="campaign-header">
              <h3>Tiêm phòng Sởi-Rubella</h3>
              <span className="status active">Đang diễn ra</span>
            </div>
            <div className="campaign-info">
              <p><strong>Thời gian:</strong> 15/03/2024 - 20/03/2024</p>
              <p><strong>Đối tượng:</strong> Học sinh 11-12 tuổi</p>
              <p><strong>Tiến độ:</strong> 45/100 học sinh</p>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '45%' }}></div>
            </div>
            <div className="campaign-actions">
              <button className="btn-action view">Xem chi tiết</button>
              <button className="btn-action edit">Cập nhật</button>
            </div>
          </div>

          <div className="campaign-card upcoming">
            <div className="campaign-header">
              <h3>Tiêm phòng Viêm não Nhật Bản</h3>
              <span className="status upcoming">Sắp diễn ra</span>
            </div>
            <div className="campaign-info">
              <p><strong>Thời gian:</strong> 01/04/2024 - 05/04/2024</p>
              <p><strong>Đối tượng:</strong> Học sinh 6-7 tuổi</p>
              <p><strong>Số lượng:</strong> 80 học sinh</p>
            </div>
            <div className="campaign-actions">
              <button className="btn-action view">Xem chi tiết</button>
              <button className="btn-action edit">Chỉnh sửa</button>
            </div>
          </div>
        </div>

        <h3 className="section-title">Danh sách học sinh cần tiêm chủng</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã HS</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Ngày sinh</th>
                <th>Loại vaccine</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HS001</td>
                <td>Nguyễn Văn A</td>
                <td>6A1</td>
                <td>15/06/2017</td>
                <td>Sởi-Rubella</td>
                <td>
                  <span className="status pending">Chưa tiêm</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Chi tiết</button>
                    <button className="btn-action record">Ghi nhận</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .campaign-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .campaign-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #eee;
        }

        .campaign-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .campaign-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }

        .campaign-info {
          margin-bottom: 1rem;
        }

        .campaign-info p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .progress-bar {
          height: 8px;
          background: #eee;
          border-radius: 4px;
          margin: 1rem 0;
          overflow: hidden;
        }

        .progress {
          height: 100%;
          background: #1976d2;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .campaign-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .section-title {
          margin: 2rem 0 1rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .btn-secondary {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .status.normal {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status.low {
          background: #fff3e0;
          color: #e65100;
        }

        .status.active {
          background: #e3f2fd;
          color: #1976d2;
        }

        .status.upcoming {
          background: #f3e5f5;
          color: #7b1fa2;
        }

        .btn-action.restock {
          background: #fb8c00;
          color: white;
        }

        .btn-action.record {
          background: #7cb342;
          color: white;
        }
      `}</style>
    </div>
  );

  const HealthCheck = () => (
    <div className="section">
      <h2>Tổ chức đợt khám sức khỏe</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">➕</span> Tạo đợt khám mới
          </button>
          <button className="btn-secondary">
            <span className="icon">📋</span> Xuất báo cáo
          </button>
        </div>

        <div className="health-check-cards">
          <div className="health-check-card active">
            <div className="card-header">
              <h3>Khám sức khỏe định kỳ Học kỳ I</h3>
              <span className="status active">Đang diễn ra</span>
            </div>
            <div className="card-info">
              <p><strong>Thời gian:</strong> 15/03/2024 - 30/03/2024</p>
              <p><strong>Đối tượng:</strong> Toàn trường</p>
              <p><strong>Tiến độ:</strong> 450/1200 học sinh</p>
              <p><strong>Địa điểm:</strong> Phòng Y tế trường</p>
            </div>
            <div className="progress-bar">
              <div className="progress" style={{ width: '37.5%' }}></div>
            </div>
            <div className="card-actions">
              <button className="btn-action view">Chi tiết</button>
              <button className="btn-action edit">Cập nhật</button>
              <button className="btn-action results">Kết quả</button>
            </div>
          </div>

          <div className="health-check-card planned">
            <div className="card-header">
              <h3>Khám sức khỏe chuyên khoa Răng - Mắt</h3>
              <span className="status planned">Đã lên kế hoạch</span>
            </div>
            <div className="card-info">
              <p><strong>Thời gian:</strong> 10/04/2024 - 15/04/2024</p>
              <p><strong>Đối tượng:</strong> Học sinh khối 6, 7</p>
              <p><strong>Số lượng:</strong> 400 học sinh</p>
              <p><strong>Địa điểm:</strong> Bệnh viện Đa khoa tỉnh</p>
            </div>
            <div className="card-actions">
              <button className="btn-action view">Chi tiết</button>
              <button className="btn-action edit">Chỉnh sửa</button>
            </div>
          </div>
        </div>

        <h3 className="section-title">Danh sách khám hôm nay</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Thời gian</th>
                <th>Loại khám</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Nguyễn Văn A</td>
                <td>6A1</td>
                <td>08:30</td>
                <td>Khám tổng quát</td>
                <td>
                  <span className="status pending">Chờ khám</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action record">Ghi nhận</button>
                    <button className="btn-action view">Chi tiết</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const HealthRecords = () => (
    <div className="section">
      <h2>Cập nhật hồ sơ y tế học sinh</h2>
      <div className="content-card">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">Tất cả lớp</option>
            <option value="6">Khối 6</option>
            <option value="7">Khối 7</option>
            <option value="8">Khối 8</option>
            <option value="9">Khối 9</option>
          </select>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã HS</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Ngày sinh</th>
                <th>Lần khám gần nhất</th>
                <th>Tình trạng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HS001</td>
                <td>Nguyễn Văn A</td>
                <td>6A1</td>
                <td>15/06/2017</td>
                <td>01/03/2024</td>
                <td>
                  <span className="status normal">Bình thường</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action view">Xem hồ sơ</button>
                    <button className="btn-action edit">Cập nhật</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="record-details" style={{ display: 'none' }}>
          <h3>Hồ sơ y tế - Nguyễn Văn A</h3>
          
          <div className="record-sections">
            <div className="record-section">
              <h4>Thông tin cơ bản</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Chiều cao:</label>
                  <span>150 cm</span>
                </div>
                <div className="info-item">
                  <label>Cân nặng:</label>
                  <span>45 kg</span>
                </div>
                <div className="info-item">
                  <label>Nhóm máu:</label>
                  <span>A</span>
                </div>
              </div>
            </div>

            <div className="record-section">
              <h4>Lịch sử tiêm chủng</h4>
              <ul className="record-list">
                <li>
                  <span className="date">15/02/2024</span>
                  <span className="detail">Tiêm phòng Sởi-Rubella</span>
                </li>
              </ul>
            </div>

            <div className="record-section">
              <h4>Lịch sử khám sức khỏe</h4>
              <ul className="record-list">
                <li>
                  <span className="date">01/03/2024</span>
                  <span className="detail">Khám sức khỏe định kỳ</span>
                </li>
              </ul>
            </div>

            <div className="record-section">
              <h4>Sự kiện y tế</h4>
              <ul className="record-list">
                <li>
                  <span className="date">10/03/2024</span>
                  <span className="detail">Sốt nhẹ - Đã điều trị</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .health-check-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .health-check-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #eee;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }

        .card-info {
          margin-bottom: 1rem;
        }

        .card-info p {
          margin: 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .record-details {
          margin-top: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .record-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .record-section {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .record-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-item label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .record-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .record-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          font-size: 0.9rem;
        }

        .record-list .date {
          color: #666;
        }

        .status.planned {
          background: #e8eaf6;
          color: #3f51b5;
        }

        .btn-action.results {
          background: #9c27b0;
          color: white;
        }
      `}</style>
    </div>
  );

  const BlogManagement = () => (
    <div className="section">
      <h2>Quản lý các blog trong hệ thống</h2>
      <div className="content-card">
        <div className="action-buttons">
          <button className="btn-primary">
            <span className="icon">✏️</span> Viết bài mới
          </button>
        </div>

        <div className="blog-grid">
          <div className="blog-card">
            <div className="blog-image">
              <img src="https://via.placeholder.com/300x200" alt="Blog thumbnail" />
              <span className="status published">Đã đăng</span>
            </div>
            <div className="blog-content">
              <h3>Phòng chống dịch bệnh mùa hè</h3>
              <p className="blog-meta">
                <span>Đăng ngày: 10/03/2024</span>
                <span>Lượt xem: 156</span>
              </p>
              <p className="blog-excerpt">
                Các biện pháp phòng chống dịch bệnh thường gặp trong mùa hè và cách
                bảo vệ sức khỏe cho học sinh...
              </p>
              <div className="blog-actions">
                <button className="btn-action edit">Chỉnh sửa</button>
                <button className="btn-action view">Xem</button>
                <button className="btn-action delete">Xóa</button>
              </div>
            </div>
          </div>

          <div className="blog-card">
            <div className="blog-image">
              <img src="https://via.placeholder.com/300x200" alt="Blog thumbnail" />
              <span className="status draft">Nháp</span>
            </div>
            <div className="blog-content">
              <h3>Hướng dẫn sơ cứu cơ bản tại trường học</h3>
              <p className="blog-meta">
                <span>Cập nhật: 12/03/2024</span>
                <span>Chưa đăng</span>
              </p>
              <p className="blog-excerpt">
                Các kỹ năng sơ cứu cơ bản cần thiết cho giáo viên và học sinh trong
                môi trường học đường...
              </p>
              <div className="blog-actions">
                <button className="btn-action edit">Chỉnh sửa</button>
                <button className="btn-action publish">Đăng bài</button>
                <button className="btn-action delete">Xóa</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SchoolHealth = () => (
    <div className="section">
      <h2>Thông tin sức khỏe học đường</h2>
      <div className="content-card">
        <div className="health-info-grid">
          <div className="info-section documents">
            <h3>
              <span className="icon">📚</span> Tài liệu y tế
            </h3>
            <div className="document-list">
              <div className="document-item">
                <span className="doc-icon">📄</span>
                <div className="doc-info">
                  <h4>Hướng dẫn phòng chống dịch</h4>
                  <p>Cập nhật: 10/03/2024</p>
                </div>
                <button className="btn-action view">Xem</button>
              </div>
              <div className="document-item">
                <span className="doc-icon">📄</span>
                <div className="doc-info">
                  <h4>Quy trình sơ cấp cứu</h4>
                  <p>Cập nhật: 05/03/2024</p>
                </div>
                <button className="btn-action view">Xem</button>
              </div>
            </div>
          </div>

          <div className="info-section announcements">
            <h3>
              <span className="icon">📢</span> Thông báo y tế
            </h3>
            <div className="announcement-list">
              <div className="announcement-item urgent">
                <span className="announcement-icon">⚠️</span>
                <div className="announcement-content">
                  <h4>Cảnh báo dịch sốt xuất huyết</h4>
                  <p>
                    Phụ huynh và học sinh cần chú ý các biện pháp phòng ngừa...
                  </p>
                  <span className="date">15/03/2024</span>
                </div>
              </div>
              <div className="announcement-item">
                <span className="announcement-icon">📌</span>
                <div className="announcement-content">
                  <h4>Lịch khám sức khỏe định kỳ</h4>
                  <p>Thông báo lịch khám sức khỏe định kỳ học kỳ II...</p>
                  <span className="date">12/03/2024</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section blogs">
            <h3>
              <span className="icon">📝</span> Bài viết mới
            </h3>
            <div className="blog-list">
              <div className="blog-item">
                <div className="blog-preview">
                  <img
                    src="https://via.placeholder.com/100x100"
                    alt="Blog preview"
                  />
                </div>
                <div className="blog-info">
                  <h4>Dinh dưỡng học đường</h4>
                  <p>
                    Hướng dẫn chế độ dinh dưỡng cân bằng cho học sinh...
                  </p>
                  <span className="date">11/03/2024</span>
                </div>
              </div>
              <div className="blog-item">
                <div className="blog-preview">
                  <img
                    src="https://via.placeholder.com/100x100"
                    alt="Blog preview"
                  />
                </div>
                <div className="blog-info">
                  <h4>Tầm quan trọng của giấc ngủ</h4>
                  <p>
                    Vai trò của giấc ngủ đối với sự phát triển của trẻ...
                  </p>
                  <span className="date">09/03/2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .blog-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .blog-card:hover {
          transform: translateY(-4px);
        }

        .blog-image {
          position: relative;
          height: 200px;
        }

        .blog-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-image .status {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status.published {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .status.draft {
          background: #fff3e0;
          color: #e65100;
        }

        .blog-content {
          padding: 1.5rem;
        }

        .blog-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: #333;
        }

        .blog-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .blog-excerpt {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .blog-actions {
          display: flex;
          gap: 0.5rem;
        }

        .health-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .info-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .info-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.5rem 0;
          font-size: 1.2rem;
          color: #333;
        }

        .document-list,
        .announcement-list,
        .blog-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .document-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .doc-info {
          flex: 1;
        }

        .doc-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          color: #333;
        }

        .doc-info p {
          margin: 0;
          font-size: 0.85rem;
          color: #666;
        }

        .announcement-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .announcement-item.urgent {
          background: #fff3e0;
        }

        .announcement-content {
          flex: 1;
        }

        .announcement-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: #333;
        }

        .announcement-content p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .announcement-content .date {
          font-size: 0.85rem;
          color: #666;
        }

        .blog-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .blog-preview {
          width: 100px;
          height: 100px;
          border-radius: 4px;
          overflow: hidden;
        }

        .blog-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-info {
          flex: 1;
        }

        .blog-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.95rem;
          color: #333;
        }

        .blog-info p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .blog-info .date {
          font-size: 0.85rem;
          color: #666;
        }

        .btn-action.publish {
          background: #43a047;
          color: white;
        }

        @media (max-width: 768px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }

          .health-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "medicine":
        return <MedicineReceiving />;
      case "medical-events":
        return <MedicalEvents />;
      case "inventory":
        return <Inventory />;
      case "vaccination":
        return <Vaccination />;
      case "health-check":
        return <HealthCheck />;
      case "health-records":
        return <HealthRecords />;
      case "blog-management":
        return <BlogManagement />;
      case "school-health":
        return <SchoolHealth />;
      default:
        return <DashboardOverview />;
    }
  };

  if (!user) return null;

  return (
    <div className="nurse-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Y tá Trường học</h3>
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
          <h1>Y tá Trường học</h1>
        </div>
        <div className="content-body">{renderContent()}</div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .nurse-dashboard {
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

        .section {
          padding: 2rem;
        }

        .section h2 {
          margin: 0 0 2rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .content-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .nurse-dashboard {
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

          .chart-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolNurseDashboard; 