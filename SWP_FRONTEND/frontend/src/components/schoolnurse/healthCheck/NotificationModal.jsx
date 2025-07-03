import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  
  // Quill editor modules and formats configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background'
  ];

  // Default notification message in HTML format for rich text editor
  const defaultMessage = `<p><strong>Thân gửi Quý phụ huynh,</strong></p>
  <p>Nhà trường thông báo về đợt khám sức khỏe "<strong>${campaignName}</strong>" sắp diễn ra.</p>
  <p>Đợt khám sẽ được tổ chức tại trường. Đây là cơ hội để các em học sinh được kiểm tra sức khỏe định kỳ, phát hiện sớm các vấn đề sức khỏe và nhận tư vấn từ các chuyên gia y tế.</p>
  <p>Kính đề nghị Quý phụ huynh xem xét và cho phép con em tham gia đợt khám sức khỏe này để đảm bảo sức khỏe tốt nhất cho các em.</p>
  <p>Vui lòng phản hồi qua hệ thống để xác nhận việc tham gia.</p>
  <p>Nếu có bất kỳ câu hỏi nào, Quý phụ huynh có thể liên hệ với nhà trường qua số điện thoại hoặc email đã cung cấp.</p>
  <p><em>Trân trọng,</em><br>Ban Giám hiệu</p>`;

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
              validator: (_, value) => {
                // Remove HTML tags to get text length
                const textLength = value ? value.replace(/<[^>]+>/g, '').length : 0;
                if (textLength > 1000) {
                  return Promise.reject('Nội dung thông báo không được vượt quá 1000 ký tự');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            modules={modules}
            formats={formats}
            style={{ height: '250px', marginBottom: '40px' }}
            placeholder="Nhập nội dung thông báo tùy chỉnh hoặc sử dụng mẫu mặc định..."
            value={customMessage}
            onChange={value => {
              setCustomMessage(value);
              form.setFieldsValue({ message: value });
            }}
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
            maxHeight: 150,
            overflowY: 'auto'
          }}
            dangerouslySetInnerHTML={{ __html: defaultMessage }}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default NotificationModal;
