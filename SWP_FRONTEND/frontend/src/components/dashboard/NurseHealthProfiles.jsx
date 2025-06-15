import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Tabs,
  List,
  Descriptions,
  message,
  Row,
  Col,
  Alert,
  Tooltip,
  Typography,
  Divider,
  Empty,
  Badge,
  Collapse
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  AudioOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import { nurseApi } from '../../api/nurseApi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime
dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const NurseHealthProfiles = () => {
  const [healthProfiles, setHealthProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [form] = Form.useForm();
  const [approveForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeTabKey, setActiveTabKey] = useState('pending');

  // Load health profiles
  const loadHealthProfiles = async () => {
    try {
      setLoading(true);
      console.log('Loading health profiles with status:', statusFilter);
      
      // Check if user is logged in
      const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token found');
        message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      return;
    }
    
      const response = await nurseApi.getHealthProfiles(statusFilter);
      console.log('Loaded profiles response:', response);
      
      if (response.success) {
        // Ensure profiles data is always an array
        const profiles = response.data;
        if (Array.isArray(profiles)) {
          setHealthProfiles(profiles);
        } else if (profiles && typeof profiles === 'object') {
          // Handle case where API returns an object with data property
          setHealthProfiles(Array.isArray(profiles.data) ? profiles.data : []);
      } else {
      setHealthProfiles([]);
        }
        
        // Check for pending profiles count if we're not already on pending tab
        if (statusFilter !== 'PENDING') {
          try {
            const pendingResponse = await nurseApi.getHealthProfiles('PENDING');
            if (pendingResponse.success) {
              const pendingProfiles = pendingResponse.data;
              setPendingCount(Array.isArray(pendingProfiles) ? pendingProfiles.length : 
                            (pendingProfiles && Array.isArray(pendingProfiles.data)) ? 
                            pendingProfiles.data.length : 0);
            } else {
              setPendingCount(0);
            }
          } catch (pendingError) {
            console.error('Error fetching pending count:', pendingError);
            setPendingCount(0);
          }
        } else {
          // If we're on the pending tab, use the current profiles count
          const profilesArray = Array.isArray(profiles) ? profiles : 
                             (profiles && Array.isArray(profiles.data)) ? profiles.data : [];
          setPendingCount(profilesArray.length);
        }
        
        // Show success message if not using mock data
        if (!response.message || !response.message.includes('mẫu')) {
          message.success('Đã tải danh sách hồ sơ sức khỏe thành công');
        }
      } else {
        console.error('Failed to load profiles:', response.message);
        message.error(response.message || 'Không thể tải danh sách hồ sơ sức khỏe.');
        setHealthProfiles([]);
          }
        } catch (error) {
      console.error('Unexpected error loading health profiles:', error);
      message.error('Không thể tải danh sách hồ sơ sức khỏe. Vui lòng thử lại sau.');
      setHealthProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
          loadHealthProfiles();
  }, [statusFilter]);

  const handleTabChange = (key) => {
    setActiveTabKey(key);
    
    switch(key) {
      case 'pending':
        setStatusFilter('PENDING');
        break;
      case 'approved':
        setStatusFilter('APPROVED');
        break;
      case 'rejected':
        setStatusFilter('REJECTED');
        break;
      default:
        setStatusFilter(null);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_, record) => {
        const student = record.additionalFields?.student;
        return (
        <div>
          <div style={{ fontWeight: 500 }}>
              {student?.lastName} {student?.firstName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
              Lớp: {student?.className}
          </div>
        </div>
        );
      },
    },
    {
      title: 'Phụ huynh',
      key: 'parent',
      render: (_, record) => {
        const parent = record.additionalFields?.parent;
        return (
        <div>
            <div>{parent?.lastName} {parent?.firstName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
              {parent?.phone}
          </div>
        </div>
        );
      },
    },
    {
      title: 'Chỉ số cơ bản',
      key: 'basicInfo',
      render: (_, record) => (
        <div>
          <div>Chiều cao: {record.height} cm</div>
          <div>Cân nặng: {record.weight} kg</div>
          <div>BMI: {(record.weight / Math.pow(record.height / 100, 2)).toFixed(2)}</div>
        </div>
      )
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div>
          <div>{dayjs(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{dayjs(date).fromNow()}</div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          PENDING: { color: 'processing', text: 'Chờ duyệt' },
          APPROVED: { color: 'success', text: 'Đã duyệt' },
          REJECTED: { color: 'error', text: 'Từ chối' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Duyệt">
                <Button
                  type="link"
                  icon={<CheckOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record)}
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  type="link"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => handleReject(record)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Handlers
  const handleViewDetail = async (profile) => {
    try {
      setLoading(true);
      console.log(`Fetching details for profile ID: ${profile.id}`);
      const response = await nurseApi.getHealthProfileDetail(profile.id);
      
      if (response.success && response.data) {
        console.log('Profile details loaded successfully:', response.data);
        setSelectedProfile(response.data);
      setDetailModalVisible(true);
      } else {
        message.error(response.message || 'Không thể tải chi tiết hồ sơ sức khỏe.');
      }
    } catch (error) {
      console.error('Unexpected error loading profile detail:', error);
      message.error('Đã xảy ra lỗi khi tải chi tiết hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (profile) => {
    try {
      setLoading(true);
      const detailProfile = await nurseApi.getHealthProfileDetail(profile.id);
      setSelectedProfile(detailProfile);
      form.setFieldsValue({
        weight: detailProfile.weight,
        height: detailProfile.height,
        note: detailProfile.note
      });
      setEditModalVisible(true);
    } catch (error) {
      console.error('Error loading for edit:', error);
      message.error('Không thể tải thông tin hồ sơ để chỉnh sửa.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (profile) => {
    setSelectedProfile(profile);
    setApproveModalVisible(true);
    
    // Clear form 
    if (approveForm) {
      approveForm.resetFields();
    }
  };

  const handleReject = (profile) => {
    setSelectedProfile(profile);
    setRejectModalVisible(true);
    
    // Clear form
    if (rejectForm) {
      rejectForm.resetFields();
    }
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      
      // Create update payload with only the fields that need to be updated
      const updatePayload = {
        weight: values.weight,
        height: values.height,
        note: values.note
      };
      
      console.log(`Updating profile ${selectedProfile.id} with data:`, updatePayload);
      
      const response = await nurseApi.updateHealthProfile(selectedProfile.id, updatePayload);
      console.log('Profile update response:', response);
      
      if (response.success) {
        message.success(response.message || 'Cập nhật hồ sơ thành công');
      setEditModalVisible(false);
      form.resetFields();
        
        // Refresh the profile list
        await loadHealthProfiles();
        
        // If the detail modal is still open, refresh the profile details
        if (detailModalVisible) {
          const refreshResponse = await nurseApi.getHealthProfileDetail(selectedProfile.id);
          if (refreshResponse.success && refreshResponse.data) {
            setSelectedProfile(refreshResponse.data);
          }
        }
      } else {
        message.error(response.message || 'Không thể cập nhật hồ sơ sức khỏe.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    try {
      const values = await approveForm.validateFields();
      setActionLoading(true);
      
      console.log(`Approving profile ${selectedProfile.id} with note: ${values.nurseNote || 'none'}`);
      const response = await nurseApi.approveHealthProfile(selectedProfile.id, values.nurseNote);
      console.log('Profile approve response:', response);
      
      if (response.success) {
        message.success(response.message || 'Đã duyệt hồ sơ sức khỏe thành công');
      setApproveModalVisible(false);
      approveForm.resetFields();
        
        // Close detail modal if it was open
        if (detailModalVisible) {
          setDetailModalVisible(false);
        }
        
        // Refresh the profiles list
        await loadHealthProfiles();
      } else {
        message.error(response.message || 'Không thể duyệt hồ sơ sức khỏe.');
      }
    } catch (error) {
      console.error('Error approving profile:', error);
      message.error('Có lỗi xảy ra khi duyệt hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      setActionLoading(true);
      
      // Đảm bảo có reason
      if (!values.reason || values.reason.trim() === '') {
        message.error('Vui lòng nhập lý do từ chối hồ sơ');
        setActionLoading(false);
        return;
      }
      
      console.log(`Rejecting profile ${selectedProfile.id} with reason: ${values.reason}`);
      
      let success = false;
      let mockUsed = false;
      
      try {
        const response = await nurseApi.rejectHealthProfile(selectedProfile.id, values.reason);
        console.log('Profile reject response:', response);
        
        if (response.success) {
          success = true;
          // Kiểm tra xem có phải dữ liệu mock không
          if (response.data && response.data.id && !response.data.studentId) {
            mockUsed = true;
          }
        }
      } catch (apiError) {
        console.error('API error:', apiError);
        // Không làm gì - chúng ta sẽ xử lý thông qua biến success
      }
      
      // Xử lý kết quả
      if (success) {
        if (mockUsed) {
          message.success('Đã từ chối hồ sơ sức khỏe thành công (dữ liệu tạm thời)');
          message.info('Lưu ý: Hệ thống đang sử dụng dữ liệu tạm thời do vấn đề kết nối với máy chủ');
        } else {
          message.success('Đã từ chối hồ sơ sức khỏe thành công');
        }
        
        setRejectModalVisible(false);
        rejectForm.resetFields();
        
        // Close detail modal if it was open
        if (detailModalVisible) {
          setDetailModalVisible(false);
        }
        
        // Refresh the profiles list - try/catch để tránh lỗi nếu có vấn đề xác thực
        try {
          await loadHealthProfiles();
        } catch (loadError) {
          console.error('Error refreshing profiles:', loadError);
          // Không hiển thị lỗi cho người dùng vì đã hiển thị thông báo thành công
        }
      } else {
        message.error('Không thể từ chối hồ sơ sức khỏe. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error rejecting profile:', error);
      message.error('Có lỗi xảy ra khi từ chối hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(false);
    }
  };

  // Render health data sections
  const renderAllergies = (allergies = []) => {
    if (!allergies || allergies.length === 0) {
      return <Text type="secondary">Không có thông tin dị ứng</Text>;
    }
    
    return (
      <List
        dataSource={allergies}
        renderItem={(allergy) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{allergy.allergyType}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Mức độ: {allergy.status === 'MILD' ? 'Nhẹ' : allergy.status === 'MODERATE' ? 'Trung bình' : 'Nặng'}
              </div>
              {allergy.description && <div style={{ fontSize: '12px' }}>Mô tả: {allergy.description}</div>}
              {allergy.onsetDate && (
                <div style={{ fontSize: '12px' }}>
                  Ngày phát hiện: {dayjs(allergy.onsetDate).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  const renderChronicDiseases = (diseases = []) => {
    if (!diseases || diseases.length === 0) {
      return <Text type="secondary">Không có thông tin bệnh mãn tính</Text>;
    }
    
    return (
      <List
        dataSource={diseases}
        renderItem={(disease) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{disease.diseaseName}</div>
              {disease.description && <div style={{ fontSize: '12px' }}>{disease.description}</div>}
              <div style={{ fontSize: '12px', color: '#666' }}>
                Trạng thái: {disease.status}
              </div>
              {disease.dateDiagnosed && (
                <div style={{ fontSize: '12px' }}>
                  Ngày chẩn đoán: {dayjs(disease.dateDiagnosed).format('DD/MM/YYYY')}
                </div>
              )}
              {disease.placeOfTreatment && (
                <div style={{ fontSize: '12px' }}>
                  Nơi điều trị: {disease.placeOfTreatment}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  const renderInfectiousDiseases = (diseases = []) => {
    if (!diseases || diseases.length === 0) {
      return <Text type="secondary">Không có thông tin bệnh truyền nhiễm</Text>;
    }
    
    return (
      <List
        dataSource={diseases}
        renderItem={(disease) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{disease.diseaseName}</div>
              {disease.description && <div style={{ fontSize: '12px' }}>{disease.description}</div>}
              <div style={{ fontSize: '12px', color: '#666' }}>
                Trạng thái: {disease.status}
              </div>
              {disease.dateDiagnosed && (
                <div style={{ fontSize: '12px' }}>
                  Ngày chẩn đoán: {dayjs(disease.dateDiagnosed).format('DD/MM/YYYY')}
                </div>
              )}
              {disease.dateResolved && (
                <div style={{ fontSize: '12px' }}>
                  Ngày khỏi bệnh: {dayjs(disease.dateResolved).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };
  
  const renderTreatments = (treatments = []) => {
    if (!treatments || treatments.length === 0) {
      return <Text type="secondary">Không có thông tin điều trị</Text>;
    }
    
    return (
      <List
        dataSource={treatments}
        renderItem={(treatment) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{treatment.treatmentType}</div>
              {treatment.description && <div style={{ fontSize: '12px' }}>{treatment.description}</div>}
              {treatment.doctorName && (
                <div style={{ fontSize: '12px' }}>
                  Bác sĩ: {treatment.doctorName}
                </div>
              )}
              {treatment.dateOfAdmission && (
                <div style={{ fontSize: '12px' }}>
                  Ngày nhập viện: {dayjs(treatment.dateOfAdmission).format('DD/MM/YYYY')}
                </div>
              )}
              {treatment.dateOfDischarge && (
                <div style={{ fontSize: '12px' }}>
                  Ngày xuất viện: {dayjs(treatment.dateOfDischarge).format('DD/MM/YYYY')}
                </div>
              )}
              {treatment.placeOfTreatment && (
                <div style={{ fontSize: '12px' }}>
                  Nơi điều trị: {treatment.placeOfTreatment}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };
  
  const renderVaccinationHistory = (vaccinations = []) => {
    if (!vaccinations || vaccinations.length === 0) {
      return <Text type="secondary">Không có thông tin tiêm chủng</Text>;
    }
    
    return (
      <List
        dataSource={vaccinations}
        renderItem={(vaccination) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{vaccination.vaccineName}</div>
              <div style={{ fontSize: '12px' }}>
                Liều: {vaccination.doseNumber}
              </div>
              {vaccination.manufacturer && (
                <div style={{ fontSize: '12px' }}>
                  Nhà sản xuất: {vaccination.manufacturer}
                </div>
              )}
              {vaccination.dateOfVaccination && (
                <div style={{ fontSize: '12px' }}>
                  Ngày tiêm: {dayjs(vaccination.dateOfVaccination).format('DD/MM/YYYY')}
                </div>
              )}
              {vaccination.placeOfVaccination && (
                <div style={{ fontSize: '12px' }}>
                  Nơi tiêm: {vaccination.placeOfVaccination}
                </div>
              )}
              {vaccination.administeredBy && (
                <div style={{ fontSize: '12px' }}>
                  Người thực hiện: {vaccination.administeredBy}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  const renderVision = (visionData = []) => {
    if (!visionData || visionData.length === 0) {
      return <Text type="secondary">Không có thông tin thị lực</Text>;
    }
    
    return (
      <List
        dataSource={visionData}
        renderItem={(vision) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{vision.visionDescription || 'Thông tin thị lực'}</div>
              <div style={{ fontSize: '12px' }}>
                Mắt trái: {vision.visionLeft}/10
              </div>
              <div style={{ fontSize: '12px' }}>
                Mắt phải: {vision.visionRight}/10
              </div>
              <div style={{ fontSize: '12px' }}>
                Mắt trái (với kính): {vision.visionLeftWithGlass}/10
              </div>
              <div style={{ fontSize: '12px' }}>
                Mắt phải (với kính): {vision.visionRightWithGlass}/10
              </div>
              {vision.dateOfExamination && (
                <div style={{ fontSize: '12px' }}>
                  Ngày khám: {dayjs(vision.dateOfExamination).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };
  
  const renderHearing = (hearingData = []) => {
    if (!hearingData || hearingData.length === 0) {
      return <Text type="secondary">Không có thông tin thính lực</Text>;
    }
    
    return (
      <List
        dataSource={hearingData}
        renderItem={(hearing) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{hearing.description || 'Thông tin thính lực'}</div>
              <div style={{ fontSize: '12px' }}>
                Tai trái: {hearing.leftEar}/10
              </div>
              <div style={{ fontSize: '12px' }}>
                Tai phải: {hearing.rightEar}/10
              </div>
              {hearing.dateOfExamination && (
                <div style={{ fontSize: '12px' }}>
                  Ngày khám: {dayjs(hearing.dateOfExamination).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3}>
            <FileTextOutlined style={{ marginRight: '8px' }} />
            Quản lý Hồ sơ Sức khỏe Học sinh
          </Title>
          <Alert
            message="Thông tin quan trọng"
            description="Đây là nơi quản lý các hồ sơ sức khỏe do phụ huynh gửi. Bạn có thể xem, chỉnh sửa, duyệt hoặc từ chối các hồ sơ."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </div>

        <Tabs 
          activeKey={activeTabKey} 
          onChange={handleTabChange}
          tabBarExtraContent={
              <Button onClick={loadHealthProfiles} loading={loading} type="primary">
                Làm mới
              </Button>
          }
          items={[
            {
              key: 'pending',
              label: <span>Chờ duyệt {pendingCount > 0 && <Badge count={pendingCount} style={{ marginLeft: 8 }} />}</span>,
              children: (
        <Table
          columns={columns}
          dataSource={healthProfiles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Không có hồ sơ sức khỏe chờ duyệt nào' }}
                />
              )
            },
            {
              key: 'approved',
              label: 'Đã duyệt',
              children: (
                <Table
                  columns={columns}
                  dataSource={healthProfiles}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Không có hồ sơ sức khỏe đã duyệt nào' }}
                />
              )
            },
            {
              key: 'rejected',
              label: 'Đã từ chối',
              children: (
                <Table
                  columns={columns}
                  dataSource={healthProfiles}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Không có hồ sơ sức khỏe đã từ chối nào' }}
                />
              )
            }
          ]}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <FileSearchOutlined />
            <span>
              Chi tiết hồ sơ sức khỏe
              {selectedProfile?.additionalFields?.student && 
                ` - ${selectedProfile.additionalFields.student.lastName} ${selectedProfile.additionalFields.student.firstName}`}
            </span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          selectedProfile && selectedProfile.status === 'PENDING' && (
            <>
              <Button
                key="reject"
                danger
                onClick={() => handleReject(selectedProfile)}
                icon={<CloseOutlined />}
              >
                Từ chối
              </Button>
              <Button
                key="edit"
                onClick={() => handleEdit(selectedProfile)}
                icon={<EditOutlined />}
              >
                Chỉnh sửa
              </Button>
              <Button
                key="approve"
                type="primary"
                onClick={() => handleApprove(selectedProfile)}
                icon={<CheckOutlined />}
              >
                Duyệt
              </Button>
            </>
          ),
          <Button 
            key="refresh" 
            onClick={() => selectedProfile && handleViewDetail(selectedProfile)} 
            icon={<FileSearchOutlined />}
          >
            Làm mới
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
      >
        {selectedProfile && (
          <div>
            <Descriptions title="Thông tin cơ bản" bordered size="small">
              <Descriptions.Item label="Học sinh" span={2}>
                {selectedProfile.additionalFields?.student?.lastName} {selectedProfile.additionalFields?.student?.firstName}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedProfile.additionalFields?.student?.className}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh" span={2}>
                {selectedProfile.additionalFields?.parent?.lastName} {selectedProfile.additionalFields?.parent?.firstName}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {selectedProfile.additionalFields?.parent?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedProfile.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao">
                {selectedProfile.height} cm
              </Descriptions.Item>
              <Descriptions.Item label="BMI">
                {(selectedProfile.weight / Math.pow(selectedProfile.height / 100, 2)).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedProfile.status === 'PENDING' ? 'processing' : 
                           selectedProfile.status === 'APPROVED' ? 'success' : 'error'}>
                  {selectedProfile.status === 'PENDING' ? 'Chờ duyệt' :
                   selectedProfile.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                </Tag>
              </Descriptions.Item>
              {selectedProfile.status === 'APPROVED' && selectedProfile.additionalFields?.schoolNurseFullName && (
                <Descriptions.Item label="Y tá duyệt" span={2}>
                  {selectedProfile.additionalFields.schoolNurseFullName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ghi chú" span={3}>
                {selectedProfile.note || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Collapse defaultActiveKey={['allergies']} bordered={false}>
              <Panel 
                header={<span><MedicineBoxOutlined /> Dị ứng</span>} 
                key="allergies"
              >
                {renderAllergies(selectedProfile.allergies)}
              </Panel>
              
              <Panel 
                header={<span><HeartOutlined /> Bệnh mãn tính</span>} 
                key="chronic"
              >
                {renderChronicDiseases(selectedProfile.chronicDiseases)}
              </Panel>
              
              <Panel 
                header={<span><HeartOutlined /> Bệnh truyền nhiễm</span>} 
                key="infectious"
              >
                {renderInfectiousDiseases(selectedProfile.infectiousDiseases)}
              </Panel>
              
              <Panel 
                header={<span><MedicineBoxOutlined /> Lịch sử điều trị</span>} 
                key="treatments"
              >
                {renderTreatments(selectedProfile.treatments)}
              </Panel>
              
              <Panel 
                header={<span><CalendarOutlined /> Tiêm chủng</span>} 
                key="vaccination"
              >
                {renderVaccinationHistory(selectedProfile.vaccinationHistory)}
              </Panel>
              
              <Panel 
                header={<span><EyeOutlined /> Thị lực</span>} 
                key="vision"
              >
                {renderVision(selectedProfile.vision)}
              </Panel>
              
              <Panel 
                header={<span><AudioOutlined /> Thính lực</span>} 
                key="hearing"
              >
                {renderHearing(selectedProfile.hearing)}
              </Panel>
            </Collapse>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title={<span><EditOutlined /> Chỉnh sửa hồ sơ sức khỏe</span>}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        confirmLoading={actionLoading}
        width={600}
        centered
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Cân nặng (kg)"
                name="weight"
                rules={[
                  { required: true, message: 'Vui lòng nhập cân nặng' },
                  { type: 'number', min: 1, max: 200, message: 'Cân nặng phải từ 1-200 kg' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập cân nặng"
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Chiều cao (cm)"
                name="height"
                rules={[
                  { required: true, message: 'Vui lòng nhập chiều cao' },
                  { type: 'number', min: 50, max: 250, message: 'Chiều cao phải từ 50-250 cm' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập chiều cao"
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Ghi chú của Y tá"
            name="note"
          >
            <TextArea
              rows={4}
              placeholder="Thêm ghi chú hoặc nhận xét..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={<span><CheckOutlined style={{ color: '#52c41a' }} /> Duyệt hồ sơ sức khỏe</span>}
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleConfirmApprove}
        confirmLoading={actionLoading}
        centered
      >
        {selectedProfile && (
          <div>
            <Alert
              message="Xác nhận duyệt hồ sơ sức khỏe"
              description={
                <div>
                  <p>Bạn có chắc chắn muốn duyệt hồ sơ sức khỏe của <strong>{selectedProfile.additionalFields?.student?.lastName} {selectedProfile.additionalFields?.student?.firstName}</strong> (Lớp {selectedProfile.additionalFields?.student?.className}) không?</p>
                  <p>Khi duyệt, hồ sơ sức khỏe sẽ được chuyển sang mục "Tiền sử sức khỏe" của phụ huynh và sẽ được lưu trữ trong hệ thống.</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          </div>
        )}
        
        <Form form={approveForm} layout="vertical">
          <Form.Item
            label="Ghi chú của Y tá"
            name="nurseNote"
          >
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú khi duyệt (không bắt buộc)..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={<span><CloseOutlined style={{ color: '#ff4d4f' }} /> Từ chối hồ sơ sức khỏe</span>}
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleConfirmReject}
        confirmLoading={actionLoading}
        okButtonProps={{ danger: true }}
        centered
      >
        {selectedProfile && (
          <div>
            <Alert
              message="Xác nhận từ chối hồ sơ sức khỏe"
              description={
                <div>
                  <p>Bạn sắp từ chối hồ sơ sức khỏe của <strong>{selectedProfile.additionalFields?.student?.lastName} {selectedProfile.additionalFields?.student?.firstName}</strong> (Lớp {selectedProfile.additionalFields?.student?.className}).</p>
                  <p>Lý do từ chối sẽ được gửi đến phụ huynh.</p>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: '16px' }}
            />
        <p>Vui lòng nhập lý do từ chối hồ sơ này:</p>
          </div>
        )}
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            label="Lý do từ chối"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập lý do từ chối hồ sơ..."
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NurseHealthProfiles;