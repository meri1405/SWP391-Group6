import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthCheckApi, CAMPAIGN_STATUS_LABELS, HEALTH_CHECK_CATEGORY_LABELS } from '../../../api/healthCheckApi';
import NotificationModal from './NotificationModal';
import ScheduleModal from './ScheduleModal';
import RecordResultsTab from './RecordResultsTab';

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
  const [lastRefresh, setLastRefresh] = useState(null);
  const [notificationModal, setNotificationModal] = useState({ visible: false });
  const [scheduleModal, setScheduleModal] = useState({ visible: false });
  const [scheduling, setScheduling] = useState(false);
  
  // Use refs to prevent duplicate API calls and track component mount state
  const isMounted = useRef(true);
  const isLoadingCampaign = useRef(false);
  const isLoadingResults = useRef(false);
  const isLoadingStudents = useRef(false);

  const fetchResults = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingResults.current) return;
    
    isLoadingResults.current = true;
    setResultsLoading(true);
    
    try {
      console.log('Fetching results for campaign:', campaignId);
      const data = await healthCheckApi.getCampaignResults(campaignId);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        console.log('Results fetched:', data.length, 'students');
        setResults(data);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error fetching campaign results:', error);
        message.error('Không thể tải kết quả khám sức khỏe');
        setResults([]);
      }
    } finally {
      isLoadingResults.current = false;
      if (isMounted.current) {
        setResultsLoading(false);
      }
    }
  }, [campaignId]); // Add campaignId dependency since it's used in the function body

  const fetchEligibleStudents = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingStudents.current) return;
    
    isLoadingStudents.current = true;
    setStudentsLoading(true);
    
    try {
      console.log('fetchEligibleStudents called with campaignId:', campaignId);
      
      // Use the new backend endpoint that includes form status
      const data = await healthCheckApi.getEligibleStudentsWithFormStatus(campaignId);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        console.log('Eligible students with form status fetched:', data.length);
        setEligibleStudents(data);
        setLastRefresh(new Date());
        
        // Update notification sent status based on backend data
        // If any forms have been sent, mark notifications as sent
        const hasFormsWithSentAt = data.some(student => student.sentAt);
        setNotificationSent(hasFormsWithSentAt);
        
        // Update localStorage to reflect backend state
        localStorage.setItem(`campaign_${campaignId}_notification_sent`, hasFormsWithSentAt.toString());
      }
    } catch (error) {
      if (isMounted.current) {
        console.error('Error fetching eligible students:', error);
        message.error('Không thể tải danh sách học sinh đủ điều kiện');
        setEligibleStudents([]);
      }
    } finally {
      isLoadingStudents.current = false;
      if (isMounted.current) {
        setStudentsLoading(false);
      }
    }
  }, [campaignId]);

  // Main effect to fetch data only once when component mounts
  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    const loadCampaignData = async () => {
      // Prevent duplicate API calls
      if (isLoadingCampaign.current) return;
      
      isLoadingCampaign.current = true;
      setLoading(true);
      
      try {
        // Fetch campaign details
        const campaignData = await healthCheckApi.getCampaignById(campaignId);
        
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        setCampaign(campaignData);
        
        // Based on campaign status, fetch additional data
        if (campaignData) {
          if (campaignData.status === 'IN_PROGRESS' || campaignData.status === 'COMPLETED') {
            // Don't await these calls to avoid blocking
            fetchResults();
          }
          
          if (campaignData.status === 'APPROVED') {
            // Call fetchEligibleStudents without parameters
            fetchEligibleStudents();
          }
        }
      } catch (error) {
        if (!isMounted.current) return;
        console.error('Error fetching campaign details:', error);
        message.error('Không thể tải thông tin chi tiết đợt khám');
      } finally {
        isLoadingCampaign.current = false;
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    // Load data on mount
    loadCampaignData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [campaignId, fetchResults, fetchEligibleStudents]);
  // Add back the dependencies but ensure they are stable

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
          // Note: Cancel functionality not implemented in backend yet
          message.warning('Tính năng hủy đợt khám chưa được hỗ trợ');
          return;
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
    setNotificationModal({ visible: true });
  };

  const handleScheduleCampaign = () => {
    setScheduleModal({ visible: true });
  };
  
  const executeScheduleCampaign = async (scheduleData) => {
    setScheduling(true);
    try {
      console.log('Scheduling campaign with data:', scheduleData);
      
      // Call the API
      const response = await healthCheckApi.scheduleCampaign(campaignId, scheduleData);
      
      // Update campaign data
      setCampaign(response);
      
      // Refresh eligible students to get updated status
      await fetchEligibleStudents();
      
      // Show success message
      message.success('Đã lên lịch khám thành công');
      
      // Close modal
      setScheduleModal({ visible: false });
    } catch (error) {
      console.error('Error scheduling campaign:', error);
      message.error('Không thể lên lịch khám: ' + (error.response?.data?.message || error.message));
    } finally {
      setScheduling(false);
    }
  };

  // Manual refresh for eligible students (disabled auto-refresh to prevent constant reloading)
  const handleRefreshStudents = useCallback(async () => {
    console.log('Manual refresh triggered by user');
    try {
      setStudentsLoading(true);
      // Use the new API to get students with form status
      const data = await healthCheckApi.getEligibleStudentsWithFormStatus(campaignId);
      setEligibleStudents(data);
      setLastRefresh(new Date());
      
      // Update notification sent status based on backend data
      const hasFormsWithSentAt = data.some(student => student.sentAt);
      setNotificationSent(hasFormsWithSentAt);
      localStorage.setItem(`campaign_${campaignId}_notification_sent`, hasFormsWithSentAt.toString());
      
      message.success('Đã cập nhật danh sách học sinh');
    } catch (error) {
      console.error('Error refreshing students:', error);
      message.error('Không thể cập nhật danh sách học sinh');
    } finally {
      setStudentsLoading(false);
    }
  }, [campaignId]); // Only depend on campaignId

  const executeSendNotifications = async (customMessage = null) => {
    setSendingNotification(true);
    try {
      console.log('Sending notifications for campaign:', campaignId);
      
      // Step 1: Generate forms for eligible students
      console.log('Step 1: Generating health check forms...');
      message.loading('Đang tạo phiếu khám sức khỏe...', 0);
      
      const formsResponse = await healthCheckApi.generateForms(campaignId);
      console.log('Forms generated:', formsResponse);
      
      message.destroy();
      message.success(`Đã tạo ${formsResponse.formsGenerated || eligibleStudents.length} phiếu khám sức khỏe`);
      
      // Step 2: Send notifications to parents
      console.log('Step 2: Sending notifications to parents...');
      message.loading('Đang gửi thông báo đến phụ huynh...', 0);
      
      const notificationResponse = await healthCheckApi.sendNotificationsToParents(campaignId, customMessage);
      console.log('Notification response:', notificationResponse);
      
      message.destroy();
      
      // Show success message
      message.success(`Đã gửi thông báo thành công đến ${notificationResponse.notificationsSent || eligibleStudents.length} phụ huynh`);
      
      // Mark notification as sent and save to localStorage
      setNotificationSent(true);
      localStorage.setItem(`campaign_${campaignId}_notification_sent`, 'true');
      
      // Refresh student data to get updated form statuses from backend
      // This will show the correct notification sent status and form statuses
      await fetchEligibleStudents();
      
      // Don't manually update eligibleStudents state here anymore,
      // rely on the backend data from fetchEligibleStudents()
      
    } catch (error) {
      message.destroy();
      console.error('Error sending notifications:', error);
      
      if (error.response?.status === 401) {
        message.error('Không có quyền thực hiện thao tác này');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Không thể gửi thông báo đến phụ huynh');
      }
    } finally {
      setSendingNotification(false);
    }
  };

  // Notification modal handlers
  const handleNotificationModalCancel = () => {
    setNotificationModal({ visible: false });
  };

  const handleNotificationModalConfirm = async (customMessage) => {
    setNotificationModal({ visible: false });
    await executeSendNotifications(customMessage);
  };

  const handleScheduleModalCancel = () => {
    setScheduleModal({ visible: true });
  };

  const handleScheduleModalConfirm = async (scheduleData) => {
    executeScheduleCampaign(scheduleData);
  };

  const getActionButtons = () => {
    if (!campaign) return null;

    const buttons = [];
    
    switch (campaign.status) {
      case 'APPROVED': {
        // Add schedule button if notifications have been sent and not yet scheduled
        if (notificationSent && !campaign.timeSlot) {
          buttons.push(
            <Button 
              key="schedule" 
              type="primary" 
              style={{ marginRight: 8 }}
              icon={<CalendarOutlined />} 
              onClick={handleScheduleCampaign}
            >
              Lên lịch khám
            </Button>
          );
        }
        
        // Only show "Bắt đầu khám" button if notifications have been sent AND campaign is scheduled
        const isScheduled = campaign.timeSlot && campaign.timeSlot !== null;
        const canStartCampaign = notificationSent && isScheduled;
        
        buttons.push(
          <Button 
            key="start" 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            disabled={!canStartCampaign}
            onClick={() => showConfirmModal(
              'start', 
              'Xác nhận bắt đầu', 
              'Bạn có chắc chắn muốn bắt đầu đợt khám này?'
            )}
            title={!canStartCampaign ? 'Cần gửi thông báo và lên lịch trước khi bắt đầu khám' : ''}
          >
            Bắt đầu khám
          </Button>
        );
        break;
      }
      case 'IN_PROGRESS': {
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
      }
      default:
        break;
    }
    
    // Add cancel button for certain statuses (note: backend doesn't support cancel yet)
    if (['PENDING'].includes(campaign.status)) {
      buttons.push(
        <Button 
          key="cancel" 
          danger 
          icon={<CloseCircleOutlined />} 
          onClick={() => showConfirmModal(
            'cancel', 
            'Xác nhận hủy', 
            'Bạn có chắc chắn muốn hủy đợt khám này? (Chức năng này chưa được hỗ trợ)'
          )}
        >
          Hủy
        </Button>
      );
    }
    
    return buttons;
  };

  const getStatusTag = (status) => {
    const label = CAMPAIGN_STATUS_LABELS[status] || status;
    switch(status) {
      case 'PENDING':
        return <Tag color="orange">{label}</Tag>;
      case 'APPROVED':
        return <Tag color="green">{label}</Tag>;
      case 'REJECTED':
        return <Tag color="red">{label}</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="processing">{label}</Tag>;
      case 'COMPLETED':
        return <Tag color="success">{label}</Tag>;
      case 'SCHEDULED':
        return <Tag color="blue">{label}</Tag>;
      default:
        return <Tag color="default">{label}</Tag>;
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
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => index + 1,
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
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      width: 100,
      filters: [
        { text: '1A', value: '1A' },
        { text: '1B', value: '1B' },
        { text: '1C', value: '1C' },
        { text: '2A', value: '2A' },
        { text: '2B', value: '2B' },
        { text: '2C', value: '2C' },
        { text: '3A', value: '3A' },
        { text: '3B', value: '3B' },
        { text: '3C', value: '3C' },
        { text: '4A', value: '4A' },
        { text: '4B', value: '4B' },
        { text: '4C', value: '4C' },
        { text: '5A', value: '5A' },
        { text: '5B', value: '5B' },
        { text: '5C', value: '5C' },
      ],
      onFilter: (value, record) => record.className === value,
    },
    {
      title: 'Tuổi',
      dataIndex: 'age',
      key: 'age',
      width: 100,
      sorter: (a, b) => {
        const ageA = a.age || 0;
        const ageB = b.age || 0;
        return ageA - ageB;
      },
      render: (age, record) => {
        // Display age in years, similar to vaccination campaign's age in months
        if (age !== null && age !== undefined && age > 0) {
          return `${age} tuổi`;
        }
        // Fallback to calculate from dob if available
        if (record.dob) {
          const birthDate = dayjs(record.dob);
          const currentAge = dayjs().diff(birthDate, 'year');
          return `${currentAge} tuổi`;
        }
        return 'N/A';
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'statusDisplay',
      key: 'statusDisplay',
      width: 150,
      filters: [
        { text: 'Đã xác nhận khám', value: 'CONFIRMED' },
        { text: 'Từ chối khám', value: 'DECLINED' },
        { text: 'Chờ phản hồi', value: 'PENDING' },
        { text: 'Chưa gửi thông báo', value: 'NO_FORM' },
        { text: 'Chưa phản hồi', value: 'NO_RESPONSE' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (statusDisplay, record) => {
        const { status } = record;
        let color = 'default';
        let text = statusDisplay;
        
        switch (status) {
          case 'CONFIRMED':
            color = 'green';
            text = 'Đã xác nhận khám';
            break;
          case 'DECLINED':
            color = 'red';
            text = 'Từ chối khám';
            break;
          case 'PENDING':
            color = 'orange';
            text = 'Chờ phản hồi';
            break;
          case 'NO_FORM':
            color = 'default';
            text = 'Chưa gửi thông báo';
            break;
          default:
            color = 'default';
            text = 'Chưa gửi thông báo';
        }
        
        return <Tag color={color}>{text}</Tag>;
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
                              value={eligibleStudents.filter(s => 
                                s.status === 'PENDING' || s.status === 'NO_FORM'
                              ).length} 
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
              key: 'record-results',
              label: 'Ghi kết quả khám',
              disabled: campaign.status !== 'IN_PROGRESS',
              children: (
                <RecordResultsTab 
                  campaignId={campaignId}
                  campaign={campaign}
                  onRefreshData={() => {
                    // Refresh results when a new result is recorded
                    fetchResults();
                    fetchEligibleStudents();
                  }}
                />
              )
            },
            {
              key: 'results',
              label: 'Xem kết quả khám',
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

      <NotificationModal
        visible={notificationModal.visible}
        onCancel={handleNotificationModalCancel}
        onConfirm={handleNotificationModalConfirm}
        loading={sendingNotification}
        studentCount={eligibleStudents.length}
        campaignName={campaign?.name || ''}
      />

      <ScheduleModal
        visible={scheduleModal.visible}
        onCancel={handleScheduleModalCancel}
        onConfirm={handleScheduleModalConfirm}
        loading={scheduling}
        confirmedCount={campaign?.confirmedCount || 0}
      />
    </>
  );
};

export default HealthCheckCampaignDetail;