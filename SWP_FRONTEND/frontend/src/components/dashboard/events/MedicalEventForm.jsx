import React from "react";
import { Form, Row, Col, DatePicker, Select, Input, Button, Tag } from "antd";
import dayjs from "dayjs";
import { EVENT_TYPES, SEVERITY_LEVELS } from "../../../constants/medicalEventConstants";

const { Option } = Select;
const { TextArea } = Input;

/**
 * Medical Event Form Component
 */
const MedicalEventForm = ({
  form,
  classes,
  selectedClass,
  filteredStudents,
  studentCount,
  healthProfileValid,
  healthProfileMessage,
  medicalSupplies,
  onClassChange,
  onStudentChange,
  onFinish,
}) => {
  return (
    <Form form={form} layout="vertical" preserve={false} onFinish={onFinish}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="occurrenceTime"
            label="Thời gian xảy ra"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (value && value > dayjs()) {
                    return Promise.reject(new Error("Thời gian không được lớn hơn hiện tại"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
              placeholder="Chọn thời gian"
              disabledDate={(current) => current && current > dayjs().endOf("day")}
              disabledTime={() => ({
                disabledHours: () => {
                  const hours = [];
                  if (dayjs().format("DD/MM/YYYY") === dayjs().format("DD/MM/YYYY")) {
                    for (let i = dayjs().hour() + 1; i < 24; i++) {
                      hours.push(i);
                    }
                  }
                  return hours;
                },
                disabledMinutes: (hour) => {
                  const minutes = [];
                  if (
                    dayjs().format("DD/MM/YYYY") === dayjs().format("DD/MM/YYYY") &&
                    hour === dayjs().hour()
                  ) {
                    for (let i = dayjs().minute() + 1; i < 60; i++) {
                      minutes.push(i);
                    }
                  }
                  return minutes;
                },
              })}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="className"
            label="Lớp"
            rules={[{ required: true, message: "Vui lòng chọn lớp" }]}
          >
            <Select
              placeholder="Chọn lớp"
              value={selectedClass}
              onChange={onClassChange}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {classes.map((classInfo) => (
                <Option key={classInfo.name} value={classInfo.name}>
                  {classInfo.name} ({classInfo.studentCount} học sinh)
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="studentId"
            label={`Học sinh${studentCount > 0 ? ` (${studentCount} học sinh)` : ""}`}
            rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
            validateStatus={!healthProfileValid ? "error" : ""}
            help={!healthProfileValid ? healthProfileMessage : ""}
          >
            <Select
              placeholder={selectedClass ? "Chọn học sinh" : "Vui lòng chọn lớp trước"}
              disabled={!selectedClass}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              onChange={onStudentChange}
            >
              {filteredStudents.map((student) => (
                <Option
                  key={student.studentID || student.id}
                  value={student.studentID || student.id}
                >
                  {student.firstName} {student.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="eventType"
            label="Loại sự kiện"
            rules={[{ required: true, message: "Vui lòng chọn loại sự kiện" }]}
          >
            <Select placeholder="Chọn loại sự kiện">
              {EVENT_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="severityLevel"
            label="Mức độ nghiêm trọng"
            rules={[{ required: true, message: "Vui lòng chọn mức độ" }]}
          >
            <Select placeholder="Chọn mức độ">
              {SEVERITY_LEVELS.map((level) => (
                <Option key={level.value} value={level.value}>
                  <Tag color={level.color}>{level.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item
            name="location"
            label="Địa điểm xảy ra"
            rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
          >
            <Input placeholder="Ví dụ: Sân trường, Phòng học 101..." />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="symptoms" label="Triệu chứng">
            <TextArea rows={3} placeholder="Mô tả các triệu chứng của học sinh..." />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="firstAidActions" label="Xử lý ban đầu">
            <TextArea
              rows={3}
              placeholder="Mô tả các biện pháp xử lý, sơ cứu đã thực hiện..."
            />
          </Form.Item>
        </Col>
        <Col xs={24}>
          <Form.Item name="suppliesUsed" label="Vật tư y tế đã sử dụng">
            <Form.List name="suppliesUsed">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{ display: "flex", marginBottom: 8, gap: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "medicalSupplyId"]}
                        style={{ flex: 1 }}
                        rules={[{ required: true, message: "Chọn vật tư" }]}
                      >
                        <Select placeholder="Chọn vật tư y tế">
                          {medicalSupplies.map((supply) => {
                            const expirationDate = dayjs(supply.expirationDate);
                            const today = dayjs();
                            const daysUntilExpiry = expirationDate.diff(today, "day");

                            // Xác định trạng thái hết hạn (chỉ cho vật tư chưa hết hạn)
                            let expiryStatus = "";
                            let expiryColor = "";

                            if (daysUntilExpiry <= 30) {
                              expiryStatus = ` (Sắp hết hạn: ${daysUntilExpiry} ngày)`;
                              expiryColor = "#faad14";
                            } else if (daysUntilExpiry <= 90) {
                              expiryStatus = ` (${daysUntilExpiry} ngày)`;
                              expiryColor = "#52c41a";
                            }

                            return (
                              <Option key={supply.id} value={supply.id}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span>
                                    {supply.name} - {supply.displayUnit}
                                  </span>
                                  <span style={{ color: expiryColor, fontSize: "12px" }}>
                                    {expiryStatus}
                                  </span>
                                </div>
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantityUsed"]}
                        style={{ width: 120 }}
                        rules={[{ required: true, message: "Nhập số lượng" }]}
                      >
                        <Input type="number" placeholder="Số lượng" min={1} />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                        style={{ marginTop: 4 }}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    + Thêm vật tư y tế
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default MedicalEventForm;
