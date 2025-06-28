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
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { nurseApi } from "../../../api/nurseApi";
import { vaccinationCampaignApi } from "../../../api/vaccinationCampaignApi";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const VaccinationCampaignForm = ({ campaign = null, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [vaccinationRules, setVaccinationRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!campaign;

  useEffect(() => {
    fetchVaccinationRules();
    if (isEditing) {
      // Set form values from campaign data
      form.setFieldsValue({
        ...campaign,
        scheduledDate: campaign.scheduledDate
          ? dayjs(campaign.scheduledDate)
          : null,
        location: "Tại Trường", // Always override with fixed location
      });
    }
  }, [campaign, form, isEditing]);

  const fetchVaccinationRules = async () => {
    setLoading(true);
    try {
      const rules = await nurseApi.getAllVaccinationRules();
      setVaccinationRules(rules);
    } catch (error) {
      message.error("Không thể tải danh sách quy tắc tiêm chủng");
      console.error("Error fetching vaccination rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const campaignData = {
        ...values,
        scheduledDate: values.scheduledDate
          ? values.scheduledDate.format("YYYY-MM-DDTHH:mm:ss")
          : null,
      };

      let result;
      if (isEditing) {
        result = await vaccinationCampaignApi.updateCampaign(
          campaign.id,
          campaignData
        );
        message.success("Cập nhật chiến dịch tiêm chủng thành công");
      } else {
        result = await vaccinationCampaignApi.createCampaign(campaignData);
        message.success("Tạo chiến dịch tiêm chủng mới thành công");
      }
      onSuccess(result);
    } catch (error) {
      message.error(
        `Không thể ${isEditing ? "cập nhật" : "tạo"} chiến dịch tiêm chủng`
      );
      console.error(
        `Error ${isEditing ? "updating" : "creating"} campaign:`,
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onRuleChange = (ruleId) => {
    const selectedRule = vaccinationRules.find((rule) => rule.id === ruleId);
    if (selectedRule) {
      form.setFieldsValue({
        vaccineBrand: "", // Clear any previous brand to let user specify
        additionalInfo: `Vắc xin ${selectedRule.name}, liều ${
          selectedRule.doesNumber
        }.\n${selectedRule.description || ""}`,
      });
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
            ? "Chỉnh sửa chiến dịch tiêm chủng"
            : "Tạo chiến dịch tiêm chủng mới"}
        </Title>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          estimatedVaccineCount: 0,
          location: "Tại Trường",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên chiến dịch"
              rules={[
                { required: true, message: "Vui lòng nhập tên chiến dịch" },
              ]}
            >
              <Input placeholder="Nhập tên chiến dịch tiêm chủng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vaccinationRuleId"
              label="Quy tắc tiêm chủng"
              rules={[
                { required: true, message: "Vui lòng chọn quy tắc tiêm chủng" },
              ]}
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
              label="Ngày thực hiện"
              rules={[
                { required: true, message: "Vui lòng chọn ngày thực hiện" },
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn ngày và giờ thực hiện"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Địa điểm"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
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
              label="Số lượng vắc xin (dự kiến)"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng vắc xin" },
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                placeholder="Nhập số lượng vắc xin cần thiết"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Mô tả chiến dịch"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả chi tiết về chiến dịch tiêm chủng"
          />
        </Form.Item>

        <Form.Item
          name="prePostCareInstructions"
          label="Hướng dẫn chăm sóc trước và sau tiêm"
          rules={[
            { required: true, message: "Vui lòng nhập hướng dẫn chăm sóc" },
          ]}
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
