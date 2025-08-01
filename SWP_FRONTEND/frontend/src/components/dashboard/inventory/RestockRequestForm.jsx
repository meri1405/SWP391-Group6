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
  Tabs,
  DatePicker,
  Divider,
} from "antd";
import notificationEventService from "../../../services/notificationEventService";
import {
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { medicalSupplyApi } from "../../../api/medicalSupplyApi";
import { restockRequestApi } from "../../../api/restockRequestApi";
import { unitConversionApi } from "../../../api/unitConversionApi";
import { useAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const RestockRequestForm = ({
  visible,
  onCancel,
  selectedSupplies = [],
  onSuccess,
}) => {
  const { user, refreshSession } = useAuth();
  const [form] = Form.useForm();
  const [supplies, setSupplies] = useState([]);
  const [expiredSupplies, setExpiredSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  // Unit conversion states
  const [unitsList, setUnitsList] = useState([]);
  const [convertibleUnits, setConvertibleUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Fetch all units from unitConversion API
  const fetchUnits = useCallback(async () => {
    setLoadingUnits(true);
    try {
      const units = await unitConversionApi.getAllUnits();
      setUnitsList(units);
      console.log("Loaded units:", units);
      setLoadingUnits(false);
    } catch (error) {
      setLoadingUnits(false);
      messageApi.error("Không thể tải danh sách đơn vị. Vui lòng thử lại sau.");
      console.error("Error fetching units:", error);
    }
  }, [messageApi]);

  // Fetch convertible units when base unit changes
  const fetchConvertibleUnits = useCallback(
    async (baseUnit) => {
      if (!baseUnit) {
        setConvertibleUnits([]);
        return;
      }

      setLoadingUnits(true);
      try {
        const units = await unitConversionApi.getConvertibleUnits(baseUnit);
        setConvertibleUnits(units);
        console.log(`Convertible units for ${baseUnit}:`, units);
        setLoadingUnits(false);
      } catch (error) {
        setLoadingUnits(false);
        messageApi.error("Không thể tải danh sách đơn vị tương thích.");
        console.error(
          `Error fetching convertible units for ${baseUnit}:`,
          error
        );
      }
    },
    [messageApi]
  );

  // Handle base unit change
  const handleBaseUnitChange = (value) => {
    fetchConvertibleUnits(value);

    // Reset display unit field when base unit changes
    form.setFieldsValue({
      newSupplyDisplayUnit: undefined,
    });
  };

  // Fetch all medical supplies to populate dropdown
  const fetchMedicalSupplies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicalSupplyApi.getAllSupplies();

      // Separate expired supplies
      const expired = data.filter(
        (supply) =>
          supply.expirationDate &&
          dayjs(supply.expirationDate).isBefore(dayjs())
      );

      setSupplies(data);
      setExpiredSupplies(expired);
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
      fetchUnits(); // Fetch available units

      // Initialize with pre-selected supplies if any
      if (selectedSupplies.length > 0) {
        const items = selectedSupplies.map((supply) => ({
          medicalSupplyId: supply.id,
          requestedQuantity: supply.isLowStock
            ? Math.max(
                (supply.minStockLevelInBaseUnit || supply.minStockLevel || 0) -
                  (supply.quantityInBaseUnit || supply.quantity || 0),
                1
              )
            : 1,
          name: supply.name,
          currentQuantity: supply.quantityInBaseUnit || supply.quantity || 0,
          unit: supply.displayUnit || supply.unit || "unit",
          baseUnit: supply.baseUnit || supply.unit || "unit",
          minStockLevel:
            supply.minStockLevelInBaseUnit || supply.minStockLevel || 0,
          notes: "",
          requestType: "EXISTING",
        }));

        setRequestItems(items);
      }

      // Reset form
      form.setFieldsValue({
        priority: "MEDIUM",
        reason: "",
      });
    }
  }, [visible, selectedSupplies, form, fetchMedicalSupplies, fetchUnits]);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // First check if there are items in the list
      if (requestItems.length === 0) {
        messageApi.error("Vui lòng thêm ít nhất một vật tư vào yêu cầu.");
        return;
      }

      // Log current form values before validation
      const currentValues = form.getFieldsValue();
      console.log("[RestockRequestForm] Current form values:", currentValues);
      
      // Validate only the main form fields (priority and reason)
      const values = await form.validateFields(["priority", "reason"]);
      console.log("[RestockRequestForm] Form values:", values);
      console.log("[RestockRequestForm] Request items:", requestItems);

      // Get user ID from JWT token
      const getCurrentUserId = () => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
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
            console.log("[RestockRequestForm] JWT payload:", payload);
            
            // Check for userId field
            if (payload.userId) {
              return Number(payload.userId);
            }
            
            // Check for sub field (subject - usually email for OAuth2)
            if (payload.sub) {
              console.log("[RestockRequestForm] Found sub field:", payload.sub);
              // For OAuth2, sub is usually email, not numeric ID
              // We need to get user ID from backend using email
              return null; // Will handle this case separately
            }
            
            // Check for other possible ID fields
            if (payload.id) {
              return Number(payload.id);
            }
            
            console.log("[RestockRequestForm] No user ID found in token payload");
          } catch (err) {
            console.error("Error parsing token:", err);
          }
        }
        return null;
      };

      let userId = getCurrentUserId();
      
      // If we couldn't get user ID from token, try to get it from backend using email or username
      if (!userId) {
        try {
          // Try email first, then username as fallback
          const identifier = user.email || user.username;
          if (identifier) {
            console.log("[RestockRequestForm] Trying to get user ID from backend using identifier:", identifier);
            
            // Make API call to get user ID by email or username
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:8080/api/auth/user-by-email?email=${encodeURIComponent(identifier)}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              userId = userData.id;
              console.log("[RestockRequestForm] Got user ID from backend:", userId);
            } else {
              console.warn("[RestockRequestForm] Failed to get user ID from backend, using fallback");
              userId = 1; // Fallback for testing
            }
          } else {
            console.warn("[RestockRequestForm] No email or username available, using fallback");
            userId = 1; // Fallback for testing
          }
        } catch (error) {
          console.error("[RestockRequestForm] Error getting user ID from backend:", error);
          userId = 1; // Fallback for testing
        }
      }
      
      if (!userId) {
        console.error("[RestockRequestForm] User object:", user);
        console.error("[RestockRequestForm] Could not extract user ID from token or backend");
        messageApi.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!");
        return;
      }

      setSubmitting(true);

      // Validate extendedRestockItems
      if (!requestItems || requestItems.length === 0) {
        messageApi.error("Vui lòng thêm ít nhất một vật tư vào yêu cầu.");
        return;
      }

      // Build the request data
      const requestData = {
        requestedBy: userId,
        priority: values.priority || "MEDIUM",
        reason: values.reason || "",
        status: "PENDING",
        requestDate: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        extendedRestockItems: requestItems.map((item) => {
          const baseItem = {
            requestType: item.requestType || "EXISTING",
            requestedDisplayQuantity: parseFloat(item.requestedQuantity) || 0,
            requestedDisplayUnit: item.unit || item.baseUnit || "unit",
            notes: item.notes || "",
          };

          if (item.requestType === "NEW") {
            return {
              ...baseItem,
              name: item.name || "",
              category: item.category || "",
              baseUnit: item.baseUnit || "unit",
              displayUnit: item.displayUnit || item.baseUnit || "unit",
              minStockLevelInBaseUnit: parseFloat(item.minStockLevel) || 0,
              supplier: item.supplier || "",
              location: item.location || "",
              description: item.description || "",
              newExpirationDate: item.expirationDate ? dayjs(item.expirationDate).format('YYYY-MM-DD') : null,
              isDisabled: true,
              createdById: userId,
            };
          } else if (item.requestType === "EXPIRED") {
            return {
              ...baseItem,
              medicalSupplyId: item.medicalSupplyId,
              newExpirationDate: item.newExpirationDate,
              originalSupplyId: item.medicalSupplyId,
            };
          } else {
            return {
              ...baseItem,
              medicalSupplyId: item.medicalSupplyId,
            };
          }
        }),
      };

      try {
        // Refresh session before making the request
        const refreshResult = await refreshSession();
        if (!refreshResult) {
          messageApi.error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
          );
          return;
        }
        console.log("[RestockRequestForm] Session refreshed before submission");
        console.log("[RestockRequestForm] Sending request data:", JSON.stringify(requestData, null, 2));

        // Create the restock request
        const createdRequest =
          await restockRequestApi.createExtendedRestockRequest(requestData);
        console.log(
          "[RestockRequestForm] Request created successfully:",
          createdRequest
        );

        // Show success message first
        messageApi.success("Tạo yêu cầu nhập kho thành công!");

        // Trigger notification refresh for navbar
        notificationEventService.triggerRefresh();

        // Reset form and close modal
        form.resetFields();
        setRequestItems([]);

        // Close modal and trigger success callback
        if (onSuccess) {
          onSuccess(createdRequest);
        }
        onCancel();

        // Notify subscribers about the new request
        try {
          // Refresh session again before notifying subscribers
          await refreshSession();
          await restockRequestApi.notifySubscribers();
        } catch (notifyError) {
          console.error(
            "[RestockRequestForm] Error notifying subscribers:",
            notifyError
          );
          // Don't show error to user since the request was created successfully
        }
      } catch (error) {
        console.error("[RestockRequestForm] Error creating request:", error);
        console.error("[RestockRequestForm] Error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          messageApi.error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
          );
          return;
        } else if (error.response?.status === 400) {
          // Show detailed validation errors
          const errorData = error.response?.data;
          if (errorData?.message) {
            messageApi.error(`Lỗi validation: ${errorData.message}`);
          } else if (errorData?.errors) {
            errorData.errors.forEach(err => {
              messageApi.error(`Lỗi: ${err}`);
            });
          } else {
            messageApi.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
          }
        } else {
          messageApi.error(
            error.response?.data?.message ||
            "Có lỗi xảy ra khi tạo yêu cầu. Vui lòng thử lại."
          );
        }
      }
    } catch (error) {
      console.error("[RestockRequestForm] Form validation error:", error);
      console.error("[RestockRequestForm] Error details:", {
        errorFields: error.errorFields,
        values: error.values,
        outOfDate: error.outOfDate
      });
      
      // Show which fields failed validation
      if (error.errorFields) {
        error.errorFields.forEach((field) => {
          console.error(`[RestockRequestForm] Field error: ${field.name.join(".")} - ${field.errors.join(", ")}`);
          messageApi.error(
            `${field.name.join(".")} - ${field.errors.join(", ")}`
          );
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Add new existing item to the restock request
  const addNewItem = () => {
    const newItemData = form.getFieldsValue([
      "newItemId",
      "newItemQuantity",
      "newItemNotes",
    ]);

    // Validate required fields
    if (!newItemData.newItemId) {
      messageApi.error("Vui lòng chọn vật tư!");
      return;
    }

    if (!newItemData.newItemQuantity || newItemData.newItemQuantity <= 0) {
      messageApi.error("Số lượng phải lớn hơn 0!");
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

    // Create new item with all required fields
    const newItem = {
      medicalSupplyId: selectedSupply.id,
      requestedQuantity: newItemData.newItemQuantity,
      name: selectedSupply.name,
      currentQuantity:
        selectedSupply.quantityInBaseUnit || selectedSupply.quantity || 0,
      unit: selectedSupply.displayUnit || selectedSupply.unit || "unit",
      baseUnit: selectedSupply.baseUnit || selectedSupply.unit || "unit",
      minStockLevel:
        selectedSupply.minStockLevelInBaseUnit ||
        selectedSupply.minStockLevel ||
        0,
      notes: newItemData.newItemNotes || "",
      requestType: "EXISTING",
    };

    // Log the new item being added
    console.log("[RestockRequestForm] Adding new item:", newItem);

    // Add item to list
    setRequestItems((prevItems) => {
      const newItems = [...prevItems, newItem];
      console.log("[RestockRequestForm] Updated items list:", newItems);
      return newItems;
    });

    // Reset new item form fields
    form.setFieldsValue({
      newItemId: undefined,
      newItemQuantity: undefined,
      newItemNotes: undefined,
    });

    // Show success message
    messageApi.success(`Đã thêm "${selectedSupply.name}" vào danh sách!`);
  };

  // Add new supply (not in inventory yet)
  const addBrandNewSupply = async () => {
    try {
      // Get values from the main form since we're not using a separate form anymore
      const values = form.getFieldsValue([
        "newSupplyName",
        "newSupplyCategory",
        "newSupplyBaseUnit",
        "newSupplyDisplayUnit",
        "newSupplyMinStockLevel",
        "newSupplySupplier",
        "newSupplyLocation",
        "newSupplyDescription",
        "newSupplyExpirationDate",
        "newSupplyQuantity",
        "newSupplyNotes",
      ]);

      // Validate required fields manually
      if (
        !values.newSupplyName ||
        !values.newSupplyCategory ||
        !values.newSupplyBaseUnit ||
        !values.newSupplyMinStockLevel ||
        !values.newSupplyQuantity
      ) {
        messageApi.error("Vui lòng điền đầy đủ thông tin vật tư mới!");
        return;
      }

      // Validate that display unit is compatible with base unit
      if (
        values.newSupplyDisplayUnit &&
        convertibleUnits.indexOf(values.newSupplyDisplayUnit) === -1
      ) {
        messageApi.error(
          "Đơn vị hiển thị không tương thích với đơn vị cơ bản!"
        );
        return;
      }

      // Validate expiration date is in the future
      if (
        values.newSupplyExpirationDate &&
        dayjs(values.newSupplyExpirationDate).isBefore(dayjs())
      ) {
        messageApi.error("Ngày hết hạn phải là ngày trong tương lai!");
        return;
      }

      // Create new item object
      const newSupplyItem = {
        name: values.newSupplyName,
        category: values.newSupplyCategory,
        baseUnit: values.newSupplyBaseUnit,
        displayUnit: values.newSupplyDisplayUnit || values.newSupplyBaseUnit,
        minStockLevel: values.newSupplyMinStockLevel,
        supplier: values.newSupplySupplier,
        location: values.newSupplyLocation,
        description: values.newSupplyDescription || "",
        expirationDate: values.newSupplyExpirationDate
          ? values.newSupplyExpirationDate.format("YYYY-MM-DD")
          : null,
        requestedQuantity: values.newSupplyQuantity,
        unit: values.newSupplyBaseUnit,
        notes: values.newSupplyNotes || "",
        requestType: "NEW",
      };

      setRequestItems([...requestItems, newSupplyItem]);
      messageApi.success(
        `Đã thêm vật tư mới "${values.newSupplyName}" vào yêu cầu!`
      );

      // Clear fields
      form.setFieldsValue({
        newSupplyName: undefined,
        newSupplyCategory: undefined,
        newSupplyBaseUnit: undefined,
        newSupplyDisplayUnit: undefined,
        newSupplyMinStockLevel: undefined,
        newSupplySupplier: undefined,
        newSupplyLocation: undefined,
        newSupplyDescription: undefined,
        newSupplyExpirationDate: undefined,
        newSupplyQuantity: undefined,
        newSupplyNotes: undefined,
      });
    } catch (error) {
      console.error("Error adding new supply:", error);
      messageApi.error("Vui lòng điền đầy đủ thông tin vật tư mới!");
    }
  };

  // Add expired supply replacement
  const addExpiredSupplyReplacement = async () => {
    try {
      // Get values from the main form
      const values = form.getFieldsValue([
        "expiredSupplyId",
        "expiredSupplyNewExpirationDate",
        "expiredSupplyQuantity",
        "expiredSupplyNotes",
      ]);

      // Validate required fields manually
      if (
        !values.expiredSupplyId ||
        !values.expiredSupplyNewExpirationDate ||
        !values.expiredSupplyQuantity
      ) {
        messageApi.error("Vui lòng điền đầy đủ thông tin vật tư thay thế!");
        return;
      }

      // Validate new expiration date is in the future
      if (!dayjs(values.expiredSupplyNewExpirationDate).isAfter(dayjs())) {
        messageApi.error("Ngày hết hạn mới phải là ngày trong tương lai!");
        return;
      }

      // Find the expired supply details
      const expiredSupply = supplies.find(
        (supply) => supply.id === values.expiredSupplyId
      );
      if (!expiredSupply) {
        messageApi.error("Không tìm thấy thông tin vật tư hết hạn!");
        return;
      }

      // Create expired supply replacement item
      const expiredSupplyItem = {
        medicalSupplyId: expiredSupply.id,
        name: expiredSupply.name,
        currentQuantity:
          expiredSupply.quantityInBaseUnit || expiredSupply.quantity || 0,
        unit: expiredSupply.displayUnit || expiredSupply.unit || "unit",
        baseUnit: expiredSupply.baseUnit || expiredSupply.unit || "unit",
        requestedQuantity: values.expiredSupplyQuantity,
        newExpirationDate:
          values.expiredSupplyNewExpirationDate.format("YYYY-MM-DD"),
        notes: values.expiredSupplyNotes || "",
        requestType: "EXPIRED",
      };

      setRequestItems([...requestItems, expiredSupplyItem]);
      messageApi.success(
        `Đã thêm vật phẩm thay thế "${expiredSupply.name}" vào yêu cầu!`
      );

      // Clear fields
      form.setFieldsValue({
        expiredSupplyId: undefined,
        expiredSupplyNewExpirationDate: undefined,
        expiredSupplyQuantity: undefined,
        expiredSupplyNotes: undefined,
      });
    } catch (error) {
      console.error("Error adding expired supply replacement:", error);
      messageApi.error("Vui lòng điền đầy đủ thông tin vật tư thay thế!");
    }
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

  // Get icon for request type
  const getRequestTypeIcon = (requestType) => {
    switch (requestType) {
      case "NEW":
        return <FileAddOutlined style={{ color: "#52c41a" }} />;
      case "EXPIRED":
        return <ReloadOutlined style={{ color: "#faad14" }} />;
      default:
        return null;
    }
  };

  // Get display text for request type
  const getRequestTypeText = (requestType) => {
    switch (requestType) {
      case "NEW":
        return "Vật tư mới";
      case "EXPIRED":
        return "Thay thế hết hạn";
      default:
        return "";
    }
  };

  // Category configuration for medical supplies
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
    };
    return config[category] || { color: "default", text: category };
  };

  // Table columns for restock items
  const itemColumns = [
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          {text}
          {record.requestType !== "EXISTING" && (
            <Tag color={record.requestType === "NEW" ? "green" : "orange"}>
              {getRequestTypeIcon(record.requestType)}{" "}
              {getRequestTypeText(record.requestType)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "SL hiện tại",
      key: "currentQuantity",
      render: (_, record) => {
        if (record.requestType === "NEW") {
          return <Text type="secondary">Chưa có</Text>;
        }

        return (
          <Space>
            {record.currentQuantity} {record.baseUnit}
            {record.currentQuantity < record.minStockLevel && (
              <WarningOutlined style={{ color: "orange" }} />
            )}
          </Space>
        );
      },
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
          <span>{record.baseUnit || record.unit}</span>
        </Space>
      ),
    },
    {
      title: "Thông tin bổ sung",
      key: "additionalInfo",
      render: (_, record) => {
        if (record.requestType === "NEW") {
          const categoryConfig = getCategoryTag(record.category);
          return (
            <Space>
              <Text type="secondary">Vật tư mới -</Text>
              <Tag color={categoryConfig.color}>{categoryConfig.text}</Tag>
            </Space>
          );
        }

        if (record.requestType === "EXPIRED") {
          return (
            <Text type="secondary">Hạn mới: {record.newExpirationDate}</Text>
          );
        }

        return null;
      },
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
    (supply) => !requestItems.some((item) => item.medicalSupplyId === supply.id)
  );

  // Filter available expired supplies
  const availableExpiredSupplies = expiredSupplies.filter(
    (supply) =>
      !requestItems.some(
        (item) =>
          item.requestType === "EXPIRED" && item.medicalSupplyId === supply.id
      )
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
        destroyOnHidden
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
                rules={[
                  { required: true, message: "Vui lòng chọn mức độ ưu tiên!" },
                ]}
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
                rules={[
                  { required: true, message: "Vui lòng nhập lý do!" },
                  { 
                    validator: (_, value) => {
                      if (!value || value.trim().length === 0) {
                        return Promise.reject(new Error("Lý do không được để trống!"));
                      }
                      if (value.trim().length < 3) {
                        return Promise.reject(new Error("Lý do phải có ít nhất 3 ký tự!"));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <TextArea rows={2} placeholder="Nhập lý do cần nhập kho..." />
              </Form.Item>
            </div>
          </div>

          {/* Tabs for different types of items */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "1",
                label: "Vật tư hiện có",
                children: (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Thêm vật tư hiện có</Text>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 12,
                        alignItems: "end",
                      }}
                    >
                      <Form.Item
                        name="newItemId"
                        label="Vật tư y tế"
                        style={{ flex: 2 }}
                      >
                        <Select
                          placeholder="Chọn vật tư y tế"
                          showSearch
                          filterOption={(input, option) =>
                            option?.children
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          loading={loading}
                        >
                          {availableSupplies.map((supply) => (
                            <Option key={supply.id} value={supply.id}>
                              <Space>
                                {supply.name}
                                {(supply.quantityInBaseUnit ||
                                  supply.quantity ||
                                  0) <
                                  (supply.minStockLevelInBaseUnit ||
                                    supply.minStockLevel ||
                                    0) && (
                                  <Tag color="orange" size="small">
                                    Thiếu hàng
                                  </Tag>
                                )}
                                <Text type="secondary">
                                  (
                                  {supply.quantityInBaseUnit ||
                                    supply.quantity ||
                                    0}{" "}
                                  {supply.baseUnit || supply.unit || "unit"})
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
                ),
              },
              {
                key: "2",
                label: "Vật tư mới",
                children: (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Thêm vật tư mới vào hệ thống</Text>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 16 }}
                    >
                      Sử dụng khi bạn muốn thêm một loại vật tư chưa có trong hệ
                      thống
                    </Text>

                    <div className="new-supply-form">
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ flex: 1 }}>
                          <Form.Item
                            name="newSupplyName"
                            label="Tên vật tư"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập tên vật tư!",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập tên vật tư..." />
                          </Form.Item>

                          <Form.Item
                            name="newSupplyCategory"
                            label="Danh mục"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn danh mục!",
                              },
                            ]}
                          >
                            <Select placeholder="Chọn danh mục...">
                              <Option value="painkiller">
                                <Tag color="blue">Giảm đau</Tag>
                              </Option>
                              <Option value="antibiotic">
                                <Tag color="purple">Kháng sinh</Tag>
                              </Option>
                              <Option value="vitamin">
                                <Tag color="orange">Vitamin</Tag>
                              </Option>
                              <Option value="supplement">
                                <Tag color="cyan">Thực phẩm bổ sung</Tag>
                              </Option>
                              <Option value="bandage">
                                <Tag color="cyan">Băng y tế</Tag>
                              </Option>
                              <Option value="gloves">
                                <Tag color="green">Găng tay</Tag>
                              </Option>
                              <Option value="equipment">
                                <Tag color="geekblue">Thiết bị</Tag>
                              </Option>
                              <Option value="antiseptic">
                                <Tag color="red">Sát trung</Tag>
                              </Option>
                              <Option value="medical_device">
                                <Tag color="magenta">Thiết bị y tế</Tag>
                              </Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            name="newSupplySupplier"
                            label="Nhà cung cấp"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập nhà cung cấp!",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập nhà cung cấp..." />
                          </Form.Item>

                          <Form.Item 
                            name="newSupplyLocation" 
                            label="Vị trí"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn vị trí!",
                              },
                            ]}
                          >
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
                        </div>

                        <div style={{ flex: 1 }}>
                          <Form.Item
                            name="newSupplyBaseUnit"
                            label="Đơn vị cơ bản"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn đơn vị cơ bản!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn đơn vị cơ bản..."
                              loading={loadingUnits}
                              onChange={handleBaseUnitChange}
                            >
                              {unitsList.map((unit) => (
                                <Option key={unit} value={unit}>
                                  {unit}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            name="newSupplyDisplayUnit"
                            label="Đơn vị hiển thị"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn đơn vị hiển thị!",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn đơn vị hiển thị..."
                              loading={loadingUnits}
                              disabled={
                                !form.getFieldValue("newSupplyBaseUnit")
                              }
                            >
                              {convertibleUnits.map((unit) => (
                                <Option key={unit} value={unit}>
                                  {unit}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>

                          <Form.Item
                            name="newSupplyMinStockLevel"
                            label="Mức tồn kho tối thiểu"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập mức tồn kho tối thiểu!",
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>

                          <Form.Item
                            name="newSupplyExpirationDate"
                            label="Ngày hết hạn"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn ngày hết hạn!",
                              },
                              {
                                validator: async (_, value) => {
                                  if (value && dayjs(value).isBefore(dayjs())) {
                                    throw new Error(
                                      "Ngày hết hạn phải là ngày trong tương lai!"
                                    );
                                  }
                                },
                              },
                            ]}
                          >
                            <DatePicker style={{ width: "100%" }} />
                          </Form.Item>
                        </div>
                      </div>

                      <Form.Item name="newSupplyDescription" label="Mô tả">
                        <TextArea rows={2} placeholder="Nhập mô tả vật tư..." />
                      </Form.Item>

                      <div style={{ display: "flex", gap: 16 }}>
                        <Form.Item
                          name="newSupplyQuantity"
                          label="Số lượng yêu cầu"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lượng!",
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                          name="newSupplyNotes"
                          label="Ghi chú"
                          style={{ flex: 2 }}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập ghi chú!",
                            },
                          ]}
                        >
                          <Input placeholder="Thêm ghi chú..." />
                        </Form.Item>
                      </div>

                      <Button
                        type="primary"
                        icon={<FileAddOutlined />}
                        onClick={addBrandNewSupply}
                      >
                        Thêm vật tư mới vào yêu cầu
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: "3",
                label: "Thay thế vật tư hết hạn",
                children: (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Thay thế vật tư hết hạn</Text>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 16 }}
                    >
                      Sử dụng khi bạn muốn thay thế vật tư đã hết hạn bằng một
                      lô mới
                    </Text>

                    <div className="expired-supply-form">
                      <Form.Item
                        name="expiredSupplyId"
                        label="Chọn vật tư hết hạn"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn vật tư hết hạn!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn vật tư hết hạn cần thay thế"
                          showSearch
                          filterOption={(input, option) =>
                            option?.children
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {availableExpiredSupplies.map((supply) => (
                            <Option key={supply.id} value={supply.id}>
                              <Space>
                                {supply.name}
                                <Tag color="red" size="small">
                                  Hết hạn: {supply.expirationDate}
                                </Tag>
                                <Text type="secondary">
                                  (
                                  {supply.quantityInBaseUnit ||
                                    supply.quantity ||
                                    0}{" "}
                                  {supply.baseUnit || supply.unit || "unit"})
                                </Text>
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <div style={{ display: "flex", gap: 16 }}>
                        <Form.Item
                          name="expiredSupplyNewExpirationDate"
                          label="Ngày hết hạn mới"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ngày hết hạn mới!",
                            },
                            {
                              validator: async (_, value) => {
                                if (value && dayjs(value).isBefore(dayjs())) {
                                  throw new Error(
                                    "Ngày hết hạn mới phải là ngày trong tương lai!"
                                  );
                                }
                              },
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <DatePicker style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                          name="expiredSupplyQuantity"
                          label="Số lượng yêu cầu"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lượng!",
                            },
                            {
                              type: "number",
                              min: 1,
                              message: "Số lượng phải lớn hơn 0!",
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item
                          name="expiredSupplyNotes"
                          label="Ghi chú"
                          style={{ flex: 2 }}
                        >
                          <Input placeholder="Thêm ghi chú..." />
                        </Form.Item>
                      </div>

                      <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={addExpiredSupplyReplacement}
                      >
                        Thêm vật tư thay thế vào yêu cầu
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />

          {/* Request Items List - Now placed below the tabs */}
          <div style={{ marginTop: 24 }}>
            <Divider orientation="left">
              <Space>
                <Text strong>Danh sách vật tư đã thêm</Text>
                <Tag color="blue">{requestItems.length}</Tag>
              </Space>
            </Divider>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <Space>
                <Tag color="green">
                  <FileAddOutlined /> Vật tư mới
                </Tag>
                <Tag color="orange">
                  <ReloadOutlined /> Thay thế hết hạn
                </Tag>
              </Space>
            </div>

            {requestItems.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#999",
                  marginTop: 12,
                  border: "1px dashed #d9d9d9",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <InboxOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <br />
                Chưa có vật tư nào được thêm vào yêu cầu
                <br />
                <Space style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => setActiveTab("1")}
                    icon={<PlusOutlined />}
                  >
                    Thêm vật tư hiện có
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => setActiveTab("2")}
                    icon={<FileAddOutlined />}
                  >
                    Thêm vật tư mới
                  </Button>
                  <Button
                    type="primary"
                    ghost
                    onClick={() => setActiveTab("3")}
                    icon={<ReloadOutlined />}
                  >
                    Thay thế vật tư hết hạn
                  </Button>
                </Space>
              </div>
            ) : (
              <Table
                columns={itemColumns}
                dataSource={requestItems}
                rowKey={(record, index) => {
                  if (record.medicalSupplyId) {
                    return `existing-${record.medicalSupplyId}-${index}`;
                  } else if (record.requestType === "NEW") {
                    return `new-${record.name}-${index}`;
                  } else if (record.requestType === "EXPIRED") {
                    return `expired-${record.medicalSupplyId}-${record.newExpirationDate}-${index}`;
                  }
                  return `item-${index}`;
                }}
                pagination={false}
                size="small"
              />
            )}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default RestockRequestForm;
