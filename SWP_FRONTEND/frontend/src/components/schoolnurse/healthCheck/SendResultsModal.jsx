import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Spin,
  Typography,
  Alert,
  Checkbox,
  Space,
  Switch,
  Divider,
  Card
} from 'antd';
import { SendOutlined, InfoCircleOutlined, EditOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const SendResultsModal = ({
  visible,
  onCancel,
  onConfirm,
  loading,
  students = [],
  campaignName = ''
}) => {
  const [form] = Form.useForm();
  const [sendToAll, setSendToAll] = useState(false);
  const [useDefaultTemplate, setUseDefaultTemplate] = useState(true);
  const [customContent, setCustomContent] = useState('');
  
  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSendToAll(false);
      setUseDefaultTemplate(true);
      setCustomContent('');
    }
  }, [visible, form]);

  // Handle select all toggle
  const handleSelectAllChange = (checked) => {
    setSendToAll(checked);
    if (checked) {
      form.setFieldsValue({ studentIds: [] });
    }
  };

  // Handle template toggle
  const handleTemplateToggle = (checked) => {
    setUseDefaultTemplate(checked);
    if (checked) {
      setCustomContent('');
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // If send to all is checked, pass empty array to send to all students
      const studentIds = sendToAll ? [] : values.studentIds || [];
      
      // If using custom content, validate it's not empty
      if (!useDefaultTemplate && (!customContent || customContent.trim() === '')) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng nhập nội dung thông báo tùy chỉnh hoặc chọn sử dụng mẫu tự động.'
        });
        return;
      }
      
      onConfirm(studentIds, customContent, useDefaultTemplate);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Rich text editor modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const defaultTemplateInfo = (
    <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <Text type="secondary">
        <InfoCircleOutlined style={{ marginRight: 8 }} />
        Mẫu tự động sẽ tạo nội dung dựa trên kết quả khám thực tế của từng học sinh, 
        bao gồm các chỉ số cơ bản (chiều cao, cân nặng, BMI) và kết luận từng loại khám.
        Nội dung sẽ được cá nhân hóa cho từng phụ huynh.
      </Text>
    </Card>
  );

  const customContentPlaceholders = (
    <Text type="secondary" style={{ fontSize: '12px' }}>
      <strong>Placeholder có thể sử dụng:</strong> {'{{'} studentName {'}},'} {'{{'} campaignName {'}},'} {'{{'} className {'}}'}
    </Text>
  );

  return (
    <Modal
      title={
        <Space>
          <SendOutlined />
          <span>Gửi thông báo kết quả khám sức khỏe</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      style={{ top: 20 }}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSubmit}
          loading={loading}
        >
          Gửi thông báo
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin />
          <p>Đang gửi thông báo kết quả khám sức khỏe...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
        >
          <Alert
            message="Gửi thông báo kết quả khám sức khỏe cho phụ huynh"
            description={
              <div>
                <p>
                  Chức năng này chỉ gửi thông báo cho phụ huynh của những học sinh đã xác nhận tham gia 
                  và chiến dịch đã hoàn thành. Nội dung thông báo có thể tùy chỉnh hoặc sử dụng mẫu tự động.
                </p>
                <p>
                  <strong>Chiến dịch:</strong> {campaignName}
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          {/* Student Selection */}
          <Form.Item>
            <Checkbox 
              checked={sendToAll}
              onChange={e => handleSelectAllChange(e.target.checked)}
            >
              Gửi cho tất cả học sinh đã xác nhận tham gia
            </Checkbox>
          </Form.Item>
          
          {!sendToAll && (
            <Form.Item
              name="studentIds"
              label="Chọn học sinh cần gửi thông báo"
              rules={[
                { required: true, message: 'Vui lòng chọn ít nhất một học sinh!' }
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn học sinh"
                style={{ width: '100%' }}
                optionFilterProp="children"
                showSearch
                disabled={sendToAll}
              >
                {students.map(student => (
                  <Option key={student.studentID} value={student.studentID}>
                    {student.fullName} {student.className ? `- Lớp ${student.className}` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Divider />
          
          {/* Content Template Selection */}
          <Form.Item label="Loại nội dung thông báo">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Switch
                  checked={useDefaultTemplate}
                  onChange={handleTemplateToggle}
                  checkedChildren="Mẫu tự động"
                  unCheckedChildren="Tùy chỉnh"
                />
                <Text style={{ marginLeft: 8 }}>
                  {useDefaultTemplate ? 'Sử dụng mẫu tự động' : 'Tùy chỉnh nội dung'}
                </Text>
              </div>
              
              {useDefaultTemplate ? defaultTemplateInfo : customContentPlaceholders}
            </Space>
          </Form.Item>
          
          {/* Custom Content Editor */}
          {!useDefaultTemplate && (
            <Form.Item
              label="Nội dung thông báo"
              required
            >
              <ReactQuill
                theme="snow"
                value={customContent}
                onChange={setCustomContent}
                modules={quillModules}
                placeholder="Nhập nội dung thông báo cho phụ huynh..."
                style={{ height: '200px', marginBottom: '42px' }}
              />
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default SendResultsModal;
