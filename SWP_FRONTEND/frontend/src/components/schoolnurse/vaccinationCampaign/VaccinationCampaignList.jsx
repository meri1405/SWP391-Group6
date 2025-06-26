import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Tooltip, Modal, message, Select, DatePicker } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  SendOutlined,
  FileAddOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { vaccinationCampaignApi } from '../../../api/vaccinationCampaignApi';

const { Option } = Select;
const { RangePicker } = DatePicker;

const VaccinationCampaignList = ({ onCreateNew, onViewDetails }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [filterStatus, dateRange]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await vaccinationCampaignApi.getAllCampaigns();
      let filteredData = [...data];
      
      // Apply status filter
      if (filterStatus !== 'ALL') {
        filteredData = filteredData.filter(campaign => campaign.status === filterStatus);
      }
      
      // Apply date range filter
      if (dateRange && dateRange.length === 2) {
        const startDate = dateRange[0].startOf('day');
        const endDate = dateRange[1].endOf('day');
        filteredData = filteredData.filter(campaign => {
          const campaignDate = dayjs(campaign.scheduledDate);
          return campaignDate.isAfter(startDate) && campaignDate.isBefore(endDate);
        });
      }
      
      setCampaigns(filteredData);
    } catch (error) {
      message.error('Không thể tải danh sách chiến dịch tiêm chủng');
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaign) => {
    setSelectedCampaign(campaign);
    setConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCampaign) return;
    
    setLoading(true);
    try {
      await vaccinationCampaignApi.deleteCampaign(selectedCampaign.id);
      message.success('Đã xóa chiến dịch tiêm chủng');
      setConfirmDeleteModal(false);
      fetchCampaigns();
    } catch (error) {
      message.error('Không thể xóa chiến dịch. Chỉ có thể xóa chiến dịch ở trạng thái CHƯA DUYỆT.');
      console.error('Error deleting campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (campaign) => {
    if (campaign.status !== 'PENDING') {
      message.warning('Chỉ có thể chỉnh sửa chiến dịch ở trạng thái CHƯA DUYỆT');
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
      case 'REJECTED':
        return <Tag color="red">Đã từ chối</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="blue">Đang thực hiện</Tag>;
      case 'COMPLETED':
        return <Tag color="purple">Đã hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag color="gray">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'Tên chiến dịch',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <a onClick={() => handleViewDetails(record)}>{text}</a>
      ),
    },
    {
      title: 'Loại vắc xin',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      sorter: (a, b) => a.vaccineName.localeCompare(b.vaccineName),
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      sorter: (a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate),
      render: date => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Vị trí',
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
      title: 'Số vắc xin',
      dataIndex: 'estimatedVaccineCount',
      key: 'estimatedVaccineCount',
      sorter: (a, b) => a.estimatedVaccineCount - b.estimatedVaccineCount,
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
              disabled={record.status !== 'PENDING'}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              disabled={record.status !== 'PENDING'}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title="Danh sách chiến dịch tiêm chủng" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => onCreateNew()}
          >
            Tạo chiến dịch mới
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
              <Option value="REJECTED">Đã từ chối</Option>
              <Option value="IN_PROGRESS">Đang thực hiện</Option>
              <Option value="COMPLETED">Đã hoàn thành</Option>
              <Option value="CANCELLED">Đã hủy</Option>
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
          rowClassName={record => record.status === 'CANCELLED' ? 'cancelled-row' : ''}
        />
      </Card>

      <Modal
        title="Xác nhận xóa"
        open={confirmDeleteModal}
        onOk={confirmDelete}
        onCancel={() => setConfirmDeleteModal(false)}
        confirmLoading={loading}
      >
        <p>Bạn có chắc chắn muốn xóa chiến dịch <strong>{selectedCampaign?.name}</strong>?</p>
      </Modal>
    </>
  );
};

export default VaccinationCampaignList; 