import React from "react";
import { Form, Input, Button, Row, Col, Alert } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { formatDate } from "../../../utils/timeUtils";
import { 
  getPreVaccinationStatusText, 
  getCurrentNotesForEditing 
} from "../../../utils/vaccinationCampaignUtils.jsx";

const { TextArea } = Input;

const EditVaccinationNotesForm = ({ record, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  return (
    <div>
      {/* Read-only information */}
      <Alert
        message="Thông tin kết quả tiêm chủng"
        description={
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <strong>Học sinh:</strong> {record.studentFullName}
                </p>
                <p>
                  <strong>Mã học sinh:</strong> {record.studentCode}
                </p>
                <p>
                  <strong>Ngày tiêm:</strong>{" "}
                  {formatDate(record.vaccinationDate)}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Tình trạng trước tiêm:</strong>{" "}
                  {getPreVaccinationStatusText(record.preVaccinationStatus)}
                </p>
                <p>
                  <strong>Số lô vắc xin:</strong> {record.lotNumber}
                </p>
                <p>
                  <strong>Y tá thực hiện:</strong> {record.administeredBy}
                </p>
              </Col>
            </Row>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Edit notes form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          notes: getCurrentNotesForEditing(record),
        }}
      >
        <Form.Item
          name="notes"
          label={
            record.preVaccinationStatus === "ABNORMAL" ||
            record.preVaccinationStatus === "POSTPONED"
              ? "Lý do không thể tiêm / hoãn tiêm"
              : "Ghi chú"
          }
        >
          <TextArea
            rows={4}
            placeholder={
              record.preVaccinationStatus === "ABNORMAL" ||
              record.preVaccinationStatus === "POSTPONED"
                ? "Nhập lý do chi tiết..."
                : "Nhập ghi chú thêm (nếu có)..."
            }
          />
        </Form.Item>

        <Row justify="end" gutter={16} style={{ marginTop: 16 }}>
          <Col>
            <Button onClick={onCancel}>Hủy</Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              Lưu thay đổi
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditVaccinationNotesForm;