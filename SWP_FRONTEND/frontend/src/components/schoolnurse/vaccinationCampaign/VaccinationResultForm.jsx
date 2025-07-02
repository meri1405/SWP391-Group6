import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Divider,
  DatePicker,
  Row,
  Col,
  Radio,
  message,
  Alert,
} from "antd";
import { SaveOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const VaccinationResultForm = ({ form, onSubmit, onCancel }) => {
  const [resultForm] = Form.useForm();
  const [preVaccinationStatus, setPreVaccinationStatus] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const recordData = {
        ...values,
        vaccinationDate: values.vaccinationDate
          ? values.vaccinationDate.format("YYYY-MM-DDTHH:mm:ss")
          : dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        vaccinationFormId: form.id,
        studentId: form.studentId,
        studentFullName: form.studentFullName,
        studentCode: form.studentCode,
        vaccineName: form.vaccineName,
        vaccineBrand: form.vaccineBrand,
        doseNumber: form.doseNumber,
        location: form.location,
      };

      await onSubmit(recordData);
    } catch (error) {
      message.error("Không thể ghi nhận kết quả tiêm chủng");
      console.error("Error submitting vaccination result:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (e) => {
    setPreVaccinationStatus(e.target.value);
  };

  return (
    <div className="vaccination-result-form">
      <Alert
        message="Thông tin học sinh"
        description={
          <div>
            <p>
              <strong>Họ tên:</strong> {form.studentFullName}
            </p>
            <p>
              <strong>Mã học sinh:</strong> {form.studentCode}
            </p>
            <p>
              <strong>Vắc xin:</strong> {form.vaccineName}{" "}
              {form.vaccineBrand ? `(${form.vaccineBrand})` : ""}
            </p>
            <p>
              <strong>Liều:</strong> {form.doseNumber}
            </p>
            <p>
              <strong>Phụ huynh:</strong> {form.parentFullName}
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={resultForm}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          preVaccinationStatus: "NORMAL",
          administeredBy: "",
          vaccinationDate: dayjs(),
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vaccinationDate"
              label="Ngày tiêm"
              rules={[{ required: true, message: "Vui lòng chọn ngày tiêm" }]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lotNumber"
              label="Số lô vắc xin"
              rules={[
                { required: true, message: "Vui lòng nhập số lô vắc xin" },
              ]}
            >
              <Input placeholder="Ví dụ: BCG-2024-0057" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="preVaccinationStatus"
          label="Tình trạng trước tiêm"
          rules={[
            { required: true, message: "Vui lòng chọn tình trạng trước tiêm" },
          ]}
        >
          <Radio.Group onChange={handleStatusChange}>
            <Radio.Button value="NORMAL">Bình thường</Radio.Button>
            <Radio.Button value="ABNORMAL">Bất thường</Radio.Button>
            <Radio.Button value="POSTPONED">Hoãn tiêm</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {preVaccinationStatus !== "NORMAL" && (
          <Form.Item
            name="preVaccinationNotes"
            label="Lý do"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <TextArea
              rows={3}
              placeholder="Lý do không thể tiêm hoặc cần hoãn tiêm"
            />
          </Form.Item>
        )}

        {preVaccinationStatus === "NORMAL" && (
          <>
            <Form.Item
              name="administeredBy"
              label="Bác sĩ thực hiện"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên bác sĩ thực hiện",
                },
              ]}
            >
              <Input placeholder="Nhập tên bác sĩ thực hiện tiêm chủng" />
            </Form.Item>

            <Form.Item name="notes" label="Ghi chú">
              <TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
            </Form.Item>
          </>
        )}

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
                Ghi nhận kết quả
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VaccinationResultForm;
