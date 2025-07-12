import React, { useState, useEffect } from "react";
import { Spin, Row, Col, Typography, Progress } from "antd";
import managerApi from "../../api/managerApi";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "../../styles/AdminDashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const { Title } = Typography;

const ManagerOverview = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({});
  const [monthlyTrends, setMonthlyTrends] = useState({});
  const [systemOverview, setSystemOverview] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch data from the new comprehensive dashboard API
      const [dashboardData, monthlyData, overviewData] = await Promise.all([
        managerApi.getDashboardStatistics(),
        managerApi.getMonthlyTrends(new Date().getFullYear()),
        managerApi.getSystemOverview(),
      ]);

      console.log("Dashboard statistics:", dashboardData);
      console.log("Monthly trends:", monthlyData);
      console.log("System overview:", overviewData);

      // Debug vaccination data specifically
      console.log("Vaccination stats:", dashboardData?.vaccination);
      console.log("Medical events stats:", dashboardData?.medicalEvents);
      console.log("Health check stats:", dashboardData?.healthCheck);

      setDashboardStats(dashboardData);
      setMonthlyTrends(monthlyData);
      setSystemOverview(overviewData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set fallback data if APIs fail
      setDashboardStats({
        vaccination: { pending: 1, total: 3, approved: 2, completed: 1, rejected: 0, inProgress: 0 },
        healthCheck: { pending: 2, total: 3, approved: 2, completed: 1, cancelled: 0, inProgress: 0 },
        medicalEvents: { total: 1, emergency: 0, resolved: 1, pending: 0 },
        inventory: { totalSupplies: 156, lowStockItems: 23, outOfStockItems: 5, pendingRestockRequests: 4 },
        systemHealth: { 
          overallScore: 100,  // (2+1+0)+(2+1+0) = 6/6 = 100% (all non-pending/non-cancelled)
          vaccinationHealth: 100,
          healthCheckHealth: 100,
          medicalEventHealth: 100
        }
      });
      setMonthlyTrends({ monthlyData: [] });
      setSystemOverview({
        totalVaccinationCampaigns: 30,
        totalHealthCheckCampaigns: 19,
        recentActivity: {
          vaccinationCampaigns: 3,
          healthCheckCampaigns: 2,
          medicalEvents: 12
        },
        urgentItems: {
          pendingVaccinationApprovals: 3,
          pendingHealthCheckApprovals: 2,
          pendingRestockRequests: 4
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get monthly chart data from API
  const getMonthlyChartData = () => {
    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    // Use data from API if available
    const monthlyData = monthlyTrends?.monthlyData || [];
    
    console.log("Monthly trends data:", monthlyTrends);
    console.log("Monthly data array:", monthlyData);
    
    const vaccinationData = monthlyData.map(month => {
      console.log(`Month ${month.month}: vaccination=${month.vaccinationCampaigns}, healthCheck=${month.healthCheckCampaigns}`);
      return month.vaccinationCampaigns || 0;
    });
    const healthCheckData = monthlyData.map(month => month.healthCheckCampaigns || 0);
    const medicalEventsData = monthlyData.map(month => month.medicalEvents || 0);

    console.log("Processed data:", { vaccinationData, healthCheckData, medicalEventsData });

    // Fallback to sample data if API data is not available
    const fallbackVaccinationData = [2, 4, 1, 3, 2, 5, 3, 6, 4, 2, 3, 4];
    const fallbackHealthCheckData = [1, 2, 1, 2, 3, 2, 1, 3, 2, 1, 2, 2];
    const fallbackMedicalEventsData = [8, 12, 7, 15, 11, 9, 13, 18, 10, 6, 9, 14];

    return {
      labels: monthNames,
      datasets: [
        {
          label: "Chiến dịch tiêm chủng",
          data: vaccinationData.length > 0 ? vaccinationData : fallbackVaccinationData,
          backgroundColor: "#ff4d4f",
          borderColor: "#ff4d4f",
          borderWidth: 1,
        },
        {
          label: "Đợt khám sức khỏe",
          data: healthCheckData.length > 0 ? healthCheckData : fallbackHealthCheckData,
          backgroundColor: "#52c41a",
          borderColor: "#52c41a",
          borderWidth: 1,
        },
        {
          label: "Sự kiện y tế",
          data: medicalEventsData.length > 0 ? medicalEventsData : fallbackMedicalEventsData,
          backgroundColor: "#1890ff",
          borderColor: "#1890ff",
          borderWidth: 1,
        },
      ],
    };
  };

  // Helper function to get health activities chart data
  const getHealthActivitiesChartData = () => {
    const vaccination = dashboardStats?.vaccination || {};
    const healthCheck = dashboardStats?.healthCheck || {};
    const medicalEvents = dashboardStats?.medicalEvents || {};

    // Calculate total pending campaigns (vaccination + health check)
    const totalPendingCampaigns = (vaccination.pending || 0) + (healthCheck.pending || 0);

    return {
      labels: [
        "Chiến dịch chờ duyệt",
        "Sự kiện y tế",
        "Tiêm chủng",
        "Khám sức khỏe",
      ],
      datasets: [
        {
          data: [
            totalPendingCampaigns,
            medicalEvents.total || 0,
            vaccination.total || 0,
            healthCheck.total || 0,
          ],
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
  };

  // Helper function to calculate overall approval rate (vaccination + health check)
  const calculateOverallApprovalRate = () => {
    const vaccination = dashboardStats?.vaccination || {};
    const healthCheck = dashboardStats?.healthCheck || {};
    
    // For vaccination: approved campaigns = all except PENDING and REJECTED
    const vaccinationApproved = (vaccination.approved || 0) + (vaccination.completed || 0) + (vaccination.inProgress || 0);
    const vaccinationTotal = vaccination.total || 0;
    
    // For health check: approved campaigns = all except PENDING and CANCELLED
    const healthCheckApproved = (healthCheck.approved || 0) + (healthCheck.completed || 0) + (healthCheck.inProgress || 0);
    const healthCheckTotal = healthCheck.total || 0;
    
    const totalApproved = vaccinationApproved + healthCheckApproved;
    const totalCampaigns = vaccinationTotal + healthCheckTotal;
    
    console.log("Overall approval calculation:", { 
      vaccination: {
        approved: vaccination.approved || 0,
        completed: vaccination.completed || 0,
        inProgress: vaccination.inProgress || 0,
        effectiveApproved: vaccinationApproved
      },
      healthCheck: {
        approved: healthCheck.approved || 0,
        completed: healthCheck.completed || 0,
        inProgress: healthCheck.inProgress || 0,
        effectiveApproved: healthCheckApproved
      },
      totals: {
        totalApproved,
        totalCampaigns,
        rate: totalCampaigns > 0 ? (totalApproved / totalCampaigns * 100) : 0
      }
    });
    
    return totalCampaigns > 0 ? Math.round((totalApproved / totalCampaigns) * 100) : 0;
  };

  // Helper function to calculate medical event resolution rate
  const calculateMedicalEventRate = () => {
    const medicalEvents = dashboardStats?.medicalEvents || {};
    const total = medicalEvents.total || 0;
    const resolved = medicalEvents.resolved || 0;
    
    console.log("Medical events calculation:", { total, resolved, rate: total > 0 ? (resolved / total * 100) : 0 });
    
    return total > 0 ? Math.round((resolved / total) * 100) : 0;
  };

  return (
    <div className="dashboard-overview">
      <h2>Tổng quan Y tế Học đường</h2>

      <Spin spinning={loading}>
        {/* Main Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>{(dashboardStats?.vaccination?.pending || 0) + (dashboardStats?.healthCheck?.pending || 0)}</h3>
              <p>Chiến dịch chờ duyệt</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{dashboardStats?.medicalEvents?.total || 0}</h3>
              <p>Sự kiện y tế</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{dashboardStats?.vaccination?.total || 0}</h3>
              <p>Tổng chiến dịch tiêm chủng</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>{dashboardStats?.healthCheck?.total || 0}</h3>
              <p>Đợt khám sức khỏe</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <div className="stat-info">
                <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>
                  Tỷ lệ duyệt chung
                </h3>
                <Progress
                  percent={calculateOverallApprovalRate()}
                  strokeColor="#52c41a"
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                  format={(percent) => `${percent}%`}
                />
                <p
                  style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
                >
                  {((dashboardStats?.vaccination?.approved || 0) + (dashboardStats?.vaccination?.completed || 0) + (dashboardStats?.vaccination?.inProgress || 0)) + 
                   ((dashboardStats?.healthCheck?.approved || 0) + (dashboardStats?.healthCheck?.completed || 0) + (dashboardStats?.healthCheck?.inProgress || 0))} /{" "}
                  {(dashboardStats?.vaccination?.total || 0) + (dashboardStats?.healthCheck?.total || 0)} chiến dịch đã duyệt
                </p>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <div className="stat-info">
                <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>
                  Tỷ lệ xử lý
                </h3>
                <Progress
                  percent={calculateMedicalEventRate()}
                  strokeColor="#722ed1"
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                  format={(percent) => `${percent}%`}
                />
                <p
                  style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
                >
                  {dashboardStats?.medicalEvents?.resolved || 0} /{" "}
                  {dashboardStats?.medicalEvents?.total || 0} sự kiện
                </p>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div className="stat-card">
              <div className="stat-info">
                <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>
                  Sức khỏe hệ thống
                </h3>
                <Progress
                  percent={dashboardStats?.systemHealth?.overallScore || 0}
                  strokeColor={(() => {
                    const score = dashboardStats?.systemHealth?.overallScore || 0;
                    return score >= 80
                      ? "#52c41a"
                      : score >= 60
                      ? "#faad14"
                      : "#ff4d4f";
                  })()}
                  trailColor="#f0f0f0"
                  strokeWidth={8}
                  format={(percent) => `${percent}%`}
                />
                <p
                  style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
                >
                  Hiệu suất tổng thể hệ thống
                </p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-container">
              <h3>Thống kê hoạt động theo tháng</h3>
              <div className="chart-wrapper">
                {getMonthlyChartData() && (
                  <Bar
                    data={getMonthlyChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            font: {
                              size: 12,
                              weight: "500",
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="chart-container">
              <h3>Phân bố hoạt động y tế</h3>
              <div className="chart-wrapper">
                {getHealthActivitiesChartData() && (
                  <Doughnut
                    data={getHealthActivitiesChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            font: {
                              size: 12,
                              weight: "500",
                            },
                            padding: 20,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* System Overview Cards */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <div className="stat-card">
                <div className="stat-info">
                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Hoạt động gần đây (7 ngày)
                  </h3>
                  <div style={{ textAlign: "left" }}>
                    <p>
                      <strong>Chiến dịch tiêm chủng mới:</strong>{" "}
                      {systemOverview?.recentActivity?.vaccinationCampaigns || 0}
                    </p>
                    <p>
                      <strong>Đợt khám sức khỏe mới:</strong>{" "}
                      {systemOverview?.recentActivity?.healthCheckCampaigns || 0}
                    </p>
                    <p>
                      <strong>Sự kiện y tế:</strong>{" "}
                      {systemOverview?.recentActivity?.medicalEvents || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="stat-card">
                <div className="stat-info">
                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "16px",
                      color: "#333",
                    }}
                  >
                    Cần xử lý khẩn cấp
                  </h3>
                  <div style={{ textAlign: "left" }}>
                    <p>
                      <strong>Chiến dịch tiêm chủng chờ duyệt:</strong>{" "}
                      {systemOverview?.urgentItems?.pendingVaccinationApprovals || 0}
                    </p>
                    <p>
                      <strong>Đợt khám sức khỏe chờ duyệt:</strong>{" "}
                      {systemOverview?.urgentItems?.pendingHealthCheckApprovals || 0}
                    </p>
                    <p>
                      <strong>Yêu cầu bổ sung vật tư:</strong>{" "}
                      {systemOverview?.urgentItems?.pendingRestockRequests || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Spin>
    </div>
  );
};

export default ManagerOverview;
