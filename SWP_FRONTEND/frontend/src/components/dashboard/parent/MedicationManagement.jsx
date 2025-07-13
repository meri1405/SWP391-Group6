import { DEFAULT_UNITS_BY_TYPE } from "../../../constants/index.js";
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  Modal,
  Table,
  Tag,
  Spin,
  Tabs,
  Tooltip,
  Popconfirm,
  Space,
  Divider,
  Typography,
  Image,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import { useMedicationManagement } from "../../../hooks/useMedicationManagement.jsx";
import { medicationUIUtils } from "../../../utils/medicationUIUtils.jsx";
import "../../../styles/MedicationManagement.css";
import ParentMedicationSchedules from "./ParentMedicationSchedules";
import PrescriptionImageUpload from "../../common/PrescriptionImageUpload";

const { Option } = Select;
const { TextArea } = Input;

const { Title } = Typography;

const MedicationManagement = () => {
  const [form] = Form.useForm();
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewImageTitle, setPreviewImageTitle] = useState("");

  const {
    loading,
    students,
    visible,
    isEdit,
    tabKey,
    isConfirmed,
    detailModalVisible,
    selectedMedicationDetail,

    // Actions
    setVisible,
    setTabKey,
    setSelectedStudentId,
    setIsConfirmed,
    setDetailModalVisible,
    setSelectedMedicationDetail,

    // Handlers
    showAddModal,
    showEditModal,
    handleSubmit,
    handleDelete,
    handleViewDetail,

    // Helpers
    getStatusTag,
    getFilteredMedications,
    validateStartDate,
    validateEndDate,
    validateTimeSlot,
    disabledDate,
  } = useMedicationManagement();

  // Handle image preview
  const handleImagePreview = (imageUrl, index) => {
    medicationUIUtils.handleImagePreview(
      imageUrl, 
      index, 
      setPreviewImageUrl, 
      setPreviewImageTitle, 
      setImagePreviewVisible
    );
  };

  // Handle item type change to update available units
  const handleItemTypeChange = (itemType, itemIndex) => {
    medicationUIUtils.handleItemTypeChange(itemType, itemIndex, form);
  };

  // Table columns for medication requests
  const columns = [
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => medicationUIUtils.renderStudentName(text, record, students),
    },
    {
      title: "Thời gian sử dụng",
      key: "period",
      render: (_, record) => medicationUIUtils.renderPeriod(record),
    },
    {
      title: "Số loại thuốc",
      key: "medicationCount",
      render: (_, record) => medicationUIUtils.renderMedicationCount(record),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      width: 250,
      render: (text) => medicationUIUtils.renderNote(text),
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          {record.status === "PENDING" && (
            <>
              <Tooltip title="Chỉnh sửa yêu cầu">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(record, form)}
                />
              </Tooltip>
              <Popconfirm
                title="Bạn có chắc muốn xóa yêu cầu này không?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Tooltip title="Xóa yêu cầu">
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Tooltip>
              </Popconfirm>
            </>
          )}
          {record.status === "APPROVED" && (
            <Tooltip title="Xem lịch uống thuốc">
              <Button
                type="link"
                onClick={() => setTabKey("schedules")}
                style={{ color: "#1890ff" }}
              >
                Xem lịch uống thuốc
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết các loại thuốc">
            <Button
              type="link"
              icon={<InfoCircleOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="medication-management">
      <div className="page-header">
        <div className="header-title">
          <h2 style={{ color: "white" }}>Quản lý thuốc</h2>
        </div>
      </div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showAddModal(form)}
        className="add-medication-btn"
        style={{ marginBottom: "20px", marginTop: "20px" }}
      >
        Thêm yêu cầu thuốc
      </Button>

      <Card className="medication-content-card">
        <Tabs
          activeKey={tabKey}
          onChange={setTabKey}
          items={[
            {
              key: "active",
              label: "Đang xử lý",
              children: loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={getFilteredMedications()}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: "Không có yêu cầu thuốc nào" }}
                />
              ),
            },
            {
              key: "completed",
              label: "Đã duyệt/Đã hoàn thành/Từ chối",
              children: loading ? (
                <div className="loading-container">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={getFilteredMedications()}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: "Không có yêu cầu thuốc nào" }}
                />
              ),
            },
            {
              key: "schedules",
              label: "Lịch uống thuốc",
              children: <ParentMedicationSchedules />,
            },
          ]}
        />
      </Card>

      {/* Modal for adding/editing medication requests */}
      <Modal
        title={isEdit ? "Chỉnh sửa yêu cầu thuốc" : "Thêm yêu cầu thuốc mới"}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="medication-form"
        >
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #1890ff",
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                color: "#1890ff",
                fontWeight: "bold",
                marginBottom: "5px",
              }}
            >
              Thông báo quan trọng:
            </div>
            <div>
              • Mỗi loại thuốc sẽ có thời gian bắt đầu, kết thúc và thời gian uống
              riêng biệt. Bạn phải thiết lập đầy đủ thông tin cho từng loại
              thuốc.
            </div>
            <div style={{ marginTop: "5px", color: "#ff4d4f", fontWeight: "bold" }}>
              • Ngày bắt đầu uống thuốc phải tối thiểu là 1 ngày sau ngày tạo yêu cầu.
            </div>
          </div>

          <Form.Item
            name="studentId"
            label="Học sinh"
            rules={[{ required: true, message: "Vui lòng chọn học sinh" }]}
          >
            <Select
              placeholder="Chọn học sinh"
              onChange={(value) => {
                setSelectedStudentId(value);
              }}
            >
              {students
                .filter((student) => student && student.id) // Filter out students with null/undefined IDs
                .map((student) => (
                  <Option key={student.id.toString()} value={student.id}>
                    {student.lastName} {student.firstName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Ghi chú chung">
            <TextArea
              rows={2}
              placeholder="Nhập ghi chú chung về yêu cầu thuốc"
            />
          </Form.Item>

          {/* Prescription Images Upload - Show for both new and edit */}
          <Form.Item
            name="prescriptionImages"
            label="Ảnh đơn thuốc"
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên ít nhất một ảnh đơn thuốc",
              },
              {
                validator: (_, value) => {
                  if (!value || value.length === 0) {
                    return Promise.reject(
                      new Error("Bắt buộc phải có ít nhất 1 ảnh đơn thuốc")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <PrescriptionImageUpload maxCount={5} required={true} />
          </Form.Item>

          <Divider orientation="left">Danh sách thuốc</Divider>

          <Form.List
            name="itemRequests"
            rules={[
              {
                validator: async (_, items) => {
                  if (!items || items.length === 0) {
                    return Promise.reject(
                      new Error("Vui lòng thêm ít nhất một loại thuốc")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="medication-item-container">
                    <div className="medication-item-header">
                      <Title level={5}>Thuốc #{name + 1}</Title>
                      {fields.length > 1 && (
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <div className="medication-item-form">
                      {/* Hidden field to store item ID for existing items */}
                      <Form.Item {...restField} name={[name, "id"]} hidden>
                        <Input type="hidden" />
                      </Form.Item>
                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, "itemName"]}
                          label="Tên thuốc"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên thuốc",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập tên thuốc" />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "purpose"]}
                          label="Mục đích"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập mục đích sử dụng",
                            },
                          ]}
                        >
                          <Input placeholder="Nhập mục đích sử dụng thuốc" />
                        </Form.Item>
                      </div>

                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, "startDate"]}
                          label="Ngày bắt đầu"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ngày bắt đầu",
                            },
                            {
                              validator: (_, value) => validateStartDate(value),
                            },
                          ]}
                          validateTrigger="onChange"
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày bắt đầu"
                            style={{ width: "100%" }}
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "endDate"]}
                          label="Ngày kết thúc"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn ngày kết thúc",
                            },
                            {
                              validator: (_, value) =>
                                validateEndDate(value, name, form),
                            },
                          ]}
                          validateTrigger="onChange"
                        >
                          <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày kết thúc"
                            style={{ width: "100%" }}
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                      </div>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "itemType"]}
                            label="Loại thuốc"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn loại thuốc",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn loại thuốc"
                              onChange={(value) => handleItemTypeChange(value, name)}
                            >
                              <Option value="CREAM">Kem</Option>
                              <Option value="DROPS">Giọt</Option>
                              <Option value="SPOONFUL">Thìa</Option>
                              <Option value="SPRAY">Xịt</Option>
                              <Option value="TABLET">Viên</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "dosage"]}
                            label="Liều lượng"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập liều lượng",
                              },
                              {
                                pattern: /^[0-9]*\.?[0-9]+$/,
                                message: "Vui lòng nhập số hợp lệ",
                              },
                              {
                                validator: (_, value) => {
                                  const num = parseFloat(value);
                                  if (isNaN(num) || num < 0.1) {
                                    return Promise.reject(
                                      new Error("Liều lượng phải ít nhất là 0.1")
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input placeholder="Ví dụ: 0.5, 1.5, 5.0, 10" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => {
                              const prevItemType = prevValues?.itemRequests?.[name]?.itemType;
                              const currentItemType = currentValues?.itemRequests?.[name]?.itemType;
                              return prevItemType !== currentItemType;
                            }}
                          >
                            {() => {
                              const currentItemType = form.getFieldValue(['itemRequests', name, 'itemType']);
                              const availableUnits = DEFAULT_UNITS_BY_TYPE[currentItemType] || ['đơn vị'];
                              
                              return (
                                <Form.Item
                                  {...restField}
                                  name={[name, "unit"]}
                                  label="Đơn vị"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Vui lòng chọn đơn vị",
                                    },
                                  ]}
                                >
                                  <Select placeholder="Chọn đơn vị">
                                    {availableUnits.map(unit => (
                                      <Option key={unit} value={unit}>{unit}</Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        </Col>
                      </Row>
                      <div className="form-row">
                        <Form.Item
                          {...restField}
                          name={[name, "frequency"]}
                          label="Số lần uống hàng ngày"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lần uống hàng ngày",
                            },
                            {
                              pattern: /^[0-9]+$/,
                              message: "Vui lòng nhập số nguyên",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Ví dụ: 1, 2, 3"
                            onChange={(e) => medicationUIUtils.handleFrequencyChange(e, name, form)}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "note"]}
                          label="Ghi chú"
                        >
                          <Input placeholder="Hướng dẫn cụ thể về cách dùng" />
                        </Form.Item>
                      </div>
                      {/* Time slots selection based on frequency */}
                      <Form.Item
                        {...restField}
                        label="Thời gian uống thuốc (bắt buộc)"
                        required
                        className="medication-time-slots"
                      >
                        <Form.List name={[name, "timeSlots"]}>
                          {(timeFields) => (
                            <div className="time-slots-container">
                              {timeFields.map(
                                ({
                                  key,
                                  name: timeIndex,
                                  ...restTimeField
                                }) => (
                                  <div key={key} className="time-slot-item">
                                    <Form.Item
                                      {...restTimeField}
                                      name={timeIndex}
                                      rules={[
                                        {
                                          required: true,
                                          message: "Vui lòng chọn thời gian",
                                        },
                                        {
                                          validator: (_, value) =>
                                            validateTimeSlot(value),
                                        },
                                      ]}
                                      className="time-slot-input"
                                      validateTrigger="onChange"
                                    >
                                      <TimePicker
                                        format="HH:mm"
                                        placeholder={`Thời gian ${
                                          timeIndex + 1
                                        }`}
                                        minuteStep={5}
                                        use12Hours={false}
                                      />
                                    </Form.Item>
                                  </div>
                                )
                              )}
                              {timeFields.length === 0 && (
                                <div className="no-time-slots">
                                  <span style={{ color: "#ff4d4f" }}>
                                    Bạn phải chọn ít nhất một thời gian uống
                                    thuốc sau khi nhập tần suất
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Form.List>
                      </Form.Item>
                    </div>

                    {fields.length > 1 && <Divider />}
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => {
                      const defaultValues = medicationUIUtils.getNewMedicationItemDefaults(form);
                      add(defaultValues);
                    }}
                    block
                    icon={<PlusOutlined />}
                    className="add-medication-item-btn"
                  >
                    Thêm thuốc
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <div
              style={{
                border: "1px solid #d9d9d9",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f8f8f8",
              }}
            >
              <Checkbox
                checked={isConfirmed}
                onChange={(e) => {
                  setIsConfirmed(e.target.checked);
                }}
                style={{ color: "#ff4d4f", fontWeight: "bold" }}
              >
                Tôi xác nhận rằng thông tin thuốc được cung cấp là chính xác và
                được kê đơn bởi bác sĩ
              </Checkbox>
              {!isConfirmed && (
                <div
                  style={{
                    color: "#ff4d4f",
                    marginTop: "5px",
                    fontSize: "12px",
                  }}
                >
                  *Bạn cần xác nhận thông tin này trước khi gửi yêu cầu
                </div>
              )}
            </div>
          </Form.Item>

          <div className="form-actions">
            <Button onClick={() => setVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "Cập nhật" : "Gửi yêu cầu"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu thuốc"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMedicationDetail(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedMedicationDetail(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
        className="medication-detail-modal-wrapper"
      >
        {selectedMedicationDetail && (
          <div className="medication-detail-modal">
            <div className="medication-detail-content">
              <div className="medication-detail-section">
                <div
                  className="medication-detail-header"
                  style={{ marginBottom: "10px" }}
                >
                  <h3>Thông tin cơ bản</h3>
                  <strong>Trạng thái: </strong>
                  <Tag
                    color={
                      selectedMedicationDetail.status === "PENDING"
                        ? "processing"
                        : selectedMedicationDetail.status === "APPROVED"
                        ? "success"
                        : selectedMedicationDetail.status === "REJECTED"
                        ? "error"
                        : "default"
                    }
                  >
                    {selectedMedicationDetail.status === "PENDING"
                      ? "Đang chờ duyệt"
                      : selectedMedicationDetail.status === "APPROVED"
                      ? "Đã duyệt"
                      : selectedMedicationDetail.status === "REJECTED"
                      ? "Từ chối"
                      : selectedMedicationDetail.status === "COMPLETED"
                      ? "Hoàn thành"
                      : "Không xác định"}
                  </Tag>
                </div>

                <div className="medication-detail-info">
                  <p>
                    <strong>Học sinh: </strong>
                    {selectedMedicationDetail.studentName ||
                      medicationUIUtils.renderStudentName('', selectedMedicationDetail, students)}
                  </p>
                  <p>
                    <strong>Mã yêu cầu: </strong>
                    {selectedMedicationDetail.id}
                  </p>
                  <p>
                    <strong>Ngày yêu cầu: </strong>
                    {medicationUIUtils.formatRequestDate(selectedMedicationDetail.requestDate)}
                  </p>
                  <p>
                    <strong>Ghi chú chung: </strong>
                    {selectedMedicationDetail.note ? (
                      <span className="general-note">
                        {selectedMedicationDetail.note}
                      </span>
                    ) : (
                      <span className="empty-note">Không có ghi chú</span>
                    )}
                  </p>
                  {selectedMedicationDetail.nurseName && (
                    <p>
                      <strong>Y tá phụ trách:</strong>{" "}
                      {selectedMedicationDetail.nurseName}
                    </p>
                  )}
                </div>

                {/* Prescription Images Display */}
                {selectedMedicationDetail.prescriptionImages &&
                  selectedMedicationDetail.prescriptionImages.length > 0 && (
                    <div
                      className="prescription-images-section"
                      style={{ marginTop: "16px" }}
                    >
                      <h4>
                        <strong>
                          Ảnh đơn thuốc (
                          {selectedMedicationDetail.prescriptionImages.length})
                        </strong>
                      </h4>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        {selectedMedicationDetail.prescriptionImages.map(
                          (imageUrl, index) => (
                            <div key={index} style={{ position: "relative" }}>
                              <img
                                src={
                                  imageUrl ||
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
                                }
                                alt={`Đơn thuốc ${index + 1}`}
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  border: "1px solid #d9d9d9",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleImagePreview(imageUrl, index)
                                }
                                onError={(e) => {
                                  e.target.style.border = "2px solid red";
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "2px",
                                  left: "2px",
                                  backgroundColor: "rgba(0,0,0,0.6)",
                                  color: "white",
                                  padding: "2px 6px",
                                  borderRadius: "2px",
                                  fontSize: "10px",
                                }}
                              >
                                {index + 1}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "4px",
                        }}
                      >
                        Click vào ảnh để xem kích thước đầy đủ
                      </div>
                    </div>
                  )}
              </div>

              <Divider />

              <div className="medication-detail-section">
                <h2 style={{ textAlign: "left" }}>
                  Chi tiết các loại thuốc (
                  {(selectedMedicationDetail.itemRequests || []).length} loại)
                </h2>

                {!selectedMedicationDetail.itemRequests ||
                selectedMedicationDetail.itemRequests.length === 0 ? (
                  <div className="empty-medications">
                    <p>Không có thông tin thuốc trong yêu cầu này.</p>
                  </div>
                ) : (
                  <div className="medication-items-list">
                    {selectedMedicationDetail.itemRequests.map(
                      (item, index) => (
                        <div
                          key={item.id || index}
                          className="medication-item-card"
                        >
                          <div
                            className="medication-item-header"
                            style={{ marginBottom: "5px" }}
                          >
                            <h4>
                              <strong>
                                {index + 1}. {item.itemName}
                              </strong>
                            </h4>
                          </div>

                          <h4>
                            <strong>Loại: </strong>
                            <Tag color={medicationUIUtils.getItemTypeColor(item.itemType)}>
                              {medicationUIUtils.getItemTypeDisplayName(item.itemType)}
                            </Tag>
                          </h4>
                          <div className="medication-item-details">
                            <p>
                              <strong>Mục đích:</strong>{" "}
                              <span className="medication-purpose">
                                {item.purpose || "Không có mục đích"}
                              </span>
                            </p>
                            <p>
                              <strong>Thời gian sử dụng:</strong>{" "}
                              <span className="medication-period">
                                {item.startDate
                                  ? dayjs(item.startDate).format("DD/MM/YYYY")
                                  : "N/A"}{" "}
                                -{" "}
                                {item.endDate
                                  ? dayjs(item.endDate).format("DD/MM/YYYY")
                                  : "N/A"}
                              </span>
                            </p>
                            <p>
                              <strong>Liều lượng:</strong>{" "}
                              <span className="medication-dosage">
                                {item.dosage} {item.unit || "đơn vị"}
                              </span>
                            </p>
                            <p>
                              <strong>Tần suất:</strong>{" "}
                              <span className="medication-frequency">
                                {item.frequency} lần/ngày
                              </span>
                            </p>

                            {/* Display schedule times - check both direct scheduleTimes and note field */}
                            <p>
                              <strong>Thời gian uống:</strong>{" "}
                              {(() => {
                                const scheduleTimes = medicationUIUtils.getScheduleTimesForDisplay(item);

                                if (scheduleTimes && scheduleTimes.length > 0) {
                                  return (
                                    <span className="medication-schedule-times">
                                      {scheduleTimes.map((time, timeIndex) => (
                                        <Tag
                                          key={timeIndex}
                                          color="blue"
                                          style={{
                                            marginRight: "4px",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          {time}
                                        </Tag>
                                      ))}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="empty-schedule">
                                      Chưa có thời gian cụ thể
                                    </span>
                                  );
                                }
                              })()}
                            </p>

                            <p>
                              <strong>Ghi chú riêng:</strong>{" "}
                              {(() => {
                                const displayNote = medicationUIUtils.cleanNoteForDisplay(item.note);

                                return displayNote ? (
                                  <span className="medication-note">
                                    {displayNote}
                                  </span>
                                ) : (
                                  <span className="empty-note">
                                    Không có ghi chú
                                  </span>
                                );
                              })()}
                            </p>
                            <hr />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <Divider />

              <div className="medication-detail-footer">
                <p className="note-text">
                  <strong>Lưu ý:</strong> Yêu cầu thuốc sẽ được y tá trường xem
                  xét và phản hồi trong vòng 24 giờ. Vui lòng đảm bảo thông tin
                  thuốc chính xác và được kê đơn bởi bác sĩ.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        title={previewImageTitle}
        open={imagePreviewVisible}
        onCancel={() => setImagePreviewVisible(false)}
        footer={null}
        width={800}
        centered
        styles={{
          body: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          },
        }}
      >
        {previewImageUrl && (
          <Image
            src={previewImageUrl}
            alt={previewImageTitle}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
            preview={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default MedicationManagement;
