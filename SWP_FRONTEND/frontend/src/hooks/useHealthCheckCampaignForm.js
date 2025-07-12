import { useState, useEffect, useCallback } from 'react';
import { Form } from 'antd';
import { healthCheckCampaignService } from '../services/healthCheckCampaignService';
import { formDataHelpers } from './useHealthCheckCampaignValidation';

/**
 * Custom hook for managing Health Check Campaign Form state and logic
 */
export const useHealthCheckCampaignForm = (campaign, onSuccess) => {
  const [form] = Form.useForm();
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetCount, setTargetCount] = useState(0);
  const [calculatingTargetCount, setCalculatingTargetCount] = useState(false);
  
  const isEditing = !!campaign;

  /**
   * Initialize form data and fetch required data
   */
  useEffect(() => {
    const initializeForm = async () => {
      setLoading(true);
      try {
        // Fetch categories and classes in parallel
        const [categories, classes] = await Promise.all([
          healthCheckCampaignService.fetchCategories(),
          healthCheckCampaignService.fetchAvailableClasses()
        ]);
        
        setAvailableCategories(categories);
        setAvailableClasses(classes);
        
        // Set form values if editing
        if (isEditing) {
          const formData = formDataHelpers.prepareInitialFormData(campaign);
          form.setFieldsValue(formData);
          
          // Set initial target count if editing
          if (campaign.targetCount) {
            setTargetCount(campaign.targetCount);
          }
        }
      } catch (error) {
        console.error('Error initializing form:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [campaign, form, isEditing]);

  /**
   * Calculate target count with debouncing
   */
  const calculateTargetCount = useCallback(async (minAge, maxAge, targetClasses) => {
    console.log('Hook calculateTargetCount called with:', {
      minAge,
      maxAge,
      targetClasses,
      targetClassesType: typeof targetClasses,
      targetClassesArray: Array.isArray(targetClasses)
    });
    
    // Only calculate if we have valid age range OR target classes
    if ((minAge && maxAge && minAge <= maxAge) || (targetClasses && targetClasses.length > 0)) {
      setCalculatingTargetCount(true);
      try {
        const count = await healthCheckCampaignService.calculateTargetCount(minAge, maxAge, targetClasses);
        setTargetCount(count);
      } catch (error) {
        console.error('Error calculating target count:', error);
        setTargetCount(0);
      } finally {
        setCalculatingTargetCount(false);
      }
    } else {
      console.log('Skipping target count calculation - no valid criteria provided');
      setTargetCount(0);
    }
  }, []);

  /**
   * Handle form values change with debounced target count calculation
   */
  const handleValuesChange = useCallback((changedValues, allValues) => {
    const { minAge, maxAge, targetClasses } = allValues;
    
    // Only recalculate target count when relevant fields change
    if (formDataHelpers.shouldCalculateTargetCount(changedValues)) {
      // Add a small delay to avoid too many API calls
      const timeoutId = setTimeout(() => {
        calculateTargetCount(minAge, maxAge, targetClasses);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [calculateTargetCount]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (values) => {
    setSubmitting(true);
    try {
      const campaignData = healthCheckCampaignService.prepareCampaignData(values);
      
      let result;
      if (isEditing) {
        result = await healthCheckCampaignService.updateCampaign(campaign.id, campaignData);
      } else {
        result = await healthCheckCampaignService.createCampaign(campaignData);
      }
      
      onSuccess(result);
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} campaign:`, error);
    } finally {
      setSubmitting(false);
    }
  }, [isEditing, campaign?.id, onSuccess]);

  /**
   * Get target count display information
   */
  const getTargetCountInfo = useCallback(() => {
    const minAge = form.getFieldValue('minAge');
    const maxAge = form.getFieldValue('maxAge');
    
    if (targetCount > 0) {
      return `Hệ thống tính toán có ${targetCount} học sinh phù hợp với tiêu chí tuổi (${minAge || 'không giới hạn'} ≤ tuổi ≤ ${maxAge || 'không giới hạn'}) và lớp đã chọn.`;
    } else {
      return 'Vui lòng nhập độ tuổi (tối thiểu và tối đa) HOẶC chọn lớp mục tiêu để tính toán số lượng học sinh theo năm sinh.';
    }
  }, [targetCount, form]);

  return {
    // Form instance
    form,
    
    // State
    availableCategories,
    availableClasses,
    loading,
    submitting,
    targetCount,
    calculatingTargetCount,
    isEditing,
    
    // Handlers
    handleValuesChange,
    handleSubmit,
    
    // Computed values
    getTargetCountInfo
  };
};
