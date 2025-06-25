import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  message, 
  Popconfirm,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AddStudentWithParentsModal from './AddStudentWithParentsModal';
import ImportStudentsModal from './ImportStudentsModal';
import '../../styles/StudentManagement.css';
import { 
  getAllStudents, 
  deleteStudent, 
  downloadExcelTemplate 
} from '../../api/studentApi';

const StudentsSection = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch students data
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      message.error('Không thể tải danh sách học sinh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStudentStatus = async (student) => {
    try {
      await deleteStudent(student.id); // Backend handles toggle logic
      if (student.isDisabled) {
        message.success('Đã kích hoạt lại học sinh thành công');
      } else {
        message.success('Đã vô hiệu hóa học sinh thành công');
      }
      fetchStudents(); // Refresh data
    } catch (error) {
      message.error('Không thể thay đổi trạng thái học sinh: ' + error.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Import_Hoc_Sinh.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Tải template thành công');
    } catch (error) {
      message.error('Không thể tải template: ' + error.message);
    }
  };

  const columns = [
    { 
      title: 'Họ và tên', 
      key: 'fullName',
      render: (_, record) => `${record.lastName} ${record.firstName}`,
    },
    { 
      title: 'Lớp', 
      dataIndex: 'className', 
      key: 'className' 
    },
    { 
      title: 'Ngày sinh', 
      dataIndex: 'dob', 
      key: 'dob',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : ''
    },
    { 
      title: 'Giới tính', 
      dataIndex: 'gender', 
      key: 'gender',
      render: (gender) => gender === 'M' ? 'Nam' : 'Nữ'
    },
    { 
      title: 'Nơi sinh', 
      dataIndex: 'birthPlace', 
      key: 'birthPlace' 
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isDisabled ? 'red' : 'green'}>
          {record.isDisabled ? 'Vô hiệu hóa' : 'Hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title={record.isDisabled ? "Xác nhận kích hoạt lại" : "Xác nhận vô hiệu hóa"}
            description={
              record.isDisabled 
                ? "Bạn có chắc chắn muốn kích hoạt lại học sinh này?" 
                : "Bạn có chắc chắn muốn vô hiệu hóa học sinh này? Tài khoản phụ huynh cũng sẽ bị vô hiệu hóa."
            }
            onConfirm={() => handleToggleStudentStatus(record)}
            okText={record.isDisabled ? "Kích hoạt" : "Vô hiệu hóa"}
            cancelText="Hủy"
            okType={record.isDisabled ? "primary" : "danger"}
          >
            <Button 
              danger={!record.isDisabled}
              type={record.isDisabled ? "primary" : "default"}
              icon={record.isDisabled ? <CheckCircleOutlined /> : <StopOutlined />} 
              size="small"
            >
              {record.isDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAddSuccess = () => {
    fetchStudents(); // Refresh data after successful add
  };
  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2 style={{ fontSize: 24, fontWeight: 600, color: '#333', margin: 0 }}>
          Học sinh
        </h2>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Tải template Excel
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setShowImportModal(true)}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            Import Excel
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddModal(true)}
            style={{ 
              background: '#ff6b35', 
              borderColor: '#ff6b35', 
              borderRadius: 6, 
              fontWeight: 500 
            }}
          >
            Thêm học sinh
          </Button>        </Space>
      </div>
      
      <Card
        style={{ 
          borderRadius: 12, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          marginBottom: 24 
        }} 
        bodyStyle={{ padding: 24 }}
      >
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          style={{ borderRadius: 8, overflow: 'hidden' }}        />
      </Card>

      <AddStudentWithParentsModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <ImportStudentsModal
        visible={showImportModal}
        onCancel={() => setShowImportModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};

export default StudentsSection;