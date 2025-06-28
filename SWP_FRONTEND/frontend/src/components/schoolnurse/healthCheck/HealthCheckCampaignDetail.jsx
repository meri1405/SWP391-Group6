import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Button,
  Spin,
  Tabs,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthCheckApi } from '../../../api/healthCheckApi';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const HealthCheckCampaignDetail = ({ campaignId, onBack, onEdit }) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, title: '', message: '' });

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    setLoading(true);
    try {
      const data = await healthCheckApi.getCampaignById(campaignId);
      setCampaign(data);
      
      // If campaign has started, fetch results
      if (data.status === 'IN_PROGRESS' || data.status === 'COMPLETED') {
        fetchResults();
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      message.error('Không thể tải thông tin chi tiết đợt khám');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setResultsLoading(true);
    try {
      const data = await healthCheckApi.getResultsByCampaign(campaignId);
      setResults(data);
    } catch (error) {
      console.error('Error fetching campaign results:', error);
      message.error('Không thể tải kết quả khám sức khỏe');
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const showConfirmModal = (action, title, message) => {
    setConfirmModal({ visible: true, action, title, message });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ visible: false, action: null, title: '', message: '' });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmModal;
    hideConfirmModal();
    
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'start':
          response = await healthCheckApi.startCampaign(campaignId);
          message.success('Đã bắt đầu đợt khám');
          break;
        case 'complete':
          response = await healthCheckApi.completeCampaign(campaignId);
          message.success('Đã hoàn thành đợt khám');
          break;
        case 'cancel':
          response = await healthCheckApi.cancelCampaign(campaignId, 'Cancelled by nurse');
          message.success('Đã hủy đợt khám');
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }
      
      setCampaign(response);
      
      if (action === 'start' || action === 'complete') {
        fetchResults();
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      message.error(`Không thể thực hiện hành động: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (campaign && campaign.status === 'PENDING') {
      onEdit(campaign);
    } else {
      message.warning('Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT');
    }
  };

  const getActionButtons = () => {
    if (!campaign) return null;

    const buttons = [];
    
    switch (campaign.status) {
      case 'APPROVED':
        buttons.push(
          <Button 
            key="start" 
            type="primary" 
            icon={<PlayCircleOutlined />} 
            onClick={() => showConfirmModal(
              'start', 
              'Xác nhận bắt đầu', 
              'Bạn có chắc chắn muốn bắt đầu đợt khám này?'
            )}
          >
            Bắt đầu khám
          </Button>
        );
        break;
      case 'IN_PROGRESS':
        buttons.push(
          <Button 
            key="complete" 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={() => showConfirmModal(
              'complete', 
              'Xác nhận hoàn thành', 
              'Bạn có chắc chắn muốn đánh dấu đợt khám này là đã hoàn thành?'
            )}
          >
            Hoàn thành
          </Button>
        );
        break;
      default:
        break;
    }
    
    // Add cancel button for certain statuses
    if (['PENDING', 'APPROVED'].includes(campaign.status)) {
      buttons.push(
        <Button 
          key="cancel" 
          danger 
          icon={<CloseCircleOutlined />} 
          onClick={() => showConfirmModal(
            'cancel', 
            'Xác nhận hủy', 
            'Bạn có chắc chắn muốn hủy đợt khám này?'
          )}
        >
          Hủy
        </Button>
      );
    }
    
    return buttons;
  };

  const getStatusTag = (status) => {
    switch(status) {
      case 'PENDING':
        return <Tag color="orange">Chưa duyệt</Tag>;
      case 'APPROVED':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="processing">Đang diễn ra</Tag>;
      case 'COMPLETED':
        return <Tag color="success">Đã hoàn thành</Tag>;
      case 'CANCELED':
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getResultStatusTag = (status) => {
    switch(status) {
      case 'NORMAL':
        return <Tag color="green">Bình thường</Tag>;
      case 'ABNORMAL':
        return <Tag color="red">Bất thường</Tag>;
      case 'NEEDS_FOLLOWUP':
        return <Tag color="orange">Cần theo dõi</Tag>;
      case 'NEEDS_TREATMENT':
        return <Tag color="volcano">Cần điều trị</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const resultColumns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Loại khám',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getResultStatusTag(status),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'resultNotes',
      key: 'resultNotes',
      ellipsis: true,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    }
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Đang tải thông tin đợt khám...</p>
        </div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={4}>Không tìm thấy thông tin đợt khám</Title>
          <Button type="primary" onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              style={{ marginRight: 16 }} 
              onClick={onBack}
            />
            <span>Chi tiết đợt khám sức khỏe</span>
          </div>
        }
        extra={
          <Space>
            {campaign && campaign.status === 'PENDING' && (
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            )}
            {getActionButtons()}
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Thông tin chung" key="info">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card bordered={false}>
                  <Title level={4}>{campaign.name}</Title>
                  <div style={{ marginBottom: 16 }}>
                    {getStatusTag(campaign.status)}
                  </div>
                  <Paragraph>{campaign.description}</Paragraph>
                </Card>
              </Col>

              <Col xs={24} sm={24} md={12}>
                <Card title="Thông tin đợt khám" bordered={false}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Mã đợt khám">#{campaign.id}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian bắt đầu">
                      {dayjs(campaign.startDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian kết thúc">
                      {dayjs(campaign.endDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Địa điểm">{campaign.location}</Descriptions.Item>
                    <Descriptions.Item label="Người tạo">{campaign.nurse?.fullName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                      {dayjs(campaign.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col xs={24} sm={24} md={12}>
                <Card title="Phạm vi khám" bordered={false}>
                  <Descriptions column={1}>
                    <Descriptions.Item label="Độ tuổi">
                      {campaign.minAge} - {campaign.maxAge} tuổi
                    </Descriptions.Item>
                    <Descriptions.Item label="Lớp mục tiêu">
                      {campaign.targetClasses || 'Tất cả các lớp'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại khám">
                      <div>
                        {campaign.categories?.map((category) => (
                          <Tag key={category} color="blue" style={{ marginBottom: 4 }}>
                            {category === 'VISION' && 'Khám mắt'}
                            {category === 'HEARING' && 'Khám tai'}
                            {category === 'ORAL' && 'Khám răng miệng'}
                            {category === 'SKIN' && 'Khám da liễu'}
                            {category === 'RESPIRATORY' && 'Khám hô hấp'}
                          </Tag>
                        ))}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              {campaign.status !== 'PENDING' && (
                <Col span={24}>
                  <Card title="Thống kê" bordered={false}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Statistic 
                          title="Tổng số học sinh" 
                          value={campaign.targetCount || 0} 
                          prefix={<UserOutlined />} 
                        />
                      </Col>
                      <Col span={6}>
                        <Statistic 
                          title="Đã khám" 
                          value={results.length} 
                          suffix={`/ ${campaign.targetCount || 0}`}
                          prefix={<CheckCircleOutlined />} 
                        />
                      </Col>
                      <Col span={6}>
                        <Statistic 
                          title="Kết quả bất thường" 
                          value={results.filter(r => r.status === 'ABNORMAL' || r.status === 'NEEDS_FOLLOWUP' || r.status === 'NEEDS_TREATMENT').length} 
                          prefix={<CloseCircleOutlined />} 
                        />
                      </Col>
                      <Col span={6}>
                        <Statistic 
                          title="Tiến độ" 
                          value={campaign.targetCount ? Math.round((results.length / campaign.targetCount) * 100) : 0} 
                          suffix="%" 
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>

          <TabPane tab="Kết quả khám" key="results" disabled={campaign.status !== 'IN_PROGRESS' && campaign.status !== 'COMPLETED'}>
            <div style={{ marginBottom: 16 }}>
              <Button onClick={fetchResults} loading={resultsLoading}>
                <FileTextOutlined /> Làm mới kết quả
              </Button>
            </div>
            
            <Table 
              columns={resultColumns} 
              dataSource={results.map(result => ({ ...result, key: result.id }))} 
              loading={resultsLoading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={handleConfirmAction}
        onCancel={hideConfirmModal}
        confirmLoading={loading}
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </>
  );
};

export default HealthCheckCampaignDetail; 