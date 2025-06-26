import React, { useState, useEffect, useCallback } from "react";
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
import { medicalSupplyApi } from "../../../api/medicalSupplyApi";
import { restockRequestApi } from "../../../api/restockRequestApi";
import { useAuth } from "../../../contexts/AuthContext";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const RestockRequestForm = ({
  visible,
  onCancel,
  selectedSupplies = [],
  onSuccess,
}) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);

  // Fetch all medical supplies to populate dropdown
  const fetchMedicalSupplies = useCallback(async () => {
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
      console.error("Error fetching medical supplies:", error);
    }
  }, [messageApi]);

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
          notes: "",
        }));

        setRequestItems(items);
      }

      // Reset form
      form.setFieldsValue({
        priority: "MEDIUM",
        reason: "",
      });
    }
  }, [visible, selectedSupplies, form, fetchMedicalSupplies]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (requestItems.length === 0) {
        messageApi.error("Vui lòng thêm ít nhất một vật tư vào yêu cầu.");
        return;
      }

      setSubmitting(true);

      const requestData = {
        requestedBy: user.id,
        priority: values.priority,
        reason: values.reason,
        restockItems: requestItems.map((item) => ({
          medicalSupplyId: item.medicalSupplyId,
          requestedQuantity: item.requestedQuantity,
          notes: item.notes || "",
        })),
      };

      console.log("Submitting restock request:", requestData);

      await restockRequestApi.createRequest(requestData);
      messageApi.success("Tạo yêu cầu nhập kho thành công!");

      // Reset form and close modal
      form.resetFields();
      setRequestItems([]);
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error("Error creating restock request:", error);
      messageApi.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Add new item to the restock request
  const addNewItem = () => {
    const newItemData = form.getFieldsValue([
      "newItemId",
      "newItemQuantity",
      "newItemNotes",
    ]);

    if (!newItemData.newItemId || !newItemData.newItemQuantity) {
      messageApi.error("Vui lòng chọn vật tư và nhập số lượng!");
      return;
    }

    // Check if item already exists
    const exists = requestItems.some(
      (item) => item.medicalSupplyId === newItemData.newItemId
    );
    if (exists) {
      messageApi.error("Vật tư này đã có trong danh sách!");
      return;
    }

    // Find selected supply details
    const selectedSupply = supplies.find(
      (supply) => supply.id === newItemData.newItemId
    );
    if (!selectedSupply) {
      messageApi.error("Không tìm thấy thông tin vật tư!");
      return;
    }

    // Add item to list
    const newItem = {
      medicalSupplyId: selectedSupply.id,
      requestedQuantity: newItemData.newItemQuantity,
      name: selectedSupply.name,
      currentQuantity: selectedSupply.quantity,
      unit: selectedSupply.unit,
      minStockLevel: selectedSupply.minStockLevel,
      notes: newItemData.newItemNotes || "",
    };

    setRequestItems([...requestItems, newItem]);

    // Reset new item form fields
    form.setFieldsValue({
      newItemId: undefined,
      newItemQuantity: undefined,
      newItemNotes: undefined,
    });
  };

  // Remove an item from the restock request
  const removeItem = (itemIndex) => {
    setRequestItems(requestItems.filter((_, index) => index !== itemIndex));
  };

  // Update quantity for an item in the request list
  const updateItemQuantity = (itemIndex, newQuantity) => {
    if (newQuantity && newQuantity > 0) {
      const updatedItems = [...requestItems];
      updatedItems[itemIndex].requestedQuantity = newQuantity;
      setRequestItems(updatedItems);
    }
  };

  // Update notes for an item in the request list
  const updateItemNotes = (itemIndex, newNotes) => {
    const updatedItems = [...requestItems];
    updatedItems[itemIndex].notes = newNotes || "";
    setRequestItems(updatedItems);
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
      render: (value, record, index) => (
        <Space>
          <InputNumber
            min={1}
            value={value}
            onChange={(newValue) => updateItemQuantity(index, newValue)}
            style={{ width: 80 }}
            size="small"
          />
          <span>{record.unit}</span>
        </Space>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (value, record, index) => (
        <Input
          value={value || ""}
          onChange={(e) => updateItemNotes(index, e.target.value)}
          placeholder="Thêm ghi chú..."
          size="small"
          style={{ width: "100%" }}
        />
      ),
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
          size="small"
        />
      ),
    },
  ];

  // Filter available supplies (exclude already added ones)
  const availableSupplies = supplies.filter(
    (supply) =>
      !requestItems.some((item) => item.medicalSupplyId === supply.id)
  );

  return (
    <>
      {contextHolder}
      <Modal
        title="Tạo yêu cầu nhập kho"
        open={visible}
        onCancel={onCancel}
        width={1000}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={handleSubmit}
            disabled={requestItems.length === 0}
          >
            Tạo yêu cầu
          </Button>,
        ]}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {/* Request Info */}
          <div style={{ marginBottom: 24 }}>
            <Text strong>Thông tin yêu cầu</Text>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                style={{ flex: 1 }}
                initialValue="MEDIUM"
                rules={[{ required: true, message: "Vui lòng chọn mức độ ưu tiên!" }]}
              >
                <Select>
                  <Option value="LOW">Thấp</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HIGH">Cao</Option>
                  <Option value="URGENT">Khẩn cấp</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="reason"
                label="Lý do"
                style={{ flex: 2 }}
                rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Nhập lý do cần nhập kho..."
                />
              </Form.Item>
            </div>
          </div>

          {/* Add New Item */}
          <div style={{ marginBottom: 24 }}>
            <Text strong>Thêm vật tư</Text>
            <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "end" }}>
              <Form.Item
                name="newItemId"
                label="Vật tư y tế"
                style={{ flex: 2 }}
              >
                <Select
                  placeholder="Chọn vật tư y tế"
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={loading}
                >
                  {availableSupplies.map((supply) => (
                    <Option key={supply.id} value={supply.id}>
                      <Space>
                        {supply.name}
                        {supply.quantity < supply.minStockLevel && (
                          <Tag color="orange" size="small">
                            Thiếu hàng
                          </Tag>
                        )}
                        <Text type="secondary">
                          ({supply.quantity} {supply.unit})
                        </Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="newItemQuantity"
                label="Số lượng"
                style={{ flex: 1 }}
              >
                <InputNumber
                  min={1}
                  placeholder="SL"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="newItemNotes"
                label="Ghi chú"
                style={{ flex: 1 }}
              >
                <Input placeholder="Ghi chú..." />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addNewItem}
                >
                  Thêm
                </Button>
              </Form.Item>
            </div>
          </div>

          {/* Request Items List */}
          <div>
            <Text strong>Danh sách vật tư ({requestItems.length})</Text>
            {requestItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#999",
                  marginTop: 12,
                }}
              >
                <InboxOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <br />
                Chưa có vật tư nào được thêm vào yêu cầu
              </div>
            ) : (
              <Table
                columns={itemColumns}
                dataSource={requestItems}
                rowKey={(record, index) => `${record.medicalSupplyId}-${index}`}
                pagination={false}
                size="small"
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default RestockRequestForm;
