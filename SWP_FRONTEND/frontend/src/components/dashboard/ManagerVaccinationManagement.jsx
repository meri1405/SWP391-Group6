import React, { useState, useEffect, useCallback } from 'react';
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
  Form
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { managerVaccinationApi } from '../../api/vaccinationCampaignApi';
import '../../styles/ManagerVaccination.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ManagerVaccinationManagement = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchStatistics = async () => {
    try {
      const stats = await managerVaccinationApi.getCampaignStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPendingCampaigns = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await managerVaccinationApi.getPendingCampaigns(page - 1, size);
      setPendingCampaigns(response.content || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.totalElements || 0
      }));
    } catch (error) {
      message.error('Lỗi khi tải danh sách chiến dịch chờ duyệt');
      console.error('Error fetching pending campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCampaignsByStatus = useCallback(async (status, page = 1, size = 10) => {
    setLoading(true);
    try {
      const response = await managerVaccinationApi.getCampaignsByStatus(status, page - 1, size);
      setAllCampaigns(response.content || []);
      setPagination(prev => ({
        ...prev,
        current: page,
        total: response.totalElements || 0
      }));
    } catch (error) {
      message.error(`Lỗi khi tải danh sách chiến dịch với trạng thái ${status}`);
      console.error(`Error fetching campaigns with status ${status}:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
    fetchPendingCampaigns();
  }, [fetchPendingCampaigns]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingCampaigns();
    } else {
      fetchCampaignsByStatus(activeTab);
    }
  }, [activeTab, fetchPendingCampaigns, fetchCampaignsByStatus]);

  const handleApproveCampaign = async (campaignId) => {
    setLoading(true);
    try {
      const response = await managerVaccinationApi.approveCampaign(campaignId);
      if (response.success) {
        message.success('Phê duyệt chiến dịch thành công!');
        fetchStatistics();
        if (activeTab === 'pending') {
          fetchPendingCampaigns(pagination.current, pagination.pageSize);
        } else {
          fetchCampaignsByStatus(activeTab, pagination.current, pagination.pageSize);
        }
      }
    } catch (error) {
      message.error('Lỗi khi phê duyệt chiến dịch');
      console.error('Error approving campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCampaign = async (campaignId, reason) => {
    setLoading(true);
    try {
      const response = await managerVaccinationApi.rejectCampaign(campaignId, reason);
      if (response.success) {
        message.success('Từ chối chiến dịch thành công!');
        setRejectModalVisible(false);
        form.resetFields();
        fetchStatistics();
        if (activeTab === 'pending') {
          fetchPendingCampaigns(pagination.current, pagination.pageSize);
        } else {
          fetchCampaignsByStatus(activeTab, pagination.current, pagination.pageSize);
        }
      }
    } catch (error) {
      message.error('Lỗi khi từ chối chiến dịch');
      console.error('Error rejecting campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const showCampaignDetail = async (campaignId) => {
    try {
      const campaign = await managerVaccinationApi.getCampaignById(campaignId);
      setSelectedCampaign(campaign);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('Lỗi khi tải thông tin chi tiết chiến dịch');
      console.error('Error fetching campaign details:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { color: 'processing', text: 'Chờ duyệt' },
      APPROVED: { color: 'success', text: 'Đã duyệt' },
      REJECTED: { color: 'error', text: 'Bị từ chối' },
      IN_PROGRESS: { color: 'warning', text: 'Đang tiến hành' },
      COMPLETED: { color: 'default', text: 'Hoàn thành' }
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  const columns = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => (
        <Text strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'vaccineBrand',
      key: 'vaccineBrand',
      width: '15%',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      width: '15%',
      render: (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      title: 'Độ tuổi phù hợp',
      key: 'ageRange',
      width: '12%',
      render: (_, record) => {
        return record.minAge && record.maxAge 
          ? `${Math.floor(record.minAge / 12)} - ${Math.floor(record.maxAge / 12)} tuổi`
          : 'N/A';
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByName',
      key: 'createdByName',
      width: '12%',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approvedByName',
      key: 'approvedByName',
      width: '12%',
      render: (text) => text || 'Chưa duyệt',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '12%',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showCampaignDetail(record.id)}
          >
            Xem
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="Phê duyệt chiến dịch"
                description="Bạn có chắc chắn muốn phê duyệt chiến dịch này?"
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

  const getCurrentData = () => {
    return activeTab === 'pending' ? pendingCampaigns : allCampaigns;
  };

  return (
    <div className="manager-vaccination-management">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pending || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={statistics.approved || 0}
              prefix={<CheckOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Bị từ chối"
              value={statistics.rejected || 0}
              prefix={<CloseOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Đang tiến hành"
              value={statistics.inProgress || 0}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={statistics.completed || 0}
              prefix={<MedicineBoxOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="Tổng cộng"
              value={statistics.total || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Campaign Management Table */}
      <Card title="Quản lý chiến dịch tiêm chủng">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: 'Chờ duyệt',
            },
            {
              key: 'approved',
              label: 'Đã duyệt',
            },
            {
              key: 'rejected',
              label: 'Bị từ chối',
            },
            {
              key: 'in_progress',
              label: 'Đang tiến hành',
            },
            {
              key: 'completed',
              label: 'Hoàn thành',
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={getCurrentData()}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chiến dịch`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
              if (activeTab === 'pending') {
                fetchPendingCampaigns(page, pageSize);
              } else {
                fetchCampaignsByStatus(activeTab, page, pageSize);
              }
            },
          }}
        />
      </Card>

      {/* Campaign Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MedicineBoxOutlined />
            <span>Chi tiết chiến dịch tiêm chủng</span>
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
              description="Bạn có chắc chắn muốn phê duyệt chiến dịch này?"
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
        width={900}
        className="detail-modal vaccination-detail-modal"
      >
        {selectedCampaign && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Tên chiến dịch" span={2}>
              <Text strong style={{ fontSize: '16px', color: '#ff6b35', whiteSpace: 'nowrap' }}>
                {selectedCampaign.name}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thương hiệu">
              <Text strong>{selectedCampaign.vaccineBrand || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <div style={{ fontSize: '14px' }}>
                {getStatusBadge(selectedCampaign.status)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Liều số">
              <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                Liều {selectedCampaign.doseNumber || 'N/A'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tiêm">
              <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                {selectedCampaign.scheduledDate 
                  ? new Date(selectedCampaign.scheduledDate).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'N/A'
                }
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              <Text style={{ fontSize: '14px' }}>
                {selectedCampaign.location || 'N/A'}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Độ tuổi phù hợp">
              <Tag color="green" style={{ fontSize: '13px', padding: '4px 8px' }}>
                {selectedCampaign.minAge && selectedCampaign.maxAge 
                  ? `${Math.floor(selectedCampaign.minAge / 12)} - ${Math.floor(selectedCampaign.maxAge / 12)} tuổi`
                  : 'N/A'
                }
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng vaccine">
              <Text style={{ fontSize: '14px', fontWeight: 500 }}>
                {selectedCampaign.estimatedVaccineCount || 'N/A'} liều
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              <div style={{ fontSize: '14px' }}>
                <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <Text strong>{selectedCampaign.createdByName || 'N/A'}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              <Text style={{ fontSize: '14px' }}>
                {selectedCampaign.createdDate 
                  ? new Date(selectedCampaign.createdDate).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người duyệt">
              <div style={{ fontSize: '14px' }}>
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
            {selectedCampaign.approvedDate && (
              <Descriptions.Item label="Ngày duyệt">
                <Text style={{ fontSize: '14px' }}>
                  {new Date(selectedCampaign.approvedDate).toLocaleDateString('vi-VN')}
                </Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
        
        {selectedCampaign && selectedCampaign.description && (
          <div style={{ marginTop: '20px' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mô tả">
                <div style={{ 
                  padding: '8px', 
                  backgroundColor: '#fff7e6', 
                  borderRadius: '4px', 
                  border: '1px solid #ffd591',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedCampaign.description}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        
        {selectedCampaign && (
          <Descriptions column={2} bordered style={{ marginTop: selectedCampaign.description ? '20px' : '0' }}>
            {selectedCampaign.prePostCareInstructions && (
              <Descriptions.Item label="Hướng dẫn chăm sóc" span={2}>
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#fff7e6', 
                  borderRadius: '4px', 
                  border: '1px solid #ffd591',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedCampaign.prePostCareInstructions}
                </div>
              </Descriptions.Item>
            )}
            {selectedCampaign.rejectionReason && (
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
                  {selectedCampaign.rejectionReason}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Reject Campaign Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CloseOutlined />
            <span>Từ chối chiến dịch</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          form.resetFields();
        }}
        onOk={() => {
          form.validateFields().then(values => {
            handleRejectCampaign(selectedCampaign.id, values.reason);
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
              name="reason"
              label="Lý do từ chối"
              rules={[
                { required: true, message: 'Vui lòng nhập lý do từ chối' },
                { min: 10, message: 'Lý do phải có ít nhất 10 ký tự' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do từ chối chiến dịch..."
                style={{ borderRadius: 6 }}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ManagerVaccinationManagement;
