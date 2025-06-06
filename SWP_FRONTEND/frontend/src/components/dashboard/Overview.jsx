import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Avatar, List, Badge, Space, Divider, Spin, Empty, Select, message } from 'antd';
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
import { useAuth } from '../../contexts/AuthContext';
import { parentApi } from '../../api/parentApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Overview = ({ userInfo: externalUserInfo }) => {
  const { isParent, getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);
    // Function to refresh parent profile data
  const refreshParentProfile = async () => {
    if (!isParent()) return;
    
    try {
      const token = getToken();
      const profileData = await parentApi.getParentProfile(token);
      
      console.log('Refreshed parent profile:', profileData);
      setParentProfile(profileData);
    } catch (error) {
      console.error('Error refreshing parent profile:', error);
    }
  };
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
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải thông tin. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isParent, getToken]);

  // Dữ liệu mẫu cho thông báo
  const recentNotifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Nhắc lịch khám sức khỏe',
      message: 'Lịch khám sức khỏe định kỳ của bé Nguyễn Văn An vào ngày 15/06/2025',
      time: '21/5/2025',
      read: false,
      icon: <AlertOutlined />
    },
    {
      id: 2,
      type: 'vaccination',
      title: 'Cập nhật tiêm chủng',
      message: 'Nhà trường sẽ tổ chức tiêm vắc-xin phòng cúm vào ngày 30/05/2025',
      time: '20/5/2025',
      read: true,
      icon: <ExclamationCircleOutlined />
    }  ];

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
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>              <Card 
                style={{ 
                  borderTop: '3px solid #2196f3',
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
                  <Text type="secondary" style={{ fontSize: 14 }}>Nhóm máu</Text>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                    <HeartOutlined style={{ color: '#2196f3', fontSize: 20, marginRight: 8 }} />
                    <div>
                      <Text style={{ fontSize: 20, color: '#2196f3', fontWeight: 500 }}>
                        {selectedStudent?.bloodType || '-'}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={6}>              <Card 
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
        
        <Col xs={24} sm={12} lg={6}>          <Card 
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
          >            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Quốc tịch</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <CalendarOutlined style={{ color: '#ff9800', fontSize: 20, marginRight: 8 }} />
                <Text style={{ fontSize: 20, color: '#ff9800', fontWeight: 500 }}>
                  {selectedStudent?.citizenship || '-'}
                </Text>
              </div>
            </div>
          </Card>        </Col>
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
                <Col span={12}>
                  <Text type="secondary">Nhóm máu:</Text>
                  <br />
                  <Text>{selectedStudent.bloodType}</Text>
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
      )}

      {/* Only show notifications section for parents */}
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
              onClick={() => console.log('View all notifications')}
            >
              Xem tất cả
            </Text>
          }
        >
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
                      <Text>{notification.message}</Text>
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
        </Card>
      )}
    </div>
  );
};

export default Overview;
