import React, { useState, useMemo } from 'react';
import { 
  Row, Col, Card, Statistic, Select, DatePicker, Space, Spin, Alert, Tag,
  Segmented, Button
} from 'antd';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadialBarChart, RadialBar
} from 'recharts';
import {
  MedicineBoxOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  ArrowLeftOutlined,
  TableOutlined
} from '@ant-design/icons';
import { useNurseDashboardStats } from '../../hooks/useNurseDashboardStats';
import '../../styles/SchoolNurseChartsOverview.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Color schemes for charts
const COLORS = {
  primary: ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1', '#13c2c2'],
  medication: ['#52c41a', '#ff4d4f', '#fa8c16'], // approved, rejected, pending
  doses: ['#52c41a', '#ff4d4f', '#fa8c16', '#1890ff'], // taken, missed, pending, total
  events: ['#fa541c', '#52c41a', '#fa8c16'], // total, resolved, pending
  status: {
    approved: '#52c41a',
    rejected: '#ff4d4f',
    pending: '#fa8c16',
    completed: '#1890ff',
    inProgress: '#722ed1'
  }
};

const SchoolNurseChartsOverview = ({ currentViewMode = 'charts', onViewModeChange }) => {
  const { 
    stats, 
    loading, 
    filterType,
    setFilterType,
    setDateRangeFilter,
    refresh
  } = useNurseDashboardStats();

  const [chartType, setChartType] = useState('overview');
  const [dateRange, setDateRange] = useState(null);

  // Transform data for charts
  const chartData = useMemo(() => {
    if (!stats) return null;

    // Medication Requests Chart Data
    const medicationRequestsData = [
      { name: 'Đã duyệt', value: stats.medicationRequests?.approvedRequests || 0, color: COLORS.status.approved },
      { name: 'Từ chối', value: stats.medicationRequests?.rejectedRequests || 0, color: COLORS.status.rejected },
      { name: 'Chờ duyệt', value: stats.medicationRequests?.pendingRequests || 0, color: COLORS.status.pending }
    ];

    // Medication Doses Chart Data
    const medicationDosesData = [
      { name: 'Đã uống', value: stats.medicationIntake?.takenDoses || 0, color: COLORS.status.approved },
      { name: 'Bỏ lỡ', value: stats.medicationIntake?.missedDoses || 0, color: COLORS.status.rejected },
      { name: 'Chờ uống', value: stats.medicationIntake?.pendingDoses || 0, color: COLORS.status.pending }
    ];

    // Medical Events Chart Data
    const medicalEventsData = [
      { name: 'Đã giải quyết', value: stats.medicalEvents?.resolvedEvents || 0, color: COLORS.status.approved },
      { name: 'Chờ xử lý', value: stats.medicalEvents?.pendingEvents || 0, color: COLORS.status.pending }
    ];

    // Combined Overview Data for Bar Chart
    const overviewBarData = [
      {
        category: 'Yêu cầu thuốc',
        approved: stats.medicationRequests?.approvedRequests || 0,
        rejected: stats.medicationRequests?.rejectedRequests || 0,
        pending: stats.medicationRequests?.pendingRequests || 0
      },
      {
        category: 'Liều thuốc',
        approved: stats.medicationIntake?.takenDoses || 0,
        rejected: stats.medicationIntake?.missedDoses || 0,
        pending: stats.medicationIntake?.pendingDoses || 0
      },
      {
        category: 'Xử lý sơ cứu',
        approved: stats.medicalEvents?.resolvedEvents || 0,
        rejected: 0, // No rejected events
        pending: stats.medicalEvents?.pendingEvents || 0
      }
    ];

    // Health Profiles Data
    const healthProfilesData = [
      { name: 'Đã duyệt', value: stats.healthProfiles?.approvedProfiles || 0, color: COLORS.status.approved },
      { name: 'Chờ duyệt', value: stats.healthProfiles?.pendingProfiles || 0, color: COLORS.status.pending },
      { name: 'Từ chối', value: stats.healthProfiles?.rejectedProfiles || 0, color: COLORS.status.rejected }
    ];

    // Campaign Data
    const campaignData = [
      {
        type: 'Tiêm chủng',
        total: stats.vaccinationCampaigns?.totalCampaigns || 0,
        completed: stats.vaccinationCampaigns?.completedCampaigns || 0,
        inProgress: stats.vaccinationCampaigns?.inProgressCampaigns || 0
      },
      {
        type: 'Khám sức khỏe',
        total: stats.healthCheckCampaigns?.totalCampaigns || 0,
        completed: stats.healthCheckCampaigns?.completedCampaigns || 0,
        inProgress: stats.healthCheckCampaigns?.inProgressCampaigns || 0
      }
    ];

    return {
      medicationRequestsData,
      medicationDosesData,
      medicalEventsData,
      overviewBarData,
      healthProfilesData,
      campaignData
    };
  }, [stats]);

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

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          background: 'white',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          padding: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p className="label" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="school-nurse-overview">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Đang tải dữ liệu biểu đồ...</p>
        </div>
      </div>
    );
  }

  if (!stats || !chartData) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Không thể tải dữ liệu thống kê. Vui lòng thử lại sau."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div className="school-nurse-charts-overview">
      {/* Header with toggle and filters */}
      <div className="overview-header" style={{ marginBottom: '24px' }}>
        <Row justify="space-between">
          <Col>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ textAlign: 'left', margin: '0 0 8px 0' }}>Tổng quan Y tế - Biểu đồ thống kê</h2>
              <p style={{ textAlign: 'left', margin: '0', color: '#8c8c8c' }}>Theo dõi và phân tích dữ liệu y tế trường học qua biểu đồ trực quan</p>
            </div>
          </Col>
          <Col>
            <Segmented
              value={currentViewMode}
              onChange={onViewModeChange}
              options={[
                { label: 'Bảng thống kê', value: 'table', icon: <TableOutlined /> },
                { label: 'Biểu đồ', value: 'charts', icon: <BarChartOutlined /> }
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* Chart Type Selector and Filter Controls */}
      <div style={{ marginBottom: '24px'}}>
        <Row justify="space-between">
          <Col>
            <Segmented
              value={chartType}
              onChange={setChartType}
              options={[
                { label: 'Tổng quan', value: 'overview', icon: <DashboardOutlined /> },
                { label: 'Biểu đồ cột', value: 'bar', icon: <BarChartOutlined /> },
                { label: 'Biểu đồ tròn', value: 'pie', icon: <PieChartOutlined /> },
                { label: 'Xu hướng', value: 'trend', icon: <LineChartOutlined /> }
              ]}
            />
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
      </div>

      {/* Quick Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu thuốc"
              value={stats.medicationRequests?.totalRequests || 0}
              prefix={<MedicineBoxOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng liều thuốc"
              value={stats.medicationIntake?.totalDoses || 0}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Xử lý sơ cứu"
              value={stats.medicalEvents?.totalEvents || 0}
              prefix={<AlertOutlined style={{ color: '#fa541c' }} />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hồ sơ sức khỏe"
              value={stats.healthProfiles?.totalProfiles || 0}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      {chartType === 'overview' && (
        <Row gutter={[16, 16]}>
          {/* Medication Requests - Stacked Bar Chart */}
          <Col xs={24} lg={12}>
            <Card title="Yêu cầu thuốc theo trạng thái" extra={<MedicineBoxOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.overviewBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="approved" fill={COLORS.status.approved} name="Đã duyệt" />
                  <Bar dataKey="pending" fill={COLORS.status.pending} name="Chờ duyệt" />
                  <Bar dataKey="rejected" fill={COLORS.status.rejected} name="Từ chối" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Medication Compliance - Donut Chart */}
          <Col xs={24} lg={12}>
            <Card title="Tuân thủ uống thuốc" extra={<ClockCircleOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.medicationDosesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.medicationDosesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Medical Events - Radial Bar Chart */}
          <Col xs={24} lg={12}>
            <Card title="Xử lý sơ cứu" extra={<AlertOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart innerRadius="30%" outerRadius="90%" data={chartData.medicalEventsData}>
                  <RadialBar dataKey="value" cornerRadius={10} fill="#fa541c" />
                  <Legend />
                  <RechartsTooltip />
                </RadialBarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Health Profiles - Pie Chart */}
          <Col xs={24} lg={12}>
            <Card title="Hồ sơ sức khỏe" extra={<FileTextOutlined />}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.healthProfilesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.healthProfilesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {chartType === 'bar' && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Biểu đồ cột - Tổng quan trạng thái">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.overviewBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="approved" fill={COLORS.status.approved} name="Đã duyệt/Hoàn thành" />
                  <Bar dataKey="pending" fill={COLORS.status.pending} name="Chờ xử lý" />
                  <Bar dataKey="rejected" fill={COLORS.status.rejected} name="Từ chối/Bỏ lỡ" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24}>
            <Card title="Chiến dịch y tế">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="total" fill={COLORS.primary[0]} name="Tổng số" />
                  <Bar dataKey="completed" fill={COLORS.status.approved} name="Hoàn thành" />
                  <Bar dataKey="inProgress" fill={COLORS.status.pending} name="Đang tiến hành" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {chartType === 'pie' && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Yêu cầu thuốc">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.medicationRequestsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.medicationRequestsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Tuân thủ uống thuốc">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.medicationDosesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.medicationDosesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Xử lý sơ cứu">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.medicalEventsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.medicalEventsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card title="Hồ sơ sức khỏe">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.healthProfilesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.healthProfilesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {chartType === 'trend' && (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Xu hướng theo thời gian (Mô phỏng)" extra={
              <Tag color="orange">Demo - Cần dữ liệu lịch sử</Tag>
            }>
              <Alert
                message="Thông báo"
                description="Biểu đồ xu hướng cần dữ liệu lịch sử theo thời gian. Hiện tại đang hiển thị dữ liệu mô phỏng."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[
                  { date: '01/07', medications: 45, events: 23, doses: 234 },
                  { date: '02/07', medications: 52, events: 18, doses: 267 },
                  { date: '03/07', medications: 48, events: 31, doses: 198 },
                  { date: '04/07', medications: 61, events: 25, doses: 289 },
                  { date: '05/07', medications: 55, events: 19, doses: 245 },
                  { date: '06/07', medications: 67, events: 22, doses: 312 },
                  { date: '07/07', medications: 58, events: 16, doses: 276 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="medications" stroke="#1890ff" name="Yêu cầu thuốc" />
                  <Line type="monotone" dataKey="events" stroke="#fa541c" name="Xử lý sơ cứu" />
                  <Line type="monotone" dataKey="doses" stroke="#52c41a" name="Liều thuốc" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}

      {/* Summary Insights */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Thông tin chi tiết" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {stats.medicationRequests?.totalRequests || 0}
                  </div>
                  <div>Tổng yêu cầu thuốc</div>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green">
                      {stats.medicationRequests?.approvedRequests || 0} đã duyệt
                    </Tag>
                    <Tag color="orange">
                      {stats.medicationRequests?.pendingRequests || 0} chờ duyệt
                    </Tag>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                    {stats.medicationIntake?.totalDoses || 0}
                  </div>
                  <div>Tổng liều thuốc</div>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green">
                      {stats.medicationIntake?.takenDoses || 0} đã uống
                    </Tag>
                    <Tag color="red">
                      {stats.medicationIntake?.missedDoses || 0} bỏ lỡ
                    </Tag>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa541c' }}>
                    {stats.medicalEvents?.totalEvents || 0}
                  </div>
                  <div>Xử lý sơ cứu</div>
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green">
                      {stats.medicalEvents?.resolvedEvents || 0} đã giải quyết
                    </Tag>
                    <Tag color="orange">
                      {stats.medicalEvents?.pendingEvents || 0} chờ xử lý
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SchoolNurseChartsOverview;
