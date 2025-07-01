import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  InputNumber,
  Select,
  Card,
  Row,
  Col,
  Divider,
  message,
  Spin,
  Typography,
  Alert,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { healthCheckApi } from "../../../api/healthCheckApi";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;
const { RangePicker } = DatePicker;

const HealthCheckCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetCount, setTargetCount] = useState(0);
  const [calculatingTargetCount, setCalculatingTargetCount] = useState(false);
  const isEditing = !!campaign;

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      // Set form values from campaign data
      const formData = {
        ...campaign,
        dateRange:
          campaign.startDate && campaign.endDate
            ? [dayjs(campaign.startDate), dayjs(campaign.endDate)]
            : undefined,
        targetClasses: campaign.targetClasses || [],
      };
      form.setFieldsValue(formData);
      // Set initial target count if editing
      if (campaign.targetCount) {
        setTargetCount(campaign.targetCount);
      }
    }
  }, [campaign, form, isEditing]);

  // Calculate target count when relevant fields change
  const calculateTargetCount = async (minAge, maxAge, targetClasses) => {
    if (minAge && maxAge && minAge <= maxAge) {
      setCalculatingTargetCount(true);
      try {
        const result = await healthCheckApi.calculateTargetCount(
          minAge,
          maxAge,
          targetClasses || []
        );
        setTargetCount(result.targetCount || 0);
      } catch (error) {
        console.error("Error calculating target count:", error);
        setTargetCount(0);
      } finally {
        setCalculatingTargetCount(false);
      }
    } else {
      setTargetCount(0);
    }
  };

  // Watch for changes in form fields that affect target count
  const onValuesChange = (changedValues, allValues) => {
    const { minAge, maxAge, targetClasses } = allValues;

    // Only recalculate if the relevant fields have changed
    if (
      "minAge" in changedValues ||
      "maxAge" in changedValues ||
      "targetClasses" in changedValues
    ) {
      // Add a small delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        calculateTargetCount(minAge, maxAge, targetClasses);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categories = await healthCheckApi.getAvailableCategories();
      setAvailableCategories(categories);
    } catch (error) {
      message.error("Không thể tải danh sách loại khám sức khỏe");
      console.error("Error fetching health check categories:", error);
      // Set some default categories for development
      setAvailableCategories([
        "VISION",
        "HEARING",
        "ORAL",
        "SKIN",
        "RESPIRATORY",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const [startDate, endDate] = values.dateRange || [];

      const campaignData = {
        ...values,
        startDate: startDate ? startDate.format("YYYY-MM-DDTHH:mm:ss") : null,
        endDate: endDate ? endDate.format("YYYY-MM-DDTHH:mm:ss") : null,
      };

      // Remove dateRange field as it's not part of the backend DTO
      delete campaignData.dateRange;

      let result;
      if (isEditing) {
        result = await healthCheckApi.updateCampaign(campaign.id, campaignData);
        message.success("Cập nhật đợt khám sức khỏe thành công");
      } else {
        result = await healthCheckApi.createCampaign(campaignData);
        message.success("Tạo đợt khám sức khỏe mới thành công");
      }
      onSuccess(result);
    } catch (error) {
      message.error(
        `Không thể ${isEditing ? "cập nhật" : "tạo"} đợt khám sức khỏe`
      );
      console.error(
        `Error ${isEditing ? "updating" : "creating"} campaign:`,
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "30px" }}>
          <Spin size="large" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Title level={4}>
          {isEditing
            ? "Chỉnh sửa đợt khám sức khỏe cho học sinh tiểu học"
            : "Tạo đợt khám sức khỏe mới cho học sinh tiểu học"}
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={onValuesChange}
        initialValues={{
          minAge: 6,
          maxAge: 12,
          location: "Tại Trường",
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Tên đợt khám"
              rules={[
                { required: true, message: "Vui lòng nhập tên đợt khám" },
              ]}
            >
              <Input placeholder="Nhập tên đợt khám sức khỏe cho học sinh tiểu học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập mô tả chi tiết về đợt khám sức khỏe cho học sinh tiểu học"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateRange"
              label="Thời gian thực hiện"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian thực hiện",
                },
              ]}
            >
              <RangePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                disabledDate={(current, { from }) => {
                  if (!current) return false;

                  // Ngày hiện tại + 7 ngày (ngày sớm nhất có thể chọn)
                  const minStartDate = dayjs().add(7, "day");

                  // Nếu đang chọn ngày bắt đầu (from không có giá trị)
                  if (!from) {
                    // Chỉ cho phép chọn từ hôm nay + 7 ngày trở đi
                    return current.isBefore(minStartDate, "day");
                  }

                  // Nếu đang chọn ngày kết thúc (from đã có giá trị)
                  // Ngày kết thúc phải sau ngày bắt đầu + 7 ngày
                  const minEndDate = dayjs(from).add(7, "day");
                  return current.isBefore(minEndDate, "day");
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Địa điểm"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input placeholder="Nhập địa điểm khám sức khỏe cho học sinh tiểu học" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minAge"
              label="Độ tuổi tối thiểu"
              rules={[
                { required: true, message: "Vui lòng nhập độ tuổi tối thiểu" },
              ]}
            >
              <InputNumber
                min={6}
                max={12}
                style={{ width: "100%" }}
                placeholder="Nhập độ tuổi tối thiểu"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="maxAge"
              label="Độ tuổi tối đa"
              rules={[
                { required: true, message: "Vui lòng nhập độ tuổi tối đa" },
              ]}
            >
              <InputNumber
                min={6}
                max={12}
                style={{ width: "100%" }}
                placeholder="Nhập độ tuổi tối đa"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="targetClasses" label="Lớp mục tiêu (tuỳ chọn)">
              <Select
                mode="tags"
                placeholder="Chọn hoặc nhập lớp mục tiêu (Ví dụ: 1A, 2B, 3C, toàn trường)"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
              >
                <Option value="toàn trường">Toàn trường</Option>
                <Option value="1A">Lớp 1A</Option>
                <Option value="1B">Lớp 1B</Option>
                <Option value="1C">Lớp 1C</Option>
                <Option value="2A">Lớp 2A</Option>
                <Option value="2B">Lớp 2B</Option>
                <Option value="2C">Lớp 2C</Option>
                <Option value="3A">Lớp 3A</Option>
                <Option value="3B">Lớp 3B</Option>
                <Option value="3C">Lớp 3C</Option>
                <Option value="4A">Lớp 4A</Option>
                <Option value="4B">Lớp 4B</Option>
                <Option value="4C">Lớp 4C</Option>
                <Option value="5A">Lớp 5A</Option>
                <Option value="5B">Lớp 5B</Option>
                <Option value="5C">Lớp 5C</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="categories"
              label="Loại khám"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ít nhất một loại khám",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các loại khám sức khỏe cho học sinh tiểu học"
              >
                {availableCategories.map((category) => (
                  <Option key={category} value={category}>
                    {category === "VISION" && "Khám mắt"}
                    {category === "HEARING" && "Khám tai"}
                    {category === "ORAL" && "Khám răng miệng"}
                    {category === "SKIN" && "Khám da liễu"}
                    {category === "RESPIRATORY" && "Khám hô hấp"}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Target Count Display */}
        <Row gutter={16}>
          <Col span={24}>
            <Alert
              message={
                <div>
                  <strong>Số lượng học sinh dự kiến:</strong>{" "}
                  {calculatingTargetCount ? (
                    <Spin size="small" />
                  ) : (
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#1890ff",
                      }}
                    >
                      {targetCount} học sinh
                    </span>
                  )}
                </div>
              }
              description={
                targetCount > 0
                  ? `Dựa trên tiêu chí độ tuổi và lớp đã chọn, hệ thống tính toán có ${targetCount} học sinh phù hợp cho đợt khám này.`
                  : "Vui lòng nhập đầy đủ thông tin độ tuổi và lớp mục tiêu để tính toán số lượng học sinh."
              }
              type={targetCount > 0 ? "info" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Col>
        </Row>

        <Divider />

        <Form.Item>
          <Row justify="end" gutter={16}>
            <Col>
              <Button icon={<CloseOutlined />} onClick={onCancel}>
                Hủy
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                {isEditing ? "Cập nhật" : "Tạo đợt khám"}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default HealthCheckCampaignForm;
