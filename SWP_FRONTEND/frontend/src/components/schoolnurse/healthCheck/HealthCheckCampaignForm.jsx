import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Divider,
  message,
  Spin,
  Typography,
  Alert
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthCheckApi } from '../../../api/healthCheckApi';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const HealthCheckCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!campaign;

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      // Set form values from campaign data
      const formData = {
        ...campaign,
        dateRange: campaign.startDate && campaign.endDate ? 
          [dayjs(campaign.startDate), dayjs(campaign.endDate)] : 
          undefined,
        targetClasses: campaign.targetClasses || []
      };
      form.setFieldsValue(formData);
    }
  }, [campaign, form, isEditing]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categories = await healthCheckApi.getAvailableCategories();
      setAvailableCategories(categories);
    } catch (error) {
      message.error('Không thể tải danh sách loại khám sức khỏe');
      console.error('Error fetching health check categories:', error);
      // Set some default categories for development
      setAvailableCategories(['VISION', 'HEARING', 'ORAL', 'SKIN', 'RESPIRATORY']);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const [startDate, endDate] = values.dateRange || [];
      
      const campaignData = {
        ...values,
        startDate: startDate ? startDate.format('YYYY-MM-DDTHH:mm:ss') : null,
        endDate: endDate ? endDate.format('YYYY-MM-DDTHH:mm:ss') : null,
      };
      
      // Remove dateRange field as it's not part of the backend DTO
      delete campaignData.dateRange;

      let result;
      if (isEditing) {
        result = await healthCheckApi.updateCampaign(campaign.id, campaignData);
        message.success('Cập nhật đợt khám sức khỏe thành công');
      } else {
        result = await healthCheckApi.createCampaign(campaignData);
        message.success('Tạo đợt khám sức khỏe mới thành công');
      }
      onSuccess(result);
    } catch (error) {
      message.error(`Không thể ${isEditing ? 'cập nhật' : 'tạo'} đợt khám sức khỏe`);
      console.error(`Error ${isEditing ? 'updating' : 'creating'} campaign:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Title level={4}>
          {isEditing ? 'Chỉnh sửa đợt khám sức khỏe cho học sinh tiểu học' : 'Tạo đợt khám sức khỏe mới cho học sinh tiểu học'}
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          minAge: 6,
          maxAge: 12,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên đợt khám"
              rules={[{ required: true, message: 'Vui lòng nhập tên đợt khám' }]}
            >
              <Input placeholder="Nhập tên đợt khám sức khỏe cho học sinh tiểu học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
            >
              <TextArea rows={3} placeholder="Nhập mô tả chi tiết về đợt khám sức khỏe cho học sinh tiểu học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateRange"
              label="Thời gian thực hiện"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian thực hiện' }]}
            >
              <RangePicker 
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Địa điểm"
              rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
            >
              <Input placeholder="Nhập địa điểm khám sức khỏe cho học sinh tiểu học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minAge"
              label="Độ tuổi tối thiểu"
              rules={[{ required: true, message: 'Vui lòng nhập độ tuổi tối thiểu' }]}
            >
              <InputNumber 
                min={6} 
                max={12}
                style={{ width: '100%' }}
                placeholder="Nhập độ tuổi tối thiểu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxAge"
              label="Độ tuổi tối đa"
              rules={[{ required: true, message: 'Vui lòng nhập độ tuổi tối đa' }]}
            >
              <InputNumber 
                min={6} 
                max={12}
                style={{ width: '100%' }}
                placeholder="Nhập độ tuổi tối đa"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="targetClasses"
              label="Lớp mục tiêu (tuỳ chọn)"
            >
              <Select 
                mode="tags"
                placeholder="Chọn hoặc nhập lớp mục tiêu (Ví dụ: 1A, 2B, 3C, toàn trường)"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              >
                <Option value="toàn trường">Toàn trường</Option>
                <Option value="1A">Lớp 1A</Option>
                <Option value="1B">Lớp 1B</Option>
                <Option value="1C">Lớp 1C</Option>
                <Option value="2A">Lớp 2A</Option>
                <Option value="2B">Lớp 2B</Option>
                <Option value="2C">Lớp 2C</Option>
                <Option value="3A">Lớp 3A</Option>
                <Option value="3B">Lớp 3B</Option>
                <Option value="3C">Lớp 3C</Option>
                <Option value="4A">Lớp 4A</Option>
                <Option value="4B">Lớp 4B</Option>
                <Option value="4C">Lớp 4C</Option>
                <Option value="5A">Lớp 5A</Option>
                <Option value="5B">Lớp 5B</Option>
                <Option value="5C">Lớp 5C</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="categories"
              label="Loại khám"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một loại khám' }]}
            >
              <Select 
                mode="multiple"
                placeholder="Chọn các loại khám sức khỏe cho học sinh tiểu học"
              >
                {availableCategories.map(category => (
                  <Option key={category} value={category}>
                    {category === 'VISION' && 'Khám mắt'}
                    {category === 'HEARING' && 'Khám tai'}
                    {category === 'ORAL' && 'Khám răng miệng'}
                    {category === 'SKIN' && 'Khám da liễu'}
                    {category === 'RESPIRATORY' && 'Khám hô hấp'}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Row justify="end" gutter={16}>
            <Col>
              <Button 
                icon={<CloseOutlined />}
                onClick={onCancel}
              >
                Hủy
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
              >
                {isEditing ? 'Cập nhật' : 'Tạo đợt khám'}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default HealthCheckCampaignForm; 