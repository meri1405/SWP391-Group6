import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Tooltip, Modal, message, Select, DatePicker } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { healthCheckApi } from '../../../api/healthCheckApi';

const { Option } = Select;
const { RangePicker } = DatePicker;

const HealthCheckCampaignList = ({ onCreateNew, onViewDetails, refreshTrigger }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [filterStatus, dateRange, refreshTrigger]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let data;
      if (filterStatus !== 'ALL') {
        data = await healthCheckApi.getCampaignsByStatus(filterStatus);
      } else {
        data = await healthCheckApi.getNurseCampaigns();
      }
      
      // Apply date range filter if selected
      let filteredData = [...data];
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        filteredData = filteredData.filter(campaign => {
          const campaignStartDate = dayjs(campaign.startDate);
          return campaignStartDate.isAfter(startDate) && campaignStartDate.isBefore(endDate);
        });
      }
      
      setCampaigns(filteredData);
    } catch (error) {
      message.error('Không thể tải danh sách đợt khám sức khỏe');
      console.error('Error fetching campaigns:', error);
      // Set mock data for development if needed
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (campaign) => {
    setSelectedCampaign(campaign);
    setConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;
    
    setLoading(true);
    try {
      // Backend currently doesn't support delete, we could implement cancel instead
      const notes = "Cancelled by nurse";
      await healthCheckApi.cancelCampaign(selectedCampaign.id, notes);
      message.success('Đã hủy đợt khám sức khỏe');
      setConfirmDeleteModal(false);
      fetchCampaigns();
    } catch (error) {
      message.error('Không thể hủy đợt khám. Chỉ có thể hủy đợt khám ở trạng thái CHƯA DUYỆT.');
      console.error('Error canceling campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    if (campaign.status !== 'PENDING') {
      message.warning('Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT');
      return;
    }
    onCreateNew(campaign); // Pass campaign data to edit
  };

  const handleViewDetails = (campaign) => {
    onViewDetails(campaign.id);
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

  const columns = [
    {
      title: 'Tên đợt khám',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Thời gian bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Thời gian kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: date => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small" 
              disabled={!['DRAFT', 'PENDING'].includes(record.status)}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Hủy">
            <Button 
              danger 
              icon={<CloseCircleOutlined />} 
              size="small" 
              disabled={!['DRAFT', 'PENDING', 'APPROVED'].includes(record.status)}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title="Danh sách đợt khám sức khỏe" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => onCreateNew()}
          >
            Tạo đợt khám mới
          </Button>
        }
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Select 
              defaultValue="ALL" 
              style={{ width: 150 }} 
              onChange={value => setFilterStatus(value)}
            >
              <Option value="ALL">Tất cả trạng thái</Option>
              <Option value="PENDING">Chưa duyệt</Option>
              <Option value="APPROVED">Đã duyệt</Option>
              <Option value="IN_PROGRESS">Đang diễn ra</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELED">Đã hủy</Option>
            </Select>
            <RangePicker 
              onChange={dates => setDateRange(dates)} 
              format="DD/MM/YYYY"
            />
          </Space>
          <Button onClick={fetchCampaigns}>Làm mới</Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={campaigns.map(campaign => ({ ...campaign, key: campaign.id }))} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          rowClassName={record => record.status === 'CANCELED' ? 'cancelled-row' : ''}
        />
      </Card>

      <Modal
        title="Xác nhận hủy đợt khám"
        open={confirmDeleteModal}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteModal(false)}
        confirmLoading={loading}
      >
        <p>Bạn có chắc chắn muốn hủy đợt khám <strong>{selectedCampaign?.name}</strong>?</p>
      </Modal>
    </>
  );
};

export default HealthCheckCampaignList; 