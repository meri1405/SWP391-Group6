import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { useMedicalEvents, useMedicalEventForm } from "../../../hooks/useMedicalEvents";
import { createMedicalEventColumns } from "./MedicalEventTableColumns";
import MedicalEventStatistics from "./MedicalEventStatistics";
import MedicalEventFilters from "./MedicalEventFilters";
import MedicalEventForm from "./MedicalEventForm";
import MedicalEventDetailsModal from "./MedicalEventDetailsModal";
import { FILTER_OPTIONS } from "../../../constants/medicalEventConstants";
import "../../../styles/MedicalEventManagement.css";

const { Title } = Typography;

const MedicalEventManagement = () => {
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterProcessed, setFilterProcessed] = useState(FILTER_OPTIONS.PROCESSED.ALL);
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  // Get user context for role-based permissions
  const { user } = useAuth();

  // Check if user is manager (view-only mode)
  const isManager = user?.roleName === "MANAGER";
  const isViewOnly = isManager;

  // Custom hooks
  const {
    filteredEvents,
    students,
    medicalSupplies,
    statistics,
    loading,
    viewEvent,
    processEvent,
    createEvent,
    applyFilters,
  } = useMedicalEvents(isViewOnly);

  const {
    form,
    classes,
    selectedClass,
    filteredStudents,
    studentCount,
    healthProfileValid,
    healthProfileMessage,
    handleClassChange,
    handleStudentChange,
    resetFormState,
  } = useMedicalEventForm(students);

  // Apply filters when filter values change
  useEffect(() => {
    const filters = {
      searchText,
      filterProcessed,
      filterType,
      filterSeverity,
      dateRange,
    };
    applyFilters(filters);
  }, [searchText, filterProcessed, filterType, filterSeverity, dateRange, applyFilters]);

  // Handle add event
  const handleAddEvent = () => {
    if (isViewOnly) {
              message.warning("Bạn không có quyền thêm xử lý sơ cứu");
      return;
    }

    resetFormState();
    setSelectedEvent(null);
    setModalVisible(true);

    // Reset form after modal is opened to avoid the warning
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  // Handle view event
  const handleViewEvent = async (eventId) => {
    const event = await viewEvent(eventId);
    if (event) {
      setSelectedEvent(event);
      setViewModalVisible(true);
    }
  };

  // Handle process event
  const handleProcessEvent = async (eventId) => {
    await processEvent(eventId);
  };

  // Handle form submission
  const onSubmitForm = async (values) => {
    const success = await createEvent(values, healthProfileValid, healthProfileMessage);
    if (success) {
      setModalVisible(false);
      resetFormState();
    }
  };

  // Create table columns
  const columns = createMedicalEventColumns(handleViewEvent, handleProcessEvent, isViewOnly);

  return (
    <div className="medical-event-management">
      {/* Statistics */}
      <MedicalEventStatistics statistics={statistics} />

      {/* Main Content */}
      <Card>
        <div className="header-section">
          <Title level={3}>
            <MedicineBoxOutlined />{" "}
            {isViewOnly ? "Xem xử lý sơ cứu" : "Quản lý xử lý sơ cứu"}
          </Title>
          {!isViewOnly && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEvent}
            >
              Thêm xử lý sơ cứu
            </Button>
          )}
        </div>

        {/* Filters */}
        <MedicalEventFilters
          searchText={searchText}
          filterProcessed={filterProcessed}
          filterType={filterType}
          filterSeverity={filterSeverity}
          dateRange={dateRange}
          onSearchChange={setSearchText}
          onProcessedFilterChange={setFilterProcessed}
          onTypeFilterChange={setFilterType}
          onSeverityFilterChange={setFilterSeverity}
          onDateRangeChange={setDateRange}
        />

        {/* Events Table */}
        <Table
          columns={columns}
          dataSource={filteredEvents}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredEvents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sự kiện`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add Event Modal */}
      <Modal
        title="Thêm xử lý sơ cứu mới"
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          resetFormState();
        }}
        width={800}
        confirmLoading={loading}
        destroyOnHidden
        forceRender
        className="event-modal"
        styles={{
          body: { maxHeight: "70vh", overflow: "auto", paddingTop: 10 },
        }}
      >
        <MedicalEventForm
          form={form}
          classes={classes}
          selectedClass={selectedClass}
          filteredStudents={filteredStudents}
          studentCount={studentCount}
          healthProfileValid={healthProfileValid}
          healthProfileMessage={healthProfileMessage}
          medicalSupplies={medicalSupplies}
          onClassChange={handleClassChange}
          onStudentChange={handleStudentChange}
          onFinish={onSubmitForm}
        />
      </Modal>

      {/* View Event Details Modal */}
      <MedicalEventDetailsModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        selectedEvent={selectedEvent}
        medicalSupplies={medicalSupplies}
      />
    </div>
  );
};

export default MedicalEventManagement;
