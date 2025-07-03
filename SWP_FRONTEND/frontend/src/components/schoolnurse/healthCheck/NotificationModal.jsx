import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
const { Title, Text } = Typography;
const { TextArea } = Input;

const NotificationModal = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  loading = false,
  studentCount = 0,
  campaignName = ''
}) => {
  const [form] = Form.useForm();
  const [customMessage, setCustomMessage] = useState('');

  // Default notification message
  const defaultMessage = `Thân gửi Quý phụ huynh,
  Nhà trường thông báo về đợt khám sức khỏe "${campaignName}" sắp diễn ra.
  Đợt khám sẽ được tổ chức tại trường. Đây là cơ hội để các em học sinh được kiểm tra sức khỏe định kỳ, phát hiện sớm các vấn đề sức khỏe và nhận tư vấn từ các chuyên gia y tế.
  Kính đề nghị Quý phụ huynh xem xét và cho phép con em tham gia đợt khám sức khỏe này để đảm bảo sức khỏe tốt nhất cho các em.
  Vui lòng phản hồi qua hệ thống để xác nhận việc tham gia.
  Nếu có bất kỳ câu hỏi nào, Quý phụ huynh có thể liên hệ với nhà trường qua số điện thoại hoặc email đã cung cấp.
  Trân trọng,
  Ban Giám hiệu`;

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const messageToSend = values.message || defaultMessage;
      onConfirm(messageToSend);
    }).catch(() => {
      message.error('Vui lòng kiểm tra lại thông tin');
    });
  };

  const handleUseDefault = () => {
    form.setFieldsValue({ message: defaultMessage });
    setCustomMessage(defaultMessage);
  };

  const handleReset = () => {
    form.resetFields();
    setCustomMessage('');
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SendOutlined />
          <span>Tùy chỉnh thông báo khám sức khỏe</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button key="default" onClick={handleUseDefault} disabled={loading}>
          Sử dụng mẫu mặc định
        </Button>,
        <Button key="reset" onClick={handleReset} disabled={loading}>
          Xóa
        </Button>,
        <Button 
          key="send" 
          type="primary" 
          icon={<SendOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          Gửi thông báo ({studentCount} học sinh)
        </Button>
      ]}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Tùy chỉnh nội dung thông báo gửi đến phụ huynh của {studentCount} học sinh đủ điều kiện tham gia đợt khám sức khỏe.
        </Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ message: '' }}
      >
        <Form.Item
          name="message"
          label="Nội dung thông báo"
          rules={[
            {
              max: 1000,
              message: 'Nội dung thông báo không được vượt quá 1000 ký tự'
            }
          ]}
        >
          <TextArea
            rows={12}
            placeholder="Nhập nội dung thông báo tùy chỉnh hoặc sử dụng mẫu mặc định..."
            showCount
            maxLength={1000}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </Form.Item>

        <div style={{ 
          padding: 12, 
          backgroundColor: '#f6f6f6', 
          borderRadius: 6,
          border: '1px dashed #d9d9d9'
        }}>
          <Text strong style={{ fontSize: 13 }}>Mẫu thông báo mặc định:</Text>
          <div style={{ 
            marginTop: 8, 
            fontSize: 12, 
            color: '#666',
            whiteSpace: 'pre-line',
            maxHeight: 150,
            overflowY: 'auto'
          }}>
            {defaultMessage}
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default NotificationModal;
