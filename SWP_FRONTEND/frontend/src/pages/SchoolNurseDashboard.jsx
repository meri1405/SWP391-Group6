import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Spin, message } from 'antd';
import { useAuth } from "../contexts/AuthContext";
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  AlertOutlined,
  InboxOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  HeartOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
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
import '../styles/SchoolNurseDashboard.css';
import '../styles/SidebarTrigger.css';

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

const { Header, Sider, Content } = Layout;

const SchoolNurseDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isSchoolNurse } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userInfo, setUserInfo] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  // Sample data for the dashboard
  const [stats] = useState({
    totalMedicineReceived: 156,
    totalMedicalEvents: 89,
    totalVaccinations: 450,
    totalHealthChecks: 1200,
  });

  // Navigation items specific to SchoolNurse role
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'medicine',
      icon: <MedicineBoxOutlined />,
      label: 'Nhận thuốc từ phụ huynh',
    },
    {
      key: 'medical-events',
      icon: <AlertOutlined />,
      label: 'Ghi nhận sự kiện y tế',
    },
    {
      key: 'inventory',
      icon: <InboxOutlined />,
      label: 'Giám sát tồn kho',
    },
    {
      key: 'vaccination',
      icon: <CalendarOutlined />,
      label: 'Chiến dịch tiêm chủng',
    },
    {
      key: 'health-check',
      icon: <HeartOutlined />,
      label: 'Đợt khám sức khỏe',
    },
    {
      key: 'health-records',
      icon: <FileTextOutlined />,
      label: 'Hồ sơ y tế học sinh',
    },
    {
      key: 'blog-management',
      icon: <EditOutlined />,
      label: 'Quản lý blog',
    },
    {
      key: 'school-health',
      icon: <HeartOutlined />,
      label: 'Thông tin sức khỏe học đường',
    },
  ];

  const handleMenuClick = (e) => {
    const tabKey = e.key;
    setActiveSection(tabKey);
    
    // Chỉ update URL mà không navigate đi đâu khác
    const newUrl = tabKey === 'dashboard' 
      ? '/school-nurse-dashboard' 
      : `/school-nurse-dashboard?tab=${tabKey}`;
    
    // Sử dụng history.pushState để update URL mà không reload page
    window.history.pushState(null, '', newUrl);
  };

  const getBreadcrumbItems = () => {
    const currentItem = menuItems.find(item => item.key === activeSection);
    return [
      {
        title: 'Dashboard',
      },
      {
        title: currentItem?.label || 'Tổng quan',
      },
    ];
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isSchoolNurse()) {
      message.error('Bạn không có quyền truy cập vào trang này');
      navigate('/');
      return;
    }

    setUserInfo(user);
  }, [navigate, isAuthenticated, isSchoolNurse, user]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const validTabs = ['dashboard', 'medicine', 'medical-events', 'inventory', 'vaccination', 'health-check', 'health-records', 'blog-management', 'school-health'];
      if (validTabs.includes(tabParam)) {
        setActiveSection(tabParam);
      } else {
        // Nếu tab không hợp lệ, chuyển về dashboard
        setActiveSection('dashboard');
        window.history.replaceState(null, '', '/school-nurse-dashboard');
      }
    } else {
      setActiveSection('dashboard');
    }
  }, [searchParams]);

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

  const renderContent = () => {
    switch (activeSection) {
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

  // Placeholder components for each section
  const MedicineReceiving = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Nhận thuốc từ phụ huynh</h2>
      <div className="nurse-action-buttons">
        <button className="nurse-btn-primary">
          <MedicineBoxOutlined /> Thêm đơn thuốc mới
        </button>
      </div>

      <div className="nurse-search-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên học sinh..."
          className="nurse-search-input"
        />
        <select className="nurse-filter-select">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="approved">Đã xác nhận</option>
          <option value="completed">Đã cấp phát</option>
        </select>
      </div>

      <div className="nurse-table-container">
        <table className="nurse-data-table">
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
                <span className="nurse-status pending">Chờ xác nhận</span>
              </td>
              <td>
                <div className="nurse-table-actions">
                  <button className="nurse-btn-action view">Xem</button>
                  <button className="nurse-btn-action approve">Xác nhận</button>
                  <button className="nurse-btn-action complete">Cấp phát</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const MedicalEvents = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Ghi nhận và xử lý sự kiện y tế</h2>
      <div className="nurse-action-buttons">
        <button className="nurse-btn-primary">
          <AlertOutlined /> Thêm sự kiện y tế
        </button>
      </div>

      <div className="nurse-search-filters">
        <input
          type="text"
          placeholder="Tìm kiếm sự kiện..."
          className="nurse-search-input"
        />
        <select className="nurse-filter-select">
          <option value="all">Tất cả loại sự kiện</option>
          <option value="accident">Tai nạn</option>
          <option value="illness">Dịch bệnh</option>
          <option value="fever">Sốt</option>
          <option value="injury">Té ngã</option>
        </select>
      </div>

      <div className="nurse-table-container">
        <table className="nurse-data-table">
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
                <span className="nurse-status in-progress">Đang xử lý</span>
              </td>
              <td>
                <div className="nurse-table-actions">
                  <button className="nurse-btn-action view">Chi tiết</button>
                  <button className="nurse-btn-action edit">Cập nhật</button>
                  <button className="nurse-btn-action complete">Hoàn thành</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const Inventory = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Giám sát tồn kho và vật tư y tế</h2>
      <div className="nurse-action-buttons">
        <button className="nurse-btn-primary">
          <InboxOutlined /> Yêu cầu nhập thêm
        </button>
      </div>

      <div className="nurse-search-filters">
        <input
          type="text"
          placeholder="Tìm kiếm vật tư/thuốc..."
          className="nurse-search-input"
        />
        <select className="nurse-filter-select">
          <option value="all">Tất cả danh mục</option>
          <option value="medicine">Thuốc</option>
          <option value="supplies">Vật tư y tế</option>
          <option value="equipment">Thiết bị</option>
        </select>
      </div>

      <div className="nurse-table-container">
        <table className="nurse-data-table">
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
                <span className="nurse-status approved">Bình thường</span>
              </td>
              <td>
                <div className="nurse-table-actions">
                  <button className="nurse-btn-action view">Chi tiết</button>
                  <button className="nurse-btn-action edit">Nhập thêm</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const Vaccination = () => {
    const [activeTab, setActiveTab] = useState('campaign-list');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data cho chiến dịch tiêm chủng mẫu giáo
    const [campaigns, setCampaigns] = useState([
      {
        id: 1,
        name: "Tiêm chủng Sởi - Rubella (MR) năm 2024",
        vaccine: "Sởi - Rubella (MR)",
        ageGroup: "3-5 tuổi",
        startDate: "2024-01-15",
        endDate: "2024-03-15",
        status: "Đang diễn ra",
        totalStudents: 120,
        completedStudents: 85,
        description: "Tiêm chủng phòng bệnh sởi và rubella cho trẻ mẫu giáo theo quy định của Bộ Y tế"
      },
      {
        id: 2,
        name: "Tiêm chủng DPT-VGB-Hib năm 2024",
        vaccine: "DPT-VGB-Hib (5 trong 1)",
        ageGroup: "4-5 tuổi",
        startDate: "2024-02-01",
        endDate: "2024-04-01",
        status: "Chuẩn bị",
        totalStudents: 80,
        completedStudents: 0,
        description: "Tiêm nhắc lại vaccine 5 trong 1 cho trẻ 4-5 tuổi"
      },
      {
        id: 3,
        name: "Tiêm chủng Viêm gan A năm 2024",
        vaccine: "Viêm gan A",
        ageGroup: "3-4 tuổi",
        startDate: "2023-11-01",
        endDate: "2024-01-01",
        status: "Hoàn thành",
        totalStudents: 95,
        completedStudents: 95,
        description: "Tiêm phòng viêm gan A cho trẻ mẫu giáo"
      }
    ]);

    // Mock data cho danh sách học sinh mẫu giáo
    const [students, setStudents] = useState([
      {
        id: 1,
        studentId: "MG001",
        studentName: "Nguyễn Bé An",
        class: "Lá 1",
        dateOfBirth: "2019-05-15",
        age: 4,
        gender: "Nam",
        parentPhone: "0912345678",
        vaccinationHistory: [
          { vaccine: "BCG", date: "2019-06-01", status: "Đã tiêm" },
          { vaccine: "Viêm gan B", date: "2019-07-01", status: "Đã tiêm" }
        ]
      },
      {
        id: 2,
        studentId: "MG002",
        studentName: "Trần Bé Thảo",
        class: "Lá 2",
        dateOfBirth: "2020-08-22",
        age: 3,
        gender: "Nữ",
        parentPhone: "0987654321",
        vaccinationHistory: [
          { vaccine: "BCG", date: "2020-09-01", status: "Đã tiêm" },
          { vaccine: "Viêm gan B", date: "2020-10-01", status: "Đã tiêm" }
        ]
      },
      {
        id: 3,
        studentId: "MG003",
        studentName: "Lê Bé Minh",
        class: "Chồi 1",
        dateOfBirth: "2018-12-10",
        age: 5,
        gender: "Nam",
        parentPhone: "0901234567",
        vaccinationHistory: [
          { vaccine: "BCG", date: "2019-01-01", status: "Đã tiêm" },
          { vaccine: "DPT-VGB-Hib", date: "2019-03-01", status: "Đã tiêm" }
        ]
      }
    ]);

    // Mock data cho lịch sử tiêm chủng theo chiến dịch
    const [vaccinationRecords, setVaccinationRecords] = useState([
      {
        id: 1,
        studentId: "MG001",
        campaignId: 1,
        vaccineDate: "2024-01-20",
        vaccineLot: "MR240120",
        reaction: "Không có phản ứng bất thường",
        status: "Đã tiêm",
        nurseName: "Y tá Lan",
        notes: "Trẻ khỏe mạnh, tiêm bình thường"
      },
      {
        id: 2,
        studentId: "MG002",
        campaignId: 1,
        vaccineDate: null,
        vaccineLot: null,
        reaction: null,
        status: "Chưa tiêm",
        nurseName: null,
        notes: null
      },
      {
        id: 3,
        studentId: "MG003",
        campaignId: 1,
        vaccineDate: "2024-01-22",
        vaccineLot: "MR240120",
        reaction: "Sốt nhẹ 37.5°C sau 6h",
        status: "Đã tiêm",
        nurseName: "Y tá Lan",
        notes: "Có sốt nhẹ, đã hướng dẫn phụ huynh theo dõi"
      }
    ]);

    // Lọc học sinh theo độ tuổi phù hợp với vaccine
    const getEligibleStudents = (vaccine, ageGroup) => {
      const [minAge, maxAge] = ageGroup.split('-').map(a => parseInt(a));
      return students.filter(student => 
        student.age >= minAge && student.age <= maxAge
      );
    };

    const handleVaccinate = (studentId, vaccinationData) => {
      const newRecord = {
        id: vaccinationRecords.length + 1,
        studentId,
        campaignId: selectedCampaign.id,
        vaccineDate: new Date().toISOString().split('T')[0],
        status: "Đã tiêm",
        nurseName: "Y tá Lan",
        ...vaccinationData
      };

      setVaccinationRecords(prev => [...prev, newRecord]);
      
      // Cập nhật số lượng đã tiêm trong campaign
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === selectedCampaign.id
            ? { ...campaign, completedStudents: campaign.completedStudents + 1 }
            : campaign
        )
      );
      
      setShowStudentModal(false);
      message.success('Đã ghi nhận tiêm chủng thành công!');
    };

    const renderCampaignList = () => (
      <div className="nurse-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="nurse-section-title">Chiến dịch tiêm chủng - Mẫu giáo</h2>
          <button 
            className="nurse-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <CalendarOutlined /> Tạo chiến dịch mới
          </button>
        </div>

        <div className="vaccination-campaigns-grid">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="vaccination-campaign-card">
              <div className="campaign-header">
                <h3>{campaign.name}</h3>
                <span className={`campaign-status ${campaign.status.toLowerCase().replace(' ', '-').replace('đang-diễn-ra', 'active').replace('hoàn-thành', 'completed').replace('chuẩn-bị', 'preparing')}`}>
                  {campaign.status}
                </span>
              </div>
              
              <div className="campaign-details">
                <p><strong>Vaccine:</strong> {campaign.vaccine}</p>
                <p><strong>Đối tượng:</strong> Trẻ {campaign.ageGroup}</p>
                <p><strong>Thời gian:</strong> {new Date(campaign.startDate).toLocaleDateString('vi-VN')} - {new Date(campaign.endDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Tiến độ:</strong> {campaign.completedStudents}/{campaign.totalStudents} trẻ</p>
              </div>

              <div className="campaign-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${campaign.totalStudents > 0 ? (campaign.completedStudents / campaign.totalStudents) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {campaign.totalStudents > 0 ? Math.round((campaign.completedStudents / campaign.totalStudents) * 100) : 0}%
                </span>
              </div>

              <div className="campaign-actions">
                <button 
                  className="nurse-btn-action view"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setActiveTab('student-list');
                  }}
                >
                  Xem danh sách
                </button>
                <button 
                  className="nurse-btn-action edit"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setActiveTab('eligible-students');
                  }}
                >
                  Lập danh sách
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderStudentList = () => {
      const campaignRecords = vaccinationRecords.filter(record => record.campaignId === selectedCampaign?.id);
      const eligibleStudents = getEligibleStudents(selectedCampaign?.vaccine, selectedCampaign?.ageGroup);
      
      const filteredStudents = eligibleStudents.filter(student => {
        const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (statusFilter === 'all') return matchesSearch;
        
        const record = campaignRecords.find(r => r.studentId === student.studentId);
        const recordStatus = record?.status || 'Chưa tiêm';
        
        return matchesSearch && (
          (statusFilter === 'completed' && recordStatus === 'Đã tiêm') ||
          (statusFilter === 'pending' && recordStatus === 'Chưa tiêm')
        );
      });

      return (
        <div className="nurse-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <button 
                className="nurse-btn-back"
                onClick={() => setActiveTab('campaign-list')}
              >
                ← Quay lại
              </button>
              <h2 className="nurse-section-title" style={{ marginTop: '16px' }}>
                {selectedCampaign?.name} - Danh sách trẻ
              </h2>
            </div>
          </div>

          <div className="nurse-search-filters">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã trẻ..."
              className="nurse-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="nurse-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã tiêm</option>
              <option value="pending">Chưa tiêm</option>
            </select>
            <select className="nurse-filter-select">
              <option value="all">Tất cả lớp</option>
              <option value="la1">Lá 1</option>
              <option value="la2">Lá 2</option>
              <option value="choi1">Chồi 1</option>
              <option value="choi2">Chồi 2</option>
            </select>
          </div>

          <div className="nurse-table-container">
            <table className="nurse-data-table">
              <thead>
                <tr>
                  <th>Mã trẻ</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Tuổi</th>
                  <th>Giới tính</th>
                  <th>SĐT phụ huynh</th>
                  <th>Ngày tiêm</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const record = campaignRecords.find(r => r.studentId === student.studentId);
                  return (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.studentName}</td>
                      <td>{student.class}</td>
                      <td>{student.age} tuổi</td>
                      <td>{student.gender}</td>
                      <td>{student.parentPhone}</td>
                      <td>{record?.vaccineDate ? new Date(record.vaccineDate).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        <span className={`nurse-status ${record?.status === 'Đã tiêm' ? 'completed' : 'pending'}`}>
                          {record?.status || 'Chưa tiêm'}
                        </span>
                      </td>
                      <td>
                        <div className="nurse-table-actions">
                          <button className="nurse-btn-action view">Hồ sơ</button>
                          {(!record || record.status === 'Chưa tiêm') && (
                            <button 
                              className="nurse-btn-action approve"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentModal(true);
                              }}
                            >
                              Tiêm chủng
                            </button>
                          )}
                          {record?.status === 'Đã tiêm' && (
                            <button className="nurse-btn-action edit">Xem kết quả</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    const renderEligibleStudents = () => {
      const eligibleStudents = getEligibleStudents(selectedCampaign?.vaccine, selectedCampaign?.ageGroup);
      
      return (
        <div className="nurse-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <button 
                className="nurse-btn-back"
                onClick={() => setActiveTab('campaign-list')}
              >
                ← Quay lại
              </button>
              <h2 className="nurse-section-title" style={{ marginTop: '16px' }}>
                Lập danh sách trẻ đủ tuổi tiêm - {selectedCampaign?.vaccine}
              </h2>
            </div>
          </div>

          <div className="eligibility-criteria">
            <h3>Tiêu chí lọc trẻ em</h3>
            <div className="criteria-info">
              <div className="info-card">
                <p><strong>Vaccine:</strong> {selectedCampaign?.vaccine}</p>
                <p><strong>Độ tuổi:</strong> {selectedCampaign?.ageGroup}</p>
                <p><strong>Tổng số trẻ đủ tuổi:</strong> {eligibleStudents.length}</p>
                <p><strong>Quy định Bộ Y tế:</strong> Vaccine an toàn, hiệu quả cao cho trẻ mẫu giáo</p>
              </div>
            </div>
          </div>

          <div className="nurse-table-container">
            <table className="nurse-data-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Mã trẻ</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Tuổi</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Lịch sử tiêm</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {eligibleStudents.map(student => (
                  <tr key={student.id}>
                    <td><input type="checkbox" defaultChecked /></td>
                    <td>{student.studentId}</td>
                    <td>{student.studentName}</td>
                    <td>{student.class}</td>
                    <td>{student.age} tuổi</td>
                    <td>{student.gender}</td>
                    <td>{new Date(student.dateOfBirth).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="vaccination-history">
                        {student.vaccinationHistory.slice(0, 2).map((vac, idx) => (
                          <span key={idx} className="history-item">
                            {vac.vaccine} ✓
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="eligibility-note">Đủ điều kiện</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              className="nurse-btn-primary"
              onClick={() => {
                setCampaigns(prev => 
                  prev.map(campaign => 
                    campaign.id === selectedCampaign.id
                      ? { ...campaign, totalStudents: eligibleStudents.length }
                      : campaign
                  )
                );
                message.success('Đã xác nhận danh sách trẻ đủ tuổi tiêm!');
                setActiveTab('student-list');
              }}
            >
              ✓ Xác nhận danh sách ({eligibleStudents.length} trẻ)
            </button>
          </div>
        </div>
      );
    };

    const renderVaccinationModal = () => (
      showStudentModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content vaccination-modal">
            <div className="modal-header">
              <h3>Ghi nhận tiêm chủng - {selectedStudent.studentName}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowStudentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-info">
                <h4>Thông tin trẻ</h4>
                <div className="info-grid">
                  <p><strong>Họ tên:</strong> {selectedStudent.studentName}</p>
                  <p><strong>Mã trẻ:</strong> {selectedStudent.studentId}</p>
                  <p><strong>Lớp:</strong> {selectedStudent.class}</p>
                  <p><strong>Tuổi:</strong> {selectedStudent.age} tuổi</p>
                  <p><strong>Giới tính:</strong> {selectedStudent.gender}</p>
                  <p><strong>SĐT phụ huynh:</strong> {selectedStudent.parentPhone}</p>
                </div>
              </div>

              <div className="vaccination-form">
                <h4>Thông tin tiêm chủng - {selectedCampaign?.vaccine}</h4>
                <div className="form-group">
                  <label>Ngày tiêm:</label>
                  <input 
                    type="date" 
                    className="nurse-search-input" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    id="vaccineDate"
                  />
                </div>
                <div className="form-group">
                  <label>Số lô vaccine:</label>
                  <input 
                    type="text" 
                    className="nurse-search-input" 
                    placeholder="VD: MR240301, DPT240301" 
                    id="vaccineLot"
                  />
                </div>
                <div className="form-group">
                  <label>Địa điểm tiêm:</label>
                  <select className="nurse-filter-select" id="injectionSite">
                    <option value="arm">Cánh tay phải</option>
                    <option value="thigh">Đùi trái</option>
                    <option value="arm-left">Cánh tay trái</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phản ứng sau tiêm (trong 30 phút đầu):</label>
                  <select className="nurse-filter-select" id="immediateReaction">
                    <option value="none">Không có phản ứng</option>
                    <option value="mild">Đau nhẹ tại chỗ tiêm</option>
                    <option value="fever">Sốt nhẹ dưới 38°C</option>
                    <option value="allergic">Phản ứng dị ứng nhẹ</option>
                    <option value="other">Khác (ghi chú bên dưới)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ghi chú thêm:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="3" 
                    placeholder="Ghi chú về tình trạng sức khỏe trẻ, phản ứng đặc biệt, hướng dẫn phụ huynh..."
                    id="notes"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Y tá thực hiện:</label>
                  <input 
                    type="text" 
                    className="nurse-search-input" 
                    defaultValue="Y tá Lan" 
                    id="nurseName"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="nurse-btn-secondary"
                onClick={() => setShowStudentModal(false)}
              >
                Hủy
              </button>
              <button 
                className="nurse-btn-primary"
                onClick={() => {
                  const formData = {
                    vaccineDate: document.getElementById('vaccineDate').value,
                    vaccineLot: document.getElementById('vaccineLot').value,
                    injectionSite: document.getElementById('injectionSite').value,
                    reaction: document.getElementById('immediateReaction').value,
                    notes: document.getElementById('notes').value,
                    nurseName: document.getElementById('nurseName').value
                  };
                  handleVaccinate(selectedStudent.studentId, formData);
                }}
              >
                ✓ Xác nhận tiêm chủng
              </button>
            </div>
          </div>
        </div>
      )
    );

    return (
      <div>
        {activeTab === 'campaign-list' && renderCampaignList()}
        {activeTab === 'student-list' && renderStudentList()}
        {activeTab === 'eligible-students' && renderEligibleStudents()}
        {renderVaccinationModal()}
      </div>
    );
  };

  const HealthCheck = () => {
    const [activeTab, setActiveTab] = useState('schedule-list');
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExamModal, setShowExamModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock data cho kế hoạch khám sức khỏe mẫu giáo
    const [healthSchedules, setHealthSchedules] = useState([
      {
        id: 1,
        name: "Khám sức khỏe định kỳ học kỳ I - 2024",
        type: "Định kỳ",
        ageGroup: "3-5 tuổi",
        startDate: "2024-01-15",
        endDate: "2024-01-30",
        status: "Đang thực hiện",
        totalStudents: 150,
        completedStudents: 95,
        doctor: "BS. Nguyễn Thị Lan",
        location: "Phòng y tế trường",
        description: "Khám sức khỏe định kỳ cho tất cả trẻ mẫu giáo theo quy định Bộ GD&ĐT"
      },
      {
        id: 2,
        name: "Khám sàng lọc trước khi nhập học",
        type: "Sàng lọc",
        ageGroup: "3-4 tuổi",
        startDate: "2024-08-15",
        endDate: "2024-08-25",
        status: "Hoàn thành",
        totalStudents: 80,
        completedStudents: 80,
        doctor: "BS. Trần Văn Minh",
        location: "Phòng y tế trường",
        description: "Khám sàng lọc cho trẻ mới nhập học năm học 2024-2025"
      },
      {
        id: 3,
        name: "Khám sức khỏe học kỳ II - 2024",
        type: "Định kỳ",
        ageGroup: "3-5 tuổi",
        startDate: "2024-05-01",
        endDate: "2024-05-15",
        status: "Chuẩn bị",
        totalStudents: 0,
        completedStudents: 0,
        doctor: "BS. Lê Thị Hoa",
        location: "Phòng y tế trường",
        description: "Khám sức khỏe học kỳ II cho tất cả trẻ mẫu giáo"
      }
    ]);

    // Mock data cho học sinh mẫu giáo
    const [kindergartenStudents, setKindergartenStudents] = useState([
      {
        id: 1,
        studentId: "MG001",
        studentName: "Nguyễn Bé An",
        class: "Lá 1",
        dateOfBirth: "2019-05-15",
        age: 4,
        gender: "Nam",
        parentName: "Nguyễn Văn A",
        parentPhone: "0912345678",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        healthHistory: ["Dị ứng thức ăn", "Hen phế quản nhẹ"]
      },
      {
        id: 2,
        studentId: "MG002",
        studentName: "Trần Bé Thảo",
        class: "Lá 2",
        dateOfBirth: "2020-08-22",
        age: 3,
        gender: "Nữ",
        parentName: "Trần Thị B",
        parentPhone: "0987654321",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        healthHistory: ["Bình thường"]
      },
      {
        id: 3,
        studentId: "MG003",
        studentName: "Lê Bé Minh",
        class: "Chồi 1",
        dateOfBirth: "2018-12-10",
        age: 5,
        gender: "Nam",
        parentName: "Lê Văn C",
        parentPhone: "0901234567",
        address: "789 Đường DEF, Quận 3, TP.HCM",
        healthHistory: ["Cận thị nhẹ", "Suy dinh dưỡng"]
      }
    ]);

    // Mock data cho kết quả khám sức khỏe
    const [healthResults, setHealthResults] = useState([
      {
        id: 1,
        studentId: "MG001",
        scheduleId: 1,
        examDate: "2024-01-20",
        height: 105, // cm
        weight: 18.5, // kg
        bmi: 16.8,
        bloodPressure: "95/60",
        heartRate: 90,
        temperature: 36.5,
        vision: "10/10 cả hai mắt",
        hearing: "Bình thường",
        dental: "Sâu răng 2 răng",
        respiratory: "Bình thường",
        cardiovascular: "Bình thường",
        musculoskeletal: "Bình thường",
        skin: "Bình thường",
        mentalHealth: "Phát triển tốt",
        nutrition: "Dinh dưỡng tốt",
        overallAssessment: "Khỏe mạnh",
        recommendations: ["Điều trị sâu răng", "Duy trì chế độ ăn uống"],
        doctorName: "BS. Nguyễn Thị Lan",
        nurseName: "Y tá Mai",
        status: "Đã khám",
        nextCheckup: "2024-07-20"
      },
      {
        id: 2,
        studentId: "MG002",
        scheduleId: 1,
        examDate: null,
        status: "Chưa khám"
      }
    ]);

    const handleCreateSchedule = (scheduleData) => {
      const newSchedule = {
        id: healthSchedules.length + 1,
        ...scheduleData,
        totalStudents: 0,
        completedStudents: 0,
        status: "Chuẩn bị"
      };
      setHealthSchedules([...healthSchedules, newSchedule]);
      setShowCreateModal(false);
      message.success('Đã tạo kế hoạch khám sức khỏe thành công!');
    };

    const handleCompleteExam = (studentId, examData) => {
      const newResult = {
        id: healthResults.length + 1,
        studentId,
        scheduleId: selectedSchedule.id,
        examDate: new Date().toISOString().split('T')[0],
        status: "Đã khám",
        doctorName: selectedSchedule.doctor,
        nurseName: "Y tá Mai",
        nextCheckup: new Date(Date.now() + 6*30*24*60*60*1000).toISOString().split('T')[0], // 6 tháng sau
        ...examData
      };

      setHealthResults(prev => [...prev, newResult]);
      
      // Cập nhật số lượng đã khám trong schedule
      setHealthSchedules(prev => 
        prev.map(schedule => 
          schedule.id === selectedSchedule.id
            ? { ...schedule, completedStudents: schedule.completedStudents + 1 }
            : schedule
        )
      );
      
      setShowExamModal(false);
      message.success('Đã ghi nhận kết quả khám sức khỏe thành công!');
    };

    const calculateBMI = (weight, height) => {
      if (!weight || !height) return 0;
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const renderScheduleList = () => (
      <div className="nurse-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="nurse-section-title">Kế hoạch khám sức khỏe - Mẫu giáo</h2>
          <button 
            className="nurse-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <CalendarOutlined /> Lập kế hoạch khám mới
          </button>
        </div>

        <div className="health-schedules-grid">
          {healthSchedules.map(schedule => (
            <div key={schedule.id} className="health-schedule-card">
              <div className="schedule-header">
                <h3>{schedule.name}</h3>
                <span className={`schedule-status ${schedule.status.toLowerCase().replace(' ', '-').replace('đang-thực-hiện', 'active').replace('hoàn-thành', 'completed').replace('chuẩn-bị', 'preparing')}`}>
                  {schedule.status}
                </span>
              </div>
              
              <div className="schedule-details">
                <p><strong>Loại khám:</strong> {schedule.type}</p>
                <p><strong>Đối tượng:</strong> Trẻ {schedule.ageGroup}</p>
                <p><strong>Bác sĩ:</strong> {schedule.doctor}</p>
                <p><strong>Địa điểm:</strong> {schedule.location}</p>
                <p><strong>Thời gian:</strong> {new Date(schedule.startDate).toLocaleDateString('vi-VN')} - {new Date(schedule.endDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Tiến độ:</strong> {schedule.completedStudents}/{schedule.totalStudents} trẻ</p>
              </div>

              <div className="schedule-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill health-progress" 
                    style={{ 
                      width: `${schedule.totalStudents > 0 ? (schedule.completedStudents / schedule.totalStudents) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {schedule.totalStudents > 0 ? Math.round((schedule.completedStudents / schedule.totalStudents) * 100) : 0}%
                </span>
              </div>

              <div className="schedule-actions">
                <button 
                  className="nurse-btn-action view"
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setActiveTab('student-list');
                  }}
                >
                  Danh sách trẻ
                </button>
                <button 
                  className="nurse-btn-action edit"
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setActiveTab('create-plan');
                  }}
                >
                  Lập kế hoạch
                </button>
                <button className="nurse-btn-action approve">Báo cáo</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const renderStudentList = () => {
      const scheduleResults = healthResults.filter(result => result.scheduleId === selectedSchedule?.id);
      
      const filteredStudents = kindergartenStudents.filter(student => {
        const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (statusFilter === 'all') return matchesSearch;
        
        const result = scheduleResults.find(r => r.studentId === student.studentId);
        const resultStatus = result?.status || 'Chưa khám';
        
        return matchesSearch && (
          (statusFilter === 'completed' && resultStatus === 'Đã khám') ||
          (statusFilter === 'pending' && resultStatus === 'Chưa khám')
        );
      });

      return (
        <div className="nurse-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <button 
                className="nurse-btn-back"
                onClick={() => setActiveTab('schedule-list')}
              >
                ← Quay lại
              </button>
              <h2 className="nurse-section-title" style={{ marginTop: '16px' }}>
                {selectedSchedule?.name} - Danh sách trẻ
              </h2>
            </div>
          </div>

          <div className="health-schedule-info">
            <div className="info-card">
              <h4>Thông tin đợt khám</h4>
              <div className="info-grid">
                <p><strong>Bác sĩ:</strong> {selectedSchedule?.doctor}</p>
                <p><strong>Địa điểm:</strong> {selectedSchedule?.location}</p>
                <p><strong>Thời gian:</strong> {new Date(selectedSchedule?.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedSchedule?.endDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Loại khám:</strong> {selectedSchedule?.type}</p>
              </div>
            </div>
          </div>

          <div className="nurse-search-filters">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã trẻ..."
              className="nurse-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="nurse-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="completed">Đã khám</option>
              <option value="pending">Chưa khám</option>
            </select>
            <select className="nurse-filter-select">
              <option value="all">Tất cả lớp</option>
              <option value="la1">Lá 1</option>
              <option value="la2">Lá 2</option>
              <option value="choi1">Chồi 1</option>
              <option value="choi2">Chồi 2</option>
            </select>
          </div>

          <div className="nurse-table-container">
            <table className="nurse-data-table">
              <thead>
                <tr>
                  <th>Mã trẻ</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Tuổi</th>
                  <th>Giới tính</th>
                  <th>Phụ huynh</th>
                  <th>Ngày khám</th>
                  <th>Kết quả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const result = scheduleResults.find(r => r.studentId === student.studentId);
                  return (
                    <tr key={student.id}>
                      <td>{student.studentId}</td>
                      <td>{student.studentName}</td>
                      <td>{student.class}</td>
                      <td>{student.age} tuổi</td>
                      <td>{student.gender}</td>
                      <td>{student.parentName}</td>
                      <td>{result?.examDate ? new Date(result.examDate).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>{result?.overallAssessment || '-'}</td>
                      <td>
                        <span className={`nurse-status ${result?.status === 'Đã khám' ? 'completed' : 'pending'}`}>
                          {result?.status || 'Chưa khám'}
                        </span>
                      </td>
                      <td>
                        <div className="nurse-table-actions">
                          <button className="nurse-btn-action view">Hồ sơ</button>
                          {(!result || result.status === 'Chưa khám') && (
                            <button 
                              className="nurse-btn-action approve"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowExamModal(true);
                              }}
                            >
                              Khám
                            </button>
                          )}
                          {result?.status === 'Đã khám' && (
                            <button className="nurse-btn-action edit">Kết quả</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    const renderCreatePlan = () => (
      <div className="nurse-content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <button 
              className="nurse-btn-back"
              onClick={() => setActiveTab('schedule-list')}
            >
              ← Quay lại
            </button>
            <h2 className="nurse-section-title" style={{ marginTop: '16px' }}>
              Lập kế hoạch khám - {selectedSchedule?.name}
            </h2>
          </div>
        </div>

        <div className="health-plan-form">
          <h3>Thông tin kế hoạch khám</h3>
          <div className="plan-info-card">
            <div className="info-grid">
              <p><strong>Tên đợt khám:</strong> {selectedSchedule?.name}</p>
              <p><strong>Loại khám:</strong> {selectedSchedule?.type}</p>
              <p><strong>Đối tượng:</strong> Trẻ {selectedSchedule?.ageGroup}</p>
              <p><strong>Bác sĩ phụ trách:</strong> {selectedSchedule?.doctor}</p>
              <p><strong>Thời gian:</strong> {new Date(selectedSchedule?.startDate).toLocaleDateString('vi-VN')} - {new Date(selectedSchedule?.endDate).toLocaleDateString('vi-VN')}</p>
              <p><strong>Địa điểm:</strong> {selectedSchedule?.location}</p>
            </div>
          </div>

          <h3>Danh sách trẻ đủ điều kiện khám</h3>
          <div className="eligible-students-table">
            <table className="nurse-data-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" />
                  </th>
                  <th>Mã trẻ</th>
                  <th>Họ tên</th>
                  <th>Lớp</th>
                  <th>Tuổi</th>
                  <th>Giới tính</th>
                  <th>Phụ huynh</th>
                  <th>Tiền sử bệnh</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {kindergartenStudents.map(student => (
                  <tr key={student.id}>
                    <td><input type="checkbox" defaultChecked /></td>
                    <td>{student.studentId}</td>
                    <td>{student.studentName}</td>
                    <td>{student.class}</td>
                    <td>{student.age} tuổi</td>
                    <td>{student.gender}</td>
                    <td>{student.parentName}</td>
                    <td>
                      <div className="health-history">
                        {student.healthHistory.map((history, idx) => (
                          <span key={idx} className="history-tag">
                            {history}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="plan-note">Đủ điều kiện</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button 
              className="nurse-btn-primary"
              onClick={() => {
                setHealthSchedules(prev => 
                  prev.map(schedule => 
                    schedule.id === selectedSchedule.id
                      ? { ...schedule, totalStudents: kindergartenStudents.length, status: "Đang thực hiện" }
                      : schedule
                  )
                );
                message.success('Đã lập kế hoạch khám thành công!');
                setActiveTab('student-list');
              }}
            >
              ✓ Xác nhận kế hoạch ({kindergartenStudents.length} trẻ)
            </button>
          </div>
        </div>
      </div>
    );

    const renderExamModal = () => (
      showExamModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content health-exam-modal">
            <div className="modal-header health-header">
              <h3>Khám sức khỏe - {selectedStudent.studentName}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowExamModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="student-info">
                <h4>Thông tin trẻ</h4>
                <div className="info-grid">
                  <p><strong>Họ tên:</strong> {selectedStudent.studentName}</p>
                  <p><strong>Mã trẻ:</strong> {selectedStudent.studentId}</p>
                  <p><strong>Lớp:</strong> {selectedStudent.class}</p>
                  <p><strong>Tuổi:</strong> {selectedStudent.age} tuổi</p>
                  <p><strong>Giới tính:</strong> {selectedStudent.gender}</p>
                  <p><strong>SĐT phụ huynh:</strong> {selectedStudent.parentPhone}</p>
                </div>
              </div>

              <div className="health-exam-form">
                <h4>Kết quả khám sức khỏe</h4>
                
                <div className="exam-sections">
                  <div className="exam-section">
                    <h5>Thông số cơ bản</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Chiều cao (cm):</label>
                        <input type="number" className="nurse-search-input" placeholder="105" id="height" />
                      </div>
                      <div className="form-group">
                        <label>Cân nặng (kg):</label>
                        <input type="number" className="nurse-search-input" placeholder="18.5" id="weight" />
                      </div>
                      <div className="form-group">
                        <label>Huyết áp:</label>
                        <input type="text" className="nurse-search-input" placeholder="95/60" id="bloodPressure" />
                      </div>
                      <div className="form-group">
                        <label>Nhịp tim:</label>
                        <input type="number" className="nurse-search-input" placeholder="90" id="heartRate" />
                      </div>
                    </div>
                  </div>

                  <div className="exam-section">
                    <h5>Khám chuyên khoa</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Thị lực:</label>
                        <select className="nurse-filter-select" id="vision">
                          <option value="10/10 cả hai mắt">10/10 cả hai mắt</option>
                          <option value="Cận thị nhẹ">Cận thị nhẹ</option>
                          <option value="Viễn thị">Viễn thị</option>
                          <option value="Loạn thị">Loạn thị</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Thính lực:</label>
                        <select className="nurse-filter-select" id="hearing">
                          <option value="Bình thường">Bình thường</option>
                          <option value="Giảm nhẹ">Giảm nhẹ</option>
                          <option value="Cần kiểm tra thêm">Cần kiểm tra thêm</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Răng miệng:</label>
                        <select className="nurse-filter-select" id="dental">
                          <option value="Bình thường">Bình thường</option>
                          <option value="Sâu răng 1-2 răng">Sâu răng 1-2 răng</option>
                          <option value="Sâu răng nhiều">Sâu răng nhiều</option>
                          <option value="Viêm nướu">Viêm nướu</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="exam-section">
                    <h5>Khám tổng quát</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Hô hấp:</label>
                        <select className="nurse-filter-select" id="respiratory">
                          <option value="Bình thường">Bình thường</option>
                          <option value="Viêm đường hô hấp">Viêm đường hô hấp</option>
                          <option value="Hen phế quản">Hen phế quản</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tim mạch:</label>
                        <select className="nurse-filter-select" id="cardiovascular">
                          <option value="Bình thường">Bình thường</option>
                          <option value="Có tiếng thổi">Có tiếng thổi</option>
                          <option value="Cần kiểm tra thêm">Cần kiểm tra thêm</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Tình trạng dinh dưỡng:</label>
                        <select className="nurse-filter-select" id="nutrition">
                          <option value="Dinh dưỡng tốt">Dinh dưỡng tốt</option>
                          <option value="Thừa cân">Thừa cân</option>
                          <option value="Suy dinh dưỡng nhẹ">Suy dinh dưỡng nhẹ</option>
                          <option value="Suy dinh dưỡng">Suy dinh dưỡng</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="exam-section">
                    <h5>Đánh giá tổng quan</h5>
                    <div className="form-group">
                      <label>Phát triển tinh thần:</label>
                      <select className="nurse-filter-select" id="mentalHealth">
                        <option value="Phát triển tốt">Phát triển tốt</option>
                        <option value="Chậm phát triển nhẹ">Chậm phát triển nhẹ</option>
                        <option value="Cần theo dõi">Cần theo dõi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Kết luận tổng quát:</label>
                      <select className="nurse-filter-select" id="overallAssessment">
                        <option value="Khỏe mạnh">Khỏe mạnh</option>
                        <option value="Khỏe mạnh có vấn đề nhỏ">Khỏe mạnh có vấn đề nhỏ</option>
                        <option value="Cần điều trị">Cần điều trị</option>
                        <option value="Cần theo dõi">Cần theo dõi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Khuyến nghị:</label>
                      <textarea 
                        className="nurse-search-input" 
                        rows="3" 
                        id="recommendations"
                        placeholder="Ghi chú khuyến nghị cho phụ huynh..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="nurse-btn-secondary"
                onClick={() => setShowExamModal(false)}
              >
                Hủy
              </button>
              <button 
                className="nurse-btn-primary"
                onClick={() => {
                  const height = parseFloat(document.getElementById('height').value) || 0;
                  const weight = parseFloat(document.getElementById('weight').value) || 0;
                  const formData = {
                    height,
                    weight,
                    bmi: calculateBMI(weight, height),
                    bloodPressure: document.getElementById('bloodPressure').value,
                    heartRate: parseInt(document.getElementById('heartRate').value) || 0,
                    temperature: 36.5,
                    vision: document.getElementById('vision').value,
                    hearing: document.getElementById('hearing').value,
                    dental: document.getElementById('dental').value,
                    respiratory: document.getElementById('respiratory').value,
                    cardiovascular: document.getElementById('cardiovascular').value,
                    nutrition: document.getElementById('nutrition').value,
                    mentalHealth: document.getElementById('mentalHealth').value,
                    overallAssessment: document.getElementById('overallAssessment').value,
                    recommendations: document.getElementById('recommendations').value.split('\n').filter(r => r.trim()),
                    musculoskeletal: "Bình thường",
                    skin: "Bình thường"
                  };
                  handleCompleteExam(selectedStudent.studentId, formData);
                }}
              >
                ✓ Hoàn thành khám
              </button>
            </div>
          </div>
        </div>
      )
    );

    return (
      <div>
        {activeTab === 'schedule-list' && renderScheduleList()}
        {activeTab === 'student-list' && renderStudentList()}
        {activeTab === 'create-plan' && renderCreatePlan()}
        {renderExamModal()}
      </div>
    );
  }
  
  const HealthRecords = () => {
    const [activeTab, setActiveTab] = useState('student-list');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showVaccinationModal, setShowVaccinationModal] = useState(false);
    const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
    const [showMedicalEventModal, setShowMedicalEventModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('all');

    // Mock data cho học sinh tiểu học
    const [primaryStudents, setPrimaryStudents] = useState([
      {
        id: 1,
        studentId: "TH001",
        studentName: "Nguyễn Văn An",
        class: "1A",
        grade: 1,
        dateOfBirth: "2017-05-15",
        age: 6,
        gender: "Nam",
        parentName: "Nguyễn Văn A",
        parentPhone: "0912345678",
        address: "123 Đường ABC, Quận 1, TP.HCM",
        healthHistory: ["Dị ứng thức ăn"],
        bloodType: "O+",
        allergies: ["Đậu phộng", "Tôm cua"]
      },
      {
        id: 2,
        studentId: "TH002",
        studentName: "Trần Thị Bình",
        class: "2B",
        grade: 2,
        dateOfBirth: "2016-08-22",
        age: 7,
        gender: "Nữ",
        parentName: "Trần Văn B",
        parentPhone: "0987654321",
        address: "456 Đường XYZ, Quận 2, TP.HCM",
        healthHistory: ["Bình thường"],
        bloodType: "A+",
        allergies: []
      },
      {
        id: 3,
        studentId: "TH003",
        studentName: "Lê Văn Cường",
        class: "3A",
        grade: 3,
        dateOfBirth: "2015-12-10",
        age: 8,
        gender: "Nam",
        parentName: "Lê Văn C",
        parentPhone: "0901234567",
        address: "789 Đường DEF, Quận 3, TP.HCM",
        healthHistory: ["Cận thị nhẹ"],
        bloodType: "B+",
        allergies: ["Phấn hoa"]
      },
      {
        id: 4,
        studentId: "TH004",
        studentName: "Phạm Thị Dung",
        class: "4C",
        grade: 4,
        dateOfBirth: "2014-03-18",
        age: 9,
        gender: "Nữ",
        parentName: "Phạm Văn D",
        parentPhone: "0909876543",
        address: "321 Đường GHI, Quận 4, TP.HCM",
        healthHistory: ["Hen phế quản nhẹ"],
        bloodType: "AB+",
        allergies: ["Bụi", "Lông động vật"]
      },
      {
        id: 5,
        studentId: "TH005",
        studentName: "Hoàng Văn Em",
        class: "5B",
        grade: 5,
        dateOfBirth: "2013-07-25",
        age: 10,
        gender: "Nam",
        parentName: "Hoàng Văn E",
        parentPhone: "0912567890",
        address: "654 Đường JKL, Quận 5, TP.HCM",
        healthHistory: ["Suy dinh dưỡng nhẹ"],
        bloodType: "O-",
        allergies: ["Kháng sinh Penicillin"]
      }
    ]);

    // Mock data cho lịch sử tiêm chủng
    const [vaccinationHistory, setVaccinationHistory] = useState([
      {
        id: 1,
        studentId: "TH001",
        vaccineName: "Vaccine COVID-19 (Pfizer)",
        vaccineDate: "2023-09-15",
        vaccineLot: "PF230915",
        doseNumber: 1,
        injectionSite: "Cánh tay trái",
        reaction: "Không có phản ứng",
        nurseName: "Y tá Lan",
        notes: "Học sinh khỏe mạnh, tiêm bình thường"
      },
      {
        id: 2,
        studentId: "TH001",
        vaccineName: "Vaccine Sởi - Rubella (MR)",
        vaccineDate: "2023-03-20",
        vaccineLot: "MR230320",
        doseNumber: 1,
        injectionSite: "Cánh tay phải",
        reaction: "Sốt nhẹ 37.5°C",
        nurseName: "Y tá Mai",
        notes: "Có sốt nhẹ sau 6h, đã hướng dẫn phụ huynh"
      }
    ]);

    // Mock data cho lịch sử khám sức khỏe
    const [healthCheckHistory, setHealthCheckHistory] = useState([
      {
        id: 1,
        studentId: "TH001",
        checkDate: "2024-01-15",
        checkType: "Định kỳ học kỳ I",
        height: 120,
        weight: 22.5,
        bmi: 15.6,
        bloodPressure: "100/65",
        heartRate: 85,
        temperature: 36.5,
        vision: "10/10 cả hai mắt",
        hearing: "Bình thường",
        dental: "Sâu răng 1 răng",
        overallAssessment: "Khỏe mạnh",
        recommendations: ["Điều trị sâu răng", "Duy trì chế độ ăn uống"],
        doctorName: "BS. Nguyễn Thị Lan",
        nurseName: "Y tá Mai"
      }
    ]);

    // Mock data cho sự kiện y tế
    const [medicalEvents, setMedicalEvents] = useState([
      {
        id: 1,
        studentId: "TH001",
        eventDate: "2024-02-20",
        eventTime: "10:30",
        eventType: "Té ngã",
        description: "Té ngã ở sân trường khi chơi",
        symptoms: ["Đau đầu gối", "Xây xát nhẹ"],
        treatment: "Làm sạch vết thương, băng bó",
        medication: "Betadine, gạc y tế",
        severity: "Nhẹ",
        parentNotified: true,
        followUp: "Theo dõi 1 tuần",
        nurseName: "Y tá Lan",
        status: "Đã xử lý"
      }
    ]);

    // Lọc học sinh
    const filteredStudents = primaryStudents.filter(student => {
      const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter === 'all' || student.grade.toString() === classFilter;
      return matchesSearch && matchesClass;
    });

    // Thêm tiêm chủng mới
    const handleAddVaccination = (vaccinationData) => {
      const newVaccination = {
        id: vaccinationHistory.length + 1,
        studentId: selectedStudent.studentId,
        vaccineDate: new Date().toISOString().split('T')[0],
        nurseName: "Y tá Lan",
        ...vaccinationData
      };
      setVaccinationHistory(prev => [...prev, newVaccination]);
      setShowVaccinationModal(false);
      message.success('Đã thêm lịch sử tiêm chủng thành công!');
    };

    // Thêm khám sức khỏe mới
    const handleAddHealthCheck = (healthData) => {
      const height = parseFloat(healthData.height) || 0;
      const weight = parseFloat(healthData.weight) || 0;
      const bmi = weight > 0 && height > 0 ? (weight / ((height/100) * (height/100))).toFixed(1) : 0;
      
      const newHealthCheck = {
        id: healthCheckHistory.length + 1,
        studentId: selectedStudent.studentId,
        checkDate: new Date().toISOString().split('T')[0],
        nurseName: "Y tá Mai",
        doctorName: "BS. Nguyễn Thị Lan",
        bmi: parseFloat(bmi),
        ...healthData
      };
      setHealthCheckHistory(prev => [...prev, newHealthCheck]);
      setShowHealthCheckModal(false);
      message.success('Đã thêm kết quả khám sức khỏe thành công!');
    };

    // Thêm sự kiện y tế mới
    const handleAddMedicalEvent = (eventData) => {
      const newEvent = {
        id: medicalEvents.length + 1,
        studentId: selectedStudent.studentId,
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        nurseName: "Y tá Lan",
        status: "Đã xử lý",
        ...eventData
      };
      setMedicalEvents(prev => [...prev, newEvent]);
      setShowMedicalEventModal(false);
      message.success('Đã thêm sự kiện y tế thành công!');
    };

    // Render danh sách học sinh
    const renderStudentList = () => (
      <div className="nurse-content-card">
        <h2 className="nurse-section-title">Hồ sơ y tế học sinh tiểu học</h2>
        
        <div className="nurse-search-filters">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
            className="nurse-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="nurse-filter-select"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">Tất cả khối</option>
            <option value="1">Khối 1</option>
            <option value="2">Khối 2</option>
            <option value="3">Khối 3</option>
            <option value="4">Khối 4</option>
            <option value="5">Khối 5</option>
          </select>
        </div>

        <div className="nurse-table-container">
          <table className="nurse-data-table">
            <thead>
              <tr>
                <th>Mã HS</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Tuổi</th>
                <th>Giới tính</th>
                <th>Nhóm máu</th>
                <th>Dị ứng</th>
                <th>Phụ huynh</th>
                <th>SĐT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.studentName}</td>
                  <td>{student.class}</td>
                  <td>{student.age} tuổi</td>
                  <td>{student.gender}</td>
                  <td>{student.bloodType}</td>
                  <td>
                    {student.allergies.length > 0 ? (
                      <div className="allergies-list">
                        {student.allergies.slice(0, 2).map((allergy, idx) => (
                          <span key={idx} className="allergy-tag">{allergy}</span>
                        ))}
                        {student.allergies.length > 2 && <span>+{student.allergies.length - 2}</span>}
                      </div>
                    ) : (
                      <span className="no-allergies">Không có</span>
                    )}
                  </td>
                  <td>{student.parentName}</td>
                  <td>{student.parentPhone}</td>
                  <td>
                    <div className="nurse-table-actions">
                      <button 
                        className="nurse-btn-action view"
                        onClick={() => {
                          setSelectedStudent(student);
                          setActiveTab('student-detail');
                        }}
                      >
                        Xem hồ sơ
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

    // Render chi tiết hồ sơ học sinh
    const renderStudentDetail = () => {
      const studentVaccinations = vaccinationHistory.filter(v => v.studentId === selectedStudent.studentId);
      const studentHealthChecks = healthCheckHistory.filter(h => h.studentId === selectedStudent.studentId);
      const studentMedicalEvents = medicalEvents.filter(e => e.studentId === selectedStudent.studentId);

      return (
        <div className="nurse-content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <button 
                className="nurse-btn-back"
                onClick={() => setActiveTab('student-list')}
              >
                ← Quay lại danh sách
              </button>
              <h2 className="nurse-section-title" style={{ marginTop: '16px' }}>
                Hồ sơ y tế - {selectedStudent.studentName}
              </h2>
            </div>
          </div>

          {/* Thông tin cơ bản */}
          <div className="student-basic-info">
            <h3>Thông tin cơ bản</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Mã học sinh:</label>
                <span>{selectedStudent.studentId}</span>
              </div>
              <div className="info-item">
                <label>Họ tên:</label>
                <span>{selectedStudent.studentName}</span>
              </div>
              <div className="info-item">
                <label>Lớp:</label>
                <span>{selectedStudent.class}</span>
              </div>
              <div className="info-item">
                <label>Tuổi:</label>
                <span>{selectedStudent.age} tuổi</span>
              </div>
              <div className="info-item">
                <label>Giới tính:</label>
                <span>{selectedStudent.gender}</span>
              </div>
              <div className="info-item">
                <label>Ngày sinh:</label>
                <span>{new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="info-item">
                <label>Nhóm máu:</label>
                <span>{selectedStudent.bloodType}</span>
              </div>
              <div className="info-item">
                <label>Phụ huynh:</label>
                <span>{selectedStudent.parentName}</span>
              </div>
              <div className="info-item">
                <label>SĐT:</label>
                <span>{selectedStudent.parentPhone}</span>
              </div>
              <div className="info-item full-width">
                <label>Địa chỉ:</label>
                <span>{selectedStudent.address}</span>
              </div>
              <div className="info-item full-width">
                <label>Dị ứng:</label>
                <span>
                  {selectedStudent.allergies.length > 0 
                    ? selectedStudent.allergies.join(', ') 
                    : 'Không có dị ứng đã biết'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Lịch sử tiêm chủng */}
          <div className="medical-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Lịch sử tiêm chủng</h3>
              <button 
                className="nurse-btn-primary"
                onClick={() => setShowVaccinationModal(true)}
              >
                + Thêm tiêm chủng
              </button>
            </div>
            <div className="medical-history-table">
              <table className="nurse-data-table">
                <thead>
                  <tr>
                    <th>Ngày tiêm</th>
                    <th>Tên vaccine</th>
                    <th>Mũi số</th>
                    <th>Vị trí tiêm</th>
                    <th>Phản ứng</th>
                    <th>Y tá thực hiện</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {studentVaccinations.length > 0 ? (
                    studentVaccinations.map(vaccination => (
                      <tr key={vaccination.id}>
                        <td>{new Date(vaccination.vaccineDate).toLocaleDateString('vi-VN')}</td>
                        <td>{vaccination.vaccineName}</td>
                        <td>Mũi {vaccination.doseNumber}</td>
                        <td>{vaccination.injectionSite}</td>
                        <td>{vaccination.reaction}</td>
                        <td>{vaccination.nurseName}</td>
                        <td>{vaccination.notes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>
                        Chưa có lịch sử tiêm chủng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lịch sử khám sức khỏe */}
          <div className="medical-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Lịch sử khám sức khỏe</h3>
              <button 
                className="nurse-btn-primary"
                onClick={() => setShowHealthCheckModal(true)}
              >
                + Thêm khám sức khỏe
              </button>
            </div>
            <div className="medical-history-table">
              <table className="nurse-data-table">
                <thead>
                  <tr>
                    <th>Ngày khám</th>
                    <th>Loại khám</th>
                    <th>Chiều cao (cm)</th>
                    <th>Cân nặng (kg)</th>
                    <th>BMI</th>
                    <th>Thị lực</th>
                    <th>Kết luận</th>
                    <th>Bác sĩ</th>
                  </tr>
                </thead>
                <tbody>
                  {studentHealthChecks.length > 0 ? (
                    studentHealthChecks.map(check => (
                      <tr key={check.id}>
                        <td>{new Date(check.checkDate).toLocaleDateString('vi-VN')}</td>
                        <td>{check.checkType}</td>
                        <td>{check.height}</td>
                        <td>{check.weight}</td>
                        <td>{check.bmi}</td>
                        <td>{check.vision}</td>
                        <td>{check.overallAssessment}</td>
                        <td>{check.doctorName}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', color: '#666' }}>
                        Chưa có lịch sử khám sức khỏe
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lịch sử sự kiện y tế */}
          <div className="medical-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Lịch sử sự kiện y tế</h3>
              <button 
                className="nurse-btn-primary"
                onClick={() => setShowMedicalEventModal(true)}
              >
                + Thêm sự kiện y tế
              </button>
            </div>
            <div className="medical-history-table">
              <table className="nurse-data-table">
                <thead>
                  <tr>
                    <th>Ngày/Giờ</th>
                    <th>Loại sự kiện</th>
                    <th>Mô tả</th>
                    <th>Triệu chứng</th>
                    <th>Xử lý</th>
                    <th>Mức độ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMedicalEvents.length > 0 ? (
                    studentMedicalEvents.map(event => (
                      <tr key={event.id}>
                        <td>
                          {new Date(event.eventDate).toLocaleDateString('vi-VN')}<br/>
                          <small>{event.eventTime}</small>
                        </td>
                        <td>{event.eventType}</td>
                        <td>{event.description}</td>
                        <td>{Array.isArray(event.symptoms) ? event.symptoms.join(', ') : event.symptoms}</td>
                        <td>{event.treatment}</td>
                        <td>
                          <span className={`severity-badge ${event.severity.toLowerCase()}`}>
                            {event.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`nurse-status ${event.status === 'Đã xử lý' ? 'completed' : 'pending'}`}>
                            {event.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: '#666' }}>
                        Chưa có sự kiện y tế nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };

    // Modal thêm tiêm chủng
    const renderVaccinationModal = () => (
      showVaccinationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm lịch sử tiêm chủng - {selectedStudent.studentName}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowVaccinationModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên vaccine:</label>
                  <select className="nurse-filter-select" id="vaccineName">
                    <option value="">Chọn vaccine</option>
                    <option value="Vaccine COVID-19 (Pfizer)">Vaccine COVID-19 (Pfizer)</option>
                    <option value="Vaccine Sởi - Rubella (MR)">Vaccine Sởi - Rubella (MR)</option>
                    <option value="Vaccine DPT-VGB-Hib">Vaccine DPT-VGB-Hib</option>
                    <option value="Vaccine Viêm gan A">Vaccine Viêm gan A</option>
                    <option value="Vaccine HPV">Vaccine HPV</option>
                    <option value="Vaccine Cúm mùa">Vaccine Cúm mùa</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Số lô vaccine:</label>
                  <input type="text" className="nurse-search-input" id="vaccineLot" placeholder="VD: PF240301" />
                </div>
                <div className="form-group">
                  <label>Mũi số:</label>
                  <select className="nurse-filter-select" id="doseNumber">
                    <option value="1">Mũi 1</option>
                    <option value="2">Mũi 2</option>
                    <option value="3">Mũi 3</option>
                    <option value="4">Mũi nhắc lại</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Vị trí tiêm:</label>
                  <select className="nurse-filter-select" id="injectionSite">
                    <option value="Cánh tay trái">Cánh tay trái</option>
                    <option value="Cánh tay phải">Cánh tay phải</option>
                    <option value="Đùi trái">Đùi trái</option>
                    <option value="Đùi phải">Đùi phải</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phản ứng sau tiêm:</label>
                  <select className="nurse-filter-select" id="reaction">
                    <option value="Không có phản ứng">Không có phản ứng</option>
                    <option value="Đau nhẹ tại chỗ tiêm">Đau nhẹ tại chỗ tiêm</option>
                    <option value="Sốt nhẹ dưới 38°C">Sốt nhẹ dưới 38°C</option>
                    <option value="Sốt cao trên 38°C">Sốt cao trên 38°C</option>
                    <option value="Phản ứng dị ứng nhẹ">Phản ứng dị ứng nhẹ</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Ghi chú:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="3" 
                    id="vaccinationNotes"
                    placeholder="Ghi chú thêm về quá trình tiêm chủng..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="nurse-btn-secondary"
                onClick={() => setShowVaccinationModal(false)}
              >
                Hủy
              </button>
              <button 
                className="nurse-btn-primary"
                onClick={() => {
                  const vaccineName = document.getElementById('vaccineName').value;
                  if (!vaccineName) {
                    message.error('Vui lòng chọn vaccine');
                    return;
                  }
                  
                  const vaccinationData = {
                    vaccineName,
                    vaccineLot: document.getElementById('vaccineLot').value,
                    doseNumber: parseInt(document.getElementById('doseNumber').value),
                    injectionSite: document.getElementById('injectionSite').value,
                    reaction: document.getElementById('reaction').value,
                    notes: document.getElementById('vaccinationNotes').value
                  };
                  handleAddVaccination(vaccinationData);
                }}
              >
                Lưu tiêm chủng
              </button>
            </div>
          </div>
        </div>
      )
    );

    // Modal thêm khám sức khỏe
    const renderHealthCheckModal = () => (
      showHealthCheckModal && (
        <div className="modal-overlay">
          <div className="modal-content health-check-modal">
            <div className="modal-header">
              <h3>Thêm kết quả khám sức khỏe - {selectedStudent.studentName}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowHealthCheckModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-sections">
                <div className="form-section">
                  <h4>Thông tin khám</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Loại khám:</label>
                      <select className="nurse-filter-select" id="checkType">
                        <option value="Định kỳ học kỳ I">Định kỳ học kỳ I</option>
                        <option value="Định kỳ học kỳ II">Định kỳ học kỳ II</option>
                        <option value="Sàng lọc">Sàng lọc</option>
                        <option value="Khám đột xuất">Khám đột xuất</option>
                        <option value="Khám theo yêu cầu">Khám theo yêu cầu</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Thông số cơ bản</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Chiều cao (cm):</label>
                      <input type="number" className="nurse-search-input" id="height" placeholder="120" />
                    </div>
                    <div className="form-group">
                      <label>Cân nặng (kg):</label>
                      <input type="number" className="nurse-search-input" id="weight" placeholder="22.5" />
                    </div>
                    <div className="form-group">
                      <label>Huyết áp:</label>
                      <input type="text" className="nurse-search-input" id="bloodPressure" placeholder="100/65" />
                    </div>
                    <div className="form-group">
                      <label>Nhịp tim:</label>
                      <input type="number" className="nurse-search-input" id="heartRate" placeholder="85" />
                    </div>
                    <div className="form-group">
                      <label>Nhiệt độ (°C):</label>
                      <input type="number" step="0.1" className="nurse-search-input" id="temperature" placeholder="36.5" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Khám chuyên khoa</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Thị lực:</label>
                      <select className="nurse-filter-select" id="vision">
                        <option value="10/10 cả hai mắt">10/10 cả hai mắt</option>
                        <option value="Cận thị nhẹ">Cận thị nhẹ</option>
                        <option value="Cận thị vừa">Cận thị vừa</option>
                        <option value="Viễn thị">Viễn thị</option>
                        <option value="Loạn thị">Loạn thị</option>
                        <option value="Cần kiểm tra thêm">Cần kiểm tra thêm</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Thính lực:</label>
                      <select className="nurse-filter-select" id="hearing">
                        <option value="Bình thường">Bình thường</option>
                        <option value="Giảm nhẹ">Giảm nhẹ</option>
                        <option value="Cần kiểm tra thêm">Cần kiểm tra thêm</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Răng miệng:</label>
                      <select className="nurse-filter-select" id="dental">
                        <option value="Bình thường">Bình thường</option>
                        <option value="Sâu răng 1 răng">Sâu răng 1 răng</option>
                        <option value="Sâu răng 2-3 răng">Sâu răng 2-3 răng</option>
                        <option value="Sâu răng nhiều">Sâu răng nhiều</option>
                        <option value="Viêm nướu">Viêm nướu</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4>Đánh giá tổng quan</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Kết luận:</label>
                      <select className="nurse-filter-select" id="overallAssessment">
                        <option value="Khỏe mạnh">Khỏe mạnh</option>
                        <option value="Khỏe mạnh có vấn đề nhỏ">Khỏe mạnh có vấn đề nhỏ</option>
                        <option value="Cần điều trị">Cần điều trị</option>
                        <option value="Cần theo dõi">Cần theo dõi</option>
                        <option value="Cần chuyển viện">Cần chuyển viện</option>
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label>Khuyến nghị:</label>
                      <textarea 
                        className="nurse-search-input" 
                        rows="3" 
                        id="recommendations"
                        placeholder="Khuyến nghị cho phụ huynh và học sinh..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="nurse-btn-secondary"
                onClick={() => setShowHealthCheckModal(false)}
              >
                Hủy
              </button>
              <button 
                className="nurse-btn-primary"
                onClick={() => {
                  const healthData = {
                    checkType: document.getElementById('checkType').value,
                    height: document.getElementById('height').value,
                    weight: document.getElementById('weight').value,
                    bloodPressure: document.getElementById('bloodPressure').value,
                    heartRate: document.getElementById('heartRate').value,
                    temperature: document.getElementById('temperature').value,
                    vision: document.getElementById('vision').value,
                    hearing: document.getElementById('hearing').value,
                    dental: document.getElementById('dental').value,
                    overallAssessment: document.getElementById('overallAssessment').value,
                    recommendations: document.getElementById('recommendations').value.split('\n').filter(r => r.trim())
                  };
                  handleAddHealthCheck(healthData);
                }}
              >
                Lưu kết quả
              </button>
            </div>
          </div>
        </div>
      )
    );

    // Modal thêm sự kiện y tế
    const renderMedicalEventModal = () => (
      showMedicalEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm sự kiện y tế - {selectedStudent.studentName}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowMedicalEventModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Loại sự kiện:</label>
                  <select className="nurse-filter-select" id="eventType">
                    <option value="">Chọn loại sự kiện</option>
                    <option value="Té ngã">Té ngã</option>
                    <option value="Đau bụng">Đau bụng</option>
                    <option value="Sốt">Sốt</option>
                    <option value="Đau đầu">Đau đầu</option>
                    <option value="Buồn nôn">Buồn nôn</option>
                    <option value="Chảy máu cam">Chảy máu cam</option>
                    <option value="Dị ứng">Dị ứng</option>
                    <option value="Khó thở">Khó thở</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mức độ nghiêm trọng:</label>
                  <select className="nurse-filter-select" id="severity">
                    <option value="Nhẹ">Nhẹ</option>
                    <option value="Vừa">Vừa</option>
                    <option value="Nặng">Nặng</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Mô tả chi tiết:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="3" 
                    id="description"
                    placeholder="Mô tả chi tiết về sự kiện..."
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Triệu chứng:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="2" 
                    id="symptoms"
                    placeholder="Các triệu chứng quan sát được (mỗi triệu chứng một dòng)..."
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Biện pháp xử lý:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="3" 
                    id="treatment"
                    placeholder="Các biện pháp đã thực hiện..."
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Thuốc/Vật tư sử dụng:</label>
                  <input 
                    type="text" 
                    className="nurse-search-input" 
                    id="medication"
                    placeholder="VD: Betadine, gạc y tế..."
                  />
                </div>
                <div className="form-group">
                  <label>Đã thông báo phụ huynh:</label>
                  <select className="nurse-filter-select" id="parentNotified">
                    <option value={true}>Có</option>
                    <option value={false}>Chưa</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Theo dõi sau:</label>
                  <textarea 
                    className="nurse-search-input" 
                    rows="2" 
                    id="followUp"
                    placeholder="Kế hoạch theo dõi..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="nurse-btn-secondary"
                onClick={() => setShowMedicalEventModal(false)}
              >
                Hủy
              </button>
              <button 
                className="nurse-btn-primary"
                onClick={() => {
                  const eventType = document.getElementById('eventType').value;
                  if (!eventType) {
                    message.error('Vui lòng chọn loại sự kiện');
                    return;
                  }
                  
                  const symptoms = document.getElementById('symptoms').value
                    .split('\n')
                    .filter(s => s.trim())
                    .map(s => s.trim());
                
                  const eventData = {
                    eventType,
                    severity: document.getElementById('severity').value,
                    description: document.getElementById('description').value,
                    symptoms: symptoms.length > 0 ? symptoms : [],
                    treatment: document.getElementById('treatment').value,
                    medication: document.getElementById('medication').value,
                    parentNotified: document.getElementById('parentNotified').value === 'true',
                    followUp: document.getElementById('followUp').value
                  };
                  handleAddMedicalEvent(eventData);
                }}
              >
                Lưu sự kiện
              </button>
            </div>
          </div>
        </div>
      )
    );

    return (
      <div>
        {activeTab === 'student-list' && renderStudentList()}
        {activeTab === 'student-detail' && renderStudentDetail()}
        {renderVaccinationModal()}
        {renderHealthCheckModal()}
        {renderMedicalEventModal()}
      </div>
    );
  };

  if (!userInfo) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f4f6fb' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="school-nurse-dashboard">
      <Sider
        width={240}
        collapsed={collapsed}
        theme="light"
        className="nurse-sidebar"
        style={{
          borderRight: '1px solid #f0f0f0',
          background: '#fff',
          zIndex: 10,
          paddingTop: 24,
          position: 'relative'
        }}
        trigger={null}
      >
        <div className="nurse-user-section">
          <div className="nurse-user-avatar">
            <UserOutlined style={{ fontSize: 32, color: '#1976d2' }} />
          </div>
          {!collapsed && (
            <span className="nurse-user-badge">
              Y tá Trường học
            </span>
          )}
        </div>

        <Menu
          theme="light"
          selectedKeys={[activeSection]}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none', fontWeight: 500, fontSize: 16 }}
        />

        {/* Custom Sidebar Trigger Button */}
        <div 
          className="custom-sidebar-trigger"
          onClick={() => setCollapsed(!collapsed)}
          tabIndex={0}
          role="button"
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setCollapsed(!collapsed);
            }
          }}
        >
          {collapsed ? 
            <RightOutlined className="icon-right" /> : 
            <LeftOutlined className="icon-left" />
          }
          {!collapsed && <span className="trigger-text">Thu gọn</span>}
        </div>
      </Sider>

      <Layout style={{ marginLeft: 0 }}>
        <Header className="nurse-header">
          <div style={{ flex: 1 }}>
            <Breadcrumb items={getBreadcrumbItems()} style={{ fontSize: 14, marginBottom: 4 }} />
            <h1 className="nurse-header-title">Bảng điều khiển Y tá Trường học</h1>
          </div>
          <div className="nurse-header-user">
            <div className="nurse-header-avatar">
              <UserOutlined style={{ fontSize: 20, color: '#1976d2' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: 16 }}>
              {userInfo?.firstName || ''} {userInfo?.lastName || ''}
            </span>
          </div>
        </Header>

        <Content className="nurse-content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default SchoolNurseDashboard;
