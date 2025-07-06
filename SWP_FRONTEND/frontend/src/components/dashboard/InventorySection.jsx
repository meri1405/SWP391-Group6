import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Tag,
  message,
  Row,
  Col,
  Tabs,
  Typography,
  Descriptions,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  WarningOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { restockRequestApi } from "../../api/restockRequestApi";
import { medicalSupplyApi } from "../../api/medicalSupplyApi";
import { unitConversionApi } from "../../api/unitConversionApi";
import webSocketService from "../../services/webSocketService";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const { Title, Text } = Typography;

const InventorySection = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("medicines");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // Add status filter
  const [messageApi, contextHolder] = message.useMessage();
  const [restockRequests, setRestockRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [convertibleBaseUnits, setConvertibleBaseUnits] = useState([]);
  const [selectedDisplayUnit, setSelectedDisplayUnit] = useState("");

  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);

  // Helper function to get current user ID from JWT token
  const getCurrentUserId = () => {
    // Default to manager ID 2 if we can't get the actual ID
    let currentUserId = 2;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Try to extract user ID from token payload
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const payload = JSON.parse(jsonPayload);
        if (payload.userId) {
          // Ensure we're returning a numeric value
          currentUserId = Number(payload.userId);
        } else if (payload.sub) {
          // If 'sub' is a number, use it directly; otherwise, default to manager ID
          if (!isNaN(Number(payload.sub))) {
            currentUserId = Number(payload.sub);
          } else {
            console.warn("Token contains non-numeric user ID:", payload.sub);
            // Keep the default manager ID (2)
          }
        }
      } catch (err) {
        console.error("Error parsing token:", err);
      }
    }

    console.log("Resolved user ID:", currentUserId);
    return currentUserId;
  };

  const getStatusTag = (record) => {
    const quantityInBaseUnit = record.quantityInBaseUnit || 0;
    const minStockLevelInBaseUnit = record.minStockLevelInBaseUnit || 0;
    const isEnabled = record.enabled !== false; // Default to true if not specified
    const expirationDate = record.expirationDate
      ? dayjs(record.expirationDate)
      : null;
    const today = dayjs();
    const isNearExpiry =
      expirationDate && expirationDate.diff(today, "day") <= 30;
    const isLowStock = quantityInBaseUnit <= minStockLevelInBaseUnit;
    const isVeryLowStock = quantityInBaseUnit <= minStockLevelInBaseUnit * 0.5;

    if (!isEnabled) {
      return (
        <Tag
          style={{ backgroundColor: "#d9d9d9", color: "#595959" }}
          icon={<CloseOutlined />}
        >
          Ngừng sử dụng
        </Tag>
      );
    }

    // Create tags array to show multiple statuses if needed
    const tags = [];

    // Add stock status tag - prioritize this
    if (isVeryLowStock) {
      tags.push(
        <Tag color="red" icon={<WarningOutlined />} key="stock">
          Sắp hết
        </Tag>
      );
    } else if (isLowStock) {
      tags.push(
        <Tag color="orange" key="stock">
          Tồn kho thấp
        </Tag>
      );
    }

    // Add expiration tag if near expiry
    if (isNearExpiry) {
      const daysUntilExpiry = expirationDate.diff(today, "day");
      const expiryColor = daysUntilExpiry <= 7 ? "red" : "orange";
      tags.push(
        <Tag color={expiryColor} key="expiry" style={{ marginLeft: 4 }}>
          {daysUntilExpiry < 0 ? "Đã hết hạn" : `Còn ${daysUntilExpiry} ngày`}
        </Tag>
      );
    }

    // If no warning tags, show normal status
    if (tags.length === 0) {
      return <Tag color="green">Còn hàng</Tag>;
    }

    // Return all applicable tags
    return <>{tags}</>;
  };

  const getCategoryTag = (category) => {
    const config = {
      painkiller: { color: "blue", text: "Giảm đau" },
      antibiotic: { color: "purple", text: "Kháng sinh" },
      vitamin: { color: "orange", text: "Vitamin" },
      supplement: { color: "cyan", text: "Thực phẩm bổ sung" },
      bandage: { color: "cyan", text: "Băng y tế" },
      gloves: { color: "green", text: "Găng tay" },
      equipment: { color: "geekblue", text: "Thiết bị" },
      antiseptic: { color: "red", text: "Sát trung" },
      medical_device: { color: "magenta", text: "Thiết bị y tế" },
      other: { color: "default", text: "Khác" },
    };

    // Safe access with fallback
    const categoryLower = category?.toLowerCase() || "other";
    const categoryConfig = config[categoryLower] || config.other;

    return <Tag color={categoryConfig.color}>{categoryConfig.text}</Tag>;
  };

  // Load available units from unit conversions
  const loadAvailableUnits = useCallback(async () => {
    try {
      const response = await unitConversionApi.getAllUnits();
      if (response && Array.isArray(response)) {
        setAvailableUnits(response);
      } else {
        // Set default units if API fails or returns invalid data
        setAvailableUnits([
          "mg",
          "g",
          "kg",
          "ml",
          "l",
          "viên",
          "hộp",
          "lọ",
          "chai",
          "gói",
          "tuýp",
          "cuộn",
          "cái",
          "chiếc",
          "bộ",
          "hũ",
          "unit",
          "IU",
          "mcg",
        ]);
      }
    } catch (error) {
      console.error("Error loading available units:", error);
      // Set default units if API fails
      setAvailableUnits([
        "mg",
        "g",
        "kg",
        "ml",
        "l",
        "viên",
        "hộp",
        "lọ",
        "chai",
        "gói",
        "tuýp",
        "cuộn",
        "cái",
        "chiếc",
        "bộ",
        "hũ",
        "unit",
        "IU",
        "mcg",
      ]);
    }
  }, []);

  // Load convertible base units when display unit changes
  const loadConvertibleBaseUnits = useCallback(async (displayUnit) => {
    if (!displayUnit) {
      setConvertibleBaseUnits([]);
      return;
    }

    try {
      const convertibleUnits = await unitConversionApi.getConvertibleUnits(
        displayUnit
      );
      setConvertibleBaseUnits(convertibleUnits || []);
    } catch (error) {
      console.error("Error loading convertible units:", error);
      // Fallback to allow same unit
      setConvertibleBaseUnits([displayUnit]);
    }
  }, []);

  // Handle display unit change
  const handleDisplayUnitChange = useCallback(
    (value) => {
      setSelectedDisplayUnit(value);
      loadConvertibleBaseUnits(value);

      // Reset base unit if it's not convertible
      const currentBaseUnit = form.getFieldValue("baseUnit");
      if (currentBaseUnit && value) {
        // Check if current base unit is still valid
        unitConversionApi
          .getConvertibleUnits(value)
          .then((convertibleUnits) => {
            if (!convertibleUnits.includes(currentBaseUnit)) {
              form.setFieldsValue({ baseUnit: undefined });
            }
          })
          .catch(() => {
            form.setFieldsValue({ baseUnit: undefined });
          });
      }
    },
    [form, loadConvertibleBaseUnits]
  );

  const medicineColumns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
      render: (category) => getCategoryTag(category),
    },
    {
      title: "Số lượng",
      dataIndex: "displayQuantity",
      key: "displayQuantity",
      render: (displayQuantity, record) => {
        const quantity = displayQuantity || 0;
        const unit = record.displayUnit || "unit";
        const baseQuantity = record.quantityInBaseUnit || 0;
        const baseUnit = record.baseUnit || "unit";

        return (
          <div>
            <div>
              {quantity} {unit}
            </div>
            {baseUnit !== unit && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                ({baseQuantity} {baseUnit})
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date, record) => {
        if (!date) return "Không có";

        const expirationDate = dayjs(date);
        const today = dayjs();
        const daysUntilExpiry = expirationDate.diff(today, "day");
        const isNearExpiry = daysUntilExpiry <= 30;
        const isLowStock =
          (record.quantityInBaseUnit || 0) <=
          (record.minStockLevelInBaseUnit || 0);

        let style = {};
        if (isNearExpiry && isLowStock) {
          style = {
            color: daysUntilExpiry <= 7 ? "#ff4d4f" : "#faad14",
            fontWeight: "bold",
            backgroundColor: daysUntilExpiry <= 7 ? "#fff1f0" : "#fff7e6",
            padding: "2px 8px",
            borderRadius: "4px",
          };
        }

        return <span style={style}>{expirationDate.format("DD/MM/YYYY")}</span>;
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        // Check if item is expired
        const isExpired =
          record.expirationDate &&
          dayjs(record.expirationDate).isBefore(dayjs(), "day");

        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            {record.enabled ? (
              <Button
                type="default"
                size="small"
                onClick={() => handleDisableSupply(record)}
                style={{ color: "#f5222d", borderColor: "#f5222d" }}
              >
                Vô hiệu
              </Button>
            ) : (
              <Button
                type="default"
                size="small"
                onClick={() => handleEnableSupply(record)}
                style={{ color: "#52c41a", borderColor: "#52c41a" }}
              >
                Kích hoạt
              </Button>
            )}
            {!isExpired &&
              record.quantityInBaseUnit <= record.minStockLevelInBaseUnit && (
                <Tag color="warning" style={{ marginLeft: 8 }}>
                  Cần bổ sung
                </Tag>
              )}
          </Space>
        );
      },
    },
  ];

  const supplyColumns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
      render: (category) => getCategoryTag(category),
    },
    {
      title: "Số lượng",
      dataIndex: "displayQuantity",
      key: "displayQuantity",
      render: (displayQuantity, record) => {
        const quantity = displayQuantity || 0;
        const unit = record.displayUnit || "unit";
        const baseQuantity = record.quantityInBaseUnit || 0;
        const baseUnit = record.baseUnit || "unit";

        return (
          <div>
            <div>
              {quantity} {unit}
            </div>
            {baseUnit !== unit && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                ({baseQuantity} {baseUnit})
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => {
        // Check if item is expired
        const isExpired =
          record.expirationDate &&
          dayjs(record.expirationDate).isBefore(dayjs(), "day");

        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
            {record.enabled ? (
              <Button
                type="default"
                size="small"
                onClick={() => handleDisableSupply(record)}
                style={{ color: "#f5222d", borderColor: "#f5222d" }}
              >
                Vô hiệu
              </Button>
            ) : (
              <Button
                type="default"
                size="small"
                onClick={() => handleEnableSupply(record)}
                style={{ color: "#52c41a", borderColor: "#52c41a" }}
              >
                Kích hoạt
              </Button>
            )}
            {!isExpired &&
              record.quantityInBaseUnit <= record.minStockLevelInBaseUnit && (
                <Tag color="warning" style={{ marginLeft: 8 }}>
                  Cần bổ sung
                </Tag>
              )}
          </Space>
        );
      },
    },
  ];

  // Restock request columns for manager review
  const requestColumns = [
    {
      title: "STT",
      key: "index",
      width: 80,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Người yêu cầu",
      dataIndex: "requestedByName",
      key: "requestedByName",
      render: (text) => text || "Không có thông tin",
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "requestDate",
      key: "requestDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        const config = {
          HIGH: { color: "red", text: "Cao" },
          MEDIUM: { color: "orange", text: "Trung bình" },
          LOW: { color: "green", text: "Thấp" },
        };
        return (
          <Tag color={config[priority]?.color}>
            {config[priority]?.text || priority}
          </Tag>
        );
      },
    },
    {
      title: "Số vật tư",
      key: "itemCount",
      render: (_, record) => record.restockItems?.length || 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          PENDING: { color: "blue", text: "Chờ duyệt" },
          APPROVED: { color: "green", text: "Đã duyệt" },
          REJECTED: { color: "red", text: "Từ chối" },
        };
        return (
          <Tag color={config[status]?.color}>
            {config[status]?.text || status}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedRequest(record);
              setShowRequestModal(true);
            }}
          >
            Xem
          </Button>
          {record.status === "PENDING" && (
            <>
              <Button
                type="default"
                icon={<CheckOutlined />}
                size="small"
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  color: "white",
                }}
                onClick={() => {
                  setSelectedRequest(record);
                  setShowApprovalModal(true);
                }}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận từ chối",
                    content: (
                      <div>
                        <p>Bạn có chắc chắn muốn từ chối yêu cầu này?</p>
                        <Form.Item
                          label="Lý do từ chối"
                          name="rejectionReason"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập lý do từ chối",
                            },
                          ]}
                        >
                          <TextArea
                            id="rejectionReason"
                            rows={3}
                            placeholder="Nhập lý do từ chối..."
                            onChange={(e) => {
                              Modal.confirm.rejectionReason = e.target.value;
                            }}
                          />
                        </Form.Item>
                      </div>
                    ),
                    onOk: () => {
                      const reason =
                        document.getElementById("rejectionReason").value;
                      if (!reason || reason.trim() === "") {
                        messageApi.error("Vui lòng nhập lý do từ chối");
                        return Promise.reject(
                          "Lý do từ chối không được để trống"
                        );
                      }
                      handleRejectRequest(record.id, reason);
                    },
                  });
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleAdd = async (values) => {
    try {
      setLoading(true);

      console.log("Form values received:", values);

      // Validate numeric fields
      const displayQuantity = values.displayQuantity;
      const minStockLevelInBaseUnit = values.minStockLevelInBaseUnit;

      // Check for valid numbers before proceeding
      if (displayQuantity && !/^[0-9]+(\.[0-9]+)?$/.test(displayQuantity)) {
        messageApi.error("Số lượng hiển thị phải là số");
        setLoading(false);
        return;
      }

      if (
        minStockLevelInBaseUnit &&
        !/^[0-9]+(\.[0-9]+)?$/.test(minStockLevelInBaseUnit)
      ) {
        messageApi.error("Số lượng tối thiểu phải là số");
        setLoading(false);
        return;
      }

      // Map form values to API format using new DTO structure
      const supplyData = {
        name: values?.name,
        category: values?.category,
        displayQuantity: Number(displayQuantity) || 0,
        displayUnit: values?.displayUnit,
        baseUnit: values?.baseUnit,
        // Calculate quantityInBaseUnit (for now, same as displayQuantity until we have conversion)
        quantityInBaseUnit: Number(displayQuantity) || 0,
        supplier: values?.supplier,
        minStockLevelInBaseUnit: Number(values?.minStockLevelInBaseUnit) || 0,
        expirationDate: values?.expirationDate || null, // Only for medicines
        location: values?.location,
        description:
          values?.description || `${values?.category} - ${values?.name}`,
        enabled: true,
      };

      console.log("Supply data JSON:", JSON.stringify(supplyData, null, 2));

      let newOrUpdatedSupply;

      if (editingRecord) {
        // Update existing supply
        newOrUpdatedSupply = await medicalSupplyApi.updateSupply(
          editingRecord.id,
          supplyData
        );
        messageApi.success("Cập nhật thành công");

        // Immediately update the item in the local state to avoid needing refresh
        if (newOrUpdatedSupply) {
          const updatedSupply = {
            ...newOrUpdatedSupply,
            updatedAt: new Date().toISOString(),
          };

          // Update in medicines list if it exists there
          setMedicines((prevMedicines) => {
            const index = prevMedicines.findIndex(
              (item) => item.id === updatedSupply.id
            );
            if (index >= 0) {
              const newMedicines = [...prevMedicines];
              newMedicines[index] = updatedSupply;
              // Move updated item to the top
              newMedicines.splice(0, 0, newMedicines.splice(index, 1)[0]);
              return newMedicines;
            }
            return prevMedicines;
          });

          // Update in supplies list if it exists there
          setSupplies((prevSupplies) => {
            const index = prevSupplies.findIndex(
              (item) => item.id === updatedSupply.id
            );
            if (index >= 0) {
              const newSupplies = [...prevSupplies];
              newSupplies[index] = updatedSupply;
              // Move updated item to the top
              newSupplies.splice(0, 0, newSupplies.splice(index, 1)[0]);
              return newSupplies;
            }
            return prevSupplies;
          });
        }
      } else {
        // Create new supply
        newOrUpdatedSupply = await medicalSupplyApi.createSupply(supplyData);
        messageApi.success("Thêm mới thành công");

        // Immediately add the new item to the local state
        if (newOrUpdatedSupply) {
          const createdSupply = {
            ...newOrUpdatedSupply,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add to the appropriate list based on category
          const medicineCategories = [
            "painkiller",
            "antibiotic",
            "vitamin",
            "supplement",
          ];
          const category = createdSupply.category?.toLowerCase() || "";
          const isMedicine =
            medicineCategories.includes(category) ||
            createdSupply.name?.toLowerCase().includes("thuốc") ||
            createdSupply.name?.toLowerCase().includes("viên") ||
            createdSupply.name?.toLowerCase().includes("mg") ||
            createdSupply.description?.toLowerCase().includes("thuốc");

          if (isMedicine) {
            setMedicines((prevMedicines) => [createdSupply, ...prevMedicines]);
          } else {
            setSupplies((prevSupplies) => [createdSupply, ...prevSupplies]);
          }
        }
      }

      // Also fetch from server to ensure everything is in sync
      // We'll do this in the background to ensure the UI is responsive
      fetchMedicalSupplies().catch((error) => {
        console.error("Error refreshing data after update:", error);
      });

      setShowAddModal(false);
      setEditingRecord(null);
      setSelectedDisplayUnit("");
      setConvertibleBaseUnits([]);
      form.resetFields();
    } catch (error) {
      console.error("Error saving supply:", error);
      console.error("Error details:", error.response?.data || error.message);
      messageApi.error(
        editingRecord
          ? "Có lỗi xảy ra khi cập nhật"
          : "Có lỗi xảy ra khi thêm mới"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setShowAddModal(true);
  };

  // Handle supply enable/disable
  const handleEnableSupply = async (record) => {
    try {
      // Check if the item has expiration date and is expired
      if (record.expirationDate) {
        const expirationDate = dayjs(record.expirationDate);
        const today = dayjs();
        if (expirationDate.isBefore(today, "day")) {
          messageApi.error("Không thể kích hoạt vật tư đã hết hạn sử dụng");
          return;
        }
      }

      setLoading(true);
      await medicalSupplyApi.enableSupply(record.id);
      messageApi.success("Đã kích hoạt vật tư y tế");

      // Immediately update the UI with the enabled item
      const updatedRecord = {
        ...record,
        enabled: true,
        updatedAt: new Date().toISOString(),
      };

      // Update in medicines or supplies list based on where it exists
      setMedicines((prevMedicines) => {
        const index = prevMedicines.findIndex((item) => item.id === record.id);
        if (index >= 0) {
          const newMedicines = [...prevMedicines];
          newMedicines[index] = updatedRecord;
          // Move to top of the list
          newMedicines.splice(0, 0, newMedicines.splice(index, 1)[0]);
          return newMedicines;
        }
        return prevMedicines;
      });

      setSupplies((prevSupplies) => {
        const index = prevSupplies.findIndex((item) => item.id === record.id);
        if (index >= 0) {
          const newSupplies = [...prevSupplies];
          newSupplies[index] = updatedRecord;
          // Move to top of the list
          newSupplies.splice(0, 0, newSupplies.splice(index, 1)[0]);
          return newSupplies;
        }
        return prevSupplies;
      });

      // Fetch in background to ensure data is in sync
      fetchMedicalSupplies().catch((error) => {
        console.error("Error refreshing data after enabling:", error);
      });
    } catch (error) {
      console.error("Error enabling supply:", error);
      messageApi.error("Có lỗi xảy ra khi kích hoạt vật tư");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSupply = async (record) => {
    Modal.confirm({
      title: "Xác nhận vô hiệu hóa",
      content:
        "Bạn có chắc chắn muốn vô hiệu hóa vật tư này? Vật tư sẽ không được hiển thị trong danh sách sử dụng.",
      okText: "Vô hiệu",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          await medicalSupplyApi.disableSupply(record.id);
          messageApi.success("Đã vô hiệu hóa vật tư y tế");

          // Immediately update the UI with the disabled item
          const updatedRecord = {
            ...record,
            enabled: false,
            updatedAt: new Date().toISOString(),
          };

          // Update in medicines or supplies list based on where it exists
          setMedicines((prevMedicines) => {
            const index = prevMedicines.findIndex(
              (item) => item.id === record.id
            );
            if (index >= 0) {
              const newMedicines = [...prevMedicines];
              newMedicines[index] = updatedRecord;
              // Move to top of the list
              newMedicines.splice(0, 0, newMedicines.splice(index, 1)[0]);
              return newMedicines;
            }
            return prevMedicines;
          });

          setSupplies((prevSupplies) => {
            const index = prevSupplies.findIndex(
              (item) => item.id === record.id
            );
            if (index >= 0) {
              const newSupplies = [...prevSupplies];
              newSupplies[index] = updatedRecord;
              // Move to top of the list
              newSupplies.splice(0, 0, newSupplies.splice(index, 1)[0]);
              return newSupplies;
            }
            return prevSupplies;
          });

          // Fetch in background to ensure data is in sync
          fetchMedicalSupplies().catch((error) => {
            console.error("Error refreshing data after disabling:", error);
          });
        } catch (error) {
          console.error("Error disabling supply:", error);
          messageApi.error("Có lỗi xảy ra khi vô hiệu hóa vật tư");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle auto-disable expired supplies
  const handleAutoDisableExpiredSupplies = async (supplies) => {
    const today = dayjs();
    const expiredSupplies = supplies.filter((item) => {
      const expirationDate = dayjs(item.expirationDate);
      return expirationDate.isBefore(today, "day") && item.enabled !== false;
    });

    if (expiredSupplies.length > 0) {
      console.log(
        `Found ${expiredSupplies.length} expired supplies to disable`
      );
      for (const supply of expiredSupplies) {
        try {
          await medicalSupplyApi.disableSupply(supply.id);
          console.log(`Auto-disabled expired supply: ${supply.name}`);

          // Update local state
          setMedicines((prev) =>
            prev.map((item) =>
              item.id === supply.id ? { ...item, enabled: false } : item
            )
          );
          setSupplies((prev) =>
            prev.map((item) =>
              item.id === supply.id ? { ...item, enabled: false } : item
            )
          );
        } catch (error) {
          console.error(
            `Error auto-disabling expired supply ${supply.id}:`,
            error
          );
        }
      }
      messageApi.warning(
        `${expiredSupplies.length} vật tư đã hết hạn sử dụng và đã bị tự động vô hiệu hóa`
      );
    }
  };

  // Fetch medical supplies from database
  const fetchMedicalSupplies = useCallback(async () => {
    try {
      setLoading(true);
      const allSupplies = await medicalSupplyApi.getAllSupplies();
      console.log("Fetched medical supplies:", allSupplies);

      // Auto-disable expired supplies
      await handleAutoDisableExpiredSupplies(allSupplies);

      // Sort by last modified date (updatedAt or createdAt), most recent first
      const sortedSupplies = [...allSupplies].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA; // descending order (newest first)
      });

      // Separate medicines and supplies based on category
      const medicineCategories = [
        "painkiller",
        "antibiotic",
        "vitamin",
        "supplement",
      ];
      const medicineItems = sortedSupplies.filter((item) => {
        const category = item.category?.toLowerCase() || "";
        return (
          medicineCategories.includes(category) ||
          item.name?.toLowerCase().includes("thuốc") ||
          item.name?.toLowerCase().includes("viên") ||
          item.name?.toLowerCase().includes("mg") ||
          item.description?.toLowerCase().includes("thuốc")
        );
      });

      const supplyItems = sortedSupplies.filter((item) => {
        const category = item.category?.toLowerCase() || "";
        return (
          !medicineCategories.includes(category) &&
          !item.name?.toLowerCase().includes("thuốc") &&
          !item.name?.toLowerCase().includes("viên") &&
          !item.name?.toLowerCase().includes("mg") &&
          !item.description?.toLowerCase().includes("thuốc")
        );
      });

      console.log("Medicines (sorted by last modified):", medicineItems);
      console.log("Supplies (sorted by last modified):", supplyItems);

      setMedicines(medicineItems);
      setSupplies(supplyItems);
    } catch (error) {
      console.error("Error fetching medical supplies:", error);
      messageApi.error("Không thể tải danh sách vật tư y tế");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  // Fetch restock requests for manager review
  const fetchRestockRequests = useCallback(
    async (status = "all") => {
      if (!isMounted.current) return;

      try {
        console.log(
          "[InventorySection] Fetching restock requests with status:",
          status
        );
        setLoading(true);
        let requests;

        if (status === "all") {
          requests = await restockRequestApi.getAllRequests();
        } else {
          requests = await restockRequestApi.getRequestsByStatus(status);
        }

        console.log(
          "[InventorySection] Fetched restock requests:",
          requests.length
        );
        if (requests.length > 0) {
          console.log(
            "[InventorySection] Sample request with items:",
            requests[0]
          );
        }

        if (isMounted.current) {
          setRestockRequests(requests);
        }
      } catch (error) {
        console.error(
          "[InventorySection] Error fetching restock requests:",
          error
        );
        if (isMounted.current) {
          messageApi.error("Không thể tải danh sách yêu cầu bổ sung");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [messageApi]
  );

  useEffect(() => {
    // Load medical supplies and available units on component mount
    fetchMedicalSupplies();
    loadAvailableUnits();
  }, [fetchMedicalSupplies, loadAvailableUnits]);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRestockRequests(statusFilter);

      console.log(
        "[InventorySection] Setting up WebSocket listener for restock requests"
      );
      // Use WebSocketService for real-time updates
      const unsubscribe = webSocketService.addRestockRequestListener(() => {
        console.log(
          "[InventorySection] Received restock request update from WebSocketService"
        );
        if (isMounted.current) {
          fetchRestockRequests(statusFilter);
        }
      });

      // Clean up subscription when component unmounts or tab changes
      return () => {
        console.log("[InventorySection] Cleaning up WebSocket listener");
        unsubscribe();
      };
    }
  }, [activeTab, statusFilter, fetchRestockRequests]);

  // Handle request approval
  const handleApproveRequest = async (
    requestId,
    approvedItems,
    reviewNotes
  ) => {
    try {
      // Transform the approvedItems array into a map of item ID to approval data
      const itemApprovals = {};
      approvedItems.forEach((item) => {
        itemApprovals[item.itemId] = {
          quantity: item.approvedQuantity,
          unit: item.unit || "unit", // Use the item's unit or default to 'unit'
        };
      });

      // Get current user ID from helper function
      const currentUserId = getCurrentUserId();
      console.log("Using reviewer ID:", currentUserId);

      const approvalData = {
        reviewerId: currentUserId, // Use the actual logged in user ID
        reviewNotes: reviewNotes || "Duyệt bởi quản lý trường", // Use provided notes or default
        itemApprovals: itemApprovals,
      };

      await restockRequestApi.approveRequest(requestId, approvalData);
      messageApi.success("Đã duyệt yêu cầu bổ sung");
      fetchRestockRequests();
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
      messageApi.error("Có lỗi xảy ra khi duyệt yêu cầu");
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId, reason) => {
    try {
      if (!reason || reason.trim() === "") {
        messageApi.error("Vui lòng nhập lý do từ chối");
        return;
      }

      // Get current user ID from helper function
      const currentUserId = getCurrentUserId();
      console.log("Using reviewer ID for rejection:", currentUserId);

      const rejectionData = {
        reviewerId: currentUserId, // Use the actual logged in user ID
        reviewNotes: reason,
      };

      await restockRequestApi.rejectRequest(requestId, rejectionData);
      messageApi.success("Đã từ chối yêu cầu bổ sung");
      fetchRestockRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      messageApi.error("Có lỗi xảy ra khi từ chối yêu cầu");
    }
  };

  const getTableData = () => {
    if (activeTab === "requests") {
      // Sort restock requests by requestDate (newest first)
      return [...restockRequests].sort((a, b) => {
        const dateA = new Date(a.requestDate || 0);
        const dateB = new Date(b.requestDate || 0);
        return dateB - dateA; // descending order (newest first)
      });
    }

    // For medicines and supplies, apply filtering and maintain sorting
    const filteredData =
      activeTab === "medicines"
        ? medicines.filter((medicine) => {
            const matchesSearch =
              medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              medicine.supplier
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesCategory =
              categoryFilter === "all" || medicine.category === categoryFilter;
            return matchesSearch && matchesCategory;
          })
        : supplies.filter((supply) => {
            const matchesSearch =
              supply.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supply.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory =
              categoryFilter === "all" || supply.category === categoryFilter;
            return matchesSearch && matchesCategory;
          });

    // Sort the filtered data by last modified date (newest first)
    return [...filteredData].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA; // descending order (newest first)
    });
  };

  const getTableColumns = () => {
    if (activeTab === "requests") {
      return requestColumns;
    }
    return activeTab === "medicines" ? medicineColumns : supplyColumns;
  };

  // Add a manual refresh function for testing
  const handleManualRefresh = () => {
    console.log("[InventorySection] Manual refresh triggered");
    fetchRestockRequests(statusFilter);
  };

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className="inventory-section">
      {contextHolder}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "medicines",
                label: <span>Thuốc ({medicines.length})</span>,
              },
              {
                key: "supplies",
                label: <span>Vật tư ({supplies.length})</span>,
              },
              {
                key: "requests",
                label: <span>Yêu cầu bổ sung ({restockRequests.length})</span>,
              },
            ]}
          />
          {activeTab !== "requests" ? (
            <Space>
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
            </Space>
          ) : (
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleManualRefresh}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          )}
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={activeTab === "requests"}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: "100%" }}
              value={activeTab === "requests" ? statusFilter : categoryFilter}
              onChange={
                activeTab === "requests" ? setStatusFilter : setCategoryFilter
              }
            >
              {activeTab === "requests" ? (
                <>
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="PENDING">Chờ duyệt</Option>
                  <Option value="APPROVED">Đã duyệt</Option>
                  <Option value="REJECTED">Từ chối</Option>
                </>
              ) : (
                <>
                  <Option value="all">Tất cả loại</Option>
                  {activeTab === "medicines" ? (
                    <>
                      <Option value="painkiller">Giảm đau</Option>
                      <Option value="antibiotic">Kháng sinh</Option>
                      <Option value="vitamin">Vitamin</Option>
                      <Option value="supplement">Thực phẩm bổ sung</Option>
                    </>
                  ) : (
                    <>
                      <Option value="bandage">Băng y tế</Option>
                      <Option value="gloves">Găng tay</Option>
                      <Option value="equipment">Thiết bị</Option>
                      <Option value="antiseptic">Sát trung</Option>
                      <Option value="medical_device">Thiết bị y tế</Option>
                      <Option value="other">Khác</Option>
                    </>
                  )}
                </>
              )}
            </Select>
          </Col>
        </Row>

        <Table
          columns={getTableColumns()}
          dataSource={getTableData()}
          rowKey="id"
          loading={loading && activeTab === "requests"}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText:
              activeTab === "requests"
                ? "Không có yêu cầu bổ sung nào"
                : "Không có dữ liệu",
          }}
          // Data is already sorted by last modified date (newest first)
          // This key helps re-render the table when data changes
          key={`${activeTab}-table-${medicines.length + supplies.length}`}
        />
      </Card>

      <Modal
        title={editingRecord ? "Sửa thông tin" : "Thêm mới"}
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          setEditingRecord(null);
          setSelectedDisplayUnit("");
          setConvertibleBaseUnits([]);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="name"
            label={activeTab === "medicines" ? "Tên thuốc" : "Tên vật tư"}
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input
              placeholder={`Nhập tên ${
                activeTab === "medicines" ? "thuốc" : "vật tư"
              }`}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại">
              {activeTab === "medicines" ? (
                <>
                  <Option value="painkiller">Giảm đau</Option>
                  <Option value="antibiotic">Kháng sinh</Option>
                  <Option value="vitamin">Vitamin</Option>
                  <Option value="supplement">Thực phẩm bổ sung</Option>
                </>
              ) : (
                <>
                  <Option value="bandage">Băng y tế</Option>
                  <Option value="gloves">Găng tay</Option>
                  <Option value="equipment">Thiết bị</Option>
                  <Option value="antiseptic">Sát trung</Option>
                  <Option value="medical_device">Thiết bị y tế</Option>
                </>
              )}
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="displayQuantity"
            label="Số lượng hiển thị"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng hiển thị" },
              {
                pattern: /^[0-9]+(\.[0-9]+)?$/,
                message: "Vui lòng nhập số, không nhập chữ hoặc ký tự đặc biệt",
              },
            ]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input
              type="text"
              style={{ width: "100%" }}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !/^[0-9]*(\.[0-9]*)?$/.test(value)) {
                  messageApi.error("Vui lòng chỉ nhập số");
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="displayUnit"
            label="Đơn vị hiển thị"
            rules={[
              { required: true, message: "Vui lòng chọn đơn vị hiển thị" },
            ]}
          >
            <Select
              placeholder="Chọn đơn vị hiển thị"
              showSearch
              allowClear
              optionFilterProp="children"
              onChange={handleDisplayUnitChange}
            >
              {availableUnits.map((unit) => (
                <Option key={unit} value={unit}>
                  {unit}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="baseUnit"
            label="Đơn vị cơ sở"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị cơ sở" }]}
          >
            <Select
              placeholder={
                selectedDisplayUnit
                  ? "Chọn đơn vị cơ sở có thể chuyển đổi"
                  : "Vui lòng chọn đơn vị hiển thị trước"
              }
              showSearch
              allowClear
              optionFilterProp="children"
              disabled={!selectedDisplayUnit}
            >
              {convertibleBaseUnits.map((unit) => (
                <Option key={unit} value={unit}>
                  {unit}
                  {unit === selectedDisplayUnit && " (cùng đơn vị)"}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {activeTab === "medicines" && (
            <Form.Item
              name="expirationDate"
              label="Hạn sử dụng"
              rules={[
                { required: true, message: "Vui lòng nhập hạn sử dụng" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const selectedDate = new Date(value);

                    if (selectedDate < today) {
                      return Promise.reject(
                        "Hạn sử dụng không thể là ngày trong quá khứ"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="date" min={new Date().toISOString().split("T")[0]} />
            </Form.Item>
          )}

          <Form.Item
            name="supplier"
            label="Nhà cung cấp"
            rules={[{ required: true, message: "Vui lòng nhập nhà cung cấp" }]}
          >
            <Input placeholder="Nhập tên nhà cung cấp" />
          </Form.Item>

          <Form.Item
            name="minStockLevelInBaseUnit"
            label="Số lượng tối thiểu (đơn vị cơ sở)"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số lượng tối thiểu theo đơn vị cơ sở",
              },
              {
                pattern: /^[0-9]+(\.[0-9]+)?$/,
                message: "Vui lòng nhập số, không nhập chữ hoặc ký tự đặc biệt",
              },
            ]}
            validateTrigger={["onChange", "onBlur"]}
          >
            <Input
              type="text"
              style={{ width: "100%" }}
              onChange={(e) => {
                const value = e.target.value;
                if (value && !/^[0-9]*(\.[0-9]*)?$/.test(value)) {
                  messageApi.error("Vui lòng chỉ nhập số");
                }
              }}
            />
          </Form.Item>

          <Form.Item name="location" label="Vị trí">
            <Select placeholder="Chọn vị trí" allowClear>
              <Option value="Kệ A1">Kệ A1</Option>
              <Option value="Kệ A2">Kệ A2</Option>
              <Option value="Kệ A3">Kệ A3</Option>
              <Option value="Kệ B1">Kệ B1</Option>
              <Option value="Kệ B2">Kệ B2</Option>
              <Option value="Kệ B3">Kệ B3</Option>
              <Option value="Kệ C1">Kệ C1</Option>
              <Option value="Kệ C2">Kệ C2</Option>
              <Option value="Kệ C3">Kệ C3</Option>
              <Option value="Kệ D1">Kệ D1</Option>
              <Option value="Kệ D2">Kệ D2</Option>
              <Option value="Kệ D3">Kệ D3</Option>
              <Option value="Kệ E1">Kệ E1</Option>
              <Option value="Kệ E2">Kệ E2</Option>
              <Option value="Kệ E3">Kệ E3</Option>
              <Option value="Kệ F1">Kệ F1</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecord(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Request Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu bổ sung"
        open={showRequestModal && selectedRequest}
        onCancel={() => {
          setShowRequestModal(false);
          setSelectedRequest(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setShowRequestModal(false);
              setSelectedRequest(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedRequest && (
          <div>
            <Descriptions
              title="Thông tin yêu cầu"
              bordered
              size="small"
              column={3}
            >
              <Descriptions.Item label="ID">
                {selectedRequest.id}
              </Descriptions.Item>
              <Descriptions.Item label="Người yêu cầu" span={2}>
                {selectedRequest.requestedByName || "Không có thông tin"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">
                {dayjs(selectedRequest.requestDate).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Độ ưu tiên">
                {selectedRequest.priority}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedRequest.status}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do" span={3}>
                {selectedRequest.reason || "Không có lý do"}
              </Descriptions.Item>
              <Descriptions.Item label="Phản hồi" span={3}>
                {selectedRequest.reviewNotes || "Không có phản hồi"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Typography.Title level={5}>
              Danh sách vật tư ({selectedRequest.restockItems?.length || 0} mục)
            </Typography.Title>
            {selectedRequest.restockItems &&
            selectedRequest.restockItems.length > 0 ? (
              <Table
                dataSource={selectedRequest.restockItems}
                columns={[
                  {
                    title: "Tên vật tư",
                    dataIndex: "medicalSupplyName",
                    key: "name",
                  },
                  {
                    title: "Loại",
                    dataIndex: "category",
                    key: "category",
                    render: (category) => getCategoryTag(category),
                  },
                  {
                    title: "Tồn kho hiện tại",
                    key: "currentStock",
                    render: (_, record) => {
                      const displayQty = record.currentDisplayQuantity || 0;
                      const displayUnit = record.currentDisplayUnit || "unit";
                      const stockBasein = record.currentStockInBaseUnit;
                      const baseUnit = record.baseUnit || "unit";
                      return (
                        <>
                          {displayQty} {displayUnit}
                          <br />
                          <span style={{ color: "gray", fontSize: "0.9em" }}>
                            ({stockBasein || 0} {baseUnit})
                          </span>
                        </>
                      );
                    },
                  },
                  {
                    title: "Số lượng yêu cầu",
                    key: "requestedQuantity",
                    render: (_, record) => {
                      const requestedQty =
                        record.requestedQuantityInBaseUnit || 0;
                      const baseUnit = record.baseUnit || "unit";
                      return `${requestedQty} ${baseUnit}`;
                    },
                  },
                  {
                    title: "Số lượng được duyệt",
                    key: "approvedQuantity",
                    render: (_, record) => {
                      // Get request status from parent (selectedRequest)
                      const requestStatus = selectedRequest?.status;

                      if (requestStatus === "REJECTED") {
                        return <Tag color="red">Từ chối</Tag>;
                      } else if (requestStatus === "APPROVED") {
                        if (
                          record.approvedQuantityInBaseUnit &&
                          record.baseUnit
                        ) {
                          return `${record.approvedQuantityInBaseUnit} ${record.baseUnit}`;
                        } else {
                          // Approved but no specific quantity set, show requested quantity
                          const requestedQty =
                            record.requestedQuantityInBaseUnit || 0;
                          const baseUnit = record.baseUnit || "unit";
                          return `${requestedQty} ${baseUnit}`;
                        }
                      } else {
                        return <Tag color="blue">Chưa duyệt</Tag>;
                      }
                    },
                  },
                  {
                    title: "Ghi chú",
                    dataIndex: "notes",
                    key: "notes",
                    ellipsis: true,
                  },
                ]}
                pagination={false}
                rowKey="id"
                size="small"
              />
            ) : (
              <p>Không có vật tư nào trong yêu cầu này</p>
            )}
          </div>
        )}
      </Modal>

      {/* Approval Modal */}
      <Modal
        title="Duyệt yêu cầu bổ sung"
        open={showApprovalModal && selectedRequest}
        onCancel={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
        }}
        footer={null}
        width={800}
      >
        {selectedRequest && (
          <Form
            layout="vertical"
            onFinish={(values) => {
              const approvedItems = selectedRequest.restockItems.map(
                (item) => ({
                  itemId: item.id,
                  approvedQuantity: values[`qty_${item.id}`] || 0,
                  unit: item.baseUnit || "unit",
                })
              );
              handleApproveRequest(
                selectedRequest.id,
                approvedItems,
                values.reviewNotes
              );
            }}
          >
            <Typography.Title level={5}>
              Yêu cầu từ: {selectedRequest.requestedByName}
            </Typography.Title>
            <Typography.Text>Lý do: {selectedRequest.reason}</Typography.Text>

            <Divider />

            <Typography.Title level={5}>
              Duyệt số lượng cho từng vật tư:
            </Typography.Title>

            {selectedRequest.restockItems?.map((item) => (
              <Row key={item.id} gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <strong>{item.medicalSupplyName}</strong>
                  <br />
                  <Typography.Text type="secondary">
                    Tồn kho: {item.currentDisplayQuantity || 0}{" "}
                    {item.currentDisplayUnit || "unit"}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text>
                    Yêu cầu: {item.requestedQuantityInBaseUnit || 0}{" "}
                    {item.baseUnit || "unit"}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name={`qty_${item.id}`}
                    label="Số lượng duyệt"
                    initialValue={item.requestedQuantityInBaseUnit}
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                      {
                        type: "number",
                        min: 0,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      max={(item.requestedQuantityInBaseUnit || 0) * 2}
                      style={{ width: "100%" }}
                      addonAfter={item.baseUnit || "unit"}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            <Form.Item name="reviewNotes" label="Ghi chú duyệt">
              <TextArea rows={3} placeholder="Nhập ghi chú duyệt" />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Duyệt yêu cầu
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default InventorySection;
