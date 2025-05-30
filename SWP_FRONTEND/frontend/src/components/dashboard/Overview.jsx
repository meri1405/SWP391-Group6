import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Avatar, List, Badge, Space, Divider, Spin, Empty } from 'antd';
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

const { Title, Text } = Typography;

const Overview = () => {
  const { isParent, getToken, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      if (!isParent()) return;
      
      try {
        setLoading(true);
        const token = getToken();
        const studentsData = await parentApi.getMyStudents(token);
        setStudents(studentsData);
        
        // Select first student by default
        if (studentsData && studentsData.length > 0) {
          setSelectedStudent(studentsData[0]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
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
    }
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, color: '#1976d2' }}>
        Tổng quan sức khỏe
      </Title>

      {/* Health Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              textAlign: 'center', 
              borderTop: '3px solid #1976d2',
              height: '100%'
            }}
            bodyStyle={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Avatar 
              size={48} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#1976d2', marginBottom: 8 }}
            />
            <Title level={5} style={{ margin: '4px 0', fontSize: 16 }}>{selectedStudent ? selectedStudent.name : 'Chọn một học sinh'}</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>{selectedStudent ? selectedStudent.class : ''}</Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderTop: '3px solid #2196f3',
              height: '100%'
            }}
            bodyStyle={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Chỉ số BMI</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <HeartOutlined style={{ color: '#2196f3', fontSize: 20, marginRight: 8 }} />
                <div>
                  <Text style={{ fontSize: 20, color: '#2196f3', fontWeight: 500 }}>{selectedStudent ? selectedStudent.bmi : '-'}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>({selectedStudent ? selectedStudent.weight : '-'} / {selectedStudent ? selectedStudent.height : '-'})</Text>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderTop: '3px solid #4caf50',
              height: '100%'
            }}
            bodyStyle={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Tình trạng sức khỏe</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <CheckCircleOutlined style={{ color: '#4caf50', fontSize: 20, marginRight: 8 }} />
                <Text style={{ fontSize: 20, color: '#4caf50', fontWeight: 500 }}>{selectedStudent ? selectedStudent.status : '-'}</Text>
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
            bodyStyle={{ 
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div>
              <Text type="secondary" style={{ fontSize: 14 }}>Lịch khám gần nhất</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 6 }}>
                <CalendarOutlined style={{ color: '#ff9800', fontSize: 20, marginRight: 8 }} />
                <Text style={{ fontSize: 20, color: '#ff9800', fontWeight: 500 }}>{selectedStudent ? selectedStudent.lastCheckup : '-'}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

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
