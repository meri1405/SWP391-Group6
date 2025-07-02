import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  message,
  Space,
  Card,
} from "antd";
import { UserAddOutlined, TeamOutlined } from "@ant-design/icons";
import { createStudentWithParents } from "../../api/studentApi";
import moment from "moment";
import "../../styles/StudentManagement.css";

const { Option } = Select;
const { Title, Text } = Typography;

// Dữ liệu tham chiếu
const genderOptions = [
  { value: "M", label: "Nam" },
  { value: "F", label: "Nữ" },
];

const birthPlaceOptions = [
  "Thành phố Hà Nội",
  "Thành phố Huế",
  "Tỉnh Lai Châu",
  "Tỉnh Điện Biên",
  "Tỉnh Sơn La",
  "Tỉnh Lạng Sơn",
  "Tỉnh Quảng Ninh",
  "Tỉnh Thanh Hoá",
  "Tỉnh Nghệ An",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Cao Bằng",
  "Tỉnh Tuyên Quang",
  "Tỉnh Lào Cai",
  "Tỉnh Thái Nguyên",
  "Tỉnh Phú Thọ",
  "Tỉnh Bắc Ninh",
  "Tỉnh Hưng Yên",
  "Thành phố Hải Phòng",
  "Tỉnh Ninh Bình",
  "Tỉnh Quảng Trị",
  "Thành phố Đà Nẵng",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Gia Lai",
  "Tỉnh Khánh Hoà",
  "Tỉnh Lâm Đồng",
  "Tỉnh Đắk Lắk",
  "Thành phố Hồ Chí Minh",
  "Tỉnh Đồng Nai",
  "Tỉnh Tây Ninh",
  "Thành phố Cần Thơ",
  "Tỉnh Vĩnh Long",
  "Tỉnh Đồng Tháp",
  "Tỉnh Cà Mau",
  "Tỉnh An Giang",
];

const AddStudentWithParentsModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [studentDob, setStudentDob] = useState(null);
  const [fatherEnabled, setFatherEnabled] = useState(true);
  const [motherEnabled, setMotherEnabled] = useState(false);

  // Custom validator cho thông tin phụ huynh
  const validateParentInfo = (parentType) => {
    return {
      validator: async (_, value) => {
        const values = form.getFieldsValue();
        const firstNameField = `${parentType}_firstName`;
        const lastNameField = `${parentType}_lastName`;

        const hasFirstName = values[firstNameField];
        const hasLastName = values[lastNameField];

        // Nếu có nhập họ hoặc tên thì các trường khác cũng bắt buộc
        if (hasFirstName || hasLastName) {
          if (!value) {
            return Promise.reject(
              `Trường này là bắt buộc khi nhập thông tin ${
                parentType === "father" ? "cha" : "mẹ"
              }`
            );
          }
        }
        return Promise.resolve();
      },
    };
  };

  // Handle toggle parent access - only one parent can have access
  const handleFatherAccessChange = (checked) => {
    setFatherEnabled(checked);
    if (checked) {
      setMotherEnabled(false);
    }
  };

  const handleMotherAccessChange = (checked) => {
    setMotherEnabled(checked);
    if (checked) {
      setFatherEnabled(false);
    }
  };
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validation bổ sung trước khi gửi
      if (
        !values.father_firstName &&
        !values.father_lastName &&
        !values.mother_firstName &&
        !values.mother_lastName
      ) {
        message.error("Vui lòng nhập thông tin ít nhất một phụ huynh");
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu theo định dạng API
      const requestData = {
        students: [
          {
            firstName: values.student_firstName,
            lastName: values.student_lastName,
            dob: (studentDob || values.student_dob).format("YYYY-MM-DD"),
            gender: values.student_gender,
            className: values.student_className,
            birthPlace: values.student_birthPlace,
            address: values.student_address,
            citizenship: "Việt Nam",
            isDisabled: false,
          },
        ],
      };

      if (values.father_firstName && values.father_lastName) {
        if (
          !values.father_phone ||
          !values.father_jobTitle ||
          !values.father_dob
        ) {
          message.error(
            "Vui lòng nhập đầy đủ thông tin bắt buộc của cha: số điện thoại, nghề nghiệp, ngày sinh"
          );
          setLoading(false);
          return;
        }
        requestData.father = {
          firstName: values.father_firstName,
          lastName: values.father_lastName,
          phone: values.father_phone,
          gender: "M",
          jobTitle: values.father_jobTitle,
          address: values.father_address || values.student_address,
          dob: values.father_dob.format("YYYY-MM-DD"),
          enabled: fatherEnabled,
        };
      }

      // Thêm thông tin mẹ nếu có đầy đủ thông tin bắt buộc
      if (values.mother_firstName && values.mother_lastName) {
        if (
          !values.mother_phone ||
          !values.mother_jobTitle ||
          !values.mother_dob
        ) {
          message.error(
            "Vui lòng nhập đầy đủ thông tin bắt buộc của mẹ: số điện thoại, nghề nghiệp, ngày sinh"
          );
          setLoading(false);
          return;
        }
        requestData.mother = {
          firstName: values.mother_firstName,
          lastName: values.mother_lastName,
          phone: values.mother_phone,
          gender: "F",
          jobTitle: values.mother_jobTitle,
          address: values.mother_address || values.student_address,
          dob: values.mother_dob.format("YYYY-MM-DD"),
          enabled: motherEnabled,
        };
      }

      const response = await createStudentWithParents(requestData);

      message.success("Tạo học sinh và phụ huynh thành công!");
      form.resetFields();
      onSuccess && onSuccess(response);
      onCancel();
    } catch (error) {
      message.error(
        error.message || "Có lỗi xảy ra khi tạo học sinh và phụ huynh"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setStudentDob(null);
    setFatherEnabled(true);
    setMotherEnabled(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Thêm học sinh và phụ huynh</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={1000}
      destroyOnHidden
      className="student-form-modal"
    >
      {" "}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
        className="student-form"
      >
        {/* Thông tin học sinh */}
        <Card
          title={
            <Space>
              <UserAddOutlined />
              <span>Thông tin học sinh</span>
            </Space>
          }
          className="student-form-card"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_firstName"
                label="Tên"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học sinh" },
                ]}
              >
                <Input placeholder="Nhập tên học sinh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="student_lastName"
                label="Họ"
                rules={[
                  { required: true, message: "Vui lòng nhập họ học sinh" },
                ]}
              >
                <Input placeholder="Nhập họ học sinh" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {" "}
            <Col span={8}>
              <Form.Item
                name="student_dob"
                label="Ngày sinh"
                getValueFromEvent={(value) => {
                  console.log("getValueFromEvent called with:", value);
                  return value;
                }}
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  allowClear
                  value={studentDob}
                  onChange={(date, dateString) => {
                    console.log(
                      "Student DatePicker onChange:",
                      date,
                      "dateString:",
                      dateString
                    );
                    setStudentDob(date);
                    form.setFieldsValue({ student_dob: date });
                    if (date) {
                      console.log("Date object details:", {
                        year: date.year(),
                        month: date.month(),
                        day: date.date(),
                        formatted: date.format("DD/MM/YYYY"),
                      });
                    }
                  }}
                  disabledDate={(current) => {
                    if (!current) return false;

                    const today = moment();
                    // Tính ngày sinh tối thiểu (12 tuổi) và tối đa (2 tuổi)
                    const minBirthDate = moment().subtract(12, "years"); // 12 tuổi trở xuống
                    const maxBirthDate = moment().subtract(2, "years"); // 2 tuổi trở lên

                    // Disable các ngày trong tương lai và ngoài khoảng tuổi cho phép
                    return (
                      current > today ||
                      current < minBirthDate ||
                      current > maxBirthDate
                    );
                  }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="student_gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  {genderOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="student_className"
                label="Lớp học"
                rules={[{ required: true, message: "Vui lòng nhập lớp học" }]}
              >
                <Input placeholder="Ví dụ: 1A" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="student_birthPlace"
                label="Nơi sinh"
                rules={[{ required: true, message: "Vui lòng chọn nơi sinh" }]}
              >
                <Select
                  placeholder="Chọn nơi sinh"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {birthPlaceOptions.map((place) => (
                    <Option key={place} value={place}>
                      {place}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="student_address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        {/* Thông tin cha */}{" "}
        <Card
          title={
            <Space>
              <TeamOutlined />
              <span>Thông tin cha (tùy chọn)</span>
            </Space>
          }
          className="student-form-card"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="father_firstName" label="Tên">
                <Input placeholder="Nhập tên cha" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="father_lastName" label="Họ">
                <Input placeholder="Nhập họ cha" />
              </Form.Item>
            </Col>
          </Row>{" "}
          <Row gutter={16}>
            <Col span={8}>
              {" "}
              <Form.Item
                name="father_phone"
                label="Số điện thoại"
                rules={[
                  validateParentInfo("father"),
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có đúng 10 chữ số",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={8}>
              {" "}
              <Form.Item
                name="father_dob"
                label="Ngày sinh"
                rules={[validateParentInfo("father")]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) => {
                    if (!current) return false;

                    const today = moment();
                    const minDate = moment().subtract(100, "years"); // Tối đa 100 tuổi
                    const maxDate = moment().subtract(18, "years"); // Ít nhất 18 tuổi

                    return (
                      current > today || current < minDate || current > maxDate
                    );
                  }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              {" "}
              <Form.Item
                name="father_jobTitle"
                label="Nghề nghiệp"
                rules={[validateParentInfo("father")]}
              >
                <Input placeholder="Nhập nghề nghiệp" />
              </Form.Item>
            </Col>
          </Row>{" "}
          <Form.Item
            name="father_address"
            label="Địa chỉ"
            rules={[validateParentInfo("father")]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>
          
          <Form.Item
            name="father_enabled"
            label="Cho phép truy cập hệ thống"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch 
              checked={fatherEnabled} 
              onChange={handleFatherAccessChange}
            />
          </Form.Item>
          {fatherEnabled && motherEnabled && (
            <Text type="warning">
              Chỉ một phụ huynh được phép truy cập hệ thống.
            </Text>
          )}
        </Card>
        {/* Thông tin mẹ */}{" "}
        <Card
          title={
            <Space>
              <TeamOutlined />
              <span>Thông tin mẹ (tùy chọn)</span>
            </Space>
          }
          className="student-form-card"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="mother_firstName" label="Tên">
                <Input placeholder="Nhập tên mẹ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mother_lastName" label="Họ">
                <Input placeholder="Nhập họ mẹ" />
              </Form.Item>
            </Col>
          </Row>{" "}
          <Row gutter={16}>
            <Col span={8}>
              {" "}
              <Form.Item
                name="mother_phone"
                label="Số điện thoại"
                rules={[
                  validateParentInfo("mother"),
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có đúng 10 chữ số",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={8}>
              {" "}
              <Form.Item
                name="mother_dob"
                label="Ngày sinh"
                rules={[validateParentInfo("mother")]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) => {
                    if (!current) return false;

                    const today = moment();
                    const minDate = moment().subtract(100, "years"); // Tối đa 100 tuổi
                    const maxDate = moment().subtract(18, "years"); // Ít nhất 18 tuổi

                    return (
                      current > today || current < minDate || current > maxDate
                    );
                  }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mother_jobTitle"
                label="Nghề nghiệp"
                rules={[validateParentInfo("mother")]}
              >
                <Input placeholder="Nhập nghề nghiệp" />
              </Form.Item>
            </Col>
          </Row>{" "}
          <Form.Item
            name="mother_address"
            label="Địa chỉ"
            rules={[validateParentInfo("mother")]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>
          
          <Form.Item
            name="mother_enabled"
            label="Cho phép truy cập hệ thống"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              checked={motherEnabled} 
              onChange={handleMotherAccessChange}
            />
          </Form.Item>
          {fatherEnabled && motherEnabled && (
            <Text type="warning">
              Chỉ một phụ huynh được phép truy cập hệ thống.
            </Text>
          )}
        </Card>
        
        <div style={{ marginTop: 16, padding: 16, backgroundColor: "#f5f5f5", borderRadius: 4 }}>
          <Text type="secondary">
            <strong>Lưu ý:</strong> Chỉ một phụ huynh được phép truy cập hệ thống. Nếu cả hai phụ huynh được chọn, hệ thống sẽ tự động chọn cha.
          </Text>
        </div>
        
        {/* Buttons */}
        <Form.Item style={{ textAlign: "right", marginBottom: 0, marginTop: 16 }}>
          <Space>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo học sinh và phụ huynh
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentWithParentsModal;
