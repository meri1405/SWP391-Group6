import {
  Card, Select, Row, Col, Spin, Tabs, Alert
} from 'antd';
import {
  HeartOutlined, UserOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useApprovedHealthProfileRefactored } from '../../../hooks/useApprovedHealthProfileRefactored';
import { getStudentName, getStudentId } from '../../../utils/healthProfileUtils';
import {
  renderBasicInfo,
  renderAllergies,
  renderChronicDiseases,
  renderTreatments,
  renderVisionData,
  renderHearingData
} from './HealthProfileRenderers';
import DetailModal from './DetailModal';
import dayjs from 'dayjs';
import '../../../styles/ApprovedHealthProfile.css';

const { Option } = Select;

const ApprovedHealthProfile = () => {
  const {
    loading, students, selectedStudent, approvedProfiles, selectedProfile,
    profilesLoading, detailModalVisible, viewDetailData, viewDetailType,
    handleStudentSelect, handleProfileSelect, handleViewDetail, handleCloseDetailModal
  } = useApprovedHealthProfileRefactored();

  console.log('Component rendered - selectedProfile:', selectedProfile);
  console.log('approvedProfiles:', approvedProfiles);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ marginBottom: '16px', color: '#1890ff' }}>
            <HeartOutlined style={{ marginRight: '8px' }} />
            Tiền sử sức khỏe
          </h2>
          <Alert
            message="Thông tin sức khỏe đã được xác nhận"
            description="Đây là thông tin sức khỏe của con em bạn đã được nhà trường xác nhận và duyệt. Bạn có thể theo dõi các thông tin này để chăm sóc sức khỏe tốt hơn."
            type="success"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        </div>

        {/* Student Selection */}
        <Card size="small" style={{ marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={8}>
              <label style={{ fontWeight: 600 }}>Chọn học sinh:</label>
            </Col>
            <Col span={16}>
              <Select
                placeholder="Chọn học sinh để xem hồ sơ sức khỏe đã duyệt"
                style={{ width: '100%' }}
                value={getStudentId(selectedStudent)}
                onChange={handleStudentSelect}
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }              >
                {students.map((student, index) => {
                  const studentId = getStudentId(student);
                  const studentName = getStudentName(student);
                  
                  if (!studentId) return null;
                  
                  return (
                    <Option key={studentId || `student-${index}`} value={studentId}>
                      {studentName} - Lớp {student.className || 'N/A'}
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>
        </Card>

        {!selectedStudent && (
          <Card style={{ textAlign: 'center', padding: '48px', marginBottom: '24px' }}>
            <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <h3 style={{ color: '#1890ff', marginBottom: '8px' }}>Chọn học sinh để xem hồ sơ</h3>
            <p style={{ color: '#666', margin: 0 }}>
              Vui lòng chọn học sinh từ danh sách để xem hồ sơ sức khỏe đã được duyệt
            </p>
          </Card>
        )}

        {selectedStudent && profilesLoading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}

        {selectedStudent && !profilesLoading && approvedProfiles.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '48px' }}>
            <InfoCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
            <h3 style={{ color: '#faad14', marginBottom: '8px' }}>Chưa có hồ sơ sức khỏe được duyệt</h3>
            <p style={{ color: '#666', margin: 0 }}>
              Học sinh này chưa có hồ sơ sức khỏe nào được duyệt bởi nhà trường
            </p>
          </Card>
        )}

        {selectedStudent && approvedProfiles.length > 0 && (
          <>
            {/* Profile Selection */}
            {approvedProfiles.length > 1 && (
              <Card size="small" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                  <Col span={8}>
                    <label style={{ fontWeight: 600 }}>Chọn hồ sơ:</label>
                  </Col>
                  <Col span={16}>
                    <Select
                      style={{ width: '100%' }}
                      value={selectedProfile?.id}
                      onChange={handleProfileSelect}
                      placeholder="Chọn hồ sơ để xem"
                    >
                      {approvedProfiles.map(profile => (
                        <Option key={profile.id} value={profile.id}>
                          Hồ sơ ngày {dayjs(profile.updatedAt).format('DD/MM/YYYY')}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Profile Content */}
            {selectedProfile && (
              <Card title={`Hồ sơ sức khỏe của ${getStudentName(selectedStudent)}`}>
                <Tabs 
                  defaultActiveKey="basic" 
                  type="card"
                  items={[
                    {
                      key: 'basic',
                      label: 'Thông tin cơ bản',
                      children: renderBasicInfo(selectedProfile)
                    },
                    {
                      key: 'allergies',
                      label: 'Dị ứng',
                      children: renderAllergies(selectedProfile.allergies, handleViewDetail)
                    },
                    {
                      key: 'chronic',
                      label: 'Bệnh mãn tính',
                      children: renderChronicDiseases(selectedProfile.chronicDiseases, handleViewDetail)
                    },
                    {
                      key: 'treatments',
                      label: 'Lịch sử điều trị',
                      children: renderTreatments(selectedProfile.treatments, handleViewDetail)
                    },
                    {
                      key: 'vision',
                      label: 'Thị lực',
                      children: renderVisionData(selectedProfile.vision)
                    },
                    {
                      key: 'hearing',
                      label: 'Thính lực',
                      children: renderHearingData(selectedProfile.hearing)
                    }
                  ]}
                />
              </Card>
            )}
          </>
        )}

        {/* Detail Modal */}
        <DetailModal
          visible={detailModalVisible}
          onClose={handleCloseDetailModal}
          data={viewDetailData}
          type={viewDetailType}
        />
      </Card>
    </div>
  );
};

export default ApprovedHealthProfile;
