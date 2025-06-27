import React from 'react';
import { Modal, List, Typography, Button, Space, Tag, Alert } from 'antd';
import { ExclamationCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MissingHealthProfileModal = ({ 
  visible, 
  students = [], 
  onCreateProfile 
}) => {
  const navigate = useNavigate();

  const handleCreateProfile = (student) => {
    onCreateProfile(student);
    // Navigate to health profile declaration page with student info
    navigate('/parent-dashboard?tab=health-profile-declaration', { 
      state: { selectedStudent: student } 
    });
  };

  const handleStartDeclaration = () => {
    if (students.length > 0) {
      handleCreateProfile(students[0]);
    }
  };

  return (
    <Modal
      title={
        <Space align="center" style={{ color: '#ff4d4f' }}>
          <ExclamationCircleOutlined style={{ fontSize: 20 }} />
          <span>Khai báo hồ sơ y tế BẮT BUỘC</span>
        </Space>
      }
      open={visible}
      onCancel={null} // Không cho phép đóng modal
      footer={null}
      width={700}
      centered
      maskClosable={false} // Không cho phép đóng bằng cách click outside
      closable={false} // Không hiển thị nút X để đóng
      keyboard={false} // Không cho phép đóng bằng ESC
    >
      <div style={{ marginTop: 16 }}>
        <Alert
          message="THÔNG BÁO BẮT BUỘC - KHÔNG THỂ BỎ QUA"
          description="Bạn PHẢI khai báo hồ sơ y tế cho tất cả học sinh trước khi có thể sử dụng các tính năng khác của hệ thống. Đây là yêu cầu bắt buộc để đảm bảo an toàn sức khỏe cho học sinh."
          type="error"
          showIcon
          style={{ marginBottom: 20, border: '2px solid #ff4d4f' }}
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
          background: '#fff1f0', 
          border: '2px solid #ff4d4f',
          borderRadius: 8 
        }}>
          <Text style={{ color: '#cf1322' }}>
            <strong>LƯU Ý QUAN TRỌNG:</strong> Bạn KHÔNG THỂ sử dụng bất kỳ tính năng nào khác của hệ thống 
            cho đến khi hoàn thành khai báo hồ sơ y tế cho tất cả học sinh. Điều này là BẮT BUỘC và không thể bỏ qua.
          </Text>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleStartDeclaration}
            style={{ 
              background: '#52c41a',
              borderColor: '#52c41a',
              fontSize: '16px',
              height: '50px',
              padding: '0 30px'
            }}
          >
            BẮT ĐẦU KHAI BÁO NGAY
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MissingHealthProfileModal;
