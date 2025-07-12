import React from "react";
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
  Space,
  Card,
} from "antd";
import { UserAddOutlined, TeamOutlined } from "@ant-design/icons";
import AddressSelector from "../common/AddressSelector";
import { useStudentForm } from "../../hooks/useStudentForm";
import { useStudentFormValidation } from "../../hooks/useStudentFormValidation";
import { 
  genderOptions, 
  birthPlaceOptions,
  VALIDATION_MESSAGES
} from "../../constants/studentFormConstants";
import "../../styles/StudentManagement.css";

const { Option } = Select;
const { Text } = Typography;

const AddStudentWithParentsModal = ({ visible, onCancel, onSuccess }) => {
  // Use custom hooks for form logic and validation
  const {
    form,
    loading,
    fatherEnabled,
    motherEnabled,
    studentDob,
    handleSubmit,
    handleCancel,
    handleFatherAccessChange,
    handleMotherAccessChange,
    handleStudentDobChange,
    getStudentDisabledDate,
    getParentDisabledDate,
    defaultStudentDob,
    defaultParentDob,
  } = useStudentForm(onSuccess, onCancel);

  const { 
    createParentValidator, 
    createPhoneValidator 
  } = useStudentFormValidation(form);

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
                  value={studentDob}
                  defaultPickerValue={defaultStudentDob}
                  onChange={handleStudentDobChange}
                  disabledDate={getStudentDisabledDate()}
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
                <Input placeholder="Vui lòng nhập lớp học" />
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
                name="student_schoolYear"
                label="Năm học"
                rules={[{ required: true, message: "Vui lòng nhập năm học" }]}
              >
                <Input placeholder="Ví dụ: 2024-2025" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="student_address"
                label="Địa chỉ"
                rules={[{ required: true, message: "Vui lòng chọn địa chỉ" }]}
              >
                <AddressSelector
                  provinceLabel="Tỉnh/Thành phố"
                  wardLabel="Phường/Xã"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin cha */}
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
                rules={[createParentValidator("father")]}
              >
                <Input placeholder="Nhập tên cha" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="father_lastName"
                label="Họ"
                rules={[createParentValidator("father")]}
              >
                <Input placeholder="Nhập họ cha" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="father_phone"
                label="Số điện thoại"
                rules={[
                  createParentValidator("father"),
                  createPhoneValidator(),
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="father_dob"
                label="Ngày sinh"
                rules={[createParentValidator("father")]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  defaultPickerValue={defaultParentDob}
                  disabledDate={getParentDisabledDate()}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="father_jobTitle"
                label="Nghề nghiệp"
                rules={[createParentValidator("father")]}
              >
                <Input placeholder="Nhập nghề nghiệp" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="father_address"
            label="Địa chỉ (để trống nếu giống địa chỉ học sinh)"
            rules={[createParentValidator("father")]}
          >
            <AddressSelector
              provinceLabel="Tỉnh/Thành phố"
              wardLabel="Phường/Xã"
            />
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
              {VALIDATION_MESSAGES.GENERAL.ONLY_ONE_PARENT_ACCESS}
            </Text>
          )}
        </Card>

        {/* Thông tin mẹ */}
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
                rules={[createParentValidator("mother")]}
              >
                <Input placeholder="Nhập tên mẹ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="mother_lastName"
                label="Họ"
                rules={[createParentValidator("mother")]}
              >
                <Input placeholder="Nhập họ mẹ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mother_phone"
                label="Số điện thoại"
                rules={[
                  createParentValidator("mother"),
                  createPhoneValidator(),
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mother_dob"
                label="Ngày sinh"
                rules={[createParentValidator("mother")]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  defaultPickerValue={defaultParentDob}
                  disabledDate={getParentDisabledDate()}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mother_jobTitle"
                label="Nghề nghiệp"
                rules={[createParentValidator("mother")]}
              >
                <Input placeholder="Nhập nghề nghiệp" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="mother_address"
            label="Địa chỉ (để trống nếu giống địa chỉ học sinh)"
            rules={[createParentValidator("mother")]}
          >
            <AddressSelector
              provinceLabel="Tỉnh/Thành phố"
              wardLabel="Phường/Xã"
            />
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
              {VALIDATION_MESSAGES.GENERAL.ONLY_ONE_PARENT_ACCESS}
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
