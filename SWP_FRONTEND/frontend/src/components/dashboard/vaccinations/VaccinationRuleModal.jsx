import React from "react";
import { Modal, Form, Input, InputNumber, Switch, Button, Space, Row, Col } from "antd";
import { getFormValidationRules } from "../../../utils/vaccinationRuleUtils";

const { TextArea } = Input;

/**
 * Modal component for adding/editing vaccination rules
 */
const VaccinationRuleModal = ({
  visible,
  editingRule,
  currentDoseNumber,
  form,
  loading,
  onSubmit,
  onCancel,
  onDoseNumberChange,
}) => {
  const validationRules = getFormValidationRules();

  return (
    <Modal
      title={
        editingRule
          ? "Cập nhật quy tắc tiêm chủng"
          : "Thêm quy tắc tiêm chủng mới"
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item
          name="name"
          label="Tên quy tắc"
          rules={validationRules.name}
        >
          <Input placeholder="VD: COVID-19 Vaccination" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={validationRules.description}
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
              rules={validationRules.doesNumber}
            >
              <InputNumber
                min={1}
                max={10}
                style={{ width: "100%" }}
                placeholder=""
                addonBefore="Mũi"
                onChange={onDoseNumberChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="intervalDays"
              label="Số ngày tối thiểu sau mũi trước đó"
              rules={validationRules.intervalDays(currentDoseNumber)}
            >
              <InputNumber
                min={0}
                max={365}
                style={{ width: "100%" }}
                placeholder={currentDoseNumber === 1 ? "0" : ""}
                addonAfter="ngày"
                disabled={currentDoseNumber === 1}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minAge"
              label="Tuổi tối thiểu (tháng)"
              rules={validationRules.minAge}
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
              rules={validationRules.maxAge}
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
            <Button onClick={onCancel}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingRule ? "Cập nhật" : "Tạo mới"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VaccinationRuleModal;
