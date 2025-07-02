import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Typography,
  Row,
  Col,
  Alert,
  Input,
  Tabs,
  Badge,
  Descriptions,
  Popconfirm
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { parentApi } from '../../../api/parentApi';
import { useAuth } from '../../../contexts/AuthContext';
import '../../../styles/HealthCheckNotifications.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const HealthCheckNotifications = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseType, setResponseType] = useState('');
  const [parentNote, setParentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const { getToken } = useAuth();

  useEffect(() => {
    fetchHealthCheckForms();
  }, [activeTab]);

  const fetchHealthCheckForms = async () => {
    try {
      setLoading(true);
      let response;
      if (activeTab === 'all') {
        response = await parentApi.getHealthCheckForms(getToken());
      } else {
        response = await parentApi.getHealthCheckFormsByStatus(activeTab.toUpperCase(), getToken());
      }
      setForms(response || []);
      
      // Debug: log the response to console
      console.log('Health check forms loaded:', response);
    } catch (error) {
      console.error('Error fetching health check forms:', error);
      message.error('Lỗi khi tải thông tin đợt khám sức khỏe');
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: 'warning', text: 'Chờ phản hồi' },
      CONFIRMED: { color: 'success', text: 'Đã đồng ý' },
      DECLINED: { color: 'error', text: 'Từ chối' },
      SCHEDULED: { color: 'processing', text: 'Đã lên lịch' },
      CHECKED_IN: { color: 'cyan', text: 'Đã check-in' },
      COMPLETED: { color: 'default', text: 'Hoàn thành' }
    };
    return <Tag color={statusMap[status]?.color || 'default'}>{statusMap[status]?.text || status}</Tag>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const showDetailModal = (form) => {
    setSelectedForm(form);
    setDetailModalVisible(true);
  };

  const showResponseModal = (form, type) => {
    setSelectedForm(form);
    setResponseType(type);
    setParentNote('');
    setResponseModalVisible(true);
  };

  const handleResponse = async () => {
    if (!selectedForm) return;

    try {
      setSubmitting(true);
      if (responseType === 'confirm') {
        await parentApi.confirmHealthCheckForm(selectedForm.id, parentNote, getToken());
        message.success('Đã xác nhận đồng ý cho con tham gia khám sức khỏe');
      } else {
        await parentApi.declineHealthCheckForm(selectedForm.id, parentNote, getToken());
        message.success('Đã gửi phản hồi từ chối tham gia khám sức khỏe');
      }
      
      setResponseModalVisible(false);
      setParentNote('');
      await fetchHealthCheckForms(); // Refresh the list
    } catch (error) {
      console.error('Error responding to health check form:', error);
      message.error('Lỗi khi gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Đợt khám sức khỏe',
      dataIndex: 'campaign',
      key: 'campaign',
      render: (campaign) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{campaign?.name || 'N/A'}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {campaign?.description || ''}
          </div>
        </div>
      )
    },
    {
      title: 'Học sinh',
      dataIndex: 'student',
      key: 'student',
      render: (student) => (
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {student?.fullName || 'N/A'}
        </div>
      )
    },
    {
      title: 'Ngày khám dự kiến',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (dateTime) => (
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {formatDateTime(dateTime)}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => showDetailModal(record)}
          >
            Chi tiết
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Popconfirm
                title="Xác nhận đồng ý"
                description="Bạn có đồng ý cho con mình tham gia đợt khám sức khỏe này không?"
                onConfirm={() => showResponseModal(record, 'confirm')}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                >
                  Đồng ý
                </Button>
              </Popconfirm>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => showResponseModal(record, 'decline')}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const getTabCount = (status) => {
    if (status === 'all') {
      return forms.length;
    }
    return forms.filter(form => form.status === status.toUpperCase()).length;
  };

  return (
    <div className="health-check-notifications" style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>
          <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Thông báo khám sức khỏe
        </Title>

        <Alert
          message="Thông tin quan trọng"
          description="Đây là các thông báo về đợt khám sức khỏe từ nhà trường. Vui lòng xem xét và phản hồi kịp thời để nhà trường có thể sắp xếp lịch khám phù hợp."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
        >
          <TabPane
            tab={
              <Badge count={getTabCount('pending')} offset={[10, 0]}>
                Chờ phản hồi
              </Badge>
            }
            key="pending"
          />
          <TabPane
            tab={
              <Badge count={getTabCount('confirmed')} offset={[10, 0]}>
                Đã đồng ý
              </Badge>
            }
            key="confirmed"
          />
          <TabPane
            tab={
              <Badge count={getTabCount('declined')} offset={[10, 0]}>
                Đã từ chối
              </Badge>
            }
            key="declined"
          />
          <TabPane
            tab={
              <Badge count={getTabCount('all')} offset={[10, 0]}>
                Tất cả
              </Badge>
            }
            key="all"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={forms}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`
          }}
          locale={{
            emptyText: 'Không có thông báo khám sức khỏe nào'
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đợt khám sức khỏe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedForm && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên đợt khám">
                {selectedForm.campaign?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">
                {selectedForm.campaign?.description || 'Không có mô tả'}
              </Descriptions.Item>
              <Descriptions.Item label="Học sinh">
                {selectedForm.student?.fullName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp">
                {selectedForm.student?.className || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám dự kiến">
                {formatDateTime(selectedForm.appointmentTime)}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm khám">
                {selectedForm.appointmentLocation || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedForm.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {formatDateTime(selectedForm.createdAt)}
              </Descriptions.Item>
              {selectedForm.parentNote && (
                <Descriptions.Item label="Ghi chú của phụ huynh">
                  {selectedForm.parentNote}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedForm.status === 'PENDING' && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => showResponseModal(selectedForm, 'confirm')}
                  >
                    Đồng ý tham gia
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => showResponseModal(selectedForm, 'decline')}
                  >
                    Từ chối tham gia
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Response Modal */}
      <Modal
        title={responseType === 'confirm' ? 'Xác nhận tham gia khám sức khỏe' : 'Từ chối tham gia khám sức khỏe'}
        open={responseModalVisible}
        onOk={handleResponse}
        onCancel={() => setResponseModalVisible(false)}
        confirmLoading={submitting}
        okText={responseType === 'confirm' ? 'Đồng ý' : 'Từ chối'}
        cancelText="Hủy"
      >
        {selectedForm && (
          <div>
            <Alert
              message={
                responseType === 'confirm'
                  ? 'Xác nhận đồng ý'
                  : 'Xác nhận từ chối'
              }
              description={
                responseType === 'confirm'
                  ? `Bạn đang xác nhận đồng ý cho ${selectedForm.student?.fullName || 'con bạn'} tham gia đợt khám sức khỏe "${selectedForm.campaign?.name || ''}".`
                  : `Bạn đang từ chối cho ${selectedForm.student?.fullName || 'con bạn'} tham gia đợt khám sức khỏe "${selectedForm.campaign?.name || ''}".`
              }
              type={responseType === 'confirm' ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <div style={{ marginBottom: 8 }}>
              <Text strong>Ghi chú (tuỳ chọn):</Text>
            </div>
            <TextArea
              placeholder={
                responseType === 'confirm'
                  ? 'Nhập ghi chú nếu có (ví dụ: thời gian phù hợp, yêu cầu đặc biệt...)'
                  : 'Nhập lý do từ chối (ví dụ: con đang ốm, có lịch trình khác...)'
              }
              value={parentNote}
              onChange={(e) => setParentNote(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckNotifications;
