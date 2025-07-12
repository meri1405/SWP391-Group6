import React from 'react';
import { Row, Col, Typography, Divider } from 'antd';

const { Text, Title } = Typography;

const HealthCheckDetailView = () => {
  // Hardcoded demo data
  const studentData = {
    studentName: "Nguyễn Văn An",
    studentClass: "3A",
    studentId: "HS001234",
    examinationDate: "12/07/2025"
  };

  const campaignData = {
    campaignName: "Khám sức khỏe định kỳ năm học 2024-2025",
    startDate: "01/07/2025",
    endDate: "15/07/2025",
    location: "Trường Tiểu học ABC",
    description: "Chương trình khám sức khỏe toàn diện cho học sinh các khối lớp"
  };

  const bodyMetrics = {
    weight: "30.0 kg",
    height: "100.0 cm",
    bmi: "30.0",
    conclusion: "Bình thường"
  };

  const hearingTest = {
    leftEar: "20 dB",
    rightEar: "20 dB", 
    description: "Thính lực bình thường, không có dấu hiệu bất thường",
    doctorName: "Bs. Nguyễn Thị Hương"
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Section 1: Student Information */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
          Thông tin học sinh
        </Title>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Họ tên:</Text>
              <Text>{studentData.studentName}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Lớp:</Text>
              <Text>{studentData.studentClass}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Mã học sinh:</Text>
              <Text>{studentData.studentId}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày khám:</Text>
              <Text>{studentData.examinationDate}</Text>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Section 2: Campaign Information */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
          Thông tin chiến dịch khám
        </Title>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tên chiến dịch:</Text>
              <Text>{campaignData.campaignName}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Địa điểm:</Text>
              <Text>{campaignData.location}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày bắt đầu:</Text>
              <Text>{campaignData.startDate}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày kết thúc:</Text>
              <Text>{campaignData.endDate}</Text>
            </div>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Mô tả:</Text>
              <Text>{campaignData.description}</Text>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Section 3: Body Metrics */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
          Chỉ số cơ thể
        </Title>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Cân nặng:</Text>
              <Text>{bodyMetrics.weight}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Chiều cao:</Text>
              <Text>{bodyMetrics.height}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>BMI:</Text>
              <Text>{bodyMetrics.bmi}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Kết luận:</Text>
              <Text>{bodyMetrics.conclusion}</Text>
            </div>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Section 4: Hearing Test */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
          Kết quả khám Thính lực
        </Title>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tai trái:</Text>
              <Text>{hearingTest.leftEar}</Text>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tai phải:</Text>
              <Text>{hearingTest.rightEar}</Text>
            </div>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Mô tả:</Text>
              <Text>{hearingTest.description}</Text>
            </div>
          </Col>
          <Col span={24}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tên bác sĩ:</Text>
              <Text>{hearingTest.doctorName}</Text>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HealthCheckDetailView;
