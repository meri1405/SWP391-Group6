import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi } from '../../api/parentApi';
import dayjs from 'dayjs';
import { 
  Table, 
  Card, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  message, 
  Modal,
  Typography,
  Divider,
  Row,
  Col,
  Spin,
  Badge
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  MedicineBoxFilled,
  AlertOutlined,
  NumberOutlined
} from '@ant-design/icons';
import '../../styles/NurseMedicationComponents.css';
import '../../styles/NurseMedicationCards.css';
import '../../styles/MedicationNotes.css';

const { Title, Text } = Typography;
const { Option } = Select;

const ParentMedicationSchedules = ({ userInfo }) => {
    const { refreshSession } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    // Status mapping
    const statusConfig = {
        PENDING: { color: 'orange', text: 'Chưa uống', icon: <ClockCircleOutlined /> },
        TAKEN: { color: 'green', text: 'Đã uống', icon: <CheckCircleOutlined /> },
        SKIPPED: { color: 'red', text: 'Bỏ lỡ', icon: <CloseCircleOutlined /> }
    };

    const loadSchedules = useCallback(async () => {
        try {
            setLoading(true);
            refreshSession();
            
            let data;
            
            if (selectedStudent) {
                data = await parentApi.getChildMedicationSchedules(selectedStudent);
            } else {
                const params = {
                    date: selectedDate.format('YYYY-MM-DD'),
                    status: selectedStatus === 'ALL' ? undefined : selectedStatus
                };
                data = await parentApi.getAllChildrenMedicationSchedules(params);
            }
            
            setSchedules(data);
            
            // Extract unique students for filter
            const uniqueStudents = [...new Map(
                data.map(schedule => [schedule.studentId, {
                id: schedule.studentId,
                name: schedule.studentName,
                className: schedule.className
                }])
            ).values()];
            setStudents(uniqueStudents);
            
        } catch (error) {
            console.error('Error loading schedules:', error);
            message.error('Không thể tải danh sách lịch uống thuốc');
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedStatus, selectedStudent, refreshSession]);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    const showScheduleDetail = (schedule) => {
        setSelectedSchedule(schedule);
        setDetailModalVisible(true);
    };

    // Function to process data for row merging
    const processDataForMerging = (data) => {
        if (!data || data.length === 0) return [];

        // Group by student, date, and time for merging student cells only
        const groups = {};
        data.forEach((item, index) => {
            const key = `${item.studentName}_${item.scheduledDate}_${item.scheduledTime}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push({ ...item, originalIndex: index });
        });

        // Process groups to add rowSpan information for student column only
        const processedData = [];
        Object.keys(groups)
        .sort() // Sort to ensure consistent ordering
        .forEach((key) => {
            const group = groups[key];
            group.forEach((item, groupIndex) => {
                processedData.push({
                    ...item,
                    groupKey: key,
                    studentRowSpan: groupIndex === 0 ? group.length : 0, // Only merge student column
                    isFirstInGroup: groupIndex === 0,
                    groupSize: group.length,
                });
            });
        });

        return processedData;
    };

    const columns = [
        {
            title: 'Học sinh',
            key: 'student',
            render: (_, record) => (
                <div className="student-info-cell">
                    <div className="student-name">{record.studentName} - {record.className}</div>
                </div>
            ),
            onCell: (record) => ({
                rowSpan: record.studentRowSpan,
                className: record.studentRowSpan > 0 ? 'merged-student-cell' : '',
            }),
            width: 180,
        },
        {
            title: 'Tên thuốc',
            key: 'medicationName',
            render: (_, record) => (
                <div className="medication-name-cell">
                    <div className="medication-name-main">{record.medicationName}</div>
                </div>
            ),
            width: 180,
        },
        {
            title: 'Ghi chú',
            key: 'nurseNote',
            render: (_, record) => (
                <div className="medication-notes-cell">
                    {record.nurseNote ? (
                        <div className="medication-notes" style={{ color: '#000000' }}>
                            {record.nurseNote}
                        </div>
                    ) : (
                        <span className="no-notes">-</span>
                    )}
                </div>
            ),
            width: 150,
        },
        {
            title: 'Thời gian',
            dataIndex: 'scheduledTime',
            key: 'scheduledTime',
            render: (time) => (
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {time}
                </div>
            ),
            width: 80,
            align: 'center',
        },
        {
            title: 'Ngày',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            render: (date) => (
                <div style={{ textAlign: 'center' }}>
                    {dayjs(date).format('DD/MM/YYYY')}
                </div>
            ),
            width: 100,
            align: 'center',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <div className="status-tag-container">
                    <Tag color={statusConfig[status].color} icon={statusConfig[status].icon}>
                        {statusConfig[status].text}
                    </Tag>
                </div>
            ),
            width: 100,
            align: 'center',
        },
        {
            title: 'Chi tiết',
            key: 'actions',
            render: (_, record) => (
                <div className="action-cell">
                    <Button 
                        size="small" 
                        onClick={() => showScheduleDetail(record)}
                        style={{ width: '80px' }}
                    >
                        Chi tiết
                    </Button>
                </div>
            ),
            width: 100,
            align: 'center',
        },
    ];

    const getStatusSummary = () => {
        const summary = schedules.reduce((acc, schedule) => {
            acc[schedule.status] = (acc[schedule.status] || 0) + 1;
            return acc;
        }, {});
        
        return summary;
    };

    const statusSummary = getStatusSummary();  
    
    return (
        <div className="nurse-medication-container">
            <Card className="nurse-medication-card">
                <div className="medication-dashboard-header">
                    <MedicineBoxFilled style={{ fontSize: '24px', color: '#1890ff', marginRight: '10px' }} />
                    <h2 style={{ margin: 0, fontWeight: 600, fontSize: '20px' }}>Lịch uống thuốc của con</h2>
                </div>
                
                {/* Filters */}
                <div className="filter-container">
                    <div className="filter-item">
                        <div className="filter-label">Ngày:</div>
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                setSelectedStudent(null); // Reset student filter when date changes
                            }}
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            disabled={selectedStudent}
                        />
                    </div>
                    
                    <div className="filter-item">
                        <div className="filter-label">Trạng thái:</div>
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: '100%' }}
                            popupMatchSelectWidth={false}
                        >
                            <Option value="ALL">Tất cả</Option>
                            <Option value="PENDING">Chưa uống</Option>
                            <Option value="TAKEN">Đã uống</Option>
                            <Option value="SKIPPED">Bỏ lỡ</Option>
                        </Select>
                    </div>
                    
                    <div className="filter-item">
                        <div className="filter-label">Học sinh:</div>
                        <Select
                            value={selectedStudent}
                            onChange={(value) => {
                                setSelectedStudent(value);
                                if (value) {
                                    setSelectedStatus('ALL'); // Reset status filter when student is selected
                                }
                            }}
                            placeholder="Chọn học sinh"
                            style={{ width: '100%' }}
                            allowClear
                            popupMatchSelectWidth={false}
                        >
                            {students.map(student => (
                                <Option key={student.id} value={student.id}>
                                    {student.name} - {student.className}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    
                    <div className="filter-item" style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button 
                            type="primary" 
                            onClick={loadSchedules}
                            style={{ marginTop: 'auto' }}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>
                
                {/* Status Summary */}
                <div className="medication-status-grid">
                    <div className="status-card status-card-pending">
                        <div className="status-card-icon"><ClockCircleOutlined /></div>
                        <div className="status-count">
                            {statusSummary.PENDING || 0}
                        </div>
                        <div className="status-label">Chưa uống</div>
                    </div>
                    
                    <div className="status-card status-card-taken">
                        <div className="status-card-icon"><CheckCircleOutlined /></div>
                        <div className="status-count">
                            {statusSummary.TAKEN || 0}
                        </div>
                        <div className="status-label">Đã uống</div>
                    </div>
                    
                    <div className="status-card status-card-missed">
                        <div className="status-card-icon"><AlertOutlined /></div>
                        <div className="status-count">
                            {statusSummary.SKIPPED || 0}
                        </div>
                        <div className="status-label">Bỏ lỡ</div>
                    </div>
                    
                    <div className="status-card status-card-total">
                        <div className="status-card-icon"><NumberOutlined /></div>
                        <div className="status-count">
                            {schedules.length || 0}
                        </div>
                        <div className="status-label">Tổng số</div>
                    </div>
                </div>
                
                {/* Schedules Table */}
                <Spin spinning={loading}>
                    <Table
                        className="schedules-table"
                        columns={columns}
                        dataSource={processDataForMerging(schedules)}
                        rowKey="id"
                        size="small"
                        bordered
                        pagination={{
                            total: schedules.length,
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => 
                                `${range[0]}-${range[1]} của ${total} lịch uống thuốc`,
                            size: "small"
                        }}
                        style={{
                            backgroundColor: '#fff',
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px'
                        }}
                    />
                </Spin>
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết lịch uống thuốc"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedSchedule && (
                    <div>
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Học sinh:</Text>
                                <br />
                                <Text>{selectedSchedule.studentName}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Lớp:</Text>
                                <br />
                                <Text>{selectedSchedule.className}</Text>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Tên thuốc:</Text>
                                <br />
                                <Text>{selectedSchedule.medicationName}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Liều lượng:</Text>
                                <br />
                                <Text>{selectedSchedule.dosage}</Text>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Ngày:</Text>
                                <br />
                                <Text>{dayjs(selectedSchedule.scheduledDate).format('DD/MM/YYYY')}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{selectedSchedule.scheduledTime}</Text>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Trạng thái:</Text>
                                <br />
                                <Tag color={statusConfig[selectedSchedule.status]?.color} icon={statusConfig[selectedSchedule.status]?.icon}>
                                    {statusConfig[selectedSchedule.status]?.text}
                                </Tag>
                            </Col>
                            <Col span={12}>
                                <Text strong>Ghi chú:</Text>
                                <br />
                                {selectedSchedule.nurseNote ? (
                                    <div>
                                        <Text style={{ color: '#000000' }}>{selectedSchedule.nurseNote}</Text>
                                    </div>
                                ) : (
                                    <Text type="secondary" italic>Không có ghi chú</Text>
                                )}
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ParentMedicationSchedules;
