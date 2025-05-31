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
      
      // Map medication data to ensure it has the expected format
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
  const showEditModal = (record) => {
    setIsEdit(true);
    setCurrentMedication(record);
    setIsConfirmed(record.isConfirmed);
    
    // Format the data for the form
    const formData = {
      studentId: record.studentId,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      note: record.note,
      itemRequests: record.itemRequests || []
    };
    
    form.setFieldsValue(formData);
    setVisible(true);
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
        note: values.note || "Yêu cầu dùng thuốc cho học sinh",
        itemRequests: values.itemRequests.map(item => ({
          itemName: item.itemName,
          purpose: item.purpose,
          itemType: item.itemType,
          dosage: Number(item.dosage),
          frequency: Number(item.frequency),
          note: item.note || ""
        }))
      };
      
      console.log('Sending medication data to API:', medicationData);
      
      if (isEdit) {
        // Update existing request
        const updatedRequest = await parentApi.updateMedicationRequest(token, currentMedication.id, medicationData);
        console.log('Updated medication request response:', updatedRequest);
        message.success('Cập nhật yêu cầu thuốc thành công');
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
                return student ? `${student.firstName} ${student.lastName}` : 'N/A';
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
      await parentApi.deleteMedicationRequest(token, id);
      message.success('Xóa yêu cầu thuốc thành công');
      fetchData();
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
        return <Tag icon={<CheckCircleOutlined />} color="success"></Tag>;
      case 'REJECTED':
        return <Tag icon={<CloseCircleOutlined />} color="error"></Tag>;
      case 'PENDING':
        return <Tag icon={<ClockCircleOutlined />} color="processing"></Tag>;
      case 'COMPLETED':
        return <Tag icon={<CheckCircleOutlined />} color="blue"></Tag>;
      default:
        return <Tag color="default"></Tag>;
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
        return student ? `${student.firstName} ${student.lastName}` : 'N/A';
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
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      width: 250,
      render: (text, record) => {
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
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <div className="medication-actions">
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={() => showEditModal(record)}
              >
              </Button>
              <Popconfirm
                title="Bạn có chắc muốn xóa yêu cầu này không?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                >
                </Button>
              </Popconfirm>
            </>
          )}
          <Tooltip title="Xem chi tiết các loại thuốc">
            <Button 
              type="link" 
              icon={<InfoCircleOutlined />}
              onClick={() => {
                // Create a formatted message with medication details
                const items = record.itemRequests || [];
                
                Modal.info({
                  title: 'Chi tiết thuốc',
                  content: (
                    <div className="medication-detail-modal">
                      <div className="medication-detail-content">
                        <div className="medication-detail-section">
                          <div className="medication-detail-header">
                            <h3>Thông tin cơ bản</h3>
                            <Tag color={record.status === 'PENDING' ? 'processing' : (record.status === 'APPROVED' ? 'success' : 'default')}>
                              {record.status === 'PENDING' ? 'Đang chờ' : 
                               record.status === 'APPROVED' ? 'Đã duyệt' : 
                               record.status === 'REJECTED' ? 'Từ chối' : 
                               record.status === 'COMPLETED' ? 'Hoàn thành' : 'Không xác định'}
                            </Tag>
                          </div>
                          
                          <div className="medication-detail-info">
                            <p><strong>Học sinh:</strong> {record.studentName || (() => {
                              const student = students.find(s => s.id === record.studentId);
                              return student ? `${student.firstName} ${student.lastName}` : 'N/A';
                            })()}</p>
                            <p><strong>Mã yêu cầu:</strong> #{record.id}</p>
                            <p><strong>Ngày yêu cầu:</strong> {record.requestDate ? dayjs(record.requestDate).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}</p>
                            <p><strong>Thời gian sử dụng:</strong> {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}</p>
                            <p><strong>Ghi chú:</strong> {record.note ? (
                              <span className="general-note">{record.note}</span>
                            ) : (
                              <span className="empty-note">Không có ghi chú</span>
                            )}</p>
                          </div>
                        </div>
                        
                        <Divider />
                        
                        <div className="medication-detail-section">
                          <h4>Danh sách thuốc ({items.length} loại)</h4>
                          
                          {items.length === 0 ? (
                            <p>Không có thông tin thuốc</p>
                          ) : (
                            <div className="medication-items-list">
                              {items.map((item, index) => (
                                <div key={index} className="medication-item-card">
                                  <div className="medication-item-header">
                                    <h4>{item.itemName}</h4>
                                    <Tag color={
                                      item.itemType === 'PRESCRIPTION' ? 'purple' : 
                                      item.itemType === 'OTC' ? 'blue' :
                                      item.itemType === 'TABLET' ? 'green' :
                                      item.itemType === 'LIQUID' ? 'cyan' :
                                      item.itemType === 'CAPSULE' ? 'magenta' :
                                      item.itemType === 'CREAM' ? 'orange' :
                                      item.itemType === 'INJECTION' ? 'red' :
                                      'default'
                                    }>{item.itemType === 'PRESCRIPTION' ? 'Thuốc kê đơn' : 
                                       item.itemType === 'OTC' ? 'Thuốc không kê đơn' :
                                       item.itemType === 'TABLET' ? 'Viên' :
                                       item.itemType === 'LIQUID' ? 'Nước' :
                                       item.itemType === 'CAPSULE' ? 'Viên nang' :
                                       item.itemType === 'CREAM' ? 'Kem' :
                                       item.itemType === 'POWDER' ? 'Bột' :
                                       item.itemType === 'INJECTION' ? 'Tiêm' : 'Khác'}</Tag>
                                  </div>
                                  <div className="medication-item-details">
                                    <p><strong>Liều lượng:</strong> <span className="medication-dosage">{item.dosage} {
                                      item.itemType === 'TABLET' ? 'viên' :
                                      item.itemType === 'LIQUID' ? 'ml' :
                                      item.itemType === 'CAPSULE' ? 'viên' :
                                      item.itemType === 'CREAM' ? 'g' :
                                      item.itemType === 'POWDER' ? 'g' :
                                      item.itemType === 'INJECTION' ? 'ml' : 
                                      ''
                                    }</span></p>
                                    <p><strong>Tần suất:</strong> <span className="medication-frequency">{item.frequency} lần/ngày</span></p>
                                    <p><strong>Mục đích:</strong> <span className="medication-purpose">{item.purpose || 'Không có mục đích'}</span></p>
                                    <p><strong>Ghi chú:</strong> {item.note ? (
                                      <span className="medication-note">{item.note}</span>
                                    ) : (
                                      <span className="empty-note">Không có ghi chú</span>
                                    )}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Divider />
                        
                        <div className="medication-detail-footer">
                          <p className="note-text">Lưu ý: Yêu cầu thuốc sẽ được y tá trường xem xét và phản hồi trong vòng 24 giờ.</p>
                        </div>
                      </div>
                    </div>
                  ),
                  width: 700,
                  okText: 'Đóng',
                  maskClosable: true,
                  className: 'custom-modal',
                });
              }}
            >
            </Button>
          </Tooltip>
        </div>
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
            )}
          </TabPane>
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
                    {student.firstName} {student.lastName}
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
    </div>
  );
};

export default MedicationManagement;
