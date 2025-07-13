import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Typography, Alert, Divider } from 'antd';
import { SendOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;

const CustomMessageModal = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  loading = false,
  campaignName,
  formsCount 
}) => {
  const [form] = Form.useForm();
  
  // Default template content
  const getDefaultTemplate = (campaignName) => `<p>Kính gửi Quý phụ huynh,</p>
<p>Nhà trường trân trọng gửi đến Quý phụ huynh đơn xin phép tiêm chủng cho học sinh trong chiến dịch "<strong>${campaignName || '[Tên chiến dịch]'}</strong>".</p>
<p>Đây là một hoạt động quan trọng nhằm bảo vệ sức khỏe của các em học sinh. Kính đề nghị Quý phụ huynh xem xét và cho phép con em tham gia đợt khám sức khỏe này để đảm bảo sức khỏe tốt nhất cho các em.</p>
<p>Vui lòng phản hồi qua hệ thống để xác nhận việc tham gia.</p>
<p>Nếu có bất kỳ câu hỏi nào, Quý phụ huynh có thể liên hệ với nhà trường qua số điện thoại hoặc email đã cung cấp.</p>
<p>Trân trọng,</p>
<p><em>Hệ thống Quản lý Y Tế Học đường (SMMS)</em></p>`;

  const [customMessage, setCustomMessage] = useState('');

  // Sync form values when modal opens
  useEffect(() => {
    if (visible) {
      const template = getDefaultTemplate(campaignName);
      form.setFieldsValue({
        customMessage: template
      });
      setCustomMessage(template);
    }
  }, [visible, campaignName, form]);

  const handleSubmit = () => {
    form.validateFields().then(() => {
      onSubmit(customMessage.trim() || null);
    });
  };

  const handleCancel = () => {
    const template = getDefaultTemplate(campaignName);
    form.resetFields();
    setCustomMessage(template);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SendOutlined style={{ color: '#1890ff' }} />
          <span>Gửi đơn tiêm chủng đến phụ huynh</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px',
          alignItems: 'center'
        }}>
          <Button key="cancel" onClick={handleCancel}>
            Hủy bỏ
          </Button>
          <Button
            key="send-default"
            type="default"
            loading={loading}
            onClick={() => onSubmit(null)}
            icon={<FileTextOutlined />}
          >
            Gửi mẫu mặc định
          </Button>
          <Button
            key="restore-template"
            onClick={() => {
              const template = getDefaultTemplate(campaignName);
              setCustomMessage(template);
              form.setFieldsValue({ customMessage: template });
            }}
          >
            Khôi phục mẫu
          </Button>
          <Button
            key="send-custom"
            type="primary"
            loading={loading}
            icon={<SendOutlined />}
            onClick={handleSubmit}
          >
            Gửi thông báo tùy chỉnh
          </Button>
        </div>
      }
      width={700}
      destroyOnClose
    >
      <div style={{ marginBottom: '20px' }}>
        <Alert
          message={`Sẽ gửi ${formsCount} đơn tiêm chủng cho chiến dịch "${campaignName}"`}
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Divider style={{ margin: '16px 0' }} />
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="customMessage"
          label="Nội dung thông báo"
          rules={[
            {
              max: 2000,
              message: 'Nội dung không được vượt quá 2000 ký tự'
            }
          ]}
        >
          <ReactQuill
            theme="snow"
            value={customMessage}
            onChange={(content) => {
              setCustomMessage(content);
              form.setFieldsValue({ customMessage: content });
            }}
            placeholder="Chỉnh sửa nội dung thông báo theo ý muốn..."
            style={{ 
              height: '250px',
              marginBottom: '50px'
            }}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'align': [] }],
                ['clean']
              ],
            }}
            formats={[
              'header', 'bold', 'italic', 'underline', 'strike',
              'list', 'bullet', 'align'
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomMessageModal;
