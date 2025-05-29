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

  const HealthCheck = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Tổ chức đợt khám sức khỏe</h2>
      <div className="nurse-action-buttons">
        <button className="nurse-btn-primary">
          <HeartOutlined /> Tạo đợt khám mới
        </button>
      </div>
      <p>Chức năng khám sức khỏe đang được phát triển...</p>
    </div>
  );

  const HealthRecords = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Cập nhật hồ sơ y tế học sinh</h2>
      <div className="nurse-search-filters">
        <input
          type="text"
          placeholder="Tìm kiếm học sinh..."
          className="nurse-search-input"
        />
        <select className="nurse-filter-select">
          <option value="all">Tất cả lớp</option>
          <option value="6">Khối 6</option>
          <option value="7">Khối 7</option>
          <option value="8">Khối 8</option>
          <option value="9">Khối 9</option>
        </select>
      </div>
      <p>Chức năng hồ sơ y tế đang được phát triển...</p>
    </div>
  );

  const BlogManagement = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Quản lý các blog trong hệ thống</h2>
      <div className="nurse-action-buttons">
        <button className="nurse-btn-primary">
          <EditOutlined /> Viết bài mới
        </button>
      </div>
      <p>Chức năng quản lý blog đang được phát triển...</p>
    </div>
  );

  const SchoolHealth = () => (
    <div className="nurse-content-card">
      <h2 className="nurse-section-title">Thông tin sức khỏe học đường</h2>
      <p>Chức năng thông tin sức khỏe học đường đang được phát triển...</p>
    </div>
  );
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
  );};

export default SchoolNurseDashboard;
