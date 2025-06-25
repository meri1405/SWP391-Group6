import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { managerVaccinationApi } from '../../api/vaccinationCampaignApi';

const ManagerOverview = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const stats = await managerVaccinationApi.getCampaignStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-overview">
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Chiến dịch chờ duyệt"
                value={statistics.pending || 0}
                prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Chiến dịch đã duyệt"
                value={statistics.approved || 0}
                prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Chiến dịch bị từ chối"
                value={statistics.rejected || 0}
                prefix={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Đang tiến hành"
                value={statistics.inProgress || 0}
                prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Đã hoàn thành"
                value={statistics.completed || 0}
                prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Tổng chiến dịch"
                value={statistics.total || 0}
                prefix={<TeamOutlined style={{ color: '#ff6b35' }} />}
                valueStyle={{ color: '#ff6b35' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default ManagerOverview;
