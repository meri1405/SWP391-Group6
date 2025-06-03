import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Space, 
  Modal, 
  Input, 
  message, 
  Descriptions, 
  Divider,
  Tooltip,
  Popconfirm,
  Typography
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  EyeOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { nurseApi } from '../../api/nurseApi';
import '../../styles/NurseMedicationComponents.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const NurseMedicationRequests = () => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [medicationRequests, setMedicationRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectionLoading, setRejectionLoading] = useState(false);

  const fetchPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const requests = await nurseApi.getPendingMedicationRequests(token);
      setMedicationRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      message.error('Không thể tải danh sách yêu cầu thuốc');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);
  const handleApprove = async (requestId) => {
    try {
      setLoading(true);
      await nurseApi.approveMedicationRequest(requestId);
      message.success('Đã duyệt yêu cầu thuốc thành công');
      
      // Update local state
      setMedicationRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
    } catch (error) {
      console.error('Error approving request:', error);
      message.error('Có lỗi xảy ra khi duyệt yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const showRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectNote('');
    setRejectModalVisible(true);
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }    try {
      setRejectionLoading(true);
      await nurseApi.rejectMedicationRequest(selectedRequest.id, rejectNote);
      message.success('Đã từ chối yêu cầu thuốc');
      
      // Update local state
      setMedicationRequests(prev => 
        prev.filter(req => req.id !== selectedRequest.id)
      );
      
      setRejectModalVisible(false);
      setSelectedRequest(null);
      setRejectNote('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      message.error('Có lỗi xảy ra khi từ chối yêu cầu');
    } finally {
      setRejectionLoading(false);
    }
  };

  const showDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Chờ duyệt</Tag>;
      case 'APPROVED':
        return <Tag icon={<CheckOutlined />} color="success">Đã duyệt</Tag>;
      case 'REJECTED':
        return <Tag icon={<CloseOutlined />} color="error">Từ chối</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Thời gian sử dụng',
      key: 'period',
      render: (_, record) => (
        <span>
          {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
        </span>
      )
    },
    {
      title: 'Số loại thuốc',
      key: 'medicationCount',
      render: (_, record) => (
        <span>{record.itemRequests?.length || 0} loại</span>
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
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc muốn duyệt yêu cầu này không?"
            onConfirm={() => handleApprove(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Duyệt yêu cầu">
              <Button 
                type="link" 
                icon={<CheckOutlined />}
                style={{ color: '#52c41a' }}
              />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="Từ chối yêu cầu">
            <Button 
              type="link" 
              icon={<CloseOutlined />}
              danger
              onClick={() => showRejectModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];  return (
    <div className="nurse-medication-container">
      <Card className="nurse-medication-card">        <Title level={3} className="nurse-medication-title">
          <MedicineBoxOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Quản lý yêu cầu thuốc từ phụ huynh
        </Title>
        
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Danh sách yêu cầu chờ duyệt ({medicationRequests.length})</Title>
          <Button onClick={fetchPendingRequests} loading={loading}>
            Làm mới
          </Button>
        </div>
          <Table
          className="medication-requests-table"
          dataSource={medicationRequests}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Không có yêu cầu thuốc nào chờ duyệt' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thuốc"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedRequest(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedRequest && (
          <div className="request-detail">
            <Descriptions title="Thông tin cơ bản" bordered size="small">
              <Descriptions.Item label="ID" span={1}>{selectedRequest.id}</Descriptions.Item>
              <Descriptions.Item label="Học sinh" span={2}>{selectedRequest.studentName}</Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu" span={1}>
                {dayjs(selectedRequest.requestDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian sử dụng" span={2}>
                {dayjs(selectedRequest.startDate).format('DD/MM/YYYY')} - {dayjs(selectedRequest.endDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={3}>
                {getStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={3}>
                {selectedRequest.note || 'Không có ghi chú'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Danh sách thuốc ({selectedRequest.itemRequests?.length || 0} loại)</Title>
            {selectedRequest.itemRequests && selectedRequest.itemRequests.length > 0 ? (
              <div className="medication-items">
                {selectedRequest.itemRequests.map((item, index) => (
                  <Card key={item.id || index} size="small" className="medication-item">
                    <div className="item-header">
                      <Title level={5}>{index + 1}. {item.itemName}</Title>
                      <Tag color="blue">{item.itemType}</Tag>
                    </div>
                    <div className="item-details">
                      <p><strong>Mục đích:</strong> {item.purpose}</p>
                      <p><strong>Liều lượng:</strong> {item.dosage} {
                        item.itemType === 'TABLET' || item.itemType === 'CAPSULE' ? 'viên' :
                        item.itemType === 'LIQUID' || item.itemType === 'INJECTION' ? 'ml' :
                        item.itemType === 'CREAM' || item.itemType === 'POWDER' ? 'g' : 'đơn vị'
                      }</p>                      <p><strong>Tần suất:</strong> {item.frequency} lần/ngày</p>
                      <p><strong>Thời gian uống:</strong> {(() => {
                        let scheduleTimes = [];
                        
                        // First try to get scheduleTimes directly from the item
                        if (Array.isArray(item.scheduleTimes) && item.scheduleTimes.length > 0) {
                          scheduleTimes = item.scheduleTimes;
                        }
                        // If not found, try to parse from note
                        else if (item.note) {
                          const scheduleTimeMatch = item.note.match(/scheduleTimeJson:(\{[^}]+\})/);
                          if (scheduleTimeMatch) {
                            try {
                              const scheduleTimeJson = JSON.parse(scheduleTimeMatch[1]);
                              if (Array.isArray(scheduleTimeJson.scheduleTimes)) {
                                scheduleTimes = scheduleTimeJson.scheduleTimes;
                              }
                            } catch (e) {
                              console.error('Error parsing schedule times from note:', e);
                            }
                          }
                        }

                        // Sort time slots for consistent display
                        scheduleTimes = scheduleTimes
                          .map(time => dayjs(time, 'HH:mm'))
                          .sort((a, b) => a.isBefore(b) ? -1 : a.isAfter(b) ? 1 : 0)
                          .map(time => time.format('HH:mm'));
                        
                        return scheduleTimes.length > 0 ? (
                          <span className="medication-schedule-times">
                            {scheduleTimes.map((time, timeIndex) => (
                              <Tag key={timeIndex} color="blue" style={{marginRight: '4px', marginBottom: '4px'}}>
                                {time}
                              </Tag>
                            ))}
                          </span>
                        ) : (
                          <span className="no-schedule-times">Chưa thiết lập</span>
                        );
                      })()}</p>
                      {item.note && <p><strong>Ghi chú:</strong> {(() => {
                        // Show cleaned note without schedule times JSON
                        let displayNote = item.note;
                        if (displayNote) {
                          // Remove scheduleTimeJson part if exists
                          displayNote = displayNote.replace(/scheduleTimeJson:.*?($|\s)/, '').trim();
                        }
                        return displayNote || 'Không có ghi chú';
                      })()}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p>Không có thông tin thuốc</p>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu thuốc"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedRequest(null);
          setRejectNote('');
        }}
        okText="Từ chối"
        cancelText="Hủy"
        confirmLoading={rejectionLoading}
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc muốn từ chối yêu cầu thuốc này không?</p>
        <p><strong>Học sinh:</strong> {selectedRequest?.studentName}</p>
        <p><strong>Ngày yêu cầu:</strong> {selectedRequest && dayjs(selectedRequest.requestDate).format('DD/MM/YYYY')}</p>
        
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Lý do từ chối <span style={{ color: 'red' }}>*</span>
          </label>
          <TextArea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu thuốc..."
            maxLength={500}
          />
        </div>
      </Modal>
    </div>
  );
};

export default NurseMedicationRequests;
