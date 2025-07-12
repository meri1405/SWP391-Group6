import React from "react";
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
  Spin,
  Typography,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useVaccinationCampaignForm } from "../../../hooks/useVaccinationCampaignForm";
import { vaccinationCampaignValidation } from "../../../utils/vaccinationCampaignValidation";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const VaccinationCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  // Use the custom hook for all form logic and state management
  const {
    form,
    vaccinationRules,
    isEditing,
    loading,
    submitting,
    calculatingCount,
    handleSubmit,
    onRuleChange,
    getInitialValues,
  } = useVaccinationCampaignForm(campaign, onSuccess);

  // Get validation rules
  const validationRules = vaccinationCampaignValidation.getFormValidationRules();

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
            ? "Chỉnh sửa chiến dịch tiêm chủng"
            : "Tạo chiến dịch tiêm chủng mới"}
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={getInitialValues()}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span>
                  Tên chiến dịch <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={validationRules.name}
            >
              <Input placeholder="Nhập tên chiến dịch tiêm chủng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vaccinationRuleId"
              label={
                <span>
                  Quy tắc tiêm chủng <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={validationRules.vaccinationRuleId}
            >
              <Select
                placeholder="Chọn quy tắc tiêm chủng"
                onChange={onRuleChange}
              >
                {vaccinationRules.map((rule) => (
                  <Option key={rule.id} value={rule.id}>
                    {rule.name} - {rule.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="scheduledDate"
              label={
                <span>
                  Ngày thực hiện <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={validationRules.scheduledDate}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn ngày và giờ thực hiện"
                disabledDate={vaccinationCampaignValidation.isDateDisabled}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label={
                <span>
                  Địa điểm <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={validationRules.location}
            >
              <Input
                value="Tại Trường"
                disabled
                style={{ backgroundColor: "#f5f5f5", color: "#000" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="vaccineBrand" label="Nhãn hiệu vắc xin">
              <Input placeholder="Nhập nhãn hiệu vắc xin (tùy chọn)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="estimatedVaccineCount"
              label={
                <span>
                  Số lượng vắc xin (dự kiến){" "}
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              rules={validationRules.estimatedVaccineCount}
              extra={
                calculatingCount
                  ? "Đang tính toán..."
                  : "Số lượng được tính tự động dựa trên quy tắc tiêm chủng"
              }
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Chọn quy tắc tiêm chủng để tính toán tự động"
                readOnly
                disabled={calculatingCount}
                suffix={calculatingCount ? <Spin size="small" /> : null}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={
            <span>
              Mô tả chiến dịch <span style={{ color: "red" }}>*</span>
            </span>
          }
          rules={validationRules.description}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về chiến dịch tiêm chủng"
          />
        </Form.Item>

        <Form.Item
          name="prePostCareInstructions"
          label={
            <span>
              Hướng dẫn chăm sóc trước và sau tiêm{" "}
              <span style={{ color: "red" }}>*</span>
            </span>
          }
          rules={validationRules.prePostCareInstructions}
        >
          <TextArea
            rows={4}
            placeholder="Hướng dẫn chăm sóc trước và sau tiêm"
          />
        </Form.Item>

        <Form.Item name="additionalInfo" label="Thông tin bổ sung">
          <TextArea rows={3} placeholder="Thông tin bổ sung (nếu có)" />
        </Form.Item>

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
                {isEditing ? "Cập nhật" : "Tạo chiến dịch"}
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default VaccinationCampaignForm;
