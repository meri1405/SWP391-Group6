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
import { healthCheckApi, HEALTH_CHECK_CATEGORY_LABELS } from '../../../api/healthCheckApi';
import { getAvailableClassNames } from '../../../api/studentApi';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const HealthCheckCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetCount, setTargetCount] = useState(0);
  const [calculatingTargetCount, setCalculatingTargetCount] = useState(false);
  const isEditing = !!campaign;

  useEffect(() => {
    fetchCategories();
    fetchAvailableClasses();
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
      // Set initial target count if editing
      if (campaign.targetCount) {
        setTargetCount(campaign.targetCount);
      }
    }
  }, [campaign, form, isEditing]);

  // Calculate target count when relevant fields change
  const calculateTargetCount = async (minAge, maxAge, targetClasses) => {
    console.log('Frontend calculateTargetCount called with:', {
      minAge,
      maxAge,
      targetClasses,
      targetClassesType: typeof targetClasses,
      targetClassesArray: Array.isArray(targetClasses)
    });
    
    // Only calculate if we have valid age range OR target classes
    if ((minAge && maxAge && minAge <= maxAge) || (targetClasses && targetClasses.length > 0)) {
      setCalculatingTargetCount(true);
      try {
        // If no classes are selected, default to "toàn trường" (whole school)
        const classesToUse = (targetClasses && targetClasses.length > 0) ? targetClasses : ["toàn trường"];
        console.log('Using classes:', classesToUse);
        
        // Pass age range for year-based age calculation (min <= age <= max)
        const result = await healthCheckApi.calculateTargetCount(
          minAge || null, 
          maxAge || null, 
          classesToUse
        );
        console.log('Frontend calculateTargetCount result:', result);
        setTargetCount(result.targetCount || 0);
      } catch (error) {
        console.error('Error calculating target count:', error);
        setTargetCount(0);
      } finally {
        setCalculatingTargetCount(false);
      }
    } else {
      console.log('Skipping target count calculation - no valid criteria provided');
      setTargetCount(0);
    }
  };

  // Watch for changes in form fields that affect target count
  const onValuesChange = (changedValues, allValues) => {
    const { minAge, maxAge, targetClasses } = allValues;
    
    // Trigger validation for age and class fields when they change
    if ('minAge' in changedValues || 'maxAge' in changedValues || 'targetClasses' in changedValues) {
      // Validate the related fields
      setTimeout(() => {
        form.validateFields(['minAge', 'maxAge', 'targetClasses']);
      }, 100);
      
      // Only recalculate if the relevant fields have changed
      // Add a small delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        calculateTargetCount(minAge, maxAge, targetClasses);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

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

  const fetchAvailableClasses = async () => {
    try {
      const classes = await getAvailableClassNames();
      setAvailableClasses(classes);
    } catch (error) {
      console.error('Error fetching available classes:', error);
      message.error('Không thể tải danh sách lớp học. Sử dụng danh sách mặc định.');
      // Fallback to some default classes if API fails
      setAvailableClasses([
        'Mầm non', '1A', '1B', '1C', '2A', '2B', '2C', 
        '3A', '3B', '3C', '4A', '4B', '4C', '5A', '5B', '5C'
      ]);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const [startDate, endDate] = values.dateRange || [];
      
      // If no classes are selected, default to "toàn trường" (whole school)
      const targetClasses = (values.targetClasses && values.targetClasses.length > 0) 
        ? values.targetClasses 
        : ["toàn trường"];
      
      const campaignData = {
        ...values,
        targetClasses,
        startDate: startDate ? startDate.format('YYYY-MM-DD') : null,
        endDate: endDate ? endDate.format('YYYY-MM-DD') : null,
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
        onValuesChange={onValuesChange}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={<span>Tên đợt khám <span style={{color: 'red'}}>*</span></span>}
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
              label={<span>Mô tả <span style={{color: 'red'}}>*</span></span>}
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
              label={<span>Thời gian thực hiện <span style={{color: 'red'}}>*</span></span>}
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian thực hiện' },
                {
                  validator: (_, value) => {
                    if (!value || !Array.isArray(value) || value.length !== 2) {
                      return Promise.resolve();
                    }
                    
                    const [startDate, endDate] = value;
                    const today = dayjs();
                    const minStartDate = today.add(5, 'day');
                    
                    // Kiểm tra ngày bắt đầu phải sau 5 ngày kể từ hôm nay
                    if (startDate && startDate.isBefore(minStartDate, 'day')) {
                      return Promise.reject(new Error('Ngày bắt đầu phải sau ít nhất 5 ngày kể từ hôm nay'));
                    }
                    
                    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
                    if (startDate && endDate && endDate.isBefore(startDate, 'day')) {
                      return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                    }
                    
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <RangePicker 
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                disabledDate={(current) => {
                  // Vô hiệu hóa tất cả ngày trước ngày hôm nay + 5 ngày
                  const minDate = dayjs().add(5, 'day');
                  return current && current.isBefore(minDate, 'day');
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label={<span>Địa điểm <span style={{color: 'red'}}>*</span></span>}
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
              rules={[
                {
                  validator: (_, value, { getFieldValue }) => {
                    const maxAge = getFieldValue('maxAge');
                    const targetClasses = getFieldValue('targetClasses') || [];
                    
                    // Nếu không có targetClasses và không có maxAge, yêu cầu cả hai
                    if ((!targetClasses || targetClasses.length === 0) && !maxAge && !value) {
                      return Promise.reject(new Error('Vui lòng nhập độ tuổi hoặc chọn lớp'));
                    }
                    
                    // Nếu có minAge thì phải có maxAge
                    if (value && !maxAge) {
                      return Promise.reject(new Error('Vui lòng nhập độ tuổi tối đa'));
                    }
                    
                    // Kiểm tra logic min <= max (tính theo năm)
                    if (value && maxAge && value > maxAge) {
                      return Promise.reject(new Error('Độ tuổi tối thiểu phải ≤ độ tuổi tối đa'));
                    }
                    
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                min={2} 
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
              rules={[
                {
                  validator: (_, value, { getFieldValue }) => {
                    const minAge = getFieldValue('minAge');
                    const targetClasses = getFieldValue('targetClasses') || [];
                    
                    // Nếu không có targetClasses và không có minAge, yêu cầu cả hai
                    if ((!targetClasses || targetClasses.length === 0) && !minAge && !value) {
                      return Promise.reject(new Error('Vui lòng nhập độ tuổi hoặc chọn lớp'));
                    }
                    
                    // Nếu có maxAge thì phải có minAge
                    if (value && !minAge) {
                      return Promise.reject(new Error('Vui lòng nhập độ tuổi tối thiểu'));
                    }
                    
                    // Kiểm tra logic min <= max (tính theo năm)
                    if (value && minAge && value < minAge) {
                      return Promise.reject(new Error('Độ tuổi tối đa phải ≥ độ tuổi tối thiểu'));
                    }
                    
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                min={2} 
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
              label="Lớp mục tiêu"
              tooltip="Để trống để áp dụng cho toàn trường"
              rules={[
                {
                  validator: (_, value, { getFieldValue }) => {
                    const minAge = getFieldValue('minAge');
                    const maxAge = getFieldValue('maxAge');
                    
                    // Phải có ít nhất một trong hai: age range hoặc target classes
                    if (!minAge && !maxAge && (!value || value.length === 0)) {
                      return Promise.reject(new Error('Vui lòng chọn lớp mục tiêu hoặc nhập độ tuổi'));
                    }
                    
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Select 
                mode="tags"
                placeholder="Để trống cho toàn trường, hoặc chọn/nhập lớp cụ thể (Ví dụ: 1A, 2B, 3C)"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
              >
                <Option value="toàn trường">Toàn trường</Option>
                {availableClasses.map(className => (
                  <Option key={className} value={className}>
                    {className.startsWith('Lớp ') ? className : `Lớp ${className}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="categories"
              label={<span>Loại khám <span style={{color: 'red'}}>*</span></span>}
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất một loại khám' }]}
            >
              <Select 
                mode="multiple"
                placeholder="Chọn các loại khám sức khỏe cho học sinh tiểu học"
              >
                {availableCategories.map(category => (
                  <Option key={category} value={category}>
                    {HEALTH_CHECK_CATEGORY_LABELS[category] || category}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Target Count Display */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Số lượng học sinh dự kiến">
              <Input
                value={calculatingTargetCount ? 'Đang tính toán...' : `${targetCount} học sinh`}
                readOnly
                style={{ 
                  backgroundColor: '#f5f5f5',
                  color: targetCount > 0 ? '#1890ff' : '#999',
                  fontWeight: 'bold'
                }}
                suffix={calculatingTargetCount && <Spin size="small" />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              marginTop: 8,
              lineHeight: '1.4'
            }}>
              {targetCount > 0 
                ? `Hệ thống tính toán có ${targetCount} học sinh phù hợp với tiêu chí tuổi (${form.getFieldValue('minAge') || 'không giới hạn'} ≤ tuổi ≤ ${form.getFieldValue('maxAge') || 'không giới hạn'}) và lớp đã chọn.`
                : 'Vui lòng nhập độ tuổi (tối thiểu và tối đa) HOẶC chọn lớp mục tiêu để tính toán số lượng học sinh theo năm sinh.'
              }
            </div>
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