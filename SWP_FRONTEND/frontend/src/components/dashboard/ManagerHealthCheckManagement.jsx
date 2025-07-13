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
import { healthCheckApi, CAMPAIGN_STATUS_LABELS, HEALTH_CHECK_CATEGORY_LABELS } from '../../api/healthCheckApi';
import { formatDate,  } from '../../utils/timeUtils';
import notificationEventService from '../../services/notificationEventService';
import '../../styles/ManagerHealthCheck.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
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
        healthCheckApi.getAllCampaignsByStatus('PENDING'),
        healthCheckApi.getAllCampaignsByStatus('APPROVED'),
        healthCheckApi.getAllCampaignsByStatus('CANCELED'),
        healthCheckApi.getAllCampaignsByStatus('IN_PROGRESS'),
        healthCheckApi.getAllCampaignsByStatus('COMPLETED')
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
          response = await healthCheckApi.getAllCampaignsByStatus('PENDING');
          console.log('Fetching pending campaigns:', response);
          break;
        case 'approved':
          response = await healthCheckApi.getAllCampaignsByStatus('APPROVED');
          break;
        case 'canceled':
          response = await healthCheckApi.getAllCampaignsByStatus('CANCELED');
          break;
        case 'ongoing':
          response = await healthCheckApi.getAllCampaignsByStatus('IN_PROGRESS');
          console.log('Fetching ongoing campaigns:', response);
          break;
        case 'completed':
          response = await healthCheckApi.getAllCampaignsByStatus('COMPLETED');
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
      const updatedCampaign = await healthCheckApi.approveCampaign(campaignId);
      message.success('Phê duyệt chiến dịch khám sức khỏe thành công!');
      
      // If the modal is open and showing this campaign, update it
      if (detailModalVisible && selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign(updatedCampaign);
      }
      
      fetchStatistics();
      fetchCampaignsByStatus(activeTab);
      
      // Trigger notification refresh
      notificationEventService.triggerRefresh();
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
      const updatedCampaign = await healthCheckApi.rejectCampaign(campaignId, notes);
      message.success('Từ chối chiến dịch khám sức khỏe thành công!');
      setRejectModalVisible(false);
      form.resetFields();
      
      // If the modal is open and showing this campaign, update it
      if (detailModalVisible && selectedCampaign && selectedCampaign.id === campaignId) {
        setSelectedCampaign(updatedCampaign);
      }
      
      fetchStatistics();
      fetchCampaignsByStatus(activeTab);
      
      // Trigger notification refresh
      notificationEventService.triggerRefresh();
    } catch (error) {
      message.error('Lỗi khi từ chối chiến dịch');
      console.error('Error rejecting campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCampaignDetail = async (campaign) => {
    setSelectedCampaign(campaign); // Set initial value from table
    setDetailModalVisible(true);
    
    try {
      // Fetch the latest campaign data using the manager endpoint
      const updatedCampaign = await healthCheckApi.getCampaignByIdForManager(campaign.id);
      setSelectedCampaign(updatedCampaign);
      
      // Reset forms and results before fetching
      setForms([]);
      setResults([]);
      
      // If campaign has progressed beyond PENDING, fetch confirmed students and results
      if (updatedCampaign.status !== 'PENDING') {
        try {
          // Use manager API to get confirmed students
          const confirmedStudentsData = await healthCheckApi.confirmCampaign(campaign.id);
          console.log('Confirmed students data:', confirmedStudentsData);
          setForms(Array.isArray(confirmedStudentsData) ? confirmedStudentsData : []);
        } catch (formError) {
          console.error('Error fetching confirmed students:', formError);
          // Fallback to nurse API if manager API fails
          try {
            const formsData = await healthCheckApi.getFormsByCampaignId(campaign.id);
            setForms(Array.isArray(formsData) ? formsData : []);
          } catch (fallbackError) {
            console.error('Error fetching campaign forms (fallback):', fallbackError);
            setForms([]);
          }
        }
        
        // If campaign is completed or in progress, fetch results using manager API
        if (updatedCampaign.status === 'COMPLETED' || updatedCampaign.status === 'IN_PROGRESS') {
          try {
            // Use manager API to get results
            const resultsData = await healthCheckApi.resultCampaign(campaign.id);
            console.log('Campaign results data:', resultsData);
            setResults(Array.isArray(resultsData) ? resultsData : []);
          } catch (resultError) {
            console.error('Error fetching campaign results from manager API:', resultError);
            // Set empty results if both APIs fail
            setResults([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      // We already set the campaign from the table above, so no need to do it again
      message.error('Không thể tải chi tiết chiến dịch. Vui lòng thử lại sau.');
    }
  };

  const getStatusBadge = (status) => {
    const label = CAMPAIGN_STATUS_LABELS[status] || status;
    const statusConfig = {
      PENDING: { color: 'orange', text: label },
      APPROVED: { color: 'green', text: label },
      CANCELED: { color: 'red', text: label },
      IN_PROGRESS: { color: 'blue', text: label },
      COMPLETED: { color: 'purple', text: label }
    };
    
    const config = statusConfig[status] || { color: 'default', text: label };
    return <Badge color={config.color} text={config.text} />;
  };

  const formatCategories = (categories) => {
    if (!categories || categories.length === 0) return 'Không có';
    
    return categories.map(cat => HEALTH_CHECK_CATEGORY_LABELS[cat] || cat).join(', ');
  };

  const columns = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div>
          <Text strong>{text}</Text>
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
          <div>{record.startDate
                      ? new Date(record.startDate).toLocaleDateString('vi-VN')
                      : 'N/A'
                    } - {record.endDate
                      ? new Date(record.endDate).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
          </div>
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
      dataIndex: 'createdByName',
      key: 'createdByName',
      render: (createdByName, record) => createdByName || record.createdBy?.fullName || 'N/A',
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
              title="Bị hủy"
              value={statistics.canceled || 0}
              prefix={<FileTextOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
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
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'pending', label: 'Chờ duyệt' },
            { key: 'approved', label: 'Đã duyệt' },
            { key: 'canceled', label: 'Bị hủy' },
            { key: 'ongoing', label: 'Đang tiến hành' },
            { key: 'completed', label: 'Hoàn thành' }
          ]}
        />

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
          )
        ]}
        width={1000}
        className="detail-modal"
      >
        {selectedCampaign && (
          <Tabs 
            defaultActiveKey="info"
            items={[
              {
                key: 'info',
                label: 'Thông tin chiến dịch',
                children: (
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên chiến dịch" span={2}>
                      <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
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
                        <Text strong>{selectedCampaign.createdByName || 'N/A'}</Text>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      <Text>
                        {selectedCampaign.createdAt 
                          ? formatDate(selectedCampaign.createdAt)
                          : 'N/A'
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Người duyệt">
                      <div>
                        {selectedCampaign.approvedByName ? (
                          <>
                            <CheckOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                            <Text strong>{selectedCampaign.approvedByName}</Text>
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
                    {selectedCampaign.rejectNotes && selectedCampaign.status === 'CANCELED' && (
                      <Descriptions.Item label="Lý do hủy" span={2}>
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
                )
              },
              {
                key: 'forms',
                label: `Danh sách đăng ký (${forms.length})`,
                children: (
                  <Table
                    dataSource={forms}
                    columns={[
                      {
                        title: 'Học sinh',
                        dataIndex: 'fullName',
                        key: 'fullName',
                        render: (fullName) => fullName || 'N/A'
                      },
                      {
                        title: 'Lớp',
                        dataIndex: 'className',
                        key: 'className',
                        render: (className) => className || 'N/A'
                      },
                      {
                        title: 'Niên khóa',
                        dataIndex: 'schoolYear',
                        key: 'schoolYear',
                        render: (schoolYear) => schoolYear || 'N/A'
                      },
                      {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        key: 'status',
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
                      },
                      {
                        title: 'Thời gian phản hồi',
                        dataIndex: 'respondedAt',
                        key: 'respondedAt',
                        render: (respondedAt) => {
                          if (!respondedAt) return 'N/A';
                          try {
                            // Handle array format [year, month, day, hour, minute, second, nanosecond]
                            if (Array.isArray(respondedAt) && respondedAt.length >= 6) {
                              const [year, month, day, hour, minute, second] = respondedAt;
                              const date = new Date(year, month - 1, day, hour, minute, second);
                              return date.toLocaleString('vi-VN');
                            }
                            return new Date(respondedAt).toLocaleString('vi-VN');
                          } catch (error) {
                            console.error('Error parsing respondedAt:', error);
                            return 'N/A';
                          }
                        }
                      }
                    ]}
                    pagination={{ pageSize: 5 }}
                    rowKey={(record) => record.formId || record.studentID || Math.random()}
                    size="small"
                  />
                )
              },
              {
                key: 'results',
                label: `Kết quả khám (${results.length})`,
                children: (
                  <Table
                    dataSource={results}
                    columns={[
                      {
                        title: 'Học sinh',
                        dataIndex: 'fullName',
                        key: 'student',
                        render: (fullName) => fullName || 'N/A'
                      },
                      {
                        title: 'Lớp',
                        dataIndex: 'className',
                        key: 'class',
                        render: (className) => className || 'N/A'
                      },
                      {
                        title: 'Loại khám',
                        dataIndex: 'results',
                        key: 'category',
                        render: (results) => {
                          if (!results || typeof results !== 'object') return 'N/A';
                          
                          const categoryMap = {
                            VISION: 'Khám mắt',
                            HEARING: 'Khám tai',
                            ORAL: 'Khám răng miệng',
                            SKIN: 'Khám da liễu',
                            RESPIRATORY: 'Khám hô hấp'
                          };
                          
                          // Get all categories from results object
                          const categories = Object.keys(results);
                          if (categories.length === 0) return 'N/A';
                          
                          return categories.map(category => (
                            <Tag key={category} color="blue" style={{ marginBottom: 2 }}>
                              {categoryMap[category] || category}
                            </Tag>
                          ));
                        }
                      },
                      {
                        title: 'Kết quả',
                        dataIndex: 'results',
                        key: 'abnormal',
                        render: (results) => {
                          if (!results || typeof results !== 'object') return 'N/A';
                          
                          const categories = Object.keys(results);
                          if (categories.length === 0) return 'N/A';
                          
                          return categories.map(category => {
                            const result = results[category];
                            const isAbnormal = result?.abnormal || false;
                            return (
                              <div key={category} style={{ marginBottom: 2 }}>
                                <Tag color={isAbnormal ? 'red' : 'green'}>
                                  {isAbnormal ? 'Bất thường' : 'Bình thường'}
                                </Tag>
                              </div>
                            );
                          });
                        }
                      },
                      {
                        title: 'Thời gian khám',
                        dataIndex: 'overallResults',
                        key: 'performedAt',
                        render: (overallResults) => {
                          if (!overallResults?.performedAt) return 'N/A';
                          return formatDate(overallResults.performedAt);
                        }
                      }
                    ]}
                    pagination={{ pageSize: 5 }}
                    rowKey={(record) => record.id || Math.random()}
                    size="small"
                  />
                )
              }
            ]}
          />
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
