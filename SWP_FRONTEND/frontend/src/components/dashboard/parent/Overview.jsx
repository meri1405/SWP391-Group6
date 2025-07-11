import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Avatar, List, Badge, Space, Divider, Spin, Empty, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  HeartOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { parentApi } from '../../../api/parentApi';
import webSocketService from '../../../services/webSocketService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Overview = ({ userInfo: externalUserInfo }) => {
  const { isParent, getToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Helper function to check if content is HTML
  const isHtmlContent = useCallback((content) => {
    if (!content) return false;
    return /<[^>]+>/.test(content);
  }, []);

  // When externalUserInfo changes, update the parent profile
  useEffect(() => {
    if (externalUserInfo) {
      console.log('Updating parent profile from external info:', externalUserInfo);
      setParentProfile(prev => {
        const updated = { ...prev, ...externalUserInfo };
        console.log('Updated parent profile with external data:', updated);
        return updated;
      });
    }
  }, [externalUserInfo]);

  // Fetch students and parent profile data
  useEffect(() => {
    const fetchData = async () => {
      if (!isParent()) return;
      
      try {
        setLoading(true);
        const token = getToken();
        
        // Load both students and parent profile
        const [studentsData, profileData] = await Promise.all([
          parentApi.getMyStudents(token),
          parentApi.getParentProfile(token)
        ]);
        
        console.log('Loaded initial parent profile:', profileData);
        setStudents(studentsData);
        setParentProfile(profileData);
        
        // Select first student by default
        if (studentsData && studentsData.length > 0) {
          setSelectedStudent(studentsData[0]);
          console.log(studentsData[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();  }, [isParent, getToken]);
  // Helper functions (moved outside useCallback to avoid dependencies)
  const getNotificationType = useCallback((notification) => {
    if (notification.medicationRequest) {
      return 'medication';
    } else if (notification.medicationSchedule) {
      return 'medication';
    }
    return 'general';
  }, []);

  const getNotificationIcon = useCallback((notification) => {
    const type = getNotificationType(notification);
    switch (type) {
      case 'medication':
        return <MedicineBoxOutlined />;
      case 'vaccination':
        return <ExclamationCircleOutlined />;
      case 'reminder':
        return <AlertOutlined />;
      default:
        return <FileTextOutlined />;
    }
  }, [getNotificationType]);

  const formatTimeAgo = useCallback((dateString) => {
    if (!dateString) return 'Không xác định';
    
    const now = dayjs();
    const notificationDate = dayjs(dateString);
    const diffInDays = now.diff(notificationDate, 'day');
    
    if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return notificationDate.format('DD/MM/YYYY');
    }
  }, []);  // Function to load recent notifications from database
  const loadRecentNotifications = useCallback(async () => {
    if (!isParent()) return;
    
    try {
      setNotificationsLoading(true);
      const token = getToken();
      // Use limit=3 to only fetch 3 most recent notifications from backend
      const notifications = await parentApi.getAllNotifications(token, 3);
      
      // Format notifications for display
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        type: getNotificationType(notification),
        title: notification.title,
        message: notification.message,
        time: formatTimeAgo(notification.createdAt),
        read: notification.read,
        icon: getNotificationIcon(notification)
      }));
      
      setRecentNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Keep empty array if error
      setRecentNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isParent, getToken, getNotificationType, formatTimeAgo, getNotificationIcon]);
  // Setup WebSocket connection for real-time notifications
  const setupWebSocketConnection = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Connect to WebSocket if not already connected
      if (!webSocketService.isConnected()) {
        await webSocketService.connect(token);
      }
      
      // Add message handler for real-time notifications
      webSocketService.addMessageHandler('overview-notifications', (newNotification) => {
        console.log('Received real-time notification in overview:', newNotification);
        
        // Transform the new notification
        const transformedNotification = {
          id: newNotification.id,
          type: getNotificationType(newNotification),
          title: newNotification.title,
          message: newNotification.message,
          time: 'Vừa xong',
          read: false,
          icon: getNotificationIcon(newNotification)
        };
        
        // Add new notification to the beginning of the list (keep max 5)
        setRecentNotifications(prev => [transformedNotification, ...prev].slice(0, 5));
      });
      
    } catch (error) {
      console.error('Error setting up WebSocket connection in overview:', error);
    }
  }, [getToken, getNotificationType, getNotificationIcon]);

  // Load notifications and setup WebSocket when component mounts
  useEffect(() => {
    if (isParent()) {
      loadRecentNotifications();
      setupWebSocketConnection();
    }
    
    return () => {
      // Cleanup WebSocket when component unmounts
      if (webSocketService.isConnected()) {
        webSocketService.removeMessageHandler('overview-notifications');
      }
    };
  }, [isParent, loadRecentNotifications, setupWebSocketConnection]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#1976d2' }}>
        Tổng quan sức khỏe
      </Title>

      {/* Student Selector */}
      {students.length > 1 && (
        <Card style={{ marginBottom: 24 }}>
          <Text strong>Chọn học sinh: </Text>
          <Select
            style={{ width: 300, marginLeft: 8 }}
            value={selectedStudent?.studentID}
            onChange={(studentId) => {
              const student = students.find(s => s.studentID === studentId);
              setSelectedStudent(student);
            }}
            placeholder="Chọn một học sinh"
          >
            {students.map(student => (
              <Option key={student.studentID} value={student.studentID}>
                {student.lastName} {student.firstName} - {student.className}
              </Option>
            ))}
          </Select>
        </Card>
      )}

      {students.length === 0 ? (
        <Empty 
          description="Không có thông tin học sinh" 
          style={{ margin: '40px 0' }}
        />
      ) : (
        <>
          {/* Health Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>              <Card 
                style={{ 
                  textAlign: 'center', 
                  borderTop: '3px solid #1976d2',
                  height: '100%'
                }}
                styles={{ 
                  body: { 
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                }}
              >
                <Avatar 
                  size={48} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#1976d2', marginBottom: 8 }}
                />
                <Title level={5} style={{ margin: '4px 0', fontSize: 16 }}>
                  {selectedStudent ? `${selectedStudent.lastName} ${selectedStudent.firstName}` : 'Chọn một học sinh'}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {selectedStudent ? selectedStudent.className : ''}
                </Text>
                {selectedStudent && (
                  <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                    {selectedStudent.gender=== 'M' ? 'Nam' : 'Nữ'}
                    <br />
                    {dayjs(selectedStudent.dob).format('DD/MM/YYYY')}
                  </Text>
                )}
              </Card>            </Col>
            
            <Col xs={24} sm={12} lg={6}>              
              <Card 
                style={{ 
                  borderTop: '3px solid #4caf50',
                  height: '100%'
                }}
                styles={{ 
                  body: { 
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }
                }}
              >
                <div>
                  <Text type="secondary" style={{ fontSize: 14 }}>Trạng thái</Text>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                    <CheckCircleOutlined style={{ color: '#4caf50', fontSize: 20, marginRight: 8 }} />
                    <Text style={{ fontSize: 20, color: '#4caf50', fontWeight: 500 }}>
                      {selectedStudent?.disabled ? 'Thôi học' : 'Đang học'}
                    </Text>
                  </div>
                </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>          
          <Card 
            style={{ 
              borderTop: '3px solid #ff9800',
              height: '100%'
            }}
            styles={{ 
              body: { 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }
            }}
          >            
          <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Quốc tịch</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <CalendarOutlined style={{ color: '#ff9800', fontSize: 20, marginRight: 8 }} />
                <Text style={{ fontSize: 20, color: '#ff9800', fontWeight: 500 }}>
                  {selectedStudent?.citizenship || '-'}
                </Text>
              </div>
            </div>
          </Card>        
        </Col>
        <Col xs={24} sm={12} lg={6}>          
          <Card 
            style={{ 
              borderTop: '3px solid #ff9800',
              height: '100%'
            }}
            styles={{ 
              body: { 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }
            }}
          >            
          <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Năm học</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <CalendarOutlined style={{ color: '#ff9800', fontSize: 20, marginRight: 8 }} />
                <Text style={{ fontSize: 20, color: '#ff9800', fontWeight: 500 }}>
                  {selectedStudent?.schoolYear || '-'}
                </Text>
              </div>
            </div>
          </Card>        
        </Col>
      </Row>

      {/* Detailed Student Information */}
      {selectedStudent && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card 
              title="Thông tin chi tiết học sinh"
              style={{ height: '100%' }}
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">Họ và tên:</Text>
                  <br />
                  <Text strong>{selectedStudent.lastName} {selectedStudent.firstName}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Lớp:</Text>
                  <br />
                  <Text strong>{selectedStudent.className}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Ngày sinh:</Text>
                  <br />
                  <Text>{dayjs(selectedStudent.dob).format('DD/MM/YYYY')}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Giới tính:</Text>
                  <br />
                  <Text>{selectedStudent.gender === 'M' ? 'Nam' : 'Nữ'}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Nơi sinh:</Text>
                  <br />
                  <Text>{selectedStudent.birthPlace}</Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Địa chỉ:</Text>
                  <br />
                  <Text>{selectedStudent.address}</Text>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              title="Thông tin phụ huynh"
              style={{ height: '100%' }}
            >
              {parentProfile ? (
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text type="secondary">Họ và tên:</Text>
                    <br />
                    <Text strong>{parentProfile.lastName} {parentProfile.firstName}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Số điện thoại:</Text>
                    <br />
                    <Text strong>{parentProfile.phone}</Text>
                  </Col>                 <Col span={12}>
                    <Text type="secondary">Nghề nghiệp:</Text>
                    <br />
                    <Text>{parentProfile.jobTitle || 'PARENT'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Ngày sinh:</Text>
                    <br />
                    <Text>{dayjs(parentProfile.dateOfBirth).format('DD/MM/YYYY') || 'Chưa cập nhật'}</Text>
                  </Col>
                  <Col span={24}>
                    <Text type="secondary">Địa chỉ:</Text>
                    <br />
                    <Text>{parentProfile.address || 'Chưa cập nhật'}</Text>
                  </Col>
                  {selectedStudent.parents && selectedStudent.parents.length > 1 && (
                    <Col span={24}>
                      <Divider />
                      <Text type="secondary">Phụ huynh khác:</Text>
                      {selectedStudent.parents
                        .filter(parent => parent.id !== parentProfile.id)
                        .map(parent => (
                          <div key={parent.id} style={{ marginTop: 8 }}>
                            <Text strong>{parent.lastName} {parent.firstName}</Text>
                            <br />
                            <Text type="secondary">{parent.phone}</Text>
                          </div>
                        ))
                      }
                    </Col>
                  )}
                </Row>
              ) : (
                <Spin />
              )}
            </Card>
          </Col>
        </Row>
      )}
      </>
      )}      {/* Only show notifications section for parents */}
      {isParent() && (
        <Card 
          title={
            <Space>
              <AlertOutlined />
              <span>Thông báo gần đây</span>
            </Space>
          }
          extra={
            <Text 
              style={{ color: '#1976d2', cursor: 'pointer' }}
              onClick={() => navigate('/parent-dashboard?tab=notifications')}
            >
              Xem tất cả
            </Text>
          }
        >
          {notificationsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">Đang tải thông báo...</Text>
              </div>
            </div>
          ) : recentNotifications.length > 0 ? (
            <List
              dataSource={recentNotifications}
              renderItem={(notification) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!notification.read}>
                        <Avatar icon={notification.icon} />
                      </Badge>
                    }
                    title={notification.title}
                    description={
                      <div>
                        {isHtmlContent(notification.message) ? (
                          <div 
                            dangerouslySetInnerHTML={{ __html: notification.message }}
                            style={{ 
                              minHeight: '20px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : (
                          <Text style={{ 
                            minHeight: '20px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block'
                          }}>
                            {notification.message.split('\n').map((line, i) => (
                              <span key={i}>
                                {line}
                                {i < notification.message.split('\n').length - 1 && <br />}
                              </span>
                            ))}
                          </Text>
                        )}
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {notification.time}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty 
              description="Không có thông báo nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '20px 0' }}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default Overview;
