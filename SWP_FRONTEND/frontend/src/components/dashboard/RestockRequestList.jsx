import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Select, 
  Input, 
  Button, 
  Space,
  message,
  Tooltip,
  Badge,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { restockRequestApi } from '../../api/restockRequestApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const RestockRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [messageApi, contextHolder] = message.useMessage();

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'PENDING', label: 'Chờ duyệt' },
    { value: 'APPROVED', label: 'Đã duyệt' },
    { value: 'REJECTED', label: 'Đã từ chối' },
  ];

  // Load requests on component mount and when filter dependencies change
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.current, pagination.pageSize]);

  // Fetch restock requests based on filters
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let data;
      
      if (statusFilter === 'all') {
        data = await restockRequestApi.getAllRequests();
      } else {
        data = await restockRequestApi.getRequestsByStatus(statusFilter);
      }
      
      // Apply search filter if text entered
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        data = data.filter(request => 
          // Search in request properties
          (request.requesterName && request.requesterName.toLowerCase().includes(searchLower)) ||
          // Search in items
          (request.restockItems && request.restockItems.some(item => 
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.category && item.category.toLowerCase().includes(searchLower))
          ))
        );
      }

      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: data.length
      }));

      setRequests(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      messageApi.error('Không thể tải dữ liệu yêu cầu bổ sung. Vui lòng thử lại sau.');
      console.error('Error fetching restock requests:', error);
    }
  };

  // Handle search with debounce
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Reset to first page when searching
    setPagination(prev => ({...prev, current: 1}));
    
    // Debounce search
    setTimeout(() => {
      fetchRequests();
    }, 300);
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({...prev, current: 1}));
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchText('');
    setStatusFilter('all');
    setPagination(prev => ({...prev, current: 1}));
    fetchRequests();
  };

  // Get status tag based on status value
  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
      case 'APPROVED':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case 'REJECTED':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Get priority tag based on priority value
  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <Tag color="red">Cao</Tag>;
      case 'MEDIUM':
        return <Tag color="orange">Trung bình</Tag>;
      case 'LOW':
        return <Tag color="green">Thấp</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Show request detail modal
  const showRequestDetail = (request) => {
    // Implement detail view logic here
    console.log('Show detail for request:', request);
  };

  // Define table columns
  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Người yêu cầu',
      dataIndex: 'requesterName',
      key: 'requesterName',
      render: (text) => text || 'Không có thông tin',
    },
    {
      title: 'Thời gian yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Số lượng vật tư',
      key: 'itemCount',
      render: (_, record) => record.restockItems ? record.restockItems.length : 0,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => showRequestDetail(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expanded row render to show restock items
  const expandedRowRender = (record) => {
    const itemColumns = [
      {
        title: 'Tên vật tư',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Loại',
        dataIndex: 'category',
        key: 'category',
      },
      {
        title: 'Số lượng yêu cầu',
        dataIndex: 'requestedQuantity',
        key: 'requestedQuantity',
        render: (quantity, item) => `${quantity} ${item.unit || ''}`,
      },
      {
        title: 'Ghi chú',
        dataIndex: 'notes',
        key: 'notes',
        ellipsis: true,
      },
    ];

    return (
      <div style={{ padding: '0 20px' }}>
        <Text strong>Chi tiết vật tư yêu cầu:</Text>
        <Table
          columns={itemColumns}
          dataSource={record.restockItems || []}
          pagination={false}
          rowKey={(item) => `${record.id}-${item.id || item.medicalSupplyId}`}
        />
        {record.reason && (
          <>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong>Lý do yêu cầu:</Text> {record.reason}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="restock-request-list">
      {contextHolder}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Title level={4}>Danh sách yêu cầu bổ sung vật tư y tế</Title>
            {statusFilter !== 'all' && (
              <div style={{ marginTop: -8 }}>
                <Tag color="blue">
                  Đang lọc theo trạng thái: {statusOptions.find(s => s.value === statusFilter)?.label || statusFilter}
                </Tag>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên vật tư, người yêu cầu..."
            value={searchText}
            onChange={handleSearch}
            style={{ width: 300, marginRight: 8 }}
            prefix={<SearchOutlined />}
            allowClear
            onClear={() => {
              setSearchText('');
              setPagination(prev => ({...prev, current: 1}));
              fetchRequests();
            }}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            style={{ width: 200, marginRight: 8 }}
            placeholder="Lọc theo trạng thái"
          >
            {statusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
                {option.value !== 'all' && (
                  <Badge 
                    count={requests.filter(r => r.status === option.value).length}
                    style={{ 
                      marginLeft: 8,
                      backgroundColor: option.value === 'PENDING' ? '#1890ff' : 
                                      option.value === 'APPROVED' ? '#52c41a' : 
                                      option.value === 'REJECTED' ? '#f5222d' : '#999999'
                    }} 
                    overflowCount={999}
                  />
                )}
              </Option>
            ))}
          </Select>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          pagination={pagination}
          onChange={(pagination) => setPagination(pagination)}
          loading={loading}
          expandable={{
            expandedRowRender,
            expandRowByClick: true,
          }}
          locale={{ 
            emptyText: statusFilter !== 'all' 
              ? `Không tìm thấy yêu cầu bổ sung nào với trạng thái "${statusOptions.find(s => s.value === statusFilter)?.label || statusFilter}"` 
              : 'Không có dữ liệu yêu cầu bổ sung vật tư y tế' 
          }}
        />
      </Card>
    </div>
  );
};

export default RestockRequestList; 