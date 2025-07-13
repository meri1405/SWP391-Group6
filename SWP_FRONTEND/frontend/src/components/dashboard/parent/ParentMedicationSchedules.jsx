import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { parentApi } from '../../../api/parentApi';
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
import '../../../styles/NurseMedicationComponents.css';
import '../../../styles/NurseMedicationCards.css';
import '../../../styles/MedicationNotes.css';

const { Title, Text } = Typography;
const { Option } = Select;

const ParentMedicationSchedules = () => {
    const { refreshSession } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    // Helper function to format time (HH:mm)
    const formatTime = (time) => {
        if (!time) return time;
        
        // Handle array format [hour, minute] from backend
        if (Array.isArray(time) && time.length >= 2) {
            const hour = time[0].toString().padStart(2, '0');
            const minute = time[1].toString().padStart(2, '0');
            return `${hour}:${minute}`;
        }
        
        // Handle string format "HH:mm:ss.milliseconds" (legacy)
        if (typeof time === 'string' && time.includes(':')) {
            const timeParts = time.split(':');
            if (timeParts.length >= 2) {
                return `${timeParts[0]}:${timeParts[1]}`;
            }
        }
        
        return time;
    };

    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return date;
        
        // Handle array format [year, month, day] from backend
        if (Array.isArray(date) && date.length >= 3) {
            return dayjs().year(date[0]).month(date[1] - 1).date(date[2]);
        }
        
        // Handle string format (legacy)
        return dayjs(date);
    };    // Status mapping - memoized to prevent re-renders
    const statusConfig = useMemo(() => ({
        PENDING: { color: 'orange', text: 'Chưa uống', icon: <ClockCircleOutlined /> },
        TAKEN: { color: 'green', text: 'Đã uống', icon: <CheckCircleOutlined /> },
        SKIPPED: { color: 'red', text: 'Bỏ lỡ', icon: <CloseCircleOutlined /> }
    }), []);const loadSchedules = useCallback(async () => {
        try {
            setLoading(true);
            refreshSession();
            
            let data;
            
            if (selectedStudent) {
                // Get schedules for specific student (backend returns all schedules for that student)
                data = await parentApi.getChildMedicationSchedules(selectedStudent);
            } else {
                // Get schedules for all children with filters
                const dateToUse = selectedDate || dayjs();
                const params = {
                    date: dateToUse.format('YYYY-MM-DD'),
                    status: selectedStatus === 'ALL' ? undefined : selectedStatus
                };
                data = await parentApi.getAllChildrenMedicationSchedules(params);
            }
            
            // Handle backend response structure
            let schedulesArray = [];
            let studentsArray = [];
            
            if (selectedStudent) {
                // For single student: {schedules: [], student: {}}
                if (data && data.schedules) {
                    schedulesArray = Array.isArray(data.schedules) ? data.schedules : [];
                    // Convert single student to array format for consistency
                    if (data.student) {
                        studentsArray = [data.student];
                    }
                } else {
                    schedulesArray = Array.isArray(data) ? data : [];
                }
                
                // Apply frontend filtering when student is selected
                if (selectedStatus && selectedStatus !== 'ALL') {
                    schedulesArray = schedulesArray.filter(schedule => 
                        schedule.status === selectedStatus
                    );
                }
            } else {
                // For all children: {schedules: [], students: []}
                if (data && typeof data === 'object') {
                    schedulesArray = Array.isArray(data.schedules) ? data.schedules : [];
                    studentsArray = Array.isArray(data.students) ? data.students : [];
                } else {
                    schedulesArray = Array.isArray(data) ? data : [];
                }
            }
            
            // If we don't have students info but have schedules, extract from schedules
            if (studentsArray.length === 0 && schedulesArray.length > 0) {
                const uniqueStudents = [...new Map(
                    schedulesArray
                        .filter(schedule => schedule.studentId && schedule.studentName)
                        .map(schedule => [schedule.studentId, {
                            id: schedule.studentId,
                            name: schedule.studentName,
                            className: schedule.className
                        }])
                ).values()];
                studentsArray = uniqueStudents;
            }
            
            setSchedules(schedulesArray);
            setStudents(studentsArray);
            
            // Show info message if no schedules found
            if (schedulesArray.length === 0) {
                if (selectedStudent) {
                    const selectedStudentName = studentsArray.find(s => s.id === selectedStudent)?.name || 'học sinh này';
                    if (selectedStatus && selectedStatus !== 'ALL') {
                        const statusText = statusConfig[selectedStatus]?.text || selectedStatus;
                        message.info(`Không có lịch uống thuốc với trạng thái "${statusText}" cho ${selectedStudentName}`);
                    } else {
                        message.info(`Không có lịch uống thuốc cho ${selectedStudentName}`);
                    }
                } else {
                    const selectedDateStr = selectedDate ? selectedDate.format('DD/MM/YYYY') : 'hôm nay';
                    message.info(`Không có lịch uống thuốc cho ngày ${selectedDateStr}`);
                }
            }
            
        } catch (error) {
            console.error('Error loading schedules:', error);
            
            // Enhanced error handling
            if (error.response?.status === 404) {
                message.info('Không tìm thấy lịch uống thuốc');
            } else if (error.response?.status === 403) {
                message.error('Không có quyền truy cập thông tin này');
            } else {
                message.error('Không thể tải danh sách lịch uống thuốc. Vui lòng thử lại sau.');
            }
            
            setSchedules([]);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, selectedStatus, selectedStudent, refreshSession, statusConfig]);

    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);    const showScheduleDetail = (schedule) => {
        setSelectedSchedule(schedule);
        setDetailModalVisible(true);
    };

    const resetFilters = () => {
        setSelectedDate(dayjs());
        setSelectedStatus('ALL');
        setSelectedStudent(null);
    };

    // Function to process data for row merging
    const processDataForMerging = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) return [];

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
                    {formatTime(time)}
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
                    {formatDate(date).format('DD/MM/YYYY')}
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
        // Ensure schedules is an array before calling reduce
        if (!Array.isArray(schedules)) {
            return {};
        }
        
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
                <div className="filter-container">                    <div className="filter-item">
                        <div className="filter-label">Ngày:</div>
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                if (selectedStudent) {
                                    setSelectedStudent(null); // Reset student filter when date changes
                                }
                            }}
                            format="DD/MM/YYYY"
                            style={{ width: '100%' }}
                            disabled={selectedStudent !== null}
                        />
                    </div>                    <div className="filter-item">
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
                      <div className="filter-item" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <Button 
                            type="primary" 
                            onClick={loadSchedules}
                        >
                            Làm mới
                        </Button>
                        <Button onClick={resetFilters}>
                            Đặt lại bộ lọc
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
                                <Text>{selectedSchedule.dosage} {selectedSchedule.unit || "đơn vị"}</Text>
                            </Col>
                        </Row>
                        
                        <Divider />
                        
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Text strong>Ngày:</Text>
                                <br />
                                <Text>{formatDate(selectedSchedule.scheduledDate).format('DD/MM/YYYY')}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>{formatTime(selectedSchedule.scheduledTime)}</Text>
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
