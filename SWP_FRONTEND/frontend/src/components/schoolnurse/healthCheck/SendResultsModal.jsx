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
  Space
} from 'antd';
import { SendOutlined, InfoCircleOutlined } from '@ant-design/icons';

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
  
  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSendToAll(false);
    }
  }, [visible, form]);

  // Handle select all toggle
  const handleSelectAllChange = (checked) => {
    setSendToAll(checked);
    if (checked) {
      form.setFieldsValue({ studentIds: [] });
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // If send to all is checked, pass empty array to send to all students
      const studentIds = sendToAll ? [] : values.studentIds || [];
      
      onConfirm(studentIds, values.customMessage);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SendOutlined />
          <span>Gửi kết quả khám sức khỏe cho phụ huynh</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={650}
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
          Gửi kết quả
        </Button>
      ]}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin />
          <p>Đang gửi kết quả khám sức khỏe...</p>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
        >
          <Alert
            message="Gửi kết quả khám sức khỏe"
            description={
              <div>
                <p>
                  Chức năng này sẽ gửi kết quả khám sức khỏe của học sinh cho phụ huynh thông qua tin nhắn thông báo.
                  Kết quả sẽ được tổ chức theo từng loại khám và bao gồm các kết luận (nếu có).
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
          
          <Form.Item>
            <Checkbox 
              checked={sendToAll}
              onChange={e => handleSelectAllChange(e.target.checked)}
            >
              Gửi cho tất cả học sinh đã có kết quả khám
            </Checkbox>
          </Form.Item>
          
          {!sendToAll && (
            <Form.Item
              name="studentIds"
              label="Chọn học sinh cần gửi kết quả"
              rules={[
                { required: true, message: 'Vui lòng chọn ít nhất một học sinh!' }
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn học sinh"
                style={{ width: '100%' }}
                optionFilterProp="children"
                onChange={() => {}}
                disabled={sendToAll}
              >
                {students.map(student => (
                  <Option key={student.id} value={student.id}>
                    {student.fullName} {student.className ? `- Lớp ${student.className}` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          <Form.Item
            name="customMessage"
            label="Thông báo tùy chỉnh (không bắt buộc)"
          >
            <TextArea
              rows={4}
              placeholder="Nhập thông báo tùy chỉnh bạn muốn gửi kèm với kết quả khám sức khỏe..."
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default SendResultsModal;
