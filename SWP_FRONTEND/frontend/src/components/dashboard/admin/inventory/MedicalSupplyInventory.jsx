import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Badge,
  Tabs,
  message,
  Modal,
  Form,
  InputNumber,
  Typography,
  Tooltip,
  Popconfirm,
  DatePicker,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
  FilterOutlined,
  ReloadOutlined,
  InboxOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { medicalSupplyApi } from "../../../../api/medicalSupplyApi";
import RestockRequestForm from "./RestockRequestForm";
import dayjs from "dayjs";
import "../../../../styles/MedicalSupplyInventory.css";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title } = Typography;

const MedicalSupplyInventory = () => {
  // State
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isRestockModalVisible, setIsRestockModalVisible] = useState(false);
  const [selectedSupplies, setSelectedSupplies] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  // Category options for filter
  // Make sure these values match exactly with the backend category values
  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "medicine", label: "Thuốc" },
    { value: "bandage", label: "Sơ cứu" },
    { value: "equipment", label: "Thiết bị" },
    { value: "consumable", label: "Vật tư tiêu hao" },
    { value: "other", label: "Khác" },
  ];

  // Validate category filter to ensure it's a valid option
  useEffect(() => {
    // Make sure categoryFilter is a valid value from our options
    const validValues = categories.map((c) => c.value);
    if (categoryFilter && !validValues.includes(categoryFilter)) {
      console.warn(
        `Invalid category filter value: ${categoryFilter}. Resetting to 'all'`
      );
      setCategoryFilter("all");
    }
  }, [categoryFilter]);

  // Load supplies on component mount and when filter dependencies change
  useEffect(() => {
    const loadData = async () => {
      console.log("Effect triggered: fetch data with", {
        tab: activeTab,
        category: categoryFilter,
        search: searchText,
      });
      await fetchSupplies(activeTab, searchText, categoryFilter);
    };

    loadData();

    // Dependencies include all filter criteria that should trigger a reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, categoryFilter, searchText]);

  // Fetch supplies based on tab, search and category filters
  const fetchSupplies = async (
    tab = activeTab,
    search = searchText,
    category = categoryFilter
  ) => {
    setLoading(true);
    try {
      let data;

      // Fetch data based on active tab
      console.log(
        `Fetching data for tab: ${tab}, category: ${category}, search: ${search}`
      );

      // First get all supplies
      try {
        data = await medicalSupplyApi.getAllSupplies();
      } catch (error) {
        console.error("Error fetching supplies:", error);
        messageApi.error("Không thể tải dữ liệu vật tư y tế.");
        setLoading(false);
        return;
      }

      // Calculate and apply status for each item
      data = data.map((item) => {
        const statusInfo = calculateSupplyStatus(item);
        return {
          ...item,
          calculatedStatus: statusInfo.status,
          isExpired: statusInfo.isExpired,
          isExpiringSoon: statusInfo.isExpiringSoon,
          isLowStock: statusInfo.isLowStock,
        };
      });

      console.log(`Total supplies before filtering: ${data.length}`);

      // Filter based on tab first
      switch (tab) {
        case "low-stock":
          data = data.filter((item) => item.isLowStock);
          break;
        case "expiring-soon":
          // Important: Only show items that are expiring soon but NOT expired
          data = data.filter((item) => item.isExpiringSoon && !item.isExpired);
          break;
        case "expired":
          data = data.filter((item) => item.isExpired);
          break;
        default:
          // 'all' tab - no filtering needed
          break;
      }

      console.log(`Supplies after tab filtering: ${data.length}`);

      // Filter by category if specified
      if (category !== "all") {
        console.log(`Filtering by category: ${category}`);

        // Make sure we use case-insensitive comparison
        const categoryLower = category.toLowerCase();
        data = data.filter((item) => {
          // Handle both direct match and text representation matches
          if (!item.category) return false;

          const itemCategoryLower = item.category.toLowerCase();

          // Direct value match
          if (itemCategoryLower === categoryLower) return true;

          // Handle specific mappings
          if (
            category === "bandage" &&
            ["sơ cứu", "so cuu", "first aid"].includes(itemCategoryLower)
          )
            return true;
          if (
            category === "medicine" &&
            ["thuốc", "thuoc", "drug"].includes(itemCategoryLower)
          )
            return true;
          if (
            category === "equipment" &&
            ["thiết bị", "thiet bi", "device"].includes(itemCategoryLower)
          )
            return true;
          if (
            category === "consumable" &&
            ["vật tư tiêu hao", "vat tu tieu hao"].includes(itemCategoryLower)
          )
            return true;

          return false;
        });

        console.log(`After category filtering: ${data.length} items`);
      }

      // Apply search filter if text entered (using parameter)
      if (search) {
        const searchLower = search.toLowerCase();
        data = data.filter(
          (item) =>
            (item.name && item.name.toLowerCase().includes(searchLower)) ||
            (item.supplier &&
              item.supplier.toLowerCase().includes(searchLower)) ||
            (item.description &&
              item.description.toLowerCase().includes(searchLower))
        );
      }

      // Update pagination
      setPagination((prev) => ({
        ...prev,
        total: data.length,
      }));

      console.log(`Final dataset: ${data.length} items`);
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

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination((prev) => ({ ...prev, current: 1 }));
    // No need to call fetchSupplies directly - the useEffect will handle it when activeTab changes
  };

  // Handle search with debounce to avoid too many requests
  const searchTimeout = useRef(null);

  const handleSearch = (e) => {
    const value = e.target.value;

    // Clear any pending timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout to update the search text after 300ms of inactivity
    searchTimeout.current = setTimeout(() => {
      setSearchText(value);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 300);
  };

  // Handle category filter
  const handleCategoryChange = (value) => {
    // Log current selection for debugging
    console.log(`Selecting category: ${value}`);

    // Update category filter state
    setCategoryFilter(value);

    // Reset to first page when filter changes
    setPagination((prev) => ({ ...prev, current: 1 }));

    // Directly trigger data fetch to ensure immediate UI update
    fetchSupplies(activeTab, searchText, value);
  };

  // Handle refresh
  const handleRefresh = () => {
    setActiveTab("all"); // Reset to 'all' tab
    setSearchText("");
    setCategoryFilter("all");
    // No need to call fetchSupplies directly - the useEffect will handle it
  };

  // Handle restock request modal
  const showRestockModal = () => {
    setIsRestockModalVisible(true);
  };

  const handleRestockModalCancel = () => {
    setIsRestockModalVisible(false);
    setSelectedSupplies([]);
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys: selectedSupplies.map((item) => item.id),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedSupplies(selectedRows);
    },
  };

  // Calculate supply status based on expiration date and stock level
  const calculateSupplyStatus = (supply) => {
    const today = dayjs();
    const expirationDate = dayjs(supply.expirationDate);
    const threeMonthsLater = today.add(3, "month");

    // Calculate expiration status
    const isExpired = expirationDate.isBefore(today, "day");
    const isExpiringSoon =
      !isExpired && expirationDate.isBefore(threeMonthsLater, "day");

    // Calculate stock status
    const isLowStock = supply.quantity <= supply.minStockLevel;

    return {
      isExpired,
      isExpiringSoon,
      isLowStock,
      // Priority: expired > low stock > expiring soon > normal
      status: isExpired
        ? "expired"
        : isLowStock
        ? "low-stock"
        : isExpiringSoon
        ? "expiring-soon"
        : "normal",
    };
  };

  // Generate tag for supply status
  const getSupplyStatusTag = (supply) => {
    // Calculate current status
    const status = calculateSupplyStatus(supply);

    if (status.isExpired) {
      return (
        <Tag color="red" icon={<ExclamationCircleOutlined />}>
          Hết hạn
        </Tag>
      );
    } else if (status.isLowStock) {
      return (
        <Tag color="orange" icon={<WarningOutlined />}>
          Sắp hết
        </Tag>
      );
    } else if (status.isExpiringSoon) {
      return (
        <Tag color="gold" icon={<WarningOutlined />}>
          Sắp hết hạn
        </Tag>
      );
    } else {
      return <Tag color="green">Còn hàng</Tag>;
    }
  };

  // Generate category tag
  const getCategoryTag = (category) => {
    const categoryConfig = {
      medicine: { color: "blue", text: "Thuốc" },
      bandage: { color: "cyan", text: "Băng gạc" },
      equipment: { color: "purple", text: "Thiết bị" },
      consumable: { color: "green", text: "Vật tư tiêu hao" },
      other: { color: "default", text: "Khác" },
    };

    const config = categoryConfig[category] || {
      color: "default",
      text: category,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: "Tên vật tư",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Typography.Link onClick={() => showSupplyDetail(record)}>
          {text}
        </Typography.Link>
      ),
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
      render: (category) => getCategoryTag(category),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <Space>
          {quantity} {record.unit}
          {record.isLowStock && (
            <Tooltip title={`Dưới mức tối thiểu (${record.minStockLevel})`}>
              <WarningOutlined style={{ color: "orange" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date, record) => {
        const formattedDate = dayjs(date).format("DD/MM/YYYY");
        const status = calculateSupplyStatus(record);

        return (
          <Typography.Text
            type={
              status.isExpired
                ? "danger"
                : status.isExpiringSoon
                ? "warning"
                : undefined
            }
            style={{
              fontWeight:
                status.isExpired || status.isExpiringSoon ? "bold" : "normal",
            }}
          >
            {formattedDate}
            {status.isExpired && (
              <Tooltip title="Đã hết hạn">
                <ExclamationCircleOutlined
                  style={{ color: "red", marginLeft: 8 }}
                />
              </Tooltip>
            )}
            {status.isExpiringSoon && !status.isExpired && (
              <Tooltip
                title={`Sắp hết hạn (còn ${dayjs(date).diff(
                  dayjs(),
                  "day"
                )} ngày)`}
              >
                <WarningOutlined style={{ color: "orange", marginLeft: 8 }} />
              </Tooltip>
            )}
          </Typography.Text>
        );
      },
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "supplier",
      key: "supplier",
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => getSupplyStatusTag(record),
    },
  ];

  // Show supply detail modal
  const showSupplyDetail = (supply) => {
    Modal.info({
      title: supply.name,
      width: 600,
      content: (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Loại:</strong> {getCategoryTag(supply.category)}
          </p>
          <p>
            <strong>Số lượng:</strong> {supply.quantity} {supply.unit}
          </p>
          <p>
            <strong>Mức tồn kho tối thiểu:</strong> {supply.minStockLevel}{" "}
            {supply.unit}
          </p>
          <p>
            <strong>Hạn sử dụng:</strong>{" "}
            {dayjs(supply.expirationDate).format("DD/MM/YYYY")}
            {calculateSupplyStatus(supply).isExpired && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                Đã hết hạn
              </Tag>
            )}
            {calculateSupplyStatus(supply).isExpiringSoon &&
              !calculateSupplyStatus(supply).isExpired && (
                <Tag color="orange" style={{ marginLeft: 8 }}>
                  Sắp hết hạn (còn{" "}
                  {dayjs(supply.expirationDate).diff(dayjs(), "day")} ngày)
                </Tag>
              )}
          </p>
          <p>
            <strong>Nhà cung cấp:</strong> {supply.supplier}
          </p>
          <p>
            <strong>Vị trí:</strong> {supply.location}
          </p>
          {supply.description && (
            <p>
              <strong>Mô tả:</strong> {supply.description}
            </p>
          )}
          <p>
            <strong>Trạng thái:</strong> {getSupplyStatusTag(supply)}
          </p>
          <p>
            <strong>Ngày cập nhật:</strong>{" "}
            {dayjs(supply.updatedAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      ),
      okText: "Đóng",
    });
  };

  // Calculate counts for tabs
  const calculateTabCounts = () => {
    if (!supplies || supplies.length === 0)
      return { all: 0, lowStock: 0, expiringSoon: 0, expired: 0 };

    const counts = {
      all: supplies.length,
      lowStock: 0,
      expiringSoon: 0,
      expired: 0,
    };

    // Calculate counts for each status
    supplies.forEach((supply) => {
      const status = calculateSupplyStatus(supply);
      if (status.isLowStock) counts.lowStock++;
      if (status.isExpiringSoon && !status.isExpired) counts.expiringSoon++;
      if (status.isExpired) counts.expired++;
    });

    return counts;
  };

  const tabCounts = calculateTabCounts();

  // Tab items
  const tabItems = [
    {
      key: "all",
      label: (
        <span>
          Tất cả vật tư
          <Badge
            count={tabCounts.all}
            style={{
              marginLeft: 8,
              backgroundColor: "#52c41a",
            }}
            overflowCount={999}
          />
        </span>
      ),
    },
    {
      key: "low-stock",
      label: (
        <span>
          Sắp hết
          <Badge
            count={tabCounts.lowStock}
            style={{
              marginLeft: 8,
              backgroundColor: "#faad14",
            }}
            overflowCount={999}
          />
        </span>
      ),
    },
    {
      key: "expiring-soon",
      label: (
        <span>
          Sắp hết hạn
          <Badge
            count={tabCounts.expiringSoon}
            style={{
              marginLeft: 8,
              backgroundColor: "#1890ff",
            }}
            overflowCount={999}
          />
        </span>
      ),
    },
    {
      key: "expired",
      label: (
        <span>
          Đã hết hạn
          <Badge
            count={tabCounts.expired}
            style={{
              marginLeft: 8,
              backgroundColor: "#f5222d",
            }}
            overflowCount={999}
          />
        </span>
      ),
    },
  ];

  return (
    <div className="medical-supply-inventory">
      {contextHolder}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <Title level={4}>Quản lý vật tư y tế</Title>
            {categoryFilter !== "all" && (
              <div style={{ marginTop: -8 }}>
                <Tag color="blue">
                  Đang lọc theo loại:{" "}
                  {categories.find((c) => c.value === categoryFilter)?.label ||
                    categoryFilter}
                </Tag>
              </div>
            )}
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showRestockModal}
          >
            Gửi yêu cầu bổ sung
          </Button>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
        />

        <div style={{ display: "flex", marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên, nhà cung cấp..."
            defaultValue={searchText}
            onChange={handleSearch}
            style={{ width: 300, marginRight: 8 }}
            prefix={<SearchOutlined />}
            allowClear
            onClear={() => {
              setSearchText("");
              setPagination((prev) => ({ ...prev, current: 1 }));
            }}
          />
          <Select
            value={categoryFilter}
            onChange={handleCategoryChange}
            style={{ width: 220, marginRight: 8 }}
            placeholder="Lọc theo loại"
            loading={loading}
            disabled={loading}
            optionLabelProp="label"
            optionFilterProp="label" // Enable filtering in dropdown
          >
            {categories.map((category) => {
              // Count items matching this category for badge
              const count =
                category.value === "all"
                  ? supplies.length
                  : supplies.filter(
                      (item) =>
                        item.category &&
                        item.category.toLowerCase() ===
                          category.value.toLowerCase()
                    ).length;

              return (
                <Option
                  key={category.value}
                  value={category.value}
                  label={category.label}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{category.label}</span>
                    <span
                      style={{
                        color:
                          categoryFilter === category.value
                            ? "#1890ff"
                            : "#999",
                        fontWeight:
                          categoryFilter === category.value ? "bold" : "normal",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                </Option>
              );
            })}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{ marginRight: 8 }}
          >
            Làm mới
          </Button>
        </div>

        <Table
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={supplies}
          pagination={pagination}
          onChange={(pagination) => setPagination(pagination)}
          loading={loading}
          locale={{
            emptyText:
              categoryFilter !== "all"
                ? `Không tìm thấy vật tư y tế loại "${
                    categories.find((c) => c.value === categoryFilter)?.label ||
                    categoryFilter
                  }"`
                : "Không có dữ liệu vật tư y tế",
          }}
        />
      </Card>

      <RestockRequestForm
        visible={isRestockModalVisible}
        onCancel={handleRestockModalCancel}
        selectedSupplies={selectedSupplies}
        onSuccess={() => {
          messageApi.success("Gửi yêu cầu bổ sung thành công!");
          setIsRestockModalVisible(false);
          setSelectedSupplies([]);
        }}
      />
    </div>
  );
};

export default MedicalSupplyInventory;
