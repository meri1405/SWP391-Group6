import { useState, useEffect, useCallback } from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import { VaccinationCampaignFormService } from "../services/vaccinationCampaignFormService";

/**
 * Custom hook for managing vaccination campaign form state and logic
 * @param {Object} campaign - Existing campaign data (for editing)
 * @param {Function} onSuccess - Callback function called on successful form submission
 * @returns {Object} Form state and handlers
 */
export const useVaccinationCampaignForm = (campaign = null, onSuccess) => {
  const [form] = Form.useForm();
  const [vaccinationRules, setVaccinationRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingCount, setCalculatingCount] = useState(false);
  
  const isEditing = !!campaign;

  /**
   * Calculate estimated vaccine count for a given rule
   */
  const calculateEstimatedVaccineCount = useCallback(
    async (ruleId) => {
      if (!ruleId) return;

      setCalculatingCount(true);
      try {
        const eligibleCount = await VaccinationCampaignFormService.calculateEstimatedVaccineCount(ruleId);
        
        form.setFieldsValue({
          estimatedVaccineCount: eligibleCount,
        });
      } catch (error) {
        // Error handling is done in the service
        console.error("Error calculating estimated vaccine count:", error);
        form.setFieldsValue({
          estimatedVaccineCount: 0,
        });
      } finally {
        setCalculatingCount(false);
      }
    },
    [form]
  );

  /**
   * Fetch vaccination rules on component mount
   */
  const fetchVaccinationRules = async () => {
    setLoading(true);
    try {
      const rules = await VaccinationCampaignFormService.fetchVaccinationRules();
      setVaccinationRules(rules);
    } catch (error) {
      // Error handling is done in the service
      console.error("Error in fetchVaccinationRules hook:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialize form data when editing
   */
  useEffect(() => {
    fetchVaccinationRules();
    
    if (isEditing && campaign) {
      // Set form values from campaign data
      form.setFieldsValue({
        ...campaign,
        scheduledDate: campaign.scheduledDate
          ? dayjs(campaign.scheduledDate)
          : null,
        location: "Tại Trường", // Always override with fixed location
      });

      // Recalculate estimated vaccine count for edited campaign
      if (campaign.vaccinationRuleId) {
        calculateEstimatedVaccineCount(campaign.vaccinationRuleId);
      }
    }
  }, [campaign, form, isEditing, calculateEstimatedVaccineCount]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const result = await VaccinationCampaignFormService.submitForm(
        values,
        isEditing,
        campaign
      );
      onSuccess(result);
    } catch (error) {
      // Error handling is done in the service
      console.error("Error in form submission:", error);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle vaccination rule selection change
   */
  const onRuleChange = (ruleId) => {
    const formUpdates = VaccinationCampaignFormService.processRuleSelection(
      ruleId,
      vaccinationRules
    );
    
    if (formUpdates) {
      form.setFieldsValue(formUpdates);
      // Calculate estimated vaccine count
      calculateEstimatedVaccineCount(ruleId);
    }
  };

  /**
   * Get form initial values
   */
  const getInitialValues = () => ({
    estimatedVaccineCount: 0,
    location: "Tại Trường",
  });

  return {
    // Form instance and data
    form,
    vaccinationRules,
    isEditing,
    
    // Loading states
    loading,
    submitting,
    calculatingCount,
    
    // Handlers
    handleSubmit,
    onRuleChange,
    
    // Utils
    getInitialValues,
  };
};
