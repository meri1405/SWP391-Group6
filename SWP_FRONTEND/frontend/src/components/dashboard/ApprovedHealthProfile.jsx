import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  Row,
  Col,
  Spin,
  message,
  Tag,
  Tabs,
  List,
  Descriptions,
  Empty,
  Alert,
  Space,
  Button,
  Modal
} from 'antd';
import {
  HeartOutlined,
  MedicineBoxOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { parentApi } from '../../api/parentApi';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import '../../styles/ApprovedHealthProfile.css';

const { Option } = Select;
const { TabPane } = Tabs;

const ApprovedHealthProfile = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [approvedProfiles, setApprovedProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewDetailData, setViewDetailData] = useState(null);
  const [viewDetailType, setViewDetailType] = useState(null);
  // Fetch students on component mount
  useEffect(() => {
    const fetchStudentsData = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await parentApi.getMyStudents(token);
        
        if (response && Array.isArray(response)) {
          setStudents(response);
        } else {
          console.warn('Unexpected response format for students:', response);
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        message.error('Không thể tải danh sách học sinh');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, [getToken]);

  const fetchApprovedHealthProfiles = async (studentId) => {
    setProfilesLoading(true);
    try {
      const token = getToken();
      const response = await parentApi.getHealthProfilesByStudentId(studentId, token);
      
      // Filter only APPROVED profiles
      const approvedOnly = (response || []).filter(profile => profile.status === 'APPROVED');
      setApprovedProfiles(approvedOnly);
      
      // Auto-select the most recent approved profile if available
      if (approvedOnly.length > 0) {
        const mostRecent = approvedOnly.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        setSelectedProfile(mostRecent);
      } else {
        setSelectedProfile(null);
      }
    } catch (error) {
      console.error('Error fetching approved health profiles:', error);
      message.error('Không thể tải hồ sơ sức khỏe đã duyệt');
      setApprovedProfiles([]);
      setSelectedProfile(null);
    } finally {
      setProfilesLoading(false);
    }
  };

  const handleStudentSelect = (studentId) => {
    const student = students.find(s => s.id === studentId || s.studentID === studentId);
    if (student) {
      setSelectedStudent(student);
      fetchApprovedHealthProfiles(studentId);
    }
  };

  const handleProfileSelect = (profileId) => {
    const profile = approvedProfiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
  };

  const handleViewDetail = (item, type) => {
    setViewDetailData(item);
    setViewDetailType(type);
    setDetailModalVisible(true);
  };

  const renderBasicInfo = (profile) => (
    <Card title="Thông tin cơ bản" className="approved-health-card">
      <Descriptions column={2} bordered>
        <Descriptions.Item label="Cân nặng" span={1}>
          {profile.weight} kg
        </Descriptions.Item>
        <Descriptions.Item label="Chiều cao" span={1}>
          {profile.height} cm
        </Descriptions.Item>
        <Descriptions.Item label="BMI" span={1}>
          {((profile.weight / ((profile.height/100) ** 2)).toFixed(1))}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày cập nhật" span={1}>
          {dayjs(profile.updatedAt).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={2}>
          <Tag color="green">Đã duyệt</Tag>
        </Descriptions.Item>
        {profile.note && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {profile.note}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );

  const renderAllergies = (allergies) => (
    <Card title="Dị ứng" className="approved-health-card">
      {allergies && allergies.length > 0 ? (
        <List
          dataSource={allergies}
          renderItem={(allergy) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(allergy, 'allergy')}
                >
                  Xem chi tiết
                </Button>
              ]}
            >
              <List.Item.Meta
                title={allergy.allergen}
                description={
                  <div>
                    <p>{allergy.description}</p>
                    <Tag color={
                      allergy.status === 'MILD' ? 'green' : 
                      allergy.status === 'MODERATE' ? 'orange' : 
                      allergy.status === 'SEVERE' ? 'red' : 'blue'
                    }>
                      {allergy.status === 'MILD' ? 'Nhẹ' : 
                       allergy.status === 'MODERATE' ? 'Trung bình' : 
                       allergy.status === 'SEVERE' ? 'Nặng' : 'Không xác định'}
                    </Tag>
                    {allergy.onsetDate && (
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        Khởi phát: {dayjs(allergy.onsetDate).format('DD/MM/YYYY')}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có thông tin dị ứng' }}
        />
      ) : (
        <Empty description="Không có thông tin dị ứng" />
      )}
    </Card>
  );

  const renderChronicDiseases = (diseases) => (
    <Card title="Bệnh mãn tính" className="approved-health-card">
      {diseases && diseases.length > 0 ? (
        <List
          dataSource={diseases}
          renderItem={(disease) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(disease, 'chronicDisease')}
                >
                  Xem chi tiết
                </Button>
              ]}
            >
              <List.Item.Meta
                title={disease.diseaseName}
                description={
                  <div>
                    <p>{disease.description}</p>
                    <Tag color={
                      disease.status === 'RECOVERED' ? 'green' : 
                      disease.status === 'UNDER_TREATMENT' ? 'orange' :
                      disease.status === 'STABLE' ? 'blue' : 'default'
                    }>
                      {disease.status === 'UNDER_TREATMENT' ? 'Đang điều trị' : 
                       disease.status === 'RECOVERED' ? 'Đã khỏi' :
                       disease.status === 'STABLE' ? 'Ổn định' : 'Không xác định'}
                    </Tag>
                    {disease.dateDiagnosed && (
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        Chẩn đoán: {dayjs(disease.dateDiagnosed).format('DD/MM/YYYY')}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có thông tin bệnh mãn tính' }}
        />
      ) : (
        <Empty description="Không có thông tin bệnh mãn tính" />
      )}
    </Card>
  );

  const renderTreatments = (treatments) => (
    <Card title="Lịch sử điều trị" className="approved-health-card">
      {treatments && treatments.length > 0 ? (
        <List
          dataSource={treatments}
          renderItem={(treatment) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(treatment, 'treatment')}
                >
                  Xem chi tiết
                </Button>
              ]}
            >
              <List.Item.Meta
                title={treatment.treatmentType}
                description={
                  <div>
                    <p>{treatment.description}</p>
                    <p><strong>Bác sĩ:</strong> {treatment.doctorName}</p>
                    {treatment.dateOfAdmission && (
                      <p>Nhập viện: {dayjs(treatment.dateOfAdmission).format('DD/MM/YYYY')}</p>
                    )}
                    {treatment.placeOfTreatment && (
                      <p>Nơi điều trị: {treatment.placeOfTreatment}</p>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có lịch sử điều trị' }}
        />
      ) : (
        <Empty description="Không có lịch sử điều trị" />
      )}
    </Card>
  );

  const renderVisionData = (vision) => (
    <Card title="Thị lực" className="approved-health-card">
      {vision && vision.length > 0 ? (
        <List
          dataSource={vision}
          renderItem={(visionItem) => (
            <List.Item>
              <List.Item.Meta
                title={`Khám ngày ${dayjs(visionItem.dateOfExamination).format('DD/MM/YYYY')}`}
                description={
                  <div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <p><strong>Mắt trái:</strong> {visionItem.visionLeft}</p>
                        <p><strong>Mắt trái (có kính):</strong> {visionItem.visionLeftWithGlass || 'N/A'}</p>
                      </Col>
                      <Col span={12}>
                        <p><strong>Mắt phải:</strong> {visionItem.visionRight}</p>
                        <p><strong>Mắt phải (có kính):</strong> {visionItem.visionRightWithGlass || 'N/A'}</p>
                      </Col>
                    </Row>
                    {visionItem.visionDescription && (
                      <p><strong>Mô tả:</strong> {visionItem.visionDescription}</p>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có dữ liệu thị lực' }}
        />
      ) : (
        <Empty description="Không có dữ liệu thị lực" />
      )}
    </Card>
  );

  const renderHearingData = (hearing) => (
    <Card title="Thính lực" className="approved-health-card">
      {hearing && hearing.length > 0 ? (
        <List
          dataSource={hearing}
          renderItem={(hearingItem) => (
            <List.Item>
              <List.Item.Meta
                title={`Khám ngày ${dayjs(hearingItem.dateOfExamination).format('DD/MM/YYYY')}`}
                description={
                  <div>
                    <Row gutter={16}>
                      <Col span={12}>
                        <p><strong>Tai trái:</strong> {hearingItem.leftEar}</p>
                      </Col>
                      <Col span={12}>
                        <p><strong>Tai phải:</strong> {hearingItem.rightEar}</p>
                      </Col>
                    </Row>
                    {hearingItem.description && (
                      <p><strong>Mô tả:</strong> {hearingItem.description}</p>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: 'Không có dữ liệu thính lực' }}
        />
      ) : (
        <Empty description="Không có dữ liệu thính lực" />
      )}
    </Card>
  );

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
                value={selectedStudent?.id || selectedStudent?.studentID}
                onChange={handleStudentSelect}
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {students.map((student, index) => {
                  const studentId = student.id || student.studentID;
                  const studentName = student.firstName && student.lastName 
                    ? `${student.lastName} ${student.firstName}` 
                    : student.name || 'Tên không có';
                  
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
              <Card title={`Hồ sơ sức khỏe của ${
                selectedStudent.firstName && selectedStudent.lastName 
                  ? `${selectedStudent.lastName} ${selectedStudent.firstName}` 
                  : selectedStudent.name || 'Học sinh'
              }`}>
                <Tabs defaultActiveKey="basic" type="card">
                  <TabPane tab="Thông tin cơ bản" key="basic">
                    {renderBasicInfo(selectedProfile)}
                  </TabPane>
                  <TabPane tab="Dị ứng" key="allergies">
                    {renderAllergies(selectedProfile.allergies)}
                  </TabPane>
                  <TabPane tab="Bệnh mãn tính" key="chronic">
                    {renderChronicDiseases(selectedProfile.chronicDiseases)}
                  </TabPane>
                  <TabPane tab="Lịch sử điều trị" key="treatments">
                    {renderTreatments(selectedProfile.treatments)}
                  </TabPane>
                  <TabPane tab="Thị lực" key="vision">
                    {renderVisionData(selectedProfile.vision)}
                  </TabPane>
                  <TabPane tab="Thính lực" key="hearing">
                    {renderHearingData(selectedProfile.hearing)}
                  </TabPane>
                </Tabs>
              </Card>
            )}
          </>
        )}

        {/* Detail Modal */}
        <Modal
          title="Chi tiết thông tin"
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={600}
        >
          {viewDetailData && viewDetailType === 'allergy' && (
            <div>
              <p><strong>Chất gây dị ứng:</strong> {viewDetailData.allergen}</p>
              <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
              <p><strong>Mức độ nghiêm trọng:</strong>
                <Tag color={
                  viewDetailData.status === 'MILD' ? 'green' : 
                  viewDetailData.status === 'MODERATE' ? 'orange' : 
                  viewDetailData.status === 'SEVERE' ? 'red' : 'blue'
                }>
                  {viewDetailData.status === 'MILD' ? 'Nhẹ' : 
                   viewDetailData.status === 'MODERATE' ? 'Trung bình' : 
                   viewDetailData.status === 'SEVERE' ? 'Nặng' : 'Không xác định'}
                </Tag>
              </p>
              {viewDetailData.onsetDate && (
                <p><strong>Ngày khởi phát:</strong> {dayjs(viewDetailData.onsetDate).format('DD/MM/YYYY')}</p>
              )}
            </div>
          )}

          {viewDetailData && viewDetailType === 'chronicDisease' && (
            <div>
              <p><strong>Tên bệnh:</strong> {viewDetailData.diseaseName}</p>
              <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
              <p><strong>Trạng thái:</strong>
                <Tag 
                    color={
                        viewDetailData.status === 'RECOVERED' ? 'green' : 
                        viewDetailData.status === 'UNDER_TREATMENT' ? 'orange' :
                        viewDetailData.status === 'STABLE' ? 'blue' :
                        viewDetailData.status === 'WORSENED' ? 'red' :
                        viewDetailData.status === 'RELAPSED' ? 'volcano' :
                        viewDetailData.status === 'NEWLY_DIAGNOSED' ? 'purple' :
                        viewDetailData.status === 'UNDER_OBSERVATION' ? 'cyan' :
                        viewDetailData.status === 'ISOLATED' ? 'magenta' :
                        viewDetailData.status === 'UNTREATED' ? 'gold' : 'default'
                    }>
                    {
                        viewDetailData.status === 'UNDER_TREATMENT' ? 'Đang điều trị' : 
                        viewDetailData.status === 'RECOVERED' ? 'Đã khỏi' :
                        viewDetailData.status === 'STABLE' ? 'Ổn định' :
                        viewDetailData.status === 'WORSENED' ? 'Đang xấu đi' :
                        viewDetailData.status === 'RELAPSED' ? 'Tái phát' :
                        viewDetailData.status === 'NEWLY_DIAGNOSED' ? 'Mới chẩn đoán' :
                        viewDetailData.status === 'UNDER_OBSERVATION' ? 'Đang theo dõi' :
                        viewDetailData.status === 'UNKNOWN' ? 'Không rõ' :
                        viewDetailData.status === 'ISOLATED' ? 'Cách ly' :
                        viewDetailData.status === 'UNTREATED' ? 'Chưa điều trị' : 'Không xác định'}
                </Tag>
              </p>
              {viewDetailData.dateDiagnosed && (
                <p><strong>Ngày chẩn đoán:</strong> {dayjs(viewDetailData.dateDiagnosed).format('DD/MM/YYYY')}</p>
              )}
              {viewDetailData.placeOfTreatment && (
                <p><strong>Nơi điều trị:</strong> {viewDetailData.placeOfTreatment}</p>
              )}
            </div>
          )}

          {viewDetailData && viewDetailType === 'treatment' && (
            <div>
              <p><strong>Loại điều trị:</strong> {viewDetailData.treatmentType}</p>
              <p><strong>Mô tả:</strong> {viewDetailData.description}</p>
              <p><strong>Bác sĩ điều trị:</strong> {viewDetailData.doctorName}</p>
              {viewDetailData.dateOfAdmission && (
                <p><strong>Ngày nhập viện:</strong> {dayjs(viewDetailData.dateOfAdmission).format('DD/MM/YYYY')}</p>
              )}
              {viewDetailData.dateOfDischarge && (
                <p><strong>Ngày xuất viện:</strong> {dayjs(viewDetailData.dateOfDischarge).format('DD/MM/YYYY')}</p>
              )}
              {viewDetailData.placeOfTreatment && (
                <p><strong>Nơi điều trị:</strong> {viewDetailData.placeOfTreatment}</p>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ApprovedHealthProfile;
