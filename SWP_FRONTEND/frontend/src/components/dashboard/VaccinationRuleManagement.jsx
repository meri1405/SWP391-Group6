import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Space,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { nurseApi } from "../../api/nurseApi";

const { TextArea } = Input;

const VaccinationRuleManagement = () => {
  const { getToken } = useAuth();
  const [vaccinationRules, setVaccinationRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form] = Form.useForm();

  // Helper function to format age
  const formatAge = (months) => {
    if (months < 12) {
      return `${months} tháng`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths === 0) {
        return `${years} tuổi`;
      } else {
        return `${years} tuổi ${remainingMonths} tháng`;
      }
    }
  };

  // Load vaccination rules
  const loadVaccinationRules = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const rules = await nurseApi.getAllVaccinationRules(token);
      setVaccinationRules(rules);
    } catch (error) {
      console.error("Error loading vaccination rules:", error);
      message.error("Không thể tải danh sách quy tắc tiêm chủng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadVaccinationRules();
  }, [getToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle create/update vaccination rule
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = getToken();

      const ruleData = {
        name: values.name,
        description: values.description,
        doesNumber: values.doesNumber,
        minAge: values.minAge,
        maxAge: values.maxAge,
        intervalDays: values.intervalDays,
        mandatory: values.mandatory || false,
      };

      if (editingRule) {
        // Update existing rule
        await nurseApi.updateVaccinationRule(token, editingRule.id, ruleData);
        message.success("Cập nhật quy tắc tiêm chủng thành công!");
      } else {
        // Create new rule
        await nurseApi.createVaccinationRule(token, ruleData);
        message.success("Tạo quy tắc tiêm chủng thành công!");
      }
      setModalVisible(false);
      setEditingRule(null);
      form.resetFields();
      // Explicitly clear all field values
      form.setFieldsValue({
        name: undefined,
        description: undefined,
        doesNumber: undefined,
        minAge: undefined,
        maxAge: undefined,
        intervalDays: undefined,
        mandatory: undefined,
      });
      loadVaccinationRules();
    } catch (error) {
      console.error("Error saving vaccination rule:", error);
      message.error("Có lỗi xảy ra khi lưu quy tắc tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete vaccination rule
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = getToken();
      await nurseApi.deleteVaccinationRule(token, id);
      message.success("Xóa quy tắc tiêm chủng thành công!");
      loadVaccinationRules();
    } catch (error) {
      console.error("Error deleting vaccination rule:", error);
      message.error("Có lỗi xảy ra khi xóa quy tắc tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (rule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      doesNumber: rule.doesNumber,
      minAge: rule.minAge,
      maxAge: rule.maxAge,
      intervalDays: rule.intervalDays,
      mandatory: rule.mandatory,
    });
    setModalVisible(true);
  };
  // Handle add new
  const handleAddNew = () => {
    setEditingRule(null);
    form.resetFields();
    // Explicitly clear all field values to prevent auto-fill
    form.setFieldsValue({
      name: undefined,
      description: undefined,
      doesNumber: undefined,
      minAge: undefined,
      maxAge: undefined,
      intervalDays: undefined,
      mandatory: undefined,
    });
    setModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: "Tên quy tắc",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Mũi thứ",
      dataIndex: "doesNumber",
      key: "doesNumber",
      width: 80,
      align: "center",
      render: (value) => <Tag color="blue">Mũi {value}</Tag>,
    },
    {
      title: "Độ tuổi",
      key: "ageRange",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Tag color="green">
          {formatAge(record.minAge)} - {formatAge(record.maxAge)}
        </Tag>
      ),
    },
    {
      title: "Ngày tối thiểu sau mũi trước",
      dataIndex: "intervalDays",
      key: "intervalDays",
      width: 150,
      align: "center",
      render: (value) => <Tag color="orange">{value} ngày</Tag>,
    },
    {
      title: "Bắt buộc",
      dataIndex: "mandatory",
      key: "mandatory",
      width: 100,
      align: "center",
      render: (mandatory) => (
        <Tag color={mandatory ? "red" : "default"}>
          {mandatory ? "Bắt buộc" : "Tự nguyện"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa quy tắc này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="vaccination-rule-management">
      <div className="section-header">
        <h2>Quản lý quy tắc tiêm chủng</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
        >
          Thêm quy tắc mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vaccinationRules}
        rowKey="id"
        loading={loading}
        style={{ marginTop: 16 }}
      />

      <Modal
        title={editingRule ? "Sửa quy tắc tiêm chủng" : "Thêm quy tắc tiêm chủng mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRule(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <div className="guide-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '10px', color: '#ff6b35' }}>Hướng dẫn nhập thông tin</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Tên quy tắc: Phải là duy nhất và có ít nhất 3 ký tự</li>
            <li>Mô tả: Giải thích chi tiết về quy tắc tiêm chủng</li>
            <li>Mũi thứ: Số thứ tự của mũi tiêm (từ 1 đến 10)</li>
            <li>Độ tuổi tối thiểu: Tuổi nhỏ nhất có thể tiêm (từ 0 đến 18 tuổi)</li>
            <li>Độ tuổi tối đa: Tuổi lớn nhất có thể tiêm (phải lớn hơn độ tuổi tối thiểu)</li>
            <li>Khoảng cách tối thiểu: Số ngày tối thiểu giữa các mũi tiêm (từ 0 đến 365 ngày)</li>
            <li>Bắt buộc: Xác định xem mũi tiêm này có bắt buộc hay không</li>
          </ul>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            mandatory: false
          }}
        >
          <Form.Item
            name="name"
            label="Tên quy tắc"
            rules={[
              { required: true, message: 'Vui lòng nhập tên quy tắc!' },
              { min: 3, message: 'Tên quy tắc phải có ít nhất 3 ký tự!' },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  const isDuplicate = vaccinationRules.some(
                    rule => rule.name === value && (!editingRule || rule.id !== editingRule.id)
                  );
                  if (isDuplicate) {
                    return Promise.reject('Tên quy tắc này đã tồn tại!');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="Nhập tên quy tắc" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả!' },
              { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' }
            ]}
          >
            <TextArea
              placeholder="Nhập mô tả chi tiết về quy tắc tiêm chủng"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="doesNumber"
            label="Mũi thứ"
            rules={[
              { required: true, message: 'Vui lòng nhập số thứ tự mũi tiêm!' },
              { type: 'number', min: 1, max: 10, message: 'Số thứ tự mũi tiêm phải từ 1 đến 10!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số thứ tự mũi tiêm"
              min={1}
              max={10}
            />
          </Form.Item>

          <Form.Item
            name="minAge"
            label="Độ tuổi tối thiểu (tháng)"
            rules={[
              { required: true, message: 'Vui lòng nhập độ tuổi tối thiểu!' },
              { type: 'number', min: 0, max: 216, message: 'Độ tuổi phải từ 0 đến 18 tuổi (216 tháng)!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập độ tuổi tối thiểu (tháng)"
              min={0}
              max={216}
            />
          </Form.Item>

          <Form.Item
            name="maxAge"
            label="Độ tuổi tối đa (tháng)"
            rules={[
              { required: true, message: 'Vui lòng nhập độ tuổi tối đa!' },
              { type: 'number', min: 0, max: 216, message: 'Độ tuổi phải từ 0 đến 18 tuổi (216 tháng)!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('minAge') || value >= getFieldValue('minAge')) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Độ tuổi tối đa phải lớn hơn độ tuổi tối thiểu!');
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập độ tuổi tối đa (tháng)"
              min={0}
              max={216}
            />
          </Form.Item>

          <Form.Item
            name="intervalDays"
            label="Khoảng cách tối thiểu (ngày)"
            rules={[
              { required: true, message: 'Vui lòng nhập khoảng cách tối thiểu!' },
              { type: 'number', min: 0, max: 365, message: 'Khoảng cách phải từ 0 đến 365 ngày!' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập khoảng cách tối thiểu giữa các mũi tiêm"
              min={0}
              max={365}
            />
          </Form.Item>

          <Form.Item
            name="mandatory"
            label="Bắt buộc"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
            <Button
              onClick={() => {
                setModalVisible(false);
                setEditingRule(null);
                form.resetFields();
              }}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
            >
              {editingRule ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationRuleManagement;
