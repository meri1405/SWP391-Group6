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
import { useAuth } from "../../../../contexts/AuthContext";
import { nurseApi } from "../../../../api/nurseApi";

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
      const rules = await nurseApi.getAllVaccinationRules();
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
        await nurseApi.updateVaccinationRule(editingRule.id, ruleData);
        message.success("Cập nhật quy tắc tiêm chủng thành công!");
      } else {
        // Create new rule
        await nurseApi.createVaccinationRule(ruleData);
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
      await nurseApi.deleteVaccinationRule(id);
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
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={24}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <MedicineBoxOutlined
                  style={{
                    fontSize: "24px",
                    color: "#1890ff",
                    marginRight: "10px",
                  }}
                />{" "}
                <div>
                  <h2 style={{ margin: 0, fontWeight: 600 }}>
                    Quản lý quy tắc tiêm chủng
                  </h2>
                  <p style={{ margin: 0, color: "#666" }}>
                    Thiết lập và quản lý các quy tắc tiêm chủng cho học sinh
                    (tuổi tính theo tháng)
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
                size="large"
              >
                Thêm quy tắc mới
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#1890ff", fontSize: "24px", margin: 0 }}>
                {vaccinationRules.length}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>Tổng số quy tắc</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#52c41a", fontSize: "24px", margin: 0 }}>
                {vaccinationRules.filter((rule) => rule.mandatory).length}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>Quy tắc bắt buộc</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#fa8c16", fontSize: "24px", margin: 0 }}>
                {vaccinationRules.filter((rule) => !rule.mandatory).length}
              </h3>
              <p style={{ margin: 0, color: "#666" }}>Quy tắc tự nguyện</p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={vaccinationRules}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} quy tắc`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal for Add/Edit */}
      <Modal
        title={
          editingRule
            ? "Cập nhật quy tắc tiêm chủng"
            : "Thêm quy tắc tiêm chủng mới"
        }
        open={modalVisible}
        onCancel={() => {
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
        }}
        footer={null}
        width={600}
        destroyOnHidden
      >
        {" "}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên quy tắc"
            rules={[
              { required: true, message: "Vui lòng nhập tên quy tắc" },
              {
                max: 255,
                message: "Tên quy tắc không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input placeholder="VD: COVID-19 Vaccination" />
          </Form.Item>{" "}
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: "Vui lòng nhập mô tả" },
              { max: 500, message: "Mô tả không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="VD: Quy tắc cho mũi 1 vaccine COVID-19, dành cho trẻ 60-216 tháng tuổi, có thể tiêm ngay"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="doesNumber"
                label="Mũi thứ"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số thứ tự mũi tiêm",
                  },
                  {
                    type: "number",
                    min: 1,
                    max: 10,
                    message: "Mũi tiêm phải từ 1-10",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: "100%" }}
                  placeholder=""
                  addonBefore="Mũi"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="intervalDays"
                label="Số ngày tối thiểu sau mũi trước đó"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số ngày tối thiểu",
                  },
                  {
                    type: "number",
                    min: 0,
                    max: 365,
                    message: "Số ngày phải từ 0-365 ngày",
                  },
                ]}
                extra="Mũi 1 có thể là 0 ngày. Các mũi tiếp theo phải chờ ít nhất số ngày này sau mũi trước."
              >
                <InputNumber
                  min={0}
                  max={365}
                  style={{ width: "100%" }}
                  placeholder=""
                  addonAfter="ngày"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minAge"
                label="Tuổi tối thiểu (tháng)"
                rules={[
                  { required: true, message: "Vui lòng nhập tuổi tối thiểu" },
                  {
                    type: "number",
                    min: 0,
                    max: 216,
                    message: "Tuổi phải từ 0-216 tháng (18 năm)",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={216}
                  style={{ width: "100%" }}
                  placeholder=""
                  addonAfter="tháng"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxAge"
                label="Tuổi tối đa (tháng)"
                rules={[
                  { required: true, message: "Vui lòng nhập tuổi tối đa" },
                  {
                    type: "number",
                    min: 0,
                    max: 216,
                    message: "Tuổi phải từ 0-216 tháng (18 năm)",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={216}
                  style={{ width: "100%" }}
                  placeholder=""
                  addonAfter="tháng"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="mandatory"
            label="Bắt buộc tiêm"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bắt buộc" unCheckedChildren="Tự nguyện" />
          </Form.Item>
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Space>
              {" "}
              <Button
                onClick={() => {
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
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRule ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationRuleManagement;
