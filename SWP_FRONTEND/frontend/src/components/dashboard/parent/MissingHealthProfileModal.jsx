import React, { useState } from 'react';
import { Modal, List, Typography, Button, Space, Tag, Alert } from 'antd';
import { ExclamationCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MissingHealthProfileModal = ({ 
  visible, 
  students = [], 
  onCancel, 
  onCreateProfile 
}) => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleCreateProfile = (student) => {
    setSelectedStudent(student);
    onCreateProfile(student);
    // Navigate to health profile declaration page with student info
    navigate('/parent-dashboard?tab=health-profile-declaration', { 
      state: { selectedStudent: student } 
    });
  };

  return (
    <Modal
      title={
        <Space align="center" style={{ color: '#ff4d4f' }}>
          <ExclamationCircleOutlined style={{ fontSize: 20 }} />
          <span>Khai báo hồ sơ y tế bắt buộc</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      maskClosable={false}
      closable={false}
    >
      <div style={{ marginTop: 16 }}>
        <Alert
          message="Thông báo quan trọng"
          description="Một số học sinh của bạn chưa có hồ sơ y tế. Việc khai báo hồ sơ y tế là bắt buộc để đảm bảo sức khỏe và an toàn cho học sinh tại trường."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <Title level={5} style={{ marginBottom: 16 }}>
          Danh sách học sinh cần khai báo hồ sơ y tế:
        </Title>

        <List
          dataSource={students}
          renderItem={(student) => (
            <List.Item
              style={{
                padding: '12px 16px',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                marginBottom: 8,
                backgroundColor: '#fafafa'
              }}
              actions={[
                <Button
                  type="primary"
                  icon={<MedicineBoxOutlined />}
                  onClick={() => handleCreateProfile(student)}
                  style={{ 
                    background: '#52c41a',
                    borderColor: '#52c41a'
                  }}
                >
                  Khai báo ngay
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#e6f7ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #1890ff'
                    }}
                  >
                    <UserOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                  </div>
                }
                title={
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>
                      {student.lastName} {student.firstName}
                    </Text>
                    <Tag color="red">Chưa có hồ sơ</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">Lớp: {student.className || 'Chưa xác định'}</Text>
                    <br />
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: 8 
        }}>
          <Text style={{ color: '#389e0d' }}>
            <strong>Lưu ý:</strong> Bạn cần hoàn thành khai báo hồ sơ y tế cho tất cả học sinh 
            trước khi có thể sử dụng đầy đủ các tính năng của hệ thống.
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bạn có thể đóng thông báo này và quay lại sau, nhưng thông báo sẽ tiếp tục hiển thị 
            cho đến khi hoàn thành khai báo cho tất cả học sinh.
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Để sau
          </Button>
          <Button 
            type="primary" 
            onClick={() => handleCreateProfile(students[0])}
            style={{ 
              background: '#52c41a',
              borderColor: '#52c41a'
            }}
          >
            Bắt đầu khai báo
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MissingHealthProfileModal;
