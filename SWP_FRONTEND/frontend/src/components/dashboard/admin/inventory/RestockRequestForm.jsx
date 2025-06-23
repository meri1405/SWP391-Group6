import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Table,
  Space,
  Tag,
  Spin,
  message,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { medicalSupplyApi } from "../../../../api/medicalSupplyApi";
import { restockRequestApi } from "../../../../api/restockRequestApi";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const RestockRequestForm = ({
  visible,
  onCancel,
  selectedSupplies = [],
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);

  // Load all medical supplies when modal opens
  useEffect(() => {
    if (visible) {
      fetchMedicalSupplies();

      // Initialize with pre-selected supplies if any
      if (selectedSupplies.length > 0) {
        const items = selectedSupplies.map((supply) => ({
          medicalSupplyId: supply.id,
          requestedQuantity: supply.isLowStock
            ? Math.max(supply.minStockLevel - supply.quantity, 10)
            : 10,
          name: supply.name,
          currentQuantity: supply.quantity,
          unit: supply.unit,
          minStockLevel: supply.minStockLevel,
        }));

        setRequestItems(items);
      }

      // Reset form
      form.setFieldsValue({
        priority: "MEDIUM",
        reason: "",
      });
    }
  }, [visible, selectedSupplies, form]);

  // Fetch all medical supplies to populate dropdown
  const fetchMedicalSupplies = async () => {
    setLoading(true);
    try {
      const data = await medicalSupplyApi.getAllSupplies();
      setSupplies(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      messageApi.error(
        "Không thể tải dữ liệu vật tư y tế. Vui lòng thử lại sau."
      );
      console.error("Error fetching supplies:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (requestItems.length === 0) {
        messageApi.error("Vui lòng thêm ít nhất một vật tư vào yêu cầu.");
        return;
      }

      setSubmitting(true);

      // Create restock request DTO
      const requestData = {
        priority: values.priority,
        reason: values.reason,
        status: "PENDING",
        restockItems: requestItems.map((item) => ({
          medicalSupplyId: item.medicalSupplyId,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes || "",
        })),
      };

      try {
        const response = await restockRequestApi.createRequest(requestData);
        messageApi.success("Gửi yêu cầu bổ sung thành công!");
        setSubmitting(false);

        // Reset form and close modal
        form.resetFields();
        setRequestItems([]);
        onSuccess && onSuccess(response);
      } catch (error) {
        setSubmitting(false);
        messageApi.error("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
        console.error("Error creating restock request:", error);
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  // Add a new item to the restock request
  const addItem = () => {
    const newItemId = form.getFieldValue("newItemSupply");
    const newItemQuantity = form.getFieldValue("newItemQuantity");
    const newItemNotes = form.getFieldValue("newItemNotes");

    if (!newItemId || !newItemQuantity) {
      messageApi.error("Vui lòng chọn vật tư và nhập số lượng.");
      return;
    }

    const supplyToAdd = supplies.find((s) => s.id === newItemId);
    if (!supplyToAdd) return;

    // Check if item already exists in the list
    if (requestItems.some((item) => item.medicalSupplyId === newItemId)) {
      messageApi.warning("Vật tư này đã có trong danh sách.");
      return;
    }

    const newItem = {
      medicalSupplyId: supplyToAdd.id,
      requestedQuantity: newItemQuantity,
      notes: newItemNotes,
      name: supplyToAdd.name,
      currentQuantity: supplyToAdd.quantity,
      unit: supplyToAdd.unit,
      minStockLevel: supplyToAdd.minStockLevel,
    };

    setRequestItems([...requestItems, newItem]);

    // Reset add item fields
    form.setFieldsValue({
      newItemSupply: undefined,
      newItemQuantity: undefined,
      newItemNotes: undefined,
    });
  };

  // Remove an item from the restock request
  const removeItem = (itemIndex) => {
    setRequestItems(requestItems.filter((_, index) => index !== itemIndex));
  };

  // Table columns for restock items
  const itemColumns = [
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "SL hiện tại",
      key: "currentQuantity",
      render: (_, record) => (
        <Space>
          {record.currentQuantity} {record.unit}
          {record.currentQuantity < record.minStockLevel && (
            <WarningOutlined style={{ color: "orange" }} />
          )}
        </Space>
      ),
    },
    {
      title: "SL yêu cầu",
      dataIndex: "requestedQuantity",
      key: "requestedQuantity",
      render: (value, record) => `${value} ${record.unit}`,
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record, index) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          type="text"
        />
      ),
    },
  ];

  // Filter out already selected items from dropdown
  const filteredSupplies = supplies.filter(
    (supply) => !requestItems.some((item) => item.medicalSupplyId === supply.id)
  );

  return (
    <>
      {contextHolder}
      <Modal
        title="Gửi yêu cầu bổ sung vật tư y tế"
        open={visible}
        width={800}
        onCancel={onCancel}
        footer={[
          <Button key="back" onClick={onCancel}>
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            disabled={requestItems.length === 0}
          >
            Gửi yêu cầu
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              priority: "MEDIUM",
            }}
          >
            <Form.Item
              name="priority"
              label="Mức độ ưu tiên"
              rules={[
                { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
              ]}
            >
              <Select>
                <Option value="HIGH">
                  <Tag color="red">Cao</Tag>
                </Option>
                <Option value="MEDIUM">
                  <Tag color="blue">Trung bình</Tag>
                </Option>
                <Option value="LOW">
                  <Tag color="green">Thấp</Tag>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="reason"
              label="Lý do yêu cầu"
              rules={[
                { required: true, message: "Vui lòng nhập lý do yêu cầu" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập lý do cần bổ sung vật tư..."
              />
            </Form.Item>

            <div
              className="add-item-section"
              style={{
                marginBottom: 16,
                padding: 16,
                border: "1px dashed #d9d9d9",
                borderRadius: 4,
              }}
            >
              <Text strong style={{ display: "block", marginBottom: 16 }}>
                <PlusOutlined /> Thêm vật tư vào yêu cầu
              </Text>
              <Form.Item
                name="newItemSupply"
                label="Chọn vật tư"
                style={{ marginBottom: 12 }}
              >
                <Select
                  placeholder="Chọn vật tư cần bổ sung"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {filteredSupplies.map((supply) => (
                    <Option key={supply.id} value={supply.id}>
                      {supply.name} ({supply.quantity} {supply.unit} hiện có)
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="newItemQuantity"
                label="Số lượng yêu cầu"
                style={{ marginBottom: 12 }}
              >
                <InputNumber
                  min={1}
                  placeholder="Nhập số lượng"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="newItemNotes"
                label="Ghi chú (không bắt buộc)"
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="Thêm ghi chú cho vật tư này..." />
              </Form.Item>

              <Button
                type="dashed"
                onClick={addItem}
                icon={<PlusOutlined />}
                block
              >
                Thêm vào danh sách
              </Button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Danh sách vật tư yêu cầu:</Text>
              <Table
                columns={itemColumns}
                dataSource={requestItems}
                pagination={false}
                rowKey={(record) => record.medicalSupplyId.toString()}
                size="small"
                style={{ marginTop: 8 }}
                locale={{ emptyText: "Chưa có vật tư nào được thêm" }}
              />
            </div>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default RestockRequestForm;
