import React from 'react';
import { Card, Descriptions, Tag, Row, Col, Statistic, Table, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UsergroupAddOutlined,
  SendOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { HEALTH_CHECK_CATEGORY_LABELS } from '../../../api/healthCheckApi';
import { getStatusTag, calculateCampaignStats } from '../../../utils/healthCheckUtils.jsx';
import { getEligibleStudentsColumns } from '../../../utils/tableConfigs.jsx';

const { Title, Paragraph, Text } = Typography;

/**
 * Component for displaying campaign information and eligible students
 */
const CampaignInfoTab = ({
  campaign,
  eligibleStudents,
  results,
  studentsLoading,
  notificationSent,
  sendingNotification,
  lastRefresh,
  onSendNotifications,
  onRefreshStudents
}) => {
  const stats = calculateCampaignStats(campaign, eligibleStudents, results);
  const eligibleStudentsColumns = getEligibleStudentsColumns();

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Card variant="outlined">
          <Title level={4}>{campaign.name}</Title>
          <div style={{ marginBottom: 16 }}>
            {getStatusTag(campaign.status)}
          </div>
          <Paragraph>{campaign.description}</Paragraph>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={12}>
        <Card title="Thông tin đợt khám" variant="outlined">
          <Descriptions column={1}>
            <Descriptions.Item label="Mã đợt khám">#{campaign.id}</Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {dayjs(campaign.startDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {dayjs(campaign.endDate).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">{campaign.location}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{campaign.nurse?.fullName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {dayjs(campaign.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      <Col xs={24} sm={24} md={12}>
        <Card title="Phạm vi khám" variant="outlined">
          <Descriptions column={1}>
            <Descriptions.Item label="Độ tuổi">
              {campaign.minAge} - {campaign.maxAge} tuổi
            </Descriptions.Item>
            <Descriptions.Item label="Lớp mục tiêu">
              {campaign.targetClasses && campaign.targetClasses.length > 0 
                ? (Array.isArray(campaign.targetClasses) 
                    ? campaign.targetClasses.join(', ') 
                    : campaign.targetClasses)
                : 'Tất cả các lớp'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại khám">
              <div>
                {campaign.categories?.map((category) => (
                  <Tag key={category} color="blue" style={{ marginBottom: 4 }}>
                    {HEALTH_CHECK_CATEGORY_LABELS[category] || category}
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>

      {campaign.status !== 'PENDING' && (
        <Col span={24}>
          <Card title="Thống kê" variant="outlined">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic 
                  title="Học sinh đủ điều kiện" 
                  value={stats.targetCount} 
                  prefix={<UserOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Đã khám" 
                  value={stats.completedCount} 
                  suffix={`/ ${stats.targetCount}`}
                  prefix={<CheckCircleOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Kết quả bất thường" 
                  value={stats.abnormalCount} 
                  prefix={<CloseCircleOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Tiến độ" 
                  value={stats.progressPercentage} 
                  suffix="%" 
                />
              </Col>
            </Row>
          </Card>
        </Col>
      )}

      {/* Eligible Students List - shown when campaign is approved */}
      {campaign.status === 'APPROVED' && (
        <Col span={24}>
          <Card title="Danh sách học sinh đủ điều kiện" variant="outlined">
            {/* Statistics Row */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic 
                  title="Tổng số học sinh" 
                  value={eligibleStudents.length} 
                  prefix={<UserOutlined />} 
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Đã xác nhận" 
                  value={stats.confirmedCount} 
                  prefix={<CheckCircleOutlined />} 
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Từ chối" 
                  value={stats.declinedCount} 
                  prefix={<CloseCircleOutlined />} 
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={6}>
                <Statistic 
                  title="Chưa phản hồi" 
                  value={stats.pendingCount} 
                  prefix={<UsergroupAddOutlined />} 
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
            
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={onSendNotifications} 
                  loading={sendingNotification}
                  disabled={notificationSent}
                >
                  {notificationSent ? 'Đã gửi thông báo' : 'Gửi thông báo cho phụ huynh'}
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={onRefreshStudents} 
                  loading={studentsLoading}
                >
                  Làm mới dữ liệu
                </Button>
              </Space>
              {lastRefresh && (
                <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                  <Text type="secondary">
                    Cập nhật lần cuối: {dayjs(lastRefresh).format('DD/MM/YYYY HH:mm:ss')}
                  </Text>
                </div>
              )}
            </div>
            
            <Table
              columns={eligibleStudentsColumns}
              dataSource={eligibleStudents.map(student => ({ ...student, key: student.studentID || student.studentCode }))}
              loading={studentsLoading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default CampaignInfoTab;
