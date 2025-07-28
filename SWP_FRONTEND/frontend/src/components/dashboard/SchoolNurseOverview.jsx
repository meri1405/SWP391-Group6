import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Tag, Alert, Space, Spin, Segmented, Select, DatePicker, Button } from 'antd';
import {
  MedicineBoxOutlined,
  AlertOutlined,
  HeartOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  CalendarOutlined,
  InboxOutlined,
  TrophyOutlined,
  TableOutlined,
  BarChartOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useNurseDashboardStats } from '../../hooks/useNurseDashboardStats';
import SchoolNurseChartsOverview from './SchoolNurseChartsOverview';
import '../../styles/SchoolNurseOverview.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SchoolNurseOverview = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'charts'
  const [dateRange, setDateRange] = useState(null);
  
  const { 
    stats, 
    loading, 
    keyMetrics, 
    urgentAlerts,
    filterType,
    setFilterType,
    setDateRangeFilter,
    refresh
  } = useNurseDashboardStats();

  // Handle filter changes
  const handleFilterChange = (value) => {
    setFilterType(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates.length === 2) {
      setDateRangeFilter(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }
  };

  // Debug logging
  console.log("SchoolNurseOverview - stats:", stats);
  console.log("SchoolNurseOverview - loading:", loading);
  console.log("SchoolNurseOverview - keyMetrics:", keyMetrics);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="school-nurse-overview">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // If charts view is selected, render the charts component
  if (viewMode === 'charts') {
    return (
      <SchoolNurseChartsOverview 
        currentViewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    );
  }

  // Use fetched data or fallback to static data
  const currentStats = stats ? {
    // Medication Requests
    totalMedicationRequests: stats.medicationRequests?.totalRequests || 0,
    pendingMedicationRequests: stats.medicationRequests?.pendingRequests || 0,
    approvedMedicationRequests: stats.medicationRequests?.approvedRequests || 0,
    rejectedMedicationRequests: stats.medicationRequests?.rejectedRequests || 0,
    
    // Medical Events
    totalMedicalEvents: stats.medicalEvents?.totalEvents || 0,
    pendingMedicalEvents: stats.medicalEvents?.pendingEvents || 0,
    resolvedMedicalEvents: stats.medicalEvents?.resolvedEvents || 0,
    
    // Medical Inventory
    totalSupplies: stats.medicalInventory?.totalSupplies || 0,
    lowStockSupplies: stats.medicalInventory?.lowStockSupplies || 0,
    expiringSoonSupplies: stats.medicalInventory?.expiringSoonSupplies || 0,
    expiredSupplies: stats.medicalInventory?.expiredSupplies || 0,
    
    // Health Profiles
    pendingHealthProfiles: stats.healthProfiles?.pendingProfiles || 0,
    approvedHealthProfiles: stats.healthProfiles?.approvedProfiles || 0,
    studentsWithoutProfiles: stats.healthProfiles?.studentsWithoutProfiles || 0,
    
    // Campaigns
    totalVaccinationCampaigns: stats.vaccinationCampaigns?.totalCampaigns || 0,
    totalHealthCheckCampaigns: stats.healthCheckCampaigns?.totalCampaigns || 0,
    
    // Medication Intake
    totalDoses: stats.medicationIntake?.totalDoses || 0,
    takenDoses: stats.medicationIntake?.takenDoses || 0,
    missedDoses: stats.medicationIntake?.missedDoses || 0,
    pendingDoses: stats.medicationIntake?.pendingDoses || 0
  } : (keyMetrics || {
    totalMedicationRequests: 45,
    pendingMedicationRequests: 8,
    approvedMedicationRequests: 32,
    rejectedMedicationRequests: 5,
    
    totalMedicalEvents: 23,
    pendingMedicalEvents: 3,
    resolvedMedicalEvents: 20,
    
    totalSupplies: 156,
    lowStockSupplies: 12,
    expiringSoonSupplies: 8,
    expiredSupplies: 2,
    
    pendingHealthProfiles: 15,
    approvedHealthProfiles: 89,
    studentsWithoutProfiles: 25,
    
    totalVaccinationCampaigns: 6,
    totalHealthCheckCampaigns: 4,
    
    totalDoses: 234,
    takenDoses: 198,
    missedDoses: 21,
    pendingDoses: 15
  });

  // Debug the transformed data
  console.log("SchoolNurseOverview - currentStats after transformation:", currentStats);

  // Use dynamic alerts or fallback to static alerts
  const currentAlerts = urgentAlerts || (stats ? [
    // Generate alerts based on real data
    ...(stats.medicalEvents?.pendingEvents > 0 ? [{
              title: 'Xử lý sơ cứu chưa giải quyết',
        message: `${stats.medicalEvents.pendingEvents} xử lý sơ cứu đang chờ xử lý`,
      type: "error",
      count: stats.medicalEvents.pendingEvents
    }] : []),
    ...(stats.medicationRequests?.pendingRequests > 0 ? [{
      title: 'Yêu cầu thuốc chờ duyệt',
      message: `${stats.medicationRequests.pendingRequests} yêu cầu thuốc đang chờ duyệt`,
      type: "warning",
      count: stats.medicationRequests.pendingRequests
    }] : []),
    ...(stats.medicalInventory?.lowStockSupplies > 0 ? [{
      title: 'Cảnh báo tồn kho thấp',
      message: `${stats.medicalInventory.lowStockSupplies} vật tư y tế sắp hết`,
      type: "warning",
      count: stats.medicalInventory.lowStockSupplies
    }] : []),
    ...(stats.medicalInventory?.expiredSupplies > 0 ? [{
      title: 'Vật tư hết hạn',
      message: `${stats.medicalInventory.expiredSupplies} vật tư y tế đã hết hạn`,
      type: "error",
      count: stats.medicalInventory.expiredSupplies
    }] : []),
    ...(stats.healthProfiles?.pendingProfiles > 0 ? [{
      title: 'Hồ sơ sức khỏe chờ duyệt',
      message: `${stats.healthProfiles.pendingProfiles} hồ sơ sức khỏe đang chờ duyệt`,
      type: "warning",
      count: stats.healthProfiles.pendingProfiles
    }] : [])
  ] : [
    {
      title: "Cảnh báo vật tư sắp hết hạn",
      message: "12 vật tư y tế sắp hết hạn trong 7 ngày tới",
      type: "warning",
      count: 12
    },
    {
              title: "Xử lý sơ cứu chờ xử lý",
        message: "3 xử lý sơ cứu đang chờ xử lý",
      type: "error",
      count: 3
    }
  ]);

  // Calculate percentages
  const medicationApprovalRate = currentStats.totalMedicationRequests > 0 
    ? ((currentStats.approvedMedicationRequests / currentStats.totalMedicationRequests) * 100).toFixed(1)
    : 0;

  const medicationComplianceRate = currentStats.totalDoses > 0
    ? ((currentStats.takenDoses / currentStats.totalDoses) * 100).toFixed(1)
    : 0;

  const eventResolutionRate = currentStats.totalMedicalEvents > 0
    ? ((currentStats.resolvedMedicalEvents / currentStats.totalMedicalEvents) * 100).toFixed(1)
    : 0;

  const inventoryHealthRate = currentStats.totalSupplies > 0
    ? (((currentStats.totalSupplies - currentStats.lowStockSupplies - currentStats.expiredSupplies) / currentStats.totalSupplies) * 100).toFixed(1)
    : 0;

  return (
    <div className="school-nurse-overview">
      <div className="overview-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2>Tổng quan Y tế Trường học</h2>
            <p>Theo dõi và quản lý các hoạt động y tế trong trường học</p>
          </div>
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { label: 'Bảng thống kê', value: 'table', icon: <TableOutlined /> },
              { label: 'Biểu đồ', value: 'charts', icon: <BarChartOutlined /> }
            ]}
          />
        </div>
      </div>

      {/* Urgent Alerts */}
      {currentAlerts && currentAlerts.length > 0 && (
        <div className="urgent-alerts-section">
          <h3>Cảnh báo khẩn cấp</h3>
          <Space direction="vertical" style={{ width: '100%' }}>
            {currentAlerts.map((alert, index) => (
              <Alert
                key={index}
                message={alert.title}
                description={alert.message}
                type={alert.type}
                showIcon
                action={
                  <Tag color={alert.type === 'error' ? 'red' : alert.type === 'warning' ? 'orange' : 'blue'}>
                    {alert.count}
                  </Tag>
                }
              />
            ))}
          </Space>
        </div>
      )}

      {/* Key Performance Indicators with Filter Controls */}
      <div className="kpi-section">
        <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
          <Col>
            <h3 style={{ margin: 0 }}>Chỉ số hiệu suất chính</h3>
          </Col>
          <Col>
            <Space>
              <Select
                value={filterType}
                onChange={handleFilterChange}
                style={{ width: 120 }}
                placeholder="Lọc theo"
              >
                <Option value="all-time">Tất cả</Option>
                <Option value="today">Hôm nay</Option>
                <Option value="month">Tháng này</Option>
                <Option value="year">Năm này</Option>
              </Select>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
              <Button onClick={refresh} icon={<DashboardOutlined />}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card">
              <Statistic
                title="Tỷ lệ duyệt thuốc"
                value={medicationApprovalRate}
                suffix="%"
                valueStyle={{ color: medicationApprovalRate >= 80 ? '#3f8600' : medicationApprovalRate >= 60 ? '#fa8c16' : '#cf1322' }}
                prefix={<TrophyOutlined />}
              />
              <Progress 
                percent={medicationApprovalRate} 
                showInfo={false} 
                strokeColor={medicationApprovalRate >= 80 ? '#52c41a' : medicationApprovalRate >= 60 ? '#faad14' : '#ff4d4f'}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card">
              <Statistic
                title="Tuân thủ uống thuốc"
                value={medicationComplianceRate}
                suffix="%"
                valueStyle={{ color: medicationComplianceRate >= 90 ? '#3f8600' : medicationComplianceRate >= 70 ? '#fa8c16' : '#cf1322' }}
                prefix={<ClockCircleOutlined />}
              />
              <Progress 
                percent={medicationComplianceRate} 
                showInfo={false}
                strokeColor={medicationComplianceRate >= 90 ? '#52c41a' : medicationComplianceRate >= 70 ? '#faad14' : '#ff4d4f'}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card">
              <Statistic
                title="Giải quyết sự cố y tế"
                value={eventResolutionRate}
                suffix="%"
                valueStyle={{ color: eventResolutionRate >= 85 ? '#3f8600' : eventResolutionRate >= 65 ? '#fa8c16' : '#cf1322' }}
                prefix={<CheckCircleOutlined />}
              />
              <Progress 
                percent={eventResolutionRate} 
                showInfo={false}
                strokeColor={eventResolutionRate >= 85 ? '#52c41a' : eventResolutionRate >= 65 ? '#faad14' : '#ff4d4f'}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="kpi-card">
              <Statistic
                title="Tình trạng tồn kho"
                value={inventoryHealthRate}
                suffix="%"
                valueStyle={{ color: inventoryHealthRate >= 90 ? '#3f8600' : inventoryHealthRate >= 70 ? '#fa8c16' : '#cf1322' }}
                prefix={<InboxOutlined />}
              />
              <Progress 
                percent={inventoryHealthRate} 
                showInfo={false}
                strokeColor={inventoryHealthRate >= 90 ? '#52c41a' : inventoryHealthRate >= 70 ? '#faad14' : '#ff4d4f'}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Statistics Grid */}
      <div className="main-stats-section">
        <h3>Thống kê tổng quan</h3>
        <Row gutter={[16, 16]}>
          {/* Medication Management */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Quản lý thuốc" 
              className="stat-card medication-card"
              extra={<MedicineBoxOutlined style={{ color: '#1890ff' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Yêu cầu gửi thuốc"
                    value={currentStats.totalMedicationRequests}
                    valueStyle={{ fontSize: '20px', color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Chờ duyệt"
                    value={currentStats.pendingMedicationRequests}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã duyệt"
                    value={currentStats.approvedMedicationRequests}
                    valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Từ chối"
                    value={currentStats.rejectedMedicationRequests}
                    valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Medical Events */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Xử lý sơ cứu" 
              className="stat-card events-card"
              extra={<AlertOutlined style={{ color: '#fa541c' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng sự kiện"
                    value={currentStats.totalMedicalEvents}
                    valueStyle={{ fontSize: '20px', color: '#fa541c' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Chờ xử lý"
                    value={currentStats.pendingMedicalEvents}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
                <Col span={24}>
                  <Statistic
                    title="Đã giải quyết"
                    value={currentStats.resolvedMedicalEvents}
                    valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Medical Inventory */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Tồn kho y tế" 
              className="stat-card inventory-card"
              extra={<InboxOutlined style={{ color: '#722ed1' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng vật tư"
                    value={currentStats.totalSupplies}
                    valueStyle={{ fontSize: '20px', color: '#722ed1' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Sắp hết"
                    value={currentStats.lowStockSupplies}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Sắp hết hạn"
                    value={currentStats.expiringSoonSupplies}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Hết hạn"
                    value={currentStats.expiredSupplies}
                    valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Health Profiles */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Hồ sơ sức khỏe" 
              className="stat-card health-card"
              extra={<FileTextOutlined style={{ color: '#13c2c2' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Chờ duyệt"
                    value={currentStats.pendingHealthProfiles}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã duyệt"
                    value={currentStats.approvedHealthProfiles}
                    valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={24}>
                  <Statistic
                    title="Học sinh chưa có hồ sơ"
                    value={currentStats.studentsWithoutProfiles}
                    valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Campaigns */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Chiến dịch y tế" 
              className="stat-card campaigns-card"
              extra={<CalendarOutlined style={{ color: '#eb2f96' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Chiến dịch tiêm chủng"
                    value={currentStats.totalVaccinationCampaigns}
                    valueStyle={{ fontSize: '18px', color: '#eb2f96' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đợt khám sức khỏe"
                    value={currentStats.totalHealthCheckCampaigns}
                    valueStyle={{ fontSize: '18px', color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Medication Doses */}
          <Col xs={24} sm={12} lg={8}>
            <Card 
              title="Lịch uống thuốc" 
              className="stat-card doses-card"
              extra={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Statistic
                    title="Tổng liều thuốc"
                    value={currentStats.totalDoses}
                    valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã uống"
                    value={currentStats.takenDoses}
                    valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Bỏ lỡ"
                    value={currentStats.missedDoses}
                    valueStyle={{ fontSize: '18px', color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Chờ uống"
                    value={currentStats.pendingDoses}
                    valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Lưu ý quan trọng</h3>
        <Row gutter={[16, 16]}>
          {currentStats.pendingMedicationRequests > 0 && (
            <Col xs={24} sm={12} lg={8}>
              <Alert
                message="Yêu cầu thuốc chờ duyệt"
                description={`Có ${currentStats.pendingMedicationRequests} yêu cầu gửi thuốc cần được xem xét`}
                type="info"
                showIcon
              />
            </Col>
          )}
          
          {currentStats.lowStockSupplies > 0 && (
            <Col xs={24} sm={12} lg={8}>
              <Alert
                message="Vật tư y tế sắp hết"
                description={`${currentStats.lowStockSupplies} loại vật tư y tế đang ở mức tồn kho thấp`}
                type="warning"
                showIcon
              />
            </Col>
          )}
          
          {currentStats.studentsWithoutProfiles > 0 && (
            <Col xs={24} sm={12} lg={8}>
              <Alert
                message="Học sinh chưa có hồ sơ y tế"
                description={`${currentStats.studentsWithoutProfiles} học sinh chưa có hồ sơ sức khỏe`}
                type="warning"
                showIcon
              />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
};

export default SchoolNurseOverview;
