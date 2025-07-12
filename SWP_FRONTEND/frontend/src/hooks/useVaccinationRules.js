import { useState, useEffect } from "react";
import { message } from "antd";
import { VaccinationRuleService } from "../services/vaccinationRuleService";
import { getEmptyFormValues } from "../utils/vaccinationRuleUtils";

/**
 * Custom hook for managing vaccination rules state and operations
 */
export const useVaccinationRules = () => {
  const [vaccinationRules, setVaccinationRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [currentDoseNumber, setCurrentDoseNumber] = useState(null);

  // Load vaccination rules
  const loadVaccinationRules = async () => {
    try {
      setLoading(true);
      const rules = await VaccinationRuleService.getAllVaccinationRules();
      setVaccinationRules(rules);
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load rules on mount
  useEffect(() => {
    loadVaccinationRules();
  }, []);

  // Handle create/update vaccination rule
  const handleSubmit = async (values, form) => {
    try {
      setLoading(true);
      const ruleData = VaccinationRuleService.prepareRuleData(values);

      if (editingRule) {
        await VaccinationRuleService.updateVaccinationRule(editingRule.id, ruleData);
        message.success("Cập nhật quy tắc tiêm chủng thành công!");
      } else {
        await VaccinationRuleService.createVaccinationRule(ruleData);
        message.success("Tạo quy tắc tiêm chủng thành công!");
      }

      closeModal(form);
      await loadVaccinationRules();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete vaccination rule
  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await VaccinationRuleService.deleteVaccinationRule(id);
      message.success("Xóa quy tắc tiêm chủng thành công!");
      await loadVaccinationRules();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle dose number change
  const handleDoseNumberChange = (value, form) => {
    setCurrentDoseNumber(value);
    if (value === 1) {
      // Auto set intervalDays to 0 for first dose and disable field
      form.setFieldsValue({ intervalDays: 0 });
    } else if (value > 1) {
      // Clear intervalDays for subsequent doses to let user input
      form.setFieldsValue({ intervalDays: undefined });
    }
  };

  // Handle edit
  const handleEdit = (rule, form) => {
    setEditingRule(rule);
    setCurrentDoseNumber(rule.doesNumber);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      doesNumber: rule.doesNumber,
      minAge: rule.minAge,
      maxAge: rule.maxAge,
      intervalDays: rule.intervalDays,
      mandatory: rule.mandatory,
    });
    setModalVisible(true);
  };

  // Handle add new
  const handleAddNew = (form) => {
    setEditingRule(null);
    setCurrentDoseNumber(null);
    form.resetFields();
    form.setFieldsValue(getEmptyFormValues());
    setModalVisible(true);
  };

  // Close modal and reset state
  const closeModal = (form) => {
    setModalVisible(false);
    setEditingRule(null);
    setCurrentDoseNumber(null);
    form.resetFields();
    form.setFieldsValue(getEmptyFormValues());
  };

  return {
    // State
    vaccinationRules,
    loading,
    modalVisible,
    editingRule,
    currentDoseNumber,
    
    // Actions
    handleSubmit,
    handleDelete,
    handleDoseNumberChange,
    handleEdit,
    handleAddNew,
    closeModal,
    loadVaccinationRules,
  };
};
