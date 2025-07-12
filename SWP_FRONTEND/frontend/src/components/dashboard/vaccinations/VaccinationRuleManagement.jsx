import React from "react";
import { Button, Card, Row, Col, Form } from "antd";
import { PlusOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { useVaccinationRules } from "../../../hooks/useVaccinationRules";
import { calculateRuleStatistics } from "../../../utils/vaccinationRuleUtils";
import VaccinationRuleTable from "./VaccinationRuleTable";
import VaccinationRuleModal from "./VaccinationRuleModal";
import VaccinationRuleStats from "./VaccinationRuleStats";

const VaccinationRuleManagement = () => {
  const [form] = Form.useForm();
  
  // Use custom hook for vaccination rules management
  const {
    vaccinationRules,
    loading,
    modalVisible,
    editingRule,
    currentDoseNumber,
    handleSubmit,
    handleDelete,
    handleDoseNumberChange,
    handleEdit,
    handleAddNew,
    closeModal,
  } = useVaccinationRules();

  // Calculate statistics
  const statistics = calculateRuleStatistics(vaccinationRules);

  // Handle form submission
  const onSubmit = (values) => {
    handleSubmit(values, form);
  };

  // Handle edit button click
  const onEdit = (rule) => {
    handleEdit(rule, form);
  };

  // Handle add new button click
  const onAddNew = () => {
    handleAddNew(form);
  };

  // Handle modal cancel
  const onCancel = () => {
    closeModal(form);
  };

  // Handle dose number change in modal
  const onDoseNumberChange = (value) => {
    handleDoseNumberChange(value, form);
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={24}>
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <MedicineBoxOutlined
                  style={{
                    fontSize: "24px",
                    color: "#1890ff",
                    marginRight: "10px",
                  }}
                />
                <div>
                  <h2 style={{ margin: 0, fontWeight: 600 }}>
                    Quản lý quy tắc tiêm chủng
                  </h2>
                  <p style={{ margin: 0, color: "#666" }}>
                    Thiết lập và quản lý các quy tắc tiêm chủng cho học sinh
                    (tuổi tính theo tháng)
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onAddNew}
                size="large"
              >
                Thêm quy tắc mới
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Statistics */}
      <VaccinationRuleStats statistics={statistics} />

      {/* Table */}
      <Card>
        <VaccinationRuleTable
          vaccinationRules={vaccinationRules}
          loading={loading}
          onEdit={onEdit}
          onDelete={handleDelete}
        />
      </Card>

      {/* Modal for Add/Edit */}
      <VaccinationRuleModal
        visible={modalVisible}
        editingRule={editingRule}
        currentDoseNumber={currentDoseNumber}
        form={form}
        loading={loading}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onDoseNumberChange={onDoseNumberChange}
      />
    </div>
  );
};

export default VaccinationRuleManagement;
