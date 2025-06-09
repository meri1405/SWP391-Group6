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
  Divider
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { nurseApi } from '../../api/nurseApi';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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

  // Load health profiles
  const loadHealthProfiles = async () => {
    console.log('=== Starting loadHealthProfiles ===');
    
    // Debug token và role ngay trước khi gọi API - SỬA ĐÂY
    const token = localStorage.getItem('token'); // Đổi từ 'authToken' thành 'token'
    
    // Lấy role từ user object
    let role = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        role = user.roleName;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    console.log('Token before API call:', token);
    console.log('Role before API call:', role);
    
    if (!token) {
      console.error('No token available for API call');
      message.error('Không có token xác thực. Vui lòng đăng nhập lại.');
      return;
    }
    
    if (role !== 'SCHOOLNURSE') {
      console.error('Invalid role for API call:', role);
      message.error('Bạn không có quyền truy cập chức năng này.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading health profiles with status:', statusFilter);
      const profiles = await nurseApi.getHealthProfiles(statusFilter);
      console.log('Loaded profiles:', profiles);
      setHealthProfiles(profiles || []);
    } catch (error) {
      console.error('Error loading health profiles:', error);
      
      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền truy cập chức năng này.');
      } else if (error.response?.status === 404) {
        message.warning('Không tìm thấy hồ sơ sức khỏe nào.');
        setHealthProfiles([]);
      } else {
        message.error('Không thể tải danh sách hồ sơ sức khỏe. Vui lòng thử lại.');
      }
      setHealthProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== NurseHealthProfiles Component Debug Info ===');
    console.log('Current status filter:', statusFilter);
    
    // Kiểm tra token
    const authToken = localStorage.getItem('token'); // Sửa từ 'authToken' thành 'token'
    
    // Lấy role từ user object thay vì userRole riêng
    let userRole = null;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        userRole = user.roleName; // Sử dụng roleName từ user object
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    
    console.log('Auth token exists:', !!authToken);
    console.log('Auth token value:', authToken);
    console.log('User role from user object:', userRole);
    console.log('Base URL: http://localhost:8080');
    
    // Nếu không có token, đợi một chút để AuthContext setup
    if (!authToken) {
      console.warn('No auth token found, waiting for auth context...');
      const timer = setTimeout(() => {
        const newToken = localStorage.getItem('token');
        let newRole = null;
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            newRole = user.roleName;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
        
        console.log('After waiting - Token exists:', !!newToken);
        console.log('After waiting - User role:', newRole);
        
        if (newToken && newRole === 'SCHOOLNURSE') {
          loadHealthProfiles();
        } else if (!newToken) {
          message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (newRole !== 'SCHOOLNURSE') {
          message.error('Bạn không có quyền truy cập chức năng này.');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Kiểm tra role
    if (userRole !== 'SCHOOLNURSE') {
      console.warn('User role mismatch:', userRole);
      message.error('Bạn không có quyền truy cập chức năng này.');
      return;
    }
    
    loadHealthProfiles();
  }, [statusFilter]);

  // Table columns
  const columns = [
    {
      title: 'Học sinh',
      key: 'student',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.student.lastName} {record.student.firstName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Lớp: {record.student.className}
          </div>
        </div>
      ),
    },
    {
      title: 'Phụ huynh',
      key: 'parent',
      render: (_, record) => (
        <div>
          <div>{record.parent.lastName} {record.parent.firstName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.parent.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
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
      const detailProfile = await nurseApi.getHealthProfileDetail(profile.id);
      setSelectedProfile(detailProfile);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error loading detail:', error);
      if (error.response?.status === 404) {
        message.error('Không tìm thấy chi tiết hồ sơ này.');
      } else {
        message.error('Không thể tải chi tiết hồ sơ.');
      }
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
  };

  const handleReject = (profile) => {
    setSelectedProfile(profile);
    setRejectModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      
      const updatedProfile = {
        ...selectedProfile,
        ...values
      };
      
      await nurseApi.updateHealthProfile(selectedProfile.id, updatedProfile);
      message.success('Cập nhật hồ sơ thành công');
      setEditModalVisible(false);
      form.resetFields();
      loadHealthProfiles();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 400) {
        message.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy hồ sơ để cập nhật.');
      } else {
        message.error('Có lỗi xảy ra khi cập nhật hồ sơ.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmApprove = async () => {
    try {
      const values = await approveForm.validateFields();
      setActionLoading(true);
      
      await nurseApi.approveHealthProfile(selectedProfile.id, values.nurseNote);
      message.success('Đã duyệt hồ sơ sức khỏe thành công');
      setApproveModalVisible(false);
      approveForm.resetFields();
      loadHealthProfiles();
    } catch (error) {
      console.error('Error approving profile:', error);
      if (error.response?.status === 400) {
        message.error('Không thể duyệt hồ sơ này. Vui lòng kiểm tra trạng thái.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy hồ sơ để duyệt.');
      } else {
        message.error('Có lỗi xảy ra khi duyệt hồ sơ.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      setActionLoading(true);
      
      await nurseApi.rejectHealthProfile(selectedProfile.id, values.reason);
      message.success('Đã từ chối hồ sơ sức khỏe');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      loadHealthProfiles();
    } catch (error) {
      console.error('Error rejecting profile:', error);
      if (error.response?.status === 400) {
        message.error('Không thể từ chối hồ sơ này. Vui lòng kiểm tra trạng thái.');
      } else if (error.response?.status === 404) {
        message.error('Không tìm thấy hồ sơ để từ chối.');
      } else {
        message.error('Có lỗi xảy ra khi từ chối hồ sơ.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Render health data sections
  const renderAllergies = (allergies) => {
    if (!allergies || allergies.length === 0) {
      return <Text type="secondary">Không có thông tin dị ứng</Text>;
    }
    
    return (
      <List
        dataSource={allergies}
        renderItem={(allergy) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ fontWeight: 500 }}>{allergy.allergen}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Mức độ: {allergy.severity === 'MILD' ? 'Nhẹ' : allergy.severity === 'MODERATE' ? 'Trung bình' : 'Nặng'}
              </div>
              {allergy.symptoms && <div style={{ fontSize: '12px' }}>Triệu chứng: {allergy.symptoms}</div>}
              {allergy.onsetDate && (
                <div style={{ fontSize: '12px' }}>
                  Ngày khởi phát: {dayjs(allergy.onsetDate).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          </List.Item>
        )}
      />
    );
  };

  const renderChronicDiseases = (diseases) => {
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
            </div>
          </List.Item>
        )}
      />
    );
  };

  // Thêm function test
  const testAuth = async () => {
    try {
      setLoading(true);
      console.log("Testing authentication...");
      await nurseApi.testAuth();
      message.success("Authentication test successful!");
    } catch (error) {
      console.error("Auth test failed:", error);
      message.error("Authentication failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm function test endpoint
  const testEndpoints = async () => {
    try {
      setLoading(true);
      console.log("Testing all possible endpoints...");
      
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('No token found');
        return;
      }
      
      // Test authentication first
      await nurseApi.testAuth();
      message.success("Authentication successful!");
      
      // Then test health profiles endpoints
      await nurseApi.getHealthProfiles('PENDING');
      message.success("Health profiles endpoint found!");
      
    } catch (error) {
      console.error("Endpoint test failed:", error);
      message.error("Endpoint test failed: " + error.message);
    } finally {
      setLoading(false);
    }
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

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Select
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="">Tất cả</Option>
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="REJECTED">Từ chối</Option>
            </Select>
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={testEndpoints} loading={loading} type="default">
                Test Endpoints
              </Button>
              <Button onClick={loadHealthProfiles} loading={loading} type="primary">
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={healthProfiles}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có hồ sơ sức khỏe nào' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Chi tiết hồ sơ sức khỏe</span>
          </Space>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedProfile && (
          <div>
            <Descriptions title="Thông tin cơ bản" bordered size="small">
              <Descriptions.Item label="Học sinh" span={2}>
                {selectedProfile.student.lastName} {selectedProfile.student.firstName}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedProfile.student.className}
              </Descriptions.Item>
              <Descriptions.Item label="Phụ huynh" span={2}>
                {selectedProfile.parent.lastName} {selectedProfile.parent.firstName}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {selectedProfile.parent.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {selectedProfile.weight} kg
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao">
                {selectedProfile.height} cm
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedProfile.status === 'PENDING' ? 'processing' : 
                           selectedProfile.status === 'APPROVED' ? 'success' : 'error'}>
                  {selectedProfile.status === 'PENDING' ? 'Chờ duyệt' :
                   selectedProfile.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={3}>
                {selectedProfile.note || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Tabs defaultActiveKey="allergies">
              <TabPane tab="Dị ứng" key="allergies">
                {renderAllergies(selectedProfile.allergies)}
              </TabPane>
              <TabPane tab="Bệnh mãn tính" key="chronic">
                {renderChronicDiseases(selectedProfile.chronicDiseases)}
              </TabPane>
              <TabPane tab="Bệnh truyền nhiễm" key="infectious">
                <Text type="secondary">Không có thông tin bệnh truyền nhiễm</Text>
              </TabPane>
              <TabPane tab="Lịch sử điều trị" key="treatments">
                <Text type="secondary">Không có lịch sử điều trị</Text>
              </TabPane>
              <TabPane tab="Tiêm chủng" key="vaccination">
                <Text type="secondary">Không có lịch sử tiêm chủng</Text>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa hồ sơ sức khỏe"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSaveEdit}
        confirmLoading={actionLoading}
        width={600}
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
        title="Duyệt hồ sơ sức khỏe"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        onOk={handleConfirmApprove}
        confirmLoading={actionLoading}
      >
        <p>Bạn có chắc chắn muốn duyệt hồ sơ sức khỏe này không?</p>
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
        title="Từ chối hồ sơ sức khỏe"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={handleConfirmReject}
        confirmLoading={actionLoading}
        okButtonProps={{ danger: true }}
      >
        <p>Vui lòng nhập lý do từ chối hồ sơ này:</p>
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