import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker, 
  Checkbox,
  message, 
  Modal, 
  Table, 
  Tag, 
  Spin, 
  Tabs, 
  Tooltip, 
  Popconfirm,
  Space,
  Divider,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MedicineBoxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { parentApi } from '../../api/parentApi';
import '../../styles/MedicationManagement.css';
import ParentMedicationSchedules from './ParentMedicationSchedules';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title } = Typography;

const MedicationManagement = () => {
  const [form] = Form.useForm();
  const { getToken } = useAuth();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [medicationRequests, setMedicationRequests] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [tabKey, setTabKey] = useState('active');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMedicationDetail, setSelectedMedicationDetail] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch students and medication requests
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Fetch students and medication requests in parallel
      const [studentsData, medicationData] = await Promise.all([
        parentApi.getMyStudents(token),
        parentApi.getMedicationRequests(token)
      ]);
      
      console.log('Students data received:', studentsData);
      console.log('Medication data received:', medicationData);
      
      // Filter out any students with null or undefined IDs
      // Backend returns studentID, so we need to map it to id for frontend compatibility
      const validStudents = Array.isArray(studentsData) 
        ? studentsData.filter(student => student && student.studentID).map(student => ({
            ...student,
            id: student.studentID  // Map studentID to id for frontend compatibility
          }))
        : [];
        
      // Ensure medication data is an array
      const validMedications = Array.isArray(medicationData)
        ? medicationData.filter(med => med && med.id)
        : [];
      
      console.log('Valid students after filtering:', validStudents);
      console.log('Valid medications after filtering:', validMedications);
      
      // Map medication data to ensure it has the expected format and fix student ID mapping
      const formattedMedications = validMedications.map(med => {
        // Make sure itemRequests is always an array
        if (!med.itemRequests) {
          med.itemRequests = [];
        }
        
        // If the student name doesn't exist but we have the student ID, try to get it from the students array
        if (!med.studentName && med.studentId) {
          const student = validStudents.find(s => s.id === med.studentId);
          if (student) {
            med.studentName = `${student.firstName} ${student.lastName}`;
          }
        }
        
        return med;
      });
      
      setStudents(validStudents);
      setMedicationRequests(formattedMedications);
      
      // Select the first student by default if available
      if (validStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(validStudents[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Show modal for adding a new medication request
  const showAddModal = () => {
    setIsEdit(false);
    setCurrentMedication(null);
    setIsConfirmed(false);
    form.resetFields();
    
    // Set default values
    const defaultValues = {
      startDate: dayjs(),
      endDate: dayjs().add(7, 'day'),
      itemRequests: [{ itemType: 'TABLET' }] // Default first empty medication item
    };
    
    // Add student ID if available
    if (students && students.length > 0) {
      // Find a valid student to use
      let validStudentId = null;
      
      // First try to use the selected ID if it exists in the students array
      if (selectedStudentId) {
        const studentExists = students.some(s => s.id === selectedStudentId);
        if (studentExists) {
          validStudentId = selectedStudentId;
        }
      }
      
      // If no valid selected ID, use the first student
      if (!validStudentId && students[0] && students[0].id) {
        validStudentId = students[0].id;
      }
      
      if (validStudentId) {
        defaultValues.studentId = validStudentId;
        // Also update the selected student ID state
        setSelectedStudentId(validStudentId);
        console.log('Setting default student ID:', validStudentId);
      } else {
        console.warn('No valid student ID found to set as default');
      }
    }
    
    form.setFieldsValue(defaultValues);
    setVisible(true);
  };
  // Show modal for editing an existing medication request
  const showEditModal = async (record) => {
    try {
      setIsEdit(true);
      setCurrentMedication(record);
      setIsConfirmed(record.isConfirmed);
      
      // Fetch detailed medication request data to get item IDs
      const token = getToken();
      console.log('Fetching detailed data for edit modal, ID:', record.id);
      
      const detailedData = await parentApi.getMedicationRequestDetails(token, record.id);
      console.log('Detailed data for edit modal:', detailedData);
      
      // Use detailed data if available, fallback to record data
      const medicationData = detailedData || record;
        // Format the data for the form with proper item IDs
      const formData = {
        studentId: medicationData.studentId,
        startDate: dayjs(medicationData.startDate),
        endDate: dayjs(medicationData.endDate),
        note: medicationData.note,
        itemRequests: (medicationData.itemRequests || []).map(item => {
          console.log('Processing item for form:', item);
          return {
            ...item,
            // Ensure we have the item ID for updating existing items - only include if it's a valid number
            ...(item.id && typeof item.id === 'number' && item.id > 0 ? { id: item.id } : {})
          };
        })
      };
      
      console.log('Form data for edit modal:', formData);
      console.log('Item requests with IDs:', formData.itemRequests.map(item => ({ id: item.id, itemName: item.itemName })));
      form.setFieldsValue(formData);
      setVisible(true);
    } catch (error) {
      console.error('Error loading medication details for edit:', error);
      message.error('Không thể tải chi tiết yêu cầu thuốc để chỉnh sửa. Vui lòng thử lại.');
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    console.log('Form values submitted:', values);
    
    // Validate if the checkbox is confirmed
    if (!isConfirmed) {
      message.error('Vui lòng xác nhận thông tin thuốc là chính xác');
      return;
    }
    
    // Additional validation for student selection
    if (!values.studentId) {
      message.error('Vui lòng chọn học sinh');
      return;
    }
    
    try {
      setLoading(true);
      const token = getToken();
      
      // Format today's date in YYYY-MM-DD
      const today = dayjs().format('YYYY-MM-DD');
      
      // Check if we have medication items
      if (!Array.isArray(values.itemRequests) || values.itemRequests.length === 0) {
        message.error('Vui lòng thêm ít nhất một loại thuốc');
        setLoading(false);
        return;
      }
        // Prepare data for API according to the expected format
      const medicationData = {
        studentId: values.studentId,
        requestDate: today,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        note: values.note || "Yêu cầu dùng thuốc cho học sinh",        itemRequests: values.itemRequests.map((item, index) => {
          const processedItem = {
            // Only include ID for existing items when editing - must be a valid number
            ...(item.id && typeof item.id === 'number' && item.id > 0 ? { id: item.id } : {}),
            itemName: item.itemName,
            purpose: item.purpose,
            itemType: item.itemType,
            dosage: Number(item.dosage),
            frequency: Number(item.frequency),
            note: item.note || ""
          };
          
          console.log(`Processing item ${index}:`, {
            original: item,
            processed: processedItem,
            hasValidId: item.id && typeof item.id === 'number' && item.id > 0
          });
          
          return processedItem;
        })
      };
        console.log('Sending medication data to API:', medicationData);
      console.log('itemRequests with IDs:', medicationData.itemRequests);
        if (isEdit) {
        // Update existing request
        console.log('Updating medication request with ID:', currentMedication.id);
        
        // Validate that only PENDING requests can be updated
        if (currentMedication.status !== 'PENDING') {
          message.error('Chỉ có thể chỉnh sửa yêu cầu thuốc đang chờ duyệt');
          setLoading(false);
          return;
        }
        
        try {
          const updatedRequest = await parentApi.updateMedicationRequest(token, currentMedication.id, medicationData);
          console.log('Updated medication request response:', updatedRequest);
          
          // Update the local state with the updated request
          setMedicationRequests(prev => 
            prev.map(req => 
              req.id === currentMedication.id 
                ? {
                    ...updatedRequest,
                    studentName: updatedRequest.studentName || (() => {
                      const student = students.find(s => s.id === updatedRequest.studentId);
                      return student ? `${student.firstName} ${student.lastName}` : currentMedication.studentName;
                    })()
                  }
                : req
            )
          );
          
          message.success('Cập nhật yêu cầu thuốc thành công');
        } catch (apiError) {
          console.error('API Error during update:', apiError);
          
          // Display specific error message from API
          if (apiError.message) {
            message.error(apiError.message);
          } else {
            message.error('Có lỗi xảy ra khi cập nhật yêu cầu thuốc. Vui lòng thử lại sau.');
          }
          
          setLoading(false);
          return;
        }
      } else {
        // Create new request
        const newRequest = await parentApi.createMedicationRequest(token, medicationData);
        console.log('New medication request response:', newRequest);
        
        // If the API returned the new request with all data, add it to our state directly
        if (newRequest && newRequest.id) {
          setMedicationRequests(prev => {
            // Create a properly formatted medication request with the returned data
            const formattedRequest = {
              ...newRequest,
              // Ensure studentName is set
              studentName: newRequest.studentName || (() => {
                const student = students.find(s => s.id === newRequest.studentId);
                return student ? `${student.lastName} ${student.firstName}` : 'N/A';
              })()
            };
            
            return [formattedRequest, ...prev];
          });
        } else {
          // If not, fetch all data again
          fetchData();
        }
        
        message.success('Tạo yêu cầu thuốc mới thành công');
      }
      
      // Close the modal
      setVisible(false);
    } catch (error) {
      console.error('Error submitting medication request:', error);
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  // Handle delete medication request
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Find the medication request to validate status
      const medicationToDelete = medicationRequests.find(req => req.id === id);
      if (!medicationToDelete) {
        message.error('Không tìm thấy yêu cầu thuốc');
        setLoading(false);
        return;
      }
      
      // Validate that only PENDING requests can be deleted
      if (medicationToDelete.status !== 'PENDING') {
        message.error('Chỉ có thể xóa yêu cầu thuốc đang chờ duyệt');
        setLoading(false);
        return;
      }
      
      console.log('Deleting medication request with ID:', id);
      
      // Optimistic update - remove from UI immediately
      const previousRequests = medicationRequests;
      setMedicationRequests(prev => prev.filter(req => req.id !== id));
      
      try {
        await parentApi.deleteMedicationRequest(token, id);
        console.log('Successfully deleted medication request');
        message.success('Xóa yêu cầu thuốc thành công');
        
        // Optional: refresh data to ensure consistency
        // Uncomment the line below if you want to refresh from server
        // fetchData();
        
      } catch (apiError) {
        console.error('API Error during deletion:', apiError);
        
        // Rollback optimistic update on error
        setMedicationRequests(previousRequests);
        
        // Display specific error message from API
        if (apiError.message) {
          message.error(apiError.message);
        } else {
          message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc. Vui lòng thử lại sau.');
        }
      }
      
    } catch (error) {
      console.error('Error deleting medication request:', error);
      message.error('Có lỗi xảy ra khi xóa yêu cầu thuốc');
    } finally {
      setLoading(false);
    }
  };

  // Get status tag for medication request
  const getStatusTag = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Tag icon={<CheckCircleOutlined />} color="success"> Đã duyệt</Tag>;
      case 'REJECTED':
        return <Tag icon={<CloseCircleOutlined />} color="error"> Đã từ chối</Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="processing"> Đang chờ duyệt</Tag>;
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="blue"> Đã hoàn thành</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Table columns for medication requests
  const columns = [
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => {
        // If studentName exists in the record, use it directly
        if (record.studentName) {
          return record.studentName;
        }
        
        // Otherwise, try to find the student in the students array
        const student = students.find(s => s.id === record.studentId);
        return student ? `${student.lastName} ${student.firstName}` : 'N/A';
      }
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
    },    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 250,
      render: (text) => {
        // Only display the main medication request note
        const generalNote = text || '';
        
        return (
          <div className="note-column-content">
            {generalNote ? (
              <div className="general-note-inline">{generalNote}</div>
            ) : (
              <span className="empty-note">Không có ghi chú</span>
            )}
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getStatusTag(record.status)
    },    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Tooltip title="Chỉnh sửa yêu cầu">
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => showEditModal(record)}
                />
              </Tooltip>
              <Popconfirm
                title="Bạn có chắc muốn xóa yêu cầu này không?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip title="Xóa yêu cầu">
                  <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Tooltip title="Xem lịch uống thuốc">
              <Button
                type="link"
                onClick={() => setTabKey('schedules')}
                style={{ color: '#1890ff' }}
              >
                Xem lịch uống thuốc
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết các loại thuốc">
            <Button 
              type="link" 
              icon={<InfoCircleOutlined />}
              onClick={async () => {
                console.log('View details button clicked for record:', record);
                
                try {
                  // Fetch detailed medication request data from backend
                  const token = getToken();
                  console.log('Fetching details for medication request ID:', record.id);
                  
                  const detailedData = await parentApi.getMedicationRequestDetails(token, record.id);
                  console.log('Detailed medication data received:', detailedData);
                  
                  // Use the detailed data from backend, fallback to record data if needed
                  const medicationData = detailedData || record;
                  const items = medicationData.itemRequests || [];
                  
                  console.log('Items to display:', items);
                  
                  // Set the data and show the modal
                  setSelectedMedicationDetail(medicationData);
                  setDetailModalVisible(true);
                } catch (error) {
                  console.error('Error fetching medication details:', error);
                  message.error('Không thể tải chi tiết yêu cầu thuốc. Vui lòng thử lại.');
                }
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter medications based on status
  const getFilteredMedications = () => {
    console.log('All medication requests before filtering:', medicationRequests);
    
    if (!Array.isArray(medicationRequests)) {
      console.error('medicationRequests is not an array:', medicationRequests);
      return [];
    }
    
    // First filter out any null/undefined medications or those without valid IDs
    const validMeds = medicationRequests.filter(med => med && med.id);
    
    let filteredData = [];
    if (tabKey === 'active') {
      filteredData = validMeds.filter(med => 
        med.status === 'PENDING' || med.status === 'APPROVED'
      );
    } else {
      filteredData = validMeds.filter(med => 
        med.status === 'COMPLETED' || med.status === 'REJECTED'
      );
    }
    
    console.log('Filtered medication data:', filteredData);
    return filteredData;
  };

  return (
    <div className="medication-management">
      <div className="page-header">
        <div className="header-title">
          
          <h2 style={{ color: "white"}}>Quản lý thuốc</h2>
        </div>
        
      </div>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddModal}
        className="add-medication-btn"
        style={{ marginBottom: '20px', marginTop: '20px' }}
      >
        Thêm yêu cầu thuốc
      </Button>

      <Card className="medication-content-card">
        <Tabs 
          activeKey={tabKey} 
          onChange={setTabKey}
        >
          <TabPane tab="Đang xử lý" key="active">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              <Table 
                dataSource={getFilteredMedications()} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Không có yêu cầu thuốc nào' }}
              />
            )}          </TabPane>
          <TabPane tab="Đã hoàn thành/Từ chối" key="completed">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              <Table 
                dataSource={getFilteredMedications()} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                locale={{ emptyText: 'Không có yêu cầu thuốc nào' }}
              />
            )}
          </TabPane>
          <TabPane tab="Lịch uống thuốc" key="schedules">
            <ParentMedicationSchedules />
          </TabPane>
        </Tabs>
        
      </Card>

      {/* Modal for adding/editing medication requests */}
      <Modal
        title={isEdit ? "Chỉnh sửa yêu cầu thuốc" : "Thêm yêu cầu thuốc mới"}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="medication-form"
        >
          <Form.Item
            name="studentId"
            label="Học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
          >
            <Select 
              placeholder="Chọn học sinh"
              onChange={(value) => {
                console.log('Selected student ID:', value);
                setSelectedStudentId(value);
              }}
            >
              {students
                .filter(student => student && student.id) // Filter out students with null/undefined IDs
                .map(student => (
                  <Option key={student.id.toString()} value={student.id}>
                    {student.lastName} {student.firstName}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày kết thúc" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú chung"
          >
            <TextArea 
              rows={2} 
              placeholder="Nhập ghi chú chung về yêu cầu thuốc" 
            />
          </Form.Item>

          <Divider orientation="left">Danh sách thuốc</Divider>

          <Form.List 
            name="itemRequests"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length === 0) {
                    return Promise.reject(new Error('Vui lòng thêm ít nhất một loại thuốc'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="medication-item-container">
                    <div className="medication-item-header">
                      <Title level={5}>Thuốc #{name + 1}</Title>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                      <div className="medication-item-form">
                      {/* Hidden field to store item ID for existing items */}
                      <Form.Item
                        {...restField}
                        name={[name, 'id']}
                        hidden
                      >
                        <Input type="hidden" />
                      </Form.Item>
                      
                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, 'itemName']}
                          label="Tên thuốc"
                          rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
                        >
                          <Input placeholder="Nhập tên thuốc" />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'purpose']}
                          label="Mục đích"
                          rules={[{ required: true, message: 'Vui lòng nhập mục đích sử dụng' }]}
                        >
                          <Input placeholder="Nhập mục đích sử dụng thuốc" />
                        </Form.Item>
                      </div>
                      
                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, 'itemType']}
                          label="Loại thuốc"
                          rules={[{ required: true, message: 'Vui lòng chọn loại thuốc' }]}
                        >
                          <Select placeholder="Chọn loại thuốc">
                            <Option value="TABLET">Viên</Option>
                            <Option value="LIQUID">Nước</Option>
                            <Option value="CAPSULE">Viên nang</Option>
                            <Option value="CREAM">Kem</Option>
                            <Option value="POWDER">Bột</Option>
                            <Option value="INJECTION">Tiêm</Option>
                            <Option value="OTHER">Khác</Option>
                          </Select>
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'dosage']}
                          label="Liều lượng"
                          rules={[
                            { required: true, message: 'Vui lòng nhập liều lượng' },
                            { 
                              pattern: /^[0-9]*\.?[0-9]+$/, 
                              message: 'Vui lòng nhập số hợp lệ' 
                            }
                          ]}
                        >
                          <Input placeholder="Ví dụ: 1, 5, 10" />
                        </Form.Item>
                      </div>
                      
                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, 'frequency']}
                          label="Tần suất (lần/ngày)"
                          rules={[
                            { required: true, message: 'Vui lòng nhập tần suất' },
                            { 
                              pattern: /^[0-9]+$/, 
                              message: 'Vui lòng nhập số nguyên' 
                            }
                          ]}
                        >
                          <Input placeholder="Ví dụ: 1, 2, 3" />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'note']}
                          label="Ghi chú"
                        >
                          <Input placeholder="Hướng dẫn cụ thể về cách dùng" />
                        </Form.Item>
                      </div>
                    </div>
                    
                    {fields.length > 1 && <Divider />}
                  </div>
                ))}
                
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ itemType: 'TABLET' })}
                    block
                    icon={<PlusOutlined />}
                    className="add-medication-item-btn"
                  >
                    Thêm thuốc
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <div style={{ border: '1px solid #d9d9d9', padding: '10px', borderRadius: '5px', backgroundColor: '#f8f8f8' }}>
              <Checkbox 
                checked={isConfirmed} 
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                  console.log('Confirmation checkbox changed:', e.target.checked);
                }}
                style={{ color: '#ff4d4f', fontWeight: 'bold' }}
              >
                Tôi xác nhận rằng thông tin thuốc được cung cấp là chính xác và được kê đơn bởi bác sĩ
              </Checkbox>
              {!isConfirmed && (
                <div style={{ color: '#ff4d4f', marginTop: '5px', fontSize: '12px' }}>
                  *Bạn cần xác nhận thông tin này trước khi gửi yêu cầu
                </div>
              )}
            </div>
          </Form.Item>

          <div className="form-actions">
            <Button onClick={() => setVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thuốc"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMedicationDetail(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedMedicationDetail(null);
          }}>
            Đóng
          </Button>
        ]}
        width={800}
        className="medication-detail-modal-wrapper"
      >
        {selectedMedicationDetail && (
          <div className="medication-detail-modal">
            <div className="medication-detail-content">
              <div className="medication-detail-section">
                <div className="medication-detail-header" style={{marginBottom: '10px'}}>
                  <h3>Thông tin cơ bản</h3>
                  <strong>Trạng thái: </strong>
                  <Tag color={selectedMedicationDetail.status === 'PENDING' ? 'processing' : (selectedMedicationDetail.status === 'APPROVED' ? 'success' : selectedMedicationDetail.status === 'REJECTED' ? 'error' : 'default')}>
                    {selectedMedicationDetail.status === 'PENDING' ? 'Đang chờ duyệt' : 
                     selectedMedicationDetail.status === 'APPROVED' ? 'Đã duyệt' : 
                     selectedMedicationDetail.status === 'REJECTED' ? 'Từ chối' : 
                     selectedMedicationDetail.status === 'COMPLETED' ? 'Hoàn thành' : 'Không xác định'}
                  </Tag>
                </div>
                
                <div className="medication-detail-info">
                  <p><strong>Học sinh:</strong> {selectedMedicationDetail.studentName || (() => {
                    const student = students.find(s => s.id === selectedMedicationDetail.studentId);
                    return student ? `${student.firstName} ${student.lastName}` : 'N/A';
                  })()}</p>
                  <p><strong>Mã yêu cầu:</strong> {selectedMedicationDetail.id}</p>
                  <p><strong>Ngày yêu cầu:</strong> {selectedMedicationDetail.requestDate ? dayjs(selectedMedicationDetail.requestDate).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}</p>
                  <p><strong>Thời gian sử dụng:</strong> {dayjs(selectedMedicationDetail.startDate).format('DD/MM/YYYY')} - {dayjs(selectedMedicationDetail.endDate).format('DD/MM/YYYY')}</p>
                  <p><strong>Ghi chú chung:</strong> {selectedMedicationDetail.note ? (
                    <span className="general-note">{selectedMedicationDetail.note}</span>
                  ) : (
                    <span className="empty-note">Không có ghi chú</span>
                  )}</p>
                  {selectedMedicationDetail.nurseName && (
                    <p><strong>Y tá phụ trách:</strong> {selectedMedicationDetail.nurseName}</p>
                  )}
                </div>
              </div>
              
              <Divider />
              
              <div className="medication-detail-section">
                <h2 style={{textAlign: 'left'}}>Chi tiết các loại thuốc ({(selectedMedicationDetail.itemRequests || []).length} loại)</h2>
                
                {(!selectedMedicationDetail.itemRequests || selectedMedicationDetail.itemRequests.length === 0) ? (
                  <div className="empty-medications">
                    <p>Không có thông tin thuốc trong yêu cầu này.</p>
                  </div>
                ) : (
                  <div className="medication-items-list">
                    {selectedMedicationDetail.itemRequests.map((item, index) => (
                      <div key={item.id || index} className="medication-item-card">
                        <div className="medication-item-header" style={{marginBottom: '5px'}}>
                          <h4><strong>{index + 1}. {item.itemName}</strong></h4>
                          </div>

                          <h4><strong>Loại: <Tag color={
                            item.itemType === 'PRESCRIPTION' ? 'red' :
                            item.itemType === 'OTC' ? 'green' :
                            item.itemType === 'TABLET' ? 'blue' :
                            item.itemType === 'LIQUID' ? 'cyan' :
                            item.itemType === 'CAPSULE' ? 'magenta' :
                            item.itemType === 'CREAM' ? 'orange' :
                            item.itemType === 'POWDER' ? 'purple' :
                            item.itemType === 'INJECTION' ? 'red' :
                            'default'
                          }>
                            {item.itemType === 'PRESCRIPTION' ? 'Thuốc kê đơn' :
                             item.itemType === 'OTC' ? 'Thuốc không kê đơn' :
                             item.itemType === 'TABLET' ? 'Viên' :
                             item.itemType === 'LIQUID' ? 'Nước' :
                             item.itemType === 'CAPSULE' ? 'Viên nang' :
                             item.itemType === 'CREAM' ? 'Kem' :
                             item.itemType === 'POWDER' ? 'Bột' :
                             item.itemType === 'INJECTION' ? 'Tiêm' : item.itemType}
                          </Tag> </strong></h4>
                  
                        
                        <div className="medication-item-details">
                          <p><strong>Mục đích:</strong> <span className="medication-purpose">{item.purpose || 'Không có mục đích'}</span></p>
                          <p><strong>Liều lượng:</strong> <span className="medication-dosage">{item.dosage} {
                            item.itemType === 'TABLET' || item.itemType === 'CAPSULE' ? 'viên' :
                            item.itemType === 'LIQUID' || item.itemType === 'INJECTION' ? 'ml' :
                            item.itemType === 'CREAM' || item.itemType === 'POWDER' ? 'g' :
                            'đơn vị'
                          }</span></p>
                          <p><strong>Tần suất:</strong> <span className="medication-frequency">{item.frequency} lần/ngày</span></p>
                          <p><strong>Ghi chú riêng:</strong> {item.note ? (
                            <span className="medication-note">{item.note}</span>
                          ) : (
                            <span className="empty-note">Không có ghi chú</span>
                          )}</p>
                          <hr />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Divider />
              
              <div className="medication-detail-footer">
                <p className="note-text">
                  <strong>Lưu ý:</strong> Yêu cầu thuốc sẽ được y tá trường xem xét và phản hồi trong vòng 24 giờ. 
                  Vui lòng đảm bảo thông tin thuốc chính xác và được kê đơn bởi bác sĩ.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicationManagement;
