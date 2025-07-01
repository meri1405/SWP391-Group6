import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Spin,
  Tabs,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  FileTextOutlined,
  UserOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthCheckApi } from '../../../api/healthCheckApi';

const { Title, Paragraph, Text } = Typography;

const HealthCheckCampaignDetail = ({ campaignId, onBack, onEdit }) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, title: '', message: '' });
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchResults = useCallback(async () => {
    setResultsLoading(true);
    try {
      const data = await healthCheckApi.getResultsByCampaign(campaignId);
      setResults(data);
    } catch (error) {
      console.error('Error fetching campaign results:', error);
      message.error('Không thể tải kết quả khám sức khỏe');
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  }, [campaignId]);

  const fetchEligibleStudents = useCallback(async (campaignData = null) => {
    setStudentsLoading(true);
    try {
      // Use the provided campaign data or fall back to current state
      const dataToUse = campaignData || campaign;
      
      console.log('fetchEligibleStudents called with:', {
        campaignId,
        providedData: !!campaignData,
        currentCampaignState: !!campaign,
        dataToUse: dataToUse ? {
          minAge: dataToUse.minAge,
          maxAge: dataToUse.maxAge,
          targetClasses: dataToUse.targetClasses,
          targetCount: dataToUse.targetCount
        } : null
      });
      
      // Pass campaign data to ensure we use the same filtering criteria
      const data = await healthCheckApi.getEligibleStudentsWithStatus(campaignId, dataToUse);
      console.log('Eligible students fetched:', data.length);
      setEligibleStudents(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching eligible students:', error);
      message.error('Không thể tải danh sách học sinh đủ điều kiện');
      setEligibleStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [campaignId, campaign]);

  const fetchCampaignDetails = useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthCheckApi.getCampaignById(campaignId);
      setCampaign(data);
      
      // If campaign has started, fetch results
      if (data.status === 'IN_PROGRESS' || data.status === 'COMPLETED') {
        fetchResults();
      }
      
      // If campaign is approved, fetch eligible students
      if (data.status === 'APPROVED') {
        fetchEligibleStudents(data);
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      message.error('Không thể tải thông tin chi tiết đợt khám');
    } finally {
      setLoading(false);
    }
  }, [campaignId, fetchResults, fetchEligibleStudents]);

  useEffect(() => {
    fetchCampaignDetails();
  }, [fetchCampaignDetails]);

  // Fetch eligible students when campaign becomes APPROVED
  useEffect(() => {
    if (campaign && campaign.status === 'APPROVED') {
      fetchEligibleStudents(campaign);
    }
  }, [campaign?.status, campaign, fetchEligibleStudents]);

  // Set up automatic refresh for approved campaigns
  useEffect(() => {
    if (campaign && campaign.status === 'APPROVED') {
      // Set up periodic refresh every 30 seconds to check for form updates
      const interval = setInterval(() => {
        console.log('Auto-refreshing eligible students data...');
        fetchEligibleStudents(); // Don't pass campaign to avoid stale closure
      }, 3000000); // 30 seconds
      
      setRefreshInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear interval if campaign status changes
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.status, fetchEligibleStudents]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const showConfirmModal = (action, title, message) => {
    setConfirmModal({ visible: true, action, title, message });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ visible: false, action: null, title: '', message: '' });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmModal;
    hideConfirmModal();
    
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'start':
          response = await healthCheckApi.startCampaign(campaignId);
          message.success('Đã bắt đầu đợt khám');
          break;
        case 'complete':
          response = await healthCheckApi.completeCampaign(campaignId);
          message.success('Đã hoàn thành đợt khám');
          break;
        case 'cancel':
          response = await healthCheckApi.cancelCampaign(campaignId, 'Cancelled by nurse');
          message.success('Đã hủy đợt khám');
          break;
        case 'sendNotifications':
          await executeSendNotifications();
          return; // Don't update campaign state for this action
        default:
          console.warn('Unknown action:', action);
          return;
      }
      
      setCampaign(response);
      
      if (action === 'start' || action === 'complete') {
        fetchResults();
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      message.error(`Không thể thực hiện hành động: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (campaign && campaign.status === 'PENDING') {
      onEdit(campaign);
    } else {
      message.warning('Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT');
    }
  };

  const handleSendNotifications = () => {
    showConfirmModal(
      'sendNotifications',
      'Xác nhận gửi thông báo',
      `Bạn có chắc chắn muốn gửi thông báo khám sức khỏe cho phụ huynh của các học sinh đủ điều kiện? Thông báo sẽ được gửi đến ${eligibleStudents.length} học sinh.`
    );
  };

  const handleRefreshStudents = () => {
    console.log('Manual refresh triggered by user');
    fetchEligibleStudents(); // Use current campaign state from closure
  };

  const executeSendNotifications = async () => {
    setSendingNotification(true);
    try {
      console.log('Sending notifications for campaign:', campaignId);
      const response = await healthCheckApi.sendNotificationsToParents(campaignId);
      console.log('Notification response:', response);
      message.success(`Đã gửi thông báo thành công đến ${response.notificationsSent} phụ huynh`);
      setNotificationSent(true);
      // Refresh the eligible students list to update any changes
      fetchEligibleStudents();
    } catch (error) {
      console.error('Error sending notifications:', error);
      message.error('Không thể gửi thông báo đến phụ huynh');
    } finally {
      setSendingNotification(false);
    }
  };

  const getActionButtons = () => {
    if (!campaign) return null;

    const buttons = [];
    
    switch (campaign.status) {
      case 'APPROVED':
        buttons.push(
          <Button 
            key="start" 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={() => showConfirmModal(
              'start', 
              'Xác nhận bắt đầu', 
              'Bạn có chắc chắn muốn bắt đầu đợt khám này?'
            )}
          >
            Bắt đầu khám
          </Button>
        );
        break;
      case 'IN_PROGRESS':
        buttons.push(
          <Button 
            key="complete" 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={() => showConfirmModal(
              'complete', 
              'Xác nhận hoàn thành', 
              'Bạn có chắc chắn muốn đánh dấu đợt khám này là đã hoàn thành?'
            )}
          >
            Hoàn thành
          </Button>
        );
        break;
      default:
        break;
    }
    
    // Add cancel button for certain statuses
    if (['PENDING', 'APPROVED'].includes(campaign.status)) {
      buttons.push(
        <Button 
          key="cancel" 
          danger 
          icon={<CloseCircleOutlined />} 
          onClick={() => showConfirmModal(
            'cancel', 
            'Xác nhận hủy', 
            'Bạn có chắc chắn muốn hủy đợt khám này?'
          )}
        >
          Hủy
        </Button>
      );
    }
    
    return buttons;
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'PENDING':
        return <Tag color="orange">Chưa duyệt</Tag>;
      case 'APPROVED':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="processing">Đang diễn ra</Tag>;
      case 'COMPLETED':
        return <Tag color="success">Đã hoàn thành</Tag>;
      case 'CANCELED':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getResultStatusTag = (status) => {
    switch(status) {
      case 'NORMAL':
        return <Tag color="green">Bình thường</Tag>;
      case 'ABNORMAL':
        return <Tag color="red">Bất thường</Tag>;
      case 'NEEDS_FOLLOWUP':
        return <Tag color="orange">Cần theo dõi</Tag>;
      case 'NEEDS_TREATMENT':
        return <Tag color="volcano">Cần điều trị</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const resultColumns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Loại khám',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getResultStatusTag(status),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'resultNotes',
      key: 'resultNotes',
      ellipsis: true,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    }
  ];

  const eligibleStudentsColumns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'studentCode',
      key: 'studentCode',
      width: 120,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: 100,
    },
    {
      title: 'Tuổi',
      dataIndex: 'ageDisplay',
      key: 'ageDisplay',
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusDisplay',
      key: 'statusDisplay',
      width: 150,
      render: (statusDisplay, record) => {
        const { status } = record;
        let color = 'default';
        if (status === 'CONFIRMED') {
          color = 'green';
        } else if (status === 'DECLINED') {
          color = 'red';
        } else if (status === 'PENDING') {
          color = 'orange';
        } else {
          color = 'orange'; // Default to orange for "Chưa phản hồi"
        }
        return <Tag color={color}>{statusDisplay}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Đang tải thông tin đợt khám...</p>
        </div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={4}>Không tìm thấy thông tin đợt khám</Title>
          <Button type="primary" onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              style={{ marginRight: 16 }} 
              onClick={onBack}
            />
            <span>Chi tiết đợt khám sức khỏe</span>
          </div>
        }
        extra={
          <Space>
            {campaign && campaign.status === 'PENDING' && (
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            )}
            {getActionButtons()}
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: 'Thông tin chung',
              children: (
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
                                {category === 'VISION' && 'Khám mắt'}
                                {category === 'HEARING' && 'Khám tai'}
                                {category === 'ORAL' && 'Khám răng miệng'}
                                {category === 'SKIN' && 'Khám da liễu'}
                                {category === 'RESPIRATORY' && 'Khám hô hấp'}
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
                              value={campaign.status === 'APPROVED' ? eligibleStudents.length : (campaign.targetCount || 0)} 
                              prefix={<UserOutlined />} 
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic 
                              title="Đã khám" 
                              value={results.length} 
                              suffix={campaign.status === 'APPROVED' ? `/ ${eligibleStudents.length}` : `/ ${campaign.targetCount || 0}`}
                              prefix={<CheckCircleOutlined />} 
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic 
                              title="Kết quả bất thường" 
                              value={results.filter(r => r.status === 'ABNORMAL' || r.status === 'NEEDS_FOLLOWUP' || r.status === 'NEEDS_TREATMENT').length} 
                              prefix={<CloseCircleOutlined />} 
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic 
                              title="Tiến độ" 
                              value={campaign.status === 'APPROVED' && eligibleStudents.length > 0 ? 
                                Math.round((results.length / eligibleStudents.length) * 100) : 
                                (campaign.targetCount ? Math.round((results.length / campaign.targetCount) * 100) : 0)} 
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
                              value={eligibleStudents.filter(s => s.status === 'CONFIRMED').length} 
                              prefix={<CheckCircleOutlined />} 
                              valueStyle={{ color: '#52c41a' }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic 
                              title="Từ chối" 
                              value={eligibleStudents.filter(s => s.status === 'DECLINED').length} 
                              prefix={<CloseCircleOutlined />} 
                              valueStyle={{ color: '#ff4d4f' }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic 
                              title="Chưa phản hồi" 
                              value={eligibleStudents.filter(s => s.status === 'PENDING' || s.status === 'NO_FORM').length} 
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
                              onClick={handleSendNotifications} 
                              loading={sendingNotification}
                              disabled={notificationSent}
                            >
                              {notificationSent ? 'Đã gửi thông báo' : 'Gửi thông báo cho phụ huynh'}
                            </Button>
                            <Button 
                              icon={<ReloadOutlined />} 
                              onClick={handleRefreshStudents} 
                              loading={studentsLoading}
                            >
                              Làm mới dữ liệu
                            </Button>
                          </Space>
                          {lastRefresh && (
                            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                              <Text type="secondary">
                                Cập nhật lần cuối: {dayjs(lastRefresh).format('DD/MM/YYYY HH:mm:ss')}
                                {' • Tự động làm mới mỗi 30 giây'}
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
              )
            },
            {
              key: 'results',
              label: 'Kết quả khám',
              disabled: campaign.status !== 'IN_PROGRESS' && campaign.status !== 'COMPLETED',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Button onClick={fetchResults} loading={resultsLoading}>
                      <FileTextOutlined /> Làm mới kết quả
                    </Button>
                  </div>
                  
                  <Table 
                    columns={resultColumns} 
                    dataSource={results.map(result => ({ ...result, key: result.id }))} 
                    loading={resultsLoading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={handleConfirmAction}
        onCancel={hideConfirmModal}
        confirmLoading={loading}
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </>
  );
};

export default HealthCheckCampaignDetail;