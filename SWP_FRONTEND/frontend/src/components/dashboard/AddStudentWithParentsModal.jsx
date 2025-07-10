import React, { useState, useEffect } from "react";
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
import {
  validatePhone,
  VIETNAMESE_MOBILE_PREFIXES,
} from "../../utils/phoneValidator";
import dayjs from "dayjs";
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
  const [fatherEnabled, setFatherEnabled] = useState(true);
  const [motherEnabled, setMotherEnabled] = useState(false);
  const [studentDob, setStudentDob] = useState(
    dayjs().year(2023).month(0).date(1)
  );
  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);

  // Function để tính lớp học tự động dựa trên ngày sinh
  const calculateAutoGrade = (dateOfBirth) => {
    if (!dateOfBirth) return "";

    const today = dayjs();
    const age = today.diff(dateOfBirth, "year");

    // Hệ thống giáo dục Việt Nam - tự động điền số lớp
    if (age === 6) {
      return "1"; // Lớp 1
    } else if (age === 7) {
      return "2"; // Lớp 2 (có thể là 1 hoặc 2, nhưng chọn 2 làm mặc định)
    } else if (age === 8) {
      return "3"; // Lớp 3 (có thể là 2 hoặc 3, nhưng chọn 3 làm mặc định)
    } else if (age === 9) {
      return "4"; // Lớp 4 (có thể là 3 hoặc 4, nhưng chọn 4 làm mặc định)
    } else if (age === 10) {
      return "5"; // Lớp 5 (có thể là 4 hoặc 5, nhưng chọn 5 làm mặc định)
    } else if (age === 11) {
      return "6"; // Lớp 6 (có thể là 5 hoặc 6, nhưng chọn 6 làm mặc định)
    } else {
      return ""; // Không tự động điền cho các tuổi khác
    }
  };

  // Effect để tự động điền lớp học chỉ khi user đã chọn ngày sinh
  useEffect(() => {
    if (hasUserSelectedDate) {
      const autoGrade = calculateAutoGrade(studentDob);
      if (autoGrade) {
        form.setFieldsValue({ student_className: autoGrade });
      }
    }
  }, [studentDob, hasUserSelectedDate, form]);

  // Custom validator cho thông tin phụ huynh
  const validateParentInfo = (parentType) => {
    return {
      validator: async (rule) => {
        const values = form.getFieldsValue();
        const phoneField = `${parentType}_phone`;
        const firstNameField = `${parentType}_firstName`;
        const lastNameField = `${parentType}_lastName`;
        const dobField = `${parentType}_dob`;
        const jobTitleField = `${parentType}_jobTitle`;

        const phone = values[phoneField];
        const firstName = values[firstNameField];
        const lastName = values[lastNameField];
        const dob = values[dobField];
        const jobTitle = values[jobTitleField];

        const currentField = rule.field;

        // Nếu có số điện thoại thì phải có tên và họ
        if (phone && phone.trim()) {
          if (
            currentField === firstNameField &&
            (!firstName || !firstName.trim())
          ) {
            return Promise.reject(
              new Error("Tên là bắt buộc khi có số điện thoại")
            );
          }
          if (
            currentField === lastNameField &&
            (!lastName || !lastName.trim())
          ) {
            return Promise.reject(
              new Error("Họ là bắt buộc khi có số điện thoại")
            );
          }
          if (currentField === dobField && !dob) {
            return Promise.reject(
              new Error("Ngày sinh là bắt buộc khi có số điện thoại")
            );
          }
          if (
            currentField === jobTitleField &&
            (!jobTitle || !jobTitle.trim())
          ) {
            return Promise.reject(
              new Error("Nghề nghiệp là bắt buộc khi có số điện thoại")
            );
          }

          // Validate phone format
          if (currentField === phoneField) {
            const phoneError = validatePhone(phone);
            if (phoneError) {
              return Promise.reject(new Error(phoneError));
            }
          }
        }

        // Nếu có tên hoặc họ thì phải có số điện thoại
        if ((firstName && firstName.trim()) || (lastName && lastName.trim())) {
          if (currentField === phoneField && (!phone || !phone.trim())) {
            return Promise.reject(
              new Error("Số điện thoại là bắt buộc khi có họ tên")
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
      if (!values.father_phone && !values.mother_phone) {
        message.error(
          "Vui lòng nhập thông tin ít nhất một phụ huynh (số điện thoại)"
        );
        setLoading(false);
        return;
      }

      // Chuẩn bị dữ liệu theo định dạng API
      const requestData = {
        students: [
          {
            firstName: values.student_firstName,
            lastName: values.student_lastName,
            dob: studentDob.format("YYYY-MM-DD"), // Use state instead of form value
            gender: values.student_gender,
            className: values.student_className,
            birthPlace: values.student_birthPlace,
            address: values.student_address,
            citizenship: "Việt Nam",
            isDisabled: false,
          },
        ],
      };

      // Thêm thông tin cha nếu có số điện thoại (và theo validation đã có họ tên)
      if (values.father_phone && values.father_phone.trim()) {
        if (
          !values.father_firstName ||
          !values.father_firstName.trim() ||
          !values.father_lastName ||
          !values.father_lastName.trim() ||
          !values.father_jobTitle ||
          !values.father_jobTitle.trim() ||
          !values.father_dob
        ) {
          message.error(
            "Vui lòng nhập đầy đủ thông tin bắt buộc của cha: họ, tên, nghề nghiệp, ngày sinh"
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

      // Thêm thông tin mẹ nếu có số điện thoại (và theo validation đã có họ tên)
      if (values.mother_phone && values.mother_phone.trim()) {
        if (
          !values.mother_firstName ||
          !values.mother_firstName.trim() ||
          !values.mother_lastName ||
          !values.mother_lastName.trim() ||
          !values.mother_jobTitle ||
          !values.mother_jobTitle.trim() ||
          !values.mother_dob
        ) {
          message.error(
            "Vui lòng nhập đầy đủ thông tin bắt buộc của mẹ: họ, tên, nghề nghiệp, ngày sinh"
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
    setStudentDob(dayjs().year(2017).month(0).date(1)); // Reset to default 2017
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
                  placeholder="Chọn ngày sinh (2 tuổi)"
                  allowClear={false}
                  key="student-datepicker"
                  value={studentDob} // Controlled value
                  defaultPickerValue={dayjs().year(2023).month(0).date(1)} // Calendar always opens at 2023
                  onChange={(date, dateString) => {
                    console.log(
                      "Student DatePicker onChange:",
                      date,
                      "dateString:",
                      dateString
                    );
                    setStudentDob(date); // Update state
                    setHasUserSelectedDate(true); // Mark that user has selected a date
                    form.setFieldsValue({ student_dob: date }); // Update form
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

                    const today = dayjs();
                    const currentYear = today.year();
                    const selectedYear = current.year();

                    // Disable các ngày trong tương lai và ngoài khoảng tuổi cho phép
                    // Tuổi tối thiểu 2 năm, tối đa 12 năm (tính theo năm)
                    return (
                      current > today ||
                      selectedYear < currentYear - 12 ||
                      selectedYear > currentYear - 2
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
                help={
                  <span style={{ color: "#666", fontSize: "12px" }}>
                    Chỉ cần thên chữ cái A,B,C,... sau số lớp
                  </span>
                }
              >
                <Input placeholder="Chọn ngày sinh trước để tự động điền số lớp" />
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
              <Form.Item
                name="father_firstName"
                label="Tên"
                rules={[validateParentInfo("father")]}
              >
                <Input placeholder="Nhập tên cha" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="father_lastName"
                label="Họ"
                rules={[validateParentInfo("father")]}
              >
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
                    validator: (_, value) => {
                      if (value && value.trim()) {
                        const phoneError = validatePhone(value);
                        if (phoneError) {
                          return Promise.reject(new Error(phoneError));
                        }
                      }
                      return Promise.resolve();
                    },
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
                  defaultPickerValue={dayjs().year(2006).startOf("year")} // Fixed to year 2006 (18 years old)
                  disabledDate={(current) => {
                    if (!current) return false;

                    const today = dayjs();
                    const currentYear = today.year();
                    const selectedYear = current.year();

                    // Disable các ngày trong tương lai và ngoài khoảng tuổi cho phép
                    // Tuổi tối thiểu 18 năm, tối đa 100 năm (tính theo năm)
                    return (
                      current > today ||
                      selectedYear < currentYear - 100 ||
                      selectedYear > currentYear - 18
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
              <Form.Item
                name="mother_firstName"
                label="Tên"
                rules={[validateParentInfo("mother")]}
              >
                <Input placeholder="Nhập tên mẹ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mother_lastName"
                label="Họ"
                rules={[validateParentInfo("mother")]}
              >
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
                    validator: (_, value) => {
                      if (value && value.trim()) {
                        const phoneError = validatePhone(value);
                        if (phoneError) {
                          return Promise.reject(new Error(phoneError));
                        }
                      }
                      return Promise.resolve();
                    },
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
                  defaultPickerValue={dayjs().year(2006).startOf("year")} // Fixed to year 2006 (18 years old)
                  disabledDate={(current) => {
                    if (!current) return false;

                    const today = dayjs();
                    const currentYear = today.year();
                    const selectedYear = current.year();

                    // Disable các ngày trong tương lai và ngoài khoảng tuổi cho phép
                    // Tuổi tối thiểu 18 năm, tối đa 100 năm (tính theo năm)
                    return (
                      current > today ||
                      selectedYear < currentYear - 100 ||
                      selectedYear > currentYear - 18
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
        <div
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: "#f5f5f5",
            borderRadius: 4,
          }}
        >
          <Text type="secondary">
            <strong>Lưu ý:</strong> Chỉ một phụ huynh được phép truy cập hệ
            thống. Nếu cả hai phụ huynh được chọn, hệ thống sẽ tự động chọn cha.
          </Text>
        </div>
        {/* Buttons */}
        <Form.Item
          style={{ textAlign: "right", marginBottom: 0, marginTop: 16 }}
        >
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
