import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Badge,
  Space,
  Modal,
  message,
  Descriptions,
  Input,
  Row,
  Col,
  Statistic,
  Tag,
  Tabs,
  Typography,
  Popconfirm,
  Form,
  Select
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  AlertOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { healthCheckApi } from '../../api/healthCheckApi';
import '../../styles/ManagerHealthCheck.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ManagerHealthCheckManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [statistics, setStatistics] = useState({});
  const [forms, setForms] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchStatistics();
    fetchCampaignsByStatus(activeTab);
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      const [pendingCampaigns, approvedCampaigns, canceledCampaigns, inProgressCampaigns, completedCampaigns] = await Promise.all([
        healthCheckApi.getCampaignsByStatus('PENDING'),
        healthCheckApi.getCampaignsByStatus('APPROVED'),
        healthCheckApi.getCampaignsByStatus('CANCELED'),
        healthCheckApi.getCampaignsByStatus('IN_PROGRESS'),
        healthCheckApi.getCompletedCampaigns()
      ]);

      setStatistics({
        pending: pendingCampaigns?.length || 0,
        approved: approvedCampaigns?.length || 0,
        canceled: canceledCampaigns?.length || 0,
        inProgress: inProgressCampaigns?.length || 0,
        completed: completedCampaigns?.length || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchCampaignsByStatus = async (status) => {
    setLoading(true);
    try {
      let response;
      switch (status) {
        case 'pending':
          response = await healthCheckApi.getCampaignsByStatus('PENDING');
          break;
        case 'approved':
          response = await healthCheckApi.getCampaignsByStatus('APPROVED');
          break;
        case 'canceled':
          response = await healthCheckApi.getCampaignsByStatus('CANCELED');
          break;
        case 'ongoing':
          response = await healthCheckApi.getCampaignsByStatus('IN_PROGRESS');
          break;
        case 'completed':
          response = await healthCheckApi.getCompletedCampaigns();
          break;
        default:
          response = await healthCheckApi.getCampaignsByStatus('PENDING');
      }
      setCampaigns(response || []);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách chiến dịch với trạng thái ${status}`);
      console.error(`Error fetching campaigns with status ${status}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCampaign = async (campaignId) => {
    setLoading(true);
    try {
      await healthCheckApi.approveCampaign(campaignId);
      message.success('Phê duyệt chiến dịch khám sức khỏe thành công!');
      fetchStatistics();
      fetchCampaignsByStatus(activeTab);
    } catch (error) {
      message.error('Lỗi khi phê duyệt chiến dịch');
      console.error('Error approving campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCampaign = async (campaignId, notes) => {
    setLoading(true);
    try {
      await healthCheckApi.rejectCampaign(campaignId, notes);
      message.success('Từ chối chiến dịch khám sức khỏe thành công!');
      setRejectModalVisible(false);
      form.resetFields();
      fetchStatistics();
      fetchCampaignsByStatus(activeTab);
    } catch (error) {
      message.error('Lỗi khi từ chối chiến dịch');
      console.error('Error rejecting campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCampaignDetail = async (campaign) => {
    setSelectedCampaign(campaign);
    setDetailModalVisible(true);
    
    try {
      // Fetch additional details for the campaign
      const [campaignForms, campaignResults] = await Promise.all([
        healthCheckApi.getFormsByCampaign(campaign.id),
        healthCheckApi.getResultsByCampaign(campaign.id)
      ]);
      setForms(campaignForms);
      setResults(campaignResults);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: 'Chờ phê duyệt' },
      APPROVED: { color: 'green', text: 'Đã phê duyệt' },
      IN_PROGRESS: { color: 'blue', text: 'Đang thực hiện' },
      COMPLETED: { color: 'purple', text: 'Hoàn thành' },
      CANCELED: { color: 'red', text: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Badge color={config.color} text={config.text} />;
  };

  const formatCategories = (categories) => {
    if (!categories || categories.length === 0) return 'Không có';
    
    const categoryNames = {
      'VISION': 'Thị lực',
      'HEARING': 'Thính giác', 
      'ORAL': 'Răng miệng',
      'SKIN': 'Da liễu',
      'RESPIRATORY': 'Hô hấp'
    };
    
    return categories.map(cat => categoryNames[cat] || cat).join(', ');
  };

  const columns = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ID: {record.id}
          </Text>
        </div>
      ),
    },
    {
      title: 'Loại khám',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) => formatCategories(categories),
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_, record) => (
        <div>
          <div>Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}</div>
          <div>Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (user) => user?.fullName || 'N/A',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showCampaignDetail(record)}
          >
            Xem
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="Phê duyệt chiến dịch"
                description="Bạn có chắc chắn muốn phê duyệt chiến dịch khám sức khỏe này?"
                onConfirm={() => handleApproveCampaign(record.id)}
                okText="Phê duyệt"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                >
                  Duyệt
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => {
                  setSelectedCampaign(record);
                  setRejectModalVisible(true);
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="manager-health-check-management">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pending || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={statistics.approved || 0}
              prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={statistics.CANCELED || 0}
              prefix={<FileTextOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic
              title="Đang tiến hành"
              value={statistics.inProgress || 0}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics.completed || 0}
              prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Campaign Management Table */}
      <Card title="Quản lý chiến dịch khám sức khỏe">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Chờ duyệt" key="pending" />
          <TabPane tab="Đã duyệt" key="approved" />
          <TabPane tab="Đã hủy" key="canceled" />
          <TabPane tab="Đang tiến hành" key="ongoing" />
          <TabPane tab="Hoàn thành" key="completed" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={campaigns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chiến dịch`,
          }}
        />
      </Card>

      {/* Campaign Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HeartOutlined />
            <span>Chi tiết chiến dịch khám sức khỏe</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setDetailModalVisible(false)}
            style={{ borderRadius: 6 }}
          >
            Đóng
          </Button>,
          selectedCampaign?.status === 'PENDING' && (
            <Button
              key="reject"
              danger
              onClick={() => {
                setDetailModalVisible(false);
                setRejectModalVisible(true);
              }}
              style={{ borderRadius: 6 }}
            >
              Từ chối
            </Button>
          ),
          selectedCampaign?.status === 'PENDING' && (
            <Popconfirm
              key="approve"
              title="Phê duyệt chiến dịch"
              description="Bạn có chắc chắn muốn phê duyệt chiến dịch khám sức khỏe này?"
              onConfirm={() => {
                handleApproveCampaign(selectedCampaign.id);
                setDetailModalVisible(false);
              }}
              okText="Phê duyệt"
              cancelText="Hủy"
            >
              <Button 
                type="primary"
                style={{ borderRadius: 6 }}
              >
                Phê duyệt
              </Button>
            </Popconfirm>
          ),
        ]}
        width={1000}
        className="detail-modal"
      >
        {selectedCampaign && (
          <Tabs defaultActiveKey="info">
            <TabPane tab="Thông tin chiến dịch" key="info">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Tên chiến dịch" span={2}>
                  <Text strong style={{ fontSize: '16px', color: '#ff6b35' }}>
                    {selectedCampaign.name}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusBadge(selectedCampaign.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Địa điểm">
                  <Text>{selectedCampaign.location || 'N/A'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu">
                  <Text>
                    {selectedCampaign.startDate 
                      ? new Date(selectedCampaign.startDate).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">
                  <Text>
                    {selectedCampaign.endDate 
                      ? new Date(selectedCampaign.endDate).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Độ tuổi tham gia">
                  <Tag color="green">
                    {selectedCampaign.minAge && selectedCampaign.maxAge 
                      ? `${selectedCampaign.minAge} - ${selectedCampaign.maxAge} tuổi`
                      : 'Tất cả độ tuổi'
                    }
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lớp tham gia">
                  <div>
                    {selectedCampaign.targetClasses && selectedCampaign.targetClasses.length > 0
                      ? selectedCampaign.targetClasses.map(cls => (
                          <Tag key={cls} color="blue" style={{ marginBottom: 4 }}>
                            {cls}
                          </Tag>
                        ))
                      : 'Tất cả lớp'
                    }
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  <div>
                    <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                    <Text strong>{selectedCampaign.createdBy?.fullName || 'N/A'}</Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  <Text>
                    {selectedCampaign.createdAt 
                      ? new Date(selectedCampaign.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'
                    }
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người duyệt">
                  <div>
                    {selectedCampaign.approvedBy ? (
                      <>
                        <CheckOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        <Text strong>{selectedCampaign.approvedBy.fullName}</Text>
                      </>
                    ) : (
                      <Text type="secondary">Chưa duyệt</Text>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Loại khám" span={2}>
                  <div>
                    {formatCategories(selectedCampaign.categories)}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  <div style={{ 
                    maxHeight: '120px', 
                    overflowY: 'auto', 
                    padding: '8px', 
                    backgroundColor: '#fff7e6', 
                    borderRadius: '4px', 
                    border: '1px solid #ffd591',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}>
                    {selectedCampaign.description || 'Không có mô tả'}
                  </div>
                </Descriptions.Item>
                {selectedCampaign.notes && selectedCampaign.status === 'CANCELED' && (
                  <Descriptions.Item label="Ghi chú từ Manager" span={2}>
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: '#fff2f0', 
                      borderRadius: '4px', 
                      border: '1px solid #ffccc7',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: '#cf1322',
                      whiteSpace: 'pre-line'
                    }}>
                      {selectedCampaign.notes}
                    </div>
                  </Descriptions.Item>
                )}
                {selectedCampaign.rejectNotes && (
                  <Descriptions.Item label="Lý do từ chối" span={2}>
                    <div style={{ 
                      padding: '8px', 
                      backgroundColor: '#fff2f0', 
                      borderRadius: '4px', 
                      border: '1px solid #ffccc7',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: '#cf1322',
                      whiteSpace: 'pre-line'
                    }}>
                      {selectedCampaign.rejectNotes}
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </TabPane>
            <TabPane tab={`Danh sách đăng ký (${forms.length})`} key="forms">
              <Table
                dataSource={forms}
                columns={[
                  {
                    title: 'Học sinh',
                    dataIndex: 'student',
                    render: (student) => student?.fullName || 'N/A'
                  },
                  {
                    title: 'Lớp',
                    dataIndex: 'student',
                    render: (student) => student?.className || 'N/A'
                  },
                  {
                    title: 'Phụ huynh',
                    dataIndex: 'parent',
                    render: (parent) => parent?.fullName || 'N/A'
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    render: (status) => {
                      const statusMap = {
                        SENT: { color: 'processing', text: 'Đã gửi' },
                        CONFIRMED: { color: 'success', text: 'Đã xác nhận' },
                        DECLINED: { color: 'error', text: 'Từ chối' },
                        SCHEDULED: { color: 'warning', text: 'Đã lên lịch' },
                        CHECKED_IN: { color: 'success', text: 'Đã check-in' }
                      };
                      const statusInfo = statusMap[status] || { color: 'default', text: status };
                      return <Badge status={statusInfo.color} text={statusInfo.text} />;
                    }
                  }
                ]}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                size="small"
              />
            </TabPane>
            <TabPane tab={`Kết quả khám (${results.length})`} key="results">
              <Table
                dataSource={results}
                columns={[
                  {
                    title: 'Học sinh',
                    dataIndex: 'form',
                    render: (form) => form?.student?.fullName || 'N/A'
                  },
                  {
                    title: 'Loại khám',
                    dataIndex: 'category',
                    render: (category) => {
                      const categoryMap = {
                        VISION: 'Khám mắt',
                        HEARING: 'Khám tai',
                        ORAL: 'Khám răng miệng',
                        SKIN: 'Khám da liễu',
                        RESPIRATORY: 'Khám hô hấp'
                      };
                      return <Tag color="blue">{categoryMap[category] || category}</Tag>;
                    }
                  },
                  {
                    title: 'Kết quả',
                    dataIndex: 'abnormal',
                    render: (abnormal) => (
                      <Tag color={abnormal ? 'red' : 'green'}>
                        {abnormal ? 'Bất thường' : 'Bình thường'}
                      </Tag>
                    )
                  },
                  {
                    title: 'Trạng thái',
                    dataIndex: 'status',
                    render: (status) => {
                      const statusMap = {
                        RECORDED: { color: 'success', text: 'Đã ghi nhận' },
                        CONSULTATION_SCHEDULED: { color: 'warning', text: 'Đã lên lịch tư vấn' },
                        CONSULTATION_COMPLETED: { color: 'success', text: 'Đã tư vấn' },
                        NOTIFIED_PARENT: { color: 'processing', text: 'Đã thông báo phụ huynh' },
                        SYNCED_TO_PROFILE: { color: 'default', text: 'Đã đồng bộ hồ sơ' }
                      };
                      const statusInfo = statusMap[status] || { color: 'default', text: status };
                      return <Badge status={statusInfo.color} text={statusInfo.text} />;
                    }
                  }
                ]}
                pagination={{ pageSize: 5 }}
                rowKey="id"
                size="small"
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      {/* Reject Campaign Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloseOutlined />
            <span>Từ chối chiến dịch khám sức khỏe</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
        onOk={() => {
          form.validateFields().then(values => {
            handleRejectCampaign(selectedCampaign.id, values.notes);
          });
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ 
          danger: true,
          style: { borderRadius: 6 }
        }}
        cancelButtonProps={{
          style: { borderRadius: 6 }
        }}
        width={600}
        className="reject-modal"
      >
        <div style={{ padding: '8px 0' }}>
          <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
            Vui lòng nhập lý do từ chối chiến dịch "{selectedCampaign?.name}":
          </Text>
          <Form form={form} layout="vertical">
            <Form.Item
              name="notes"
              label="Lý do từ chối"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do từ chối' },
                { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do từ chối chiến dịch khám sức khỏe..."
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerHealthCheckManagement;
