import React from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Tabs,
  List,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Space,
  Badge,
  Alert
} from 'antd';
import {
  MedicineBoxOutlined,
  HeartOutlined,
  EyeOutlined,
  AudioOutlined,
  SafetyOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const HealthProfileDetailModal = ({ visible, onClose, healthProfile }) => {
  const { user } = useAuth();  // Get authenticated user
  
  if (!healthProfile) return null;

  const student = healthProfile.student;// Debug log để kiểm tra dữ liệu
  console.log('HealthProfile in modal:', healthProfile);
  console.log('Student in modal:', student);
  console.log('Student keys:', student ? Object.keys(student) : 'no student');
  console.log('HealthProfile keys:', healthProfile ? Object.keys(healthProfile) : 'no healthProfile');
  console.log('Student parents:', student?.parents);
  console.log('Treatments data:', healthProfile?.treatments);
  console.log('Treatments length:', healthProfile?.treatments?.length);
  console.log('TreatmentHistory data:', healthProfile?.treatmentHistory);
  console.log('TreatmentHistory length:', healthProfile?.treatmentHistory?.length);
  
  // Compute student name
  const studentName = student?.firstName && student?.lastName 
    ? `${student.lastName} ${student.firstName}` 
    : student?.fullName || student?.name || healthProfile.studentName || healthProfile.student?.fullName || 'N/A';
  
  console.log('Computed student name:', studentName);
    // Compute parent name from authenticated user (current logged-in parent)
  const parentName = user && user.firstName && user.lastName 
    ? `${user.lastName} ${user.firstName}`.trim()
    : user?.fullName || 'N/A';
  
  console.log('Computed parent name:', parentName);
  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: 'Đang chờ duyệt' },
      APPROVED: { color: 'green', text: 'Đã duyệt' },
      REJECTED: { color: 'red', text: 'Từ chối' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };
  
  const formatDate = (date) => {
    return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật';
  };
  
  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Chi tiết hồ sơ khai báo sức khỏe</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      styles={{
        body: { padding: '20px' }
      }}    >{/* Header with basic info */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <div>
                <UserOutlined style={{ marginRight: 8 }} />
                <Text strong>Họ và tên học sinh: </Text>
                <Text>{studentName}</Text>
              </div>
              <div>
                <Text strong>Lớp: </Text>
                <Text>
                  {student?.className || 
                   student?.class || 
                   student?.grade || 
                   healthProfile.studentClass || 
                   healthProfile.student?.className || 'N/A'}
                </Text>
              </div>
              <div>
                <Text strong>Họ và tên phụ huynh: </Text>
                <Text>{parentName}</Text>
              </div>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <div>
                <CalendarOutlined style={{ marginRight: 8 }} />
                <Text strong>Ngày tạo: </Text>
                <Text>{formatDate(healthProfile.createdAt)}</Text>
              </div>
              <div>
                <Text strong>Trạng thái: </Text>
                {getStatusTag(healthProfile.status)}              </div>
              {healthProfile.status === 'REJECTED' && healthProfile.nurseNote && (
                <div style={{ marginTop: 8 }}>
                  <Alert
                    message="Hồ sơ đã bị từ chối"
                    description={
                      <>
                        <strong>Lý do từ chối: </strong>
                        {healthProfile.nurseNote}
                      </>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                </div>
              )}
              {healthProfile.status === 'APPROVED' && healthProfile.nurseNote && (
                <div style={{ marginTop: 8 }}>
                  <Alert
                    message="Hồ sơ đã được duyệt"
                    description={
                      <>
                        <strong>Ghi chú của Y tá: </strong>
                        {healthProfile.nurseNote}
                      </>
                    }
                    type="success"
                    showIcon
                    style={{ marginBottom: 8 }}
                  />
                </div>
              )}
              {(healthProfile.status === 'APPROVED' || healthProfile.status === 'REJECTED') && healthProfile.schoolNurseFullName && (
                <div>
                  <Text strong>Y tá trường: </Text>
                  <Text>{healthProfile.schoolNurseFullName}</Text>
                </div>
              )}
              {healthProfile.updatedAt && healthProfile.updatedAt !== healthProfile.createdAt && (
                <div>
                  <Text strong>Cập nhật lần cuối: </Text>
                  <Text>{formatDate(healthProfile.updatedAt)}</Text>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </Card>      <Tabs 
        defaultActiveKey="basic" 
        type="card"
        tabPosition="left"
        style={{ height: 'auto', marginTop: 16 }}
        className="health-profile-detail-tabs"
      >
        {/* Basic Information Tab */}
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Thông tin cơ bản
            </span>
          } 
          key="basic"
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Chiều cao (cm)">
              {healthProfile.height || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Cân nặng (kg)">
              {healthProfile.weight || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {healthProfile.note || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
        
        {/* Allergies Tab */}
        <TabPane 
          tab={
            <span>
              <MedicineBoxOutlined />
              Dị ứng ({healthProfile.allergies?.length || 0})
            </span>
          } 
          key="allergies"
        >
          {healthProfile.allergies && healthProfile.allergies.length > 0 ? (
            <List
              dataSource={healthProfile.allergies}
              renderItem={(allergy) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Loại dị ứng: </Text>
                        <Text>{allergy.allergyType}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Ngày phát hiện: </Text>
                        <Text>{formatDate(allergy.onsetDate)}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{allergy.description || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>                        <Text strong>Tình trạng: </Text>
                        {allergy.status === 'MILD' && <Tag color="blue">Nhẹ</Tag>}
                        {allergy.status === 'MODERATE' && <Tag color="orange">Trung bình</Tag>}
                        {allergy.status === 'SEVERE' && <Tag color="red">Nặng</Tag>}
                        {!['MILD', 'MODERATE', 'SEVERE'].includes(allergy.status) && (
                          <Tag color="default">{allergy.status || 'Không xác định'}</Tag>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">
                {healthProfile.allergies === null 
                  ? 'Chưa có thông tin dị ứng được khai báo cho học sinh này'
                  : 'Không có thông tin dị ứng'}
              </Text>
            </div>
          )}
        </TabPane>

        {/* Chronic Diseases Tab */}
        <TabPane 
          tab={
            <span>
              <HeartOutlined />
              Bệnh mãn tính ({healthProfile.chronicDiseases?.length || 0})
            </span>
          } 
          key="chronic"
        >
          {healthProfile.chronicDiseases && healthProfile.chronicDiseases.length > 0 ? (
            <List
              dataSource={healthProfile.chronicDiseases}
              renderItem={(disease) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Tên bệnh: </Text>
                        <Text>{disease.diseaseName}</Text>
                      </Col>
                      
                    </Row>
                    {disease.dateResolved && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={12}>
                          <Text strong>Ngày khỏi bệnh: </Text>
                          <Text>{formatDate(disease.dateResolved)}</Text>
                        </Col>
                        <Col span={12}>
                        <Text strong>Ngày chẩn đoán: </Text>
                        <Text>{formatDate(disease.dateDiagnosed)}</Text>
                      </Col>
                      </Row>
                    )}
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Nơi điều trị: </Text>
                        <Text>{disease.placeOfTreatment || 'Không có thông tin'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{disease.description || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>
                    {(disease.dateOfAdmission || disease.dateOfDischarge) && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={12}>
                          <Text strong>Ngày nhập viện: </Text>
                          <Text>{formatDate(disease.dateOfAdmission)}</Text>
                        </Col>
                        <Col span={12}>
                          <Text strong>Ngày xuất viện: </Text>
                          <Text>{formatDate(disease.dateOfDischarge)}</Text>
                        </Col>
                      </Row>                    )}
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Tình trạng: </Text>
                        {disease.status === 'UNDER_TREATMENT' && <Tag color="blue">Đang điều trị</Tag>}
                        {disease.status === 'RECOVERED' && <Tag color="green">Đã khỏi</Tag>}
                        {disease.status === 'STABLE' && <Tag color="cyan">Ổn định</Tag>}
                        {disease.status === 'WORSENED' && <Tag color="red">Xấu đi</Tag>}
                        {disease.status === 'RELAPSED' && <Tag color="orange">Tái phát</Tag>}
                        {disease.status === 'NEWLY_DIAGNOSED' && <Tag color="purple">Mới chẩn đoán</Tag>}
                        {disease.status === 'UNDER_OBSERVATION' && <Tag color="geekblue">Đang theo dõi</Tag>}
                        {disease.status === 'UNTREATED' && <Tag color="magenta">Chưa điều trị</Tag>}
                        {disease.status === 'UNKNOWN' && <Tag color="default">Không xác định</Tag>}
                        {!['UNDER_TREATMENT', 'RECOVERED', 'STABLE', 'WORSENED', 'RELAPSED', 
                          'NEWLY_DIAGNOSED', 'UNDER_OBSERVATION', 'UNKNOWN', 'UNTREATED'].includes(disease.status) && (
                          <Tag color="default">{disease.status || 'Không xác định'}</Tag>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">
                {healthProfile.chronicDiseases === null 
                  ? 'Chưa có thông tin bệnh mãn tính được khai báo cho học sinh này'
                  : 'Không có thông tin bệnh mãn tính'}
              </Text>
            </div>
          )}
        </TabPane>

        {/* Infectious Diseases Tab */}
        <TabPane 
          tab={
            <span>
              <SafetyOutlined />
              Bệnh truyền nhiễm ({healthProfile.infectiousDiseases?.length || 0})
            </span>
          } 
          key="infectious"
        >
          {healthProfile.infectiousDiseases && healthProfile.infectiousDiseases.length > 0 ? (
            <List
              dataSource={healthProfile.infectiousDiseases}
              renderItem={(disease) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Tên bệnh: </Text>
                        <Text>{disease.diseaseName}</Text>
                      </Col>
                      
                    </Row>
                    {disease.dateOfDischarge && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={12}>
                        <Text strong>Ngày mắc bệnh: </Text>
                        <Text>{formatDate(disease.dateOfAdmission)}</Text>
                      </Col>
                        <Col span={12}>
                          <Text strong>Ngày khỏi bệnh: </Text>
                          <Text>{formatDate(disease.dateOfDischarge)}</Text>
                        </Col>
                      </Row>
                    )}
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Nơi điều trị: </Text>
                        <Text>{disease.placeOfTreatment || 'Không có thông tin'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{disease.description || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Tình trạng: </Text>
                        {disease.status === 'ISOLATED' && <Tag color="volcano">Đang cách ly</Tag>}
                        {disease.status === 'UNDER_TREATMENT' && <Tag color="blue">Đang điều trị</Tag>}
                        {disease.status === 'RECOVERED' && <Tag color="green">Đã khỏi</Tag>}
                        {disease.status === 'STABLE' && <Tag color="cyan">Ổn định</Tag>}
                        {disease.status === 'WORSENED' && <Tag color="red">Xấu đi</Tag>}
                        {disease.status === 'RELAPSED' && <Tag color="orange">Tái phát</Tag>}
                        {disease.status === 'NEWLY_DIAGNOSED' && <Tag color="purple">Mới chẩn đoán</Tag>}
                        {disease.status === 'UNDER_OBSERVATION' && <Tag color="geekblue">Đang theo dõi</Tag>}
                        {disease.status === 'UNTREATED' && <Tag color="magenta">Chưa điều trị</Tag>}
                        {disease.status === 'UNKNOWN' && <Tag color="default">Không xác định</Tag>}
                        {!['UNDER_TREATMENT', 'RECOVERED', 'STABLE', 'WORSENED', 'RELAPSED', 
                          'NEWLY_DIAGNOSED', 'UNDER_OBSERVATION', 'UNKNOWN', 'ISOLATED', 'UNTREATED'].includes(disease.status) && (
                          <Tag color="default">{disease.status || 'Không xác định'}</Tag>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">
                {healthProfile.infectiousDiseases === null 
                  ? 'Chưa có thông tin bệnh truyền nhiễm được khai báo cho học sinh này'
                  : 'Không có thông tin bệnh truyền nhiễm'}
              </Text>
            </div>
          )}
        </TabPane>        {/* Treatment History Tab */}
        <TabPane 
          tab={
            <span>
              <MedicineBoxOutlined />
              Lịch sử điều trị ({(healthProfile.treatments || healthProfile.treatmentHistory)?.length || 0})
            </span>
          } 
          key="treatment"
        >
          {(healthProfile.treatments || healthProfile.treatmentHistory) && (healthProfile.treatments || healthProfile.treatmentHistory).length > 0 ? (
            <List
              dataSource={healthProfile.treatments || healthProfile.treatmentHistory}
              renderItem={(treatment) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Phương pháp điều trị: </Text>
                        <Text>{treatment.treatmentType}</Text>
                      </Col>
                      
                    </Row>
                    {treatment.dateOfDischarge && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={12}>
                        <Text strong>Ngày nhập viện: </Text>
                        <Text>{formatDate(treatment.dateOfAdmission)}</Text>
                      </Col>
                        <Col span={12}>
                          <Text strong>Ngày xuất viện: </Text>
                          <Text>{formatDate(treatment.dateOfDischarge)}</Text>
                        </Col>
                      </Row>
                    )}                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Nơi điều trị: </Text>
                        <Text>{treatment.placeOfTreatment || 'Không có thông tin'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{treatment.description || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>
                    {treatment.status && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={24}>
                          <Text strong>Tình trạng: </Text>
                          {treatment.status === 'UNDER_TREATMENT' && <Tag color="blue">Đang điều trị</Tag>}
                          {treatment.status === 'RECOVERED' && <Tag color="green">Đã khỏi</Tag>}
                          {treatment.status === 'STABLE' && <Tag color="cyan">Ổn định</Tag>}
                          {treatment.status === 'WORSENED' && <Tag color="red">Xấu đi</Tag>}
                          {treatment.status === 'RELAPSED' && <Tag color="orange">Tái phát</Tag>}
                          {treatment.status === 'NEWLY_DIAGNOSED' && <Tag color="purple">Mới chẩn đoán</Tag>}
                          {treatment.status === 'UNDER_OBSERVATION' && <Tag color="geekblue">Đang theo dõi</Tag>}
                          {treatment.status === 'UNTREATED' && <Tag color="magenta">Chưa điều trị</Tag>}
                          {treatment.status === 'UNKNOWN' && <Tag color="default">Không xác định</Tag>}
                          {!['UNDER_TREATMENT', 'RECOVERED', 'STABLE', 'WORSENED', 'RELAPSED', 
                            'NEWLY_DIAGNOSED', 'UNDER_OBSERVATION', 'UNKNOWN', 'UNTREATED'].includes(treatment.status) && (
                            <Tag color="default">{treatment.status || 'Không xác định'}</Tag>
                          )}
                        </Col>
                      </Row>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Không có lịch sử điều trị</Text>
            </div>
          )}
        </TabPane>

        {/* Vision Tab */}
        <TabPane 
          tab={
            <span>
              <EyeOutlined />
              Thị lực ({healthProfile.vision?.length || 0})
            </span>
          } 
          key="vision"
        >
          {healthProfile.vision && healthProfile.vision.length > 0 ? (
            <List
              dataSource={healthProfile.vision}
              renderItem={(vision) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Mắt trái: </Text>
                        <Text>{vision.visionLeft || 'N/A'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Mắt phải: </Text>
                        <Text>{vision.visionRight || 'N/A'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }} gutter={16}>
                      <Col span={12}>
                        <Text strong>Mắt trái (có kính): </Text>
                        <Text>{vision.visionLeftWithGlass || 'N/A'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Mắt phải (có kính): </Text>
                        <Text>{vision.visionRightWithGlass || 'N/A'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text strong>Ngày kiểm tra: </Text>
                        <Text>{formatDate(vision.dateOfExamination)}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{vision.visionDescription || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Không có thông tin thị lực</Text>
            </div>
          )}
        </TabPane>

        {/* Hearing Tab */}
        <TabPane 
          tab={
            <span>
              <AudioOutlined />
              Thính lực ({healthProfile.hearing?.length || 0})
            </span>
          } 
          key="hearing"
        >
          {healthProfile.hearing && healthProfile.hearing.length > 0 ? (
            <List
              dataSource={healthProfile.hearing}
              renderItem={(hearing) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Tai trái: </Text>
                        <Text>{hearing.leftEar || 'N/A'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Tai phải: </Text>
                        <Text>{hearing.rightEar || 'N/A'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text strong>Ngày kiểm tra: </Text>
                        <Text>{formatDate(hearing.dateOfExamination)}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }}>
                      <Col span={24}>
                        <Text strong>Mô tả: </Text>
                        <Text>{hearing.description || 'Không có mô tả'}</Text>
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Không có thông tin thính lực</Text>
            </div>
          )}
        </TabPane>

        {/* Vaccination History Tab */}
        <TabPane 
          tab={
            <span>
              <SafetyOutlined />
              Lịch sử tiêm chủng ({healthProfile.vaccinationHistory?.length || 0})
            </span>
          } 
          key="vaccination"
        >
          {healthProfile.vaccinationHistory && healthProfile.vaccinationHistory.length > 0 ? (
            <List
              dataSource={healthProfile.vaccinationHistory}
              renderItem={(vaccination) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Tên vaccine: </Text>
                        <Text>{vaccination.vaccineName}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Liều số: </Text>
                        <Text>{vaccination.doseNumber || 'N/A'}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }} gutter={16}>
                      <Col span={12}>
                        <Text strong>Nhà sản xuất: </Text>
                        <Text>{vaccination.manufacturer || 'Không có thông tin'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Ngày tiêm: </Text>
                        <Text>{formatDate(vaccination.dateOfVaccination)}</Text>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: 8 }} gutter={16}>
                      <Col span={12}>
                        <Text strong>Nơi tiêm: </Text>
                        <Text>{vaccination.placeOfVaccination || 'Không có thông tin'}</Text>
                      </Col>
                      <Col span={12}>
                        <Text strong>Người tiêm: </Text>
                        <Text>{vaccination.administeredBy || 'Không có thông tin'}</Text>
                      </Col>
                    </Row>                    <Row style={{ marginTop: 8 }}>
                      <Col span={12}>
                        <Text strong>Trạng thái: </Text>
                        <Tag color={vaccination.status === true ? 'green' : 'red'}>
                          {vaccination.status === true ? 'Đã tiêm' : 'Chưa tiêm'}
                        </Tag>
                      </Col>
                    </Row>
                    {vaccination.notes && (
                      <Row style={{ marginTop: 8 }}>
                        <Col span={24}>
                          <Text strong>Ghi chú: </Text>
                          <Text>{vaccination.notes}</Text>
                        </Col>
                      </Row>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Không có lịch sử tiêm chủng</Text>
            </div>
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default HealthProfileDetailModal;
