import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select, InputNumber, Alert } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const ScheduleModal = ({ 
  visible, 
  onCancel, 
  onConfirm, 
  loading = false,
  confirmedCount = 0
}) => {
  const [form] = Form.useForm();
  
  // Update form values when confirmedCount changes
  useEffect(() => {
    if (visible && confirmedCount !== undefined) {
      console.log('Setting targetCount to confirmedCount:', confirmedCount);
      form.setFieldsValue({ targetCount: confirmedCount });
    }
  }, [confirmedCount, visible, form]);
  
  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Submitting schedule form with values:', values);
      onConfirm(values);
    });
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined />
          <span>Lên lịch khám sức khỏe</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>,
        <Button 
          key="schedule" 
          type="primary" 
          icon={<CalendarOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          Lên lịch khám
        </Button>
      ]}
      destroyOnClose
    >
      <Alert
        message="Thông tin lịch khám"
        description={`Hiện có ${confirmedCount} học sinh đã được phụ huynh xác nhận tham gia khám.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          targetCount: confirmedCount
        }}
      >
        <Form.Item
          name="timeSlot"
          label="Khung giờ khám"
          rules={[{ required: true, message: 'Vui lòng chọn khung giờ khám' }]}
        >
          <Select placeholder="Chọn khung giờ khám">
            <Option value="MORNING">Buổi sáng (7:30 - 11:30)</Option>
            <Option value="AFTERNOON">Buổi chiều (13:30 - 17:00)</Option>
            <Option value="BOTH">Cả ngày</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="targetCount"
          label="Số học sinh dự kiến"
          extra="Mặc định là số học sinh đã được phụ huynh xác nhận"
        >
          <InputNumber min={0} style={{ width: '100%' }} readOnly/>
        </Form.Item>
        
        <Form.Item
          name="scheduleNotes"
          label="Ghi chú lịch khám"
        >
          <TextArea
            rows={4}
            placeholder="Nhập các ghi chú về lịch khám (nếu có)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ScheduleModal;
