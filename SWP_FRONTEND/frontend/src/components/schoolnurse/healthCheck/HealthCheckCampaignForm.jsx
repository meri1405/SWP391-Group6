import React from 'react';
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
  Spin,
  Typography
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { HEALTH_CHECK_CATEGORY_LABELS } from '../../../api/healthCheckApi';
import { useHealthCheckCampaignForm } from '../../../hooks/useHealthCheckCampaignForm';
import { useHealthCheckCampaignValidation } from '../../../hooks/useHealthCheckCampaignValidation';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const HealthCheckCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  // Use custom hooks for form logic and validation
  const {
    form,
    availableCategories,
    availableClasses,
    loading,
    submitting,
    targetCount,
    calculatingTargetCount,
    isEditing,
    handleValuesChange,
    handleSubmit,
    getTargetCountInfo
  } = useHealthCheckCampaignForm(campaign, onSuccess);

  const {
    validateMinAge,
    validateMaxAge,
    validateTargetClasses,
    disabledDate,
    requiredRules
  } = useHealthCheckCampaignValidation();

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
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label={<span>Tên đợt khám <span style={{color: 'red'}}>*</span></span>}
              rules={requiredRules.name}
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
              rules={requiredRules.description}
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
              rules={requiredRules.dateRange}
            >
              <RangePicker 
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                disabledDate={disabledDate}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label={<span>Địa điểm <span style={{color: 'red'}}>*</span></span>}
              rules={requiredRules.location}
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
              validateTrigger="onSubmit"
              rules={[validateMinAge(form)]}
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
              validateTrigger="onSubmit"
              rules={[validateMaxAge(form)]}
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
              validateTrigger="onSubmit"
              rules={[validateTargetClasses(form)]}
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
              rules={requiredRules.categories}
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
              {getTargetCountInfo()}
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