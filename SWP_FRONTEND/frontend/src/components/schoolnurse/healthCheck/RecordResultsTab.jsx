import React from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Spin,
  Avatar,
  Table,
  Modal,
  Tag,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  EditOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

// Import custom hook and form components
import { useHealthCheckResults } from "../../../hooks/useHealthCheckResults";
import BasicInfoForm from "./forms/BasicInfoForm";
import VisionForm from "./forms/VisionForm";
import HearingForm from "./forms/HearingForm";
import OralForm from "./forms/OralForm";
import SkinForm from "./forms/SkinForm";
import RespiratoryForm from "./forms/RespiratoryForm";

const { Title, Text } = Typography;

const RecordResultsTab = ({ campaignId, campaign, onRefreshData }) => {
  const {
    // State
    selectedStudent,
    formData,
    isSubmitting,
    confirmedStudents: students,
    loadingStudents: isLoading,
    isModalVisible,
    
    // Handlers
    handleStudentSelect,
    handleInputChange,
    handleOverallMeasurementChange,
    handleSubmit,
    handleModalOk,
    handleModalCancel,
    hasExistingResults,
  } = useHealthCheckResults(campaignId, campaign, onRefreshData);

  // Derived state for UI
  const availableCategories = campaign?.categories || ["VISION", "HEARING", "ORAL", "SKIN", "RESPIRATORY"];
  const completedCategories = Object.keys(formData).filter(key => formData[key] && Object.keys(formData[key]).length > 0);
  const validationErrors = []; // Add validation logic as needed
  const isFormValid = completedCategories.length > 0;

  // Student selection card
  const renderStudentSelectionCard = () => (
    <Card className="mb-6">

      <div className="mb-6">
        <Input
          placeholder="Tìm kiếm học sinh theo tên, mã học sinh..."
          onChange={() => {
            // Filter students based on search input
            // Implementation can be added if needed
          }}
          className="mb-4"
        />
      </div>

      <Table
        columns={[
          {
            title: "STT",
            key: "stt",
            width: 60,
            render: (_, record, index) => index + 1,
          },
          {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
          },
          {
            title: "Lớp",
            dataIndex: "className",
            key: "className",
            width: 100,
          },
          {
            title: "Trạng thái",
            key: "status",
            width: 120,
            render: (_, record) => {
              const studentId = record.id || record.studentID || record.studentCode;
              const hasResults = hasExistingResults(studentId);
              return hasResults ? (
                <Tag color="green">
                  <CheckCircleOutlined className="mr-1" />
                  Đã khám
                </Tag>
              ) : (
                <Tag color="blue">Chưa khám</Tag>
              );
            },
          },
          {
            title: "Thao tác",
            key: "action",
            width: 220,
            render: (_, record) => {
              const studentId = record.id || record.studentID || record.studentCode;
              const hasResults = hasExistingResults(studentId);
              
              return hasResults ? (
                <Tooltip title="Học sinh này đã được ghi kết quả khám sức khỏe">
                  <Button
                    type="default"
                    size="small"
                    disabled={true}
                  >
                    Đã ghi kết quả
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStudentSelect(record)}
                >
                  Chọn
                </Button>
              );
            },
          },
        ]}
        dataSource={students}
        rowKey={(record) => record.id || record.studentID || record.studentCode}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        loading={isLoading}
      />
    </Card>
  );

  // Health check form
  const renderHealthCheckForm = () => (
    <Card className="mb-6">
      <div className="mb-6">
        <Title level={4} className="text-green-600">
          <MedicineBoxOutlined className="mr-2" style={{marginRight: "10px"}}/>
          Ghi kết quả khám sức khỏe
        </Title>
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text strong>Học sinh: </Text>
          <Text className="text-blue-600">{selectedStudent?.fullName}</Text>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <Text className="ml-4">
            <strong>Lớp:</strong> {selectedStudent?.className}
          </Text>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Basic Info tag - always shown */}
          <Tag
            key="BASIC_INFO"
            color={formData.BASIC_INFO && Object.keys(formData.BASIC_INFO).some(key => formData.BASIC_INFO[key]) ? "green" : "blue"}
            className="px-4 py-2 cursor-pointer"
          >
            {formData.BASIC_INFO && Object.keys(formData.BASIC_INFO).some(key => formData.BASIC_INFO[key]) && <CheckCircleOutlined className="mr-1" />}
            Thông tin cơ bản
          </Tag>
          
          {/* Category tags */}
          {availableCategories.map((category) => {
            const isCompleted = completedCategories.includes(category);
            return (
              <Tag
                key={category}
                color={isCompleted ? "green" : "blue"}
                className="px-4 py-2 cursor-pointer"
              >
                {isCompleted && <CheckCircleOutlined className="mr-1" />}
                {category === "VISION" && "Thị lực"}
                {category === "HEARING" && "Thính lực"}
                {category === "ORAL" && "Răng miệng"}
                {category === "SKIN" && "Da liễu"}
                {category === "RESPIRATORY" && "Hô hấp"}
              </Tag>
            );
          })}
        </div>
      </div>

      {/* Form content */}
      <div className="space-y-6">
        {/* Basic Info Form - Always shown first */}
        {formData.BASIC_INFO && (
          <BasicInfoForm
            categoryData={formData.BASIC_INFO}
            formData={formData}
            onDataChange={handleInputChange}
            onOverallChange={handleOverallMeasurementChange}
            readOnly={false}
          />
        )}

        {/* Category-specific forms */}
        {availableCategories.map((category) => (
          <div key={category} className="category-section">
            {category === "VISION" && formData.VISION && (
              <VisionForm
                categoryData={formData.VISION}
                onDataChange={handleInputChange}
                readOnly={false}
              />
            )}
            {category === "HEARING" && formData.HEARING && (
              <HearingForm
                categoryData={formData.HEARING}
                onDataChange={handleInputChange}
                readOnly={false}
              />
            )}
            {category === "ORAL" && formData.ORAL && (
              <OralForm
                categoryData={formData.ORAL}
                onDataChange={handleInputChange}
                readOnly={false}
              />
            )}
            {category === "SKIN" && formData.SKIN && (
              <SkinForm
                categoryData={formData.SKIN}
                onDataChange={handleInputChange}
                readOnly={false}
              />
            )}
            {category === "RESPIRATORY" && formData.RESPIRATORY && (
              <RespiratoryForm
                categoryData={formData.RESPIRATORY}
                onDataChange={handleInputChange}
                readOnly={false}
              />
            )}
          </div>
        ))}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text strong className="text-red-600">
            Vui lòng sửa các lỗi sau:
          </Text>
          <ul className="mt-2 text-red-600">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex justify-end space-x-4" style={
        {
          marginTop: "20px",
        }
      }>
        <Button size="large" onClick={() => window.history.back()} style={{ marginRight: "8px" }}>
          Hủy
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          style={{
            minWidth: "120px" // Prevent button size changes when loading
          }}
        >
          {isSubmitting ? "Đang lưu..." : "Lưu kết quả khám"}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <Spin spinning={isLoading}>
        {!selectedStudent ? renderStudentSelectionCard() : renderHealthCheckForm()}
      </Spin>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận lưu kết quả"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isSubmitting}
        width={600}
      >
        <div className="space-y-4">
          <p>Bạn có chắc chắn muốn lưu kết quả khám sức khỏe này không?</p>
          <p>
            <strong>Học sinh:</strong> {selectedStudent?.fullName}
          </p>
          <p>
            <strong>Số hạng mục đã hoàn thành:</strong> {completedCategories.length + (formData.BASIC_INFO && Object.keys(formData.BASIC_INFO).some(key => formData.BASIC_INFO[key]) ? 1 : 0)}/
            {availableCategories.length + 1}
          </p>
          
          {/* Warning about multiple categories */}
          {completedCategories.length > 1 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">⚠️ Lưu ý quan trọng:</p>
              <p className="text-yellow-700 text-sm mt-2">
                Do giới hạn hệ thống, hiện tại chỉ có thể lưu một hạng mục chính cho mỗi lần khám. 
                Hệ thống sẽ ưu tiên lưu hạng mục có kết quả bất thường hoặc hạng mục đầu tiên.
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                <strong>Hạng mục đã hoàn thành:</strong> {completedCategories.join(", ")}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RecordResultsTab;
