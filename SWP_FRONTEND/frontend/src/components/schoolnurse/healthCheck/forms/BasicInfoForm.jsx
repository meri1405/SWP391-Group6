import React from "react";
import {
  Card,
  Input,
  InputNumber,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  ExperimentOutlined,
  ColumnHeightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const BasicInfoForm = ({ categoryData, onDataChange, onOverallChange, formData, readOnly = false }) => {
  // Calculate BMI whenever height or weight changes
  const calculateBMI = (height, weight) => {
    if (height && weight && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return Math.round(bmi * 10) / 10; // Round to 1 decimal place
    }
    return null;
  };

  // Handle input changes
  const handleChange = (field, value) => {
    console.log('BasicInfoForm handleChange:', field, value);
    
    // Use onOverallChange for basic measurements instead of category data
    if (onOverallChange) {
      onOverallChange(field, value);
      
      // Auto-calculate BMI when height or weight changes
      if (field === 'height' || field === 'weight') {
        // Get current values from formData first, then categoryData as fallback
        const currentHeight = field === 'height' ? value : (formData?.height || categoryData?.height);
        const currentWeight = field === 'weight' ? value : (formData?.weight || categoryData?.weight);
        const bmi = calculateBMI(currentHeight, currentWeight);
        if (bmi) {
          // Also update BMI
          setTimeout(() => onOverallChange('bmi', bmi), 0);
        }
      }
    } else {
      // Fallback to category data handling
      const currentData = categoryData || {};
      const newData = { ...currentData, [field]: value };
      
      // Auto-calculate BMI when height or weight changes
      if (field === 'height' || field === 'weight') {
        const height = field === 'height' ? value : currentData.height;
        const weight = field === 'weight' ? value : currentData.weight;
        const bmi = calculateBMI(height, weight);
        if (bmi) {
          newData.bmi = bmi;
        }
      }
      
      console.log('BasicInfoForm sending newData:', newData);
      onDataChange('BASIC_INFO', newData);
    }
  };

  // BMI classification
  const getBMIClassification = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { text: "Thiếu cân", color: "#faad14" };
    if (bmi < 25) return { text: "Bình thường", color: "#52c41a" };
    if (bmi < 30) return { text: "Thừa cân", color: "#fa8c16" };
    return { text: "Béo phì", color: "#f5222d" };
  };

  const bmiClassification = getBMIClassification(formData?.bmi || categoryData?.bmi);

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <Title level={4} className="text-blue-600 mb-4">
          <UserOutlined className="mr-2" />
          Thông tin cơ bản
        </Title>
      </div>

      <Row gutter={24}>
        {/* Height */}
        <Col span={8}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              <ColumnHeightOutlined className="mr-2 text-blue-500" />
              Chiều cao (cm) *
            </label>
            <InputNumber
              placeholder="Ví dụ: 150"
              style={{ width: "100%" }}
              min={50}
              max={250}
              value={formData?.height || categoryData?.height}
              onChange={(value) => handleChange('height', value)}
              disabled={readOnly}
              suffix="cm"
            />
          </div>
        </Col>

        {/* Weight */}
        <Col span={8}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              <ExperimentOutlined className="mr-2 text-green-500" />
              Cân nặng (kg) *
            </label>
            <InputNumber
              placeholder="Ví dụ: 45"
              style={{ width: "100%" }}
              min={10}
              max={200}
              step={0.1}
              value={formData?.weight || categoryData?.weight}
              onChange={(value) => handleChange('weight', value)}
              disabled={readOnly}
              suffix="kg"
            />
          </div>
        </Col>

        {/* BMI */}
        <Col span={8}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              BMI (tự động tính)
            </label>
            <div className="flex items-center space-x-2">
              <Input
                value={formData?.bmi || categoryData?.bmi || ''}
                disabled
                placeholder="Tự động tính"
                style={{ 
                  backgroundColor: '#f5f5f5',
                  fontWeight: 'bold'
                }}
              />
              {bmiClassification && (
                <Text 
                  strong 
                  style={{ color: bmiClassification.color }}
                >
                  {bmiClassification.text}
                </Text>
              )}
            </div>
            {(formData?.bmi || categoryData?.bmi) && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                BMI = Cân nặng(kg) / [Chiều cao(m)]²
              </Text>
            )}
          </div>
        </Col>
      </Row>

      <Divider />

      {/* Notes */}
      <Row>
        <Col span={24}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">
              Ghi chú & Khuyến nghị
            </label>
            <Input.TextArea
              placeholder="Mô tả tình trạng thể lực của học sinh..."
              rows={3}
              value={categoryData?.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={readOnly}
              maxLength={500}
              showCount
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default BasicInfoForm;
