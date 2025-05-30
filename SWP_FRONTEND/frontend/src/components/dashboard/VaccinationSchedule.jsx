import React, { useState } from 'react';
import {
  Tabs,
  Button,
  Card,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Space,
  message
} from 'antd';
import {
  PlusOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const VaccinationSchedule = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('completed');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Mock data for completed vaccinations
  const [completedVaccinations, setCompletedVaccinations] = useState([
    {
      id: 1,
      vaccine: 'Viêm gan B (lần 1)',
      date: '2023-03-15',
      location: 'Trung tâm Y tế Quận 1',
      batchNumber: 'HB2023-001',
      nextDue: '2023-04-15',
      status: 'completed'
    },
    {
      id: 2,
      vaccine: 'DPT (lần 1)',
      date: '2023-04-20',
      location: 'Bệnh viện Nhi Đồng',
      batchNumber: 'DPT2023-045',
      nextDue: '2023-06-20',
      status: 'completed'
    }
  ]);

  // Mock data for upcoming vaccinations
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([
    {
      id: 4,
      vaccine: 'Viêm gan B (lần 2)',
      scheduledDate: '2024-01-15',
      location: 'Trung tâm Y tế Quận 1',
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 5,
      vaccine: 'DPT (lần 2)',
      scheduledDate: '2024-02-20',
      location: 'Bệnh viện Nhi Đồng',
      status: 'scheduled',
      priority: 'medium'
    }
  ]);

  const getPriorityTag = (priority) => {
    const config = {
      high: { color: 'red', text: 'Cao' },
      medium: { color: 'orange', text: 'Trung bình' },
      low: { color: 'green', text: 'Thấp' }
    };
    return <Tag color={config[priority].color}>{config[priority].text}</Tag>;
  };

  const getStatusTag = (status) => {
    const config = {
      completed: { color: 'green', text: 'Đã tiêm' },
      scheduled: { color: 'blue', text: 'Đã lên lịch' },
      cancelled: { color: 'red', text: 'Đã hủy' }
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const completedColumns = [
    {
      title: 'Vaccine',
      dataIndex: 'vaccine',
      key: 'vaccine',
    },
    {
      title: 'Ngày tiêm',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: 'Ngày tiêm tiếp theo',
      dataIndex: 'nextDue',
      key: 'nextDue',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '--',
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
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const upcomingColumns = [
    {
      title: 'Vaccine',
      dataIndex: 'vaccine',
      key: 'vaccine',
    },
    {
      title: 'Ngày dự kiến',
      dataIndex: 'scheduledDate',
      key: 'scheduledDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = (values) => {
    const newVaccination = {
      id: Date.now(),
      ...values,
      status: activeTab === 'completed' ? 'completed' : 'scheduled'
    };

    if (activeTab === 'completed') {
      setCompletedVaccinations([...completedVaccinations, newVaccination]);
    } else {
      setUpcomingVaccinations([...upcomingVaccinations, newVaccination]);
    }

    messageApi.success('Thêm lịch tiêm chủng thành công');
    setShowAddModal(false);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null,
      nextDue: record.nextDue ? dayjs(record.nextDue) : null,
      scheduledDate: record.scheduledDate ? dayjs(record.scheduledDate) : null
    });
    setShowAddModal(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lịch tiêm chủng này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        if (activeTab === 'completed') {
          setCompletedVaccinations(completedVaccinations.filter(item => item.id !== record.id));
        } else {
          setUpcomingVaccinations(upcomingVaccinations.filter(item => item.id !== record.id));
        }
        messageApi.success('Xóa lịch tiêm chủng thành công');
      }
    });
  };

  return (
    <div className="vaccination-schedule">
      {contextHolder}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane
              tab={
                <span>
                  <CheckCircleOutlined />
                  Đã tiêm ({completedVaccinations.length})
                </span>
              }
              key="completed"
            />
            <TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Sắp tới ({upcomingVaccinations.length})
                </span>
              }
              key="upcoming"
            />
          </Tabs>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setShowAddModal(true);
            }}
          >
            Thêm mới
          </Button>
        </div>

        {activeTab === 'completed' ? (
          <Table
            columns={completedColumns}
            dataSource={completedVaccinations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Table
            columns={upcomingColumns}
            dataSource={upcomingVaccinations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title={editingRecord ? 'Sửa lịch tiêm chủng' : 'Thêm lịch tiêm chủng mới'}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdd}
        >
          <Form.Item
            name="vaccine"
            label="Tên vaccine"
            rules={[{ required: true, message: 'Vui lòng nhập tên vaccine' }]}
          >
            <Input placeholder="Nhập tên vaccine" />
          </Form.Item>

          {activeTab === 'completed' ? (
            <>
              <Form.Item
                name="date"
                label="Ngày tiêm"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tiêm' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item
                name="nextDue"
                label="Ngày tiêm tiếp theo"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              name="scheduledDate"
              label="Ngày dự kiến"
              rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          )}

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input placeholder="Nhập địa điểm tiêm" />
          </Form.Item>

          {activeTab === 'completed' && (
            <Form.Item
              name="batchNumber"
              label="Số lô"
              rules={[{ required: true, message: 'Vui lòng nhập số lô' }]}
            >
              <Input placeholder="Nhập số lô vaccine" />
            </Form.Item>
          )}

          {activeTab === 'upcoming' && (
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
            >
              <Select placeholder="Chọn độ ưu tiên">
                <Option value="high">Cao</Option>
                <Option value="medium">Trung bình</Option>
                <Option value="low">Thấp</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowAddModal(false);
                setEditingRecord(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationSchedule;
