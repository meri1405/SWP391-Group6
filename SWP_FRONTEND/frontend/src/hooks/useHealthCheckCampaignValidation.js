import dayjs from 'dayjs';

/**
 * Validation rules for Health Check Campaign Form
 */
export const useHealthCheckCampaignValidation = () => {
  
  /**
   * Validates minimum age field
   */
  const validateMinAge = (form) => ({
    validator: (_, value) => {
      const maxAge = form.getFieldValue('maxAge');
      const targetClasses = form.getFieldValue('targetClasses') || [];
      
      // Nếu không có targetClasses và không có maxAge, yêu cầu cả hai
      if ((!targetClasses || targetClasses.length === 0) && !maxAge && !value) {
        return Promise.reject(new Error('Vui lòng nhập độ tuổi hoặc chọn lớp'));
      }
      
      // Nếu có minAge thì phải có maxAge
      if (value && !maxAge) {
        return Promise.reject(new Error('Vui lòng nhập độ tuổi tối đa'));
      }
      
      // Kiểm tra logic min <= max (tính theo năm)
      if (value && maxAge && value > maxAge) {
        return Promise.reject(new Error('Độ tuổi tối thiểu phải ≤ độ tuổi tối đa'));
      }
      
      return Promise.resolve();
    }
  });

  /**
   * Validates maximum age field
   */
  const validateMaxAge = (form) => ({
    validator: (_, value) => {
      const minAge = form.getFieldValue('minAge');
      const targetClasses = form.getFieldValue('targetClasses') || [];
      
      // Nếu không có targetClasses và không có minAge, yêu cầu cả hai
      if ((!targetClasses || targetClasses.length === 0) && !minAge && !value) {
        return Promise.reject(new Error('Vui lòng nhập độ tuổi hoặc chọn lớp'));
      }
      
      // Nếu có maxAge thì phải có minAge
      if (value && !minAge) {
        return Promise.reject(new Error('Vui lòng nhập độ tuổi tối thiểu'));
      }
      
      // Kiểm tra logic min <= max (tính theo năm)
      if (value && minAge && value < minAge) {
        return Promise.reject(new Error('Độ tuổi tối đa phải ≥ độ tuổi tối thiểu'));
      }
      
      return Promise.resolve();
    }
  });

  /**
   * Validates target classes field
   */
  const validateTargetClasses = (form) => ({
    validator: (_, value) => {
      const minAge = form.getFieldValue('minAge');
      const maxAge = form.getFieldValue('maxAge');
      
      // Phải có ít nhất một trong hai: age range hoặc target classes
      if (!minAge && !maxAge && (!value || value.length === 0)) {
        return Promise.reject(new Error('Vui lòng chọn lớp mục tiêu hoặc nhập độ tuổi'));
      }
      
      return Promise.resolve();
    }
  });

  /**
   * Date picker disabled date function
   * Disables dates before today + 5 days
   */
  const disabledDate = (current) => {
    // Vô hiệu hóa tất cả ngày trước ngày hôm nay + 5 ngày
    const minDate = dayjs().add(5, 'day');
    return current && current.isBefore(minDate, 'day');
  };

  /**
   * Required field validation rules
   */
  const requiredRules = {
    name: [{ required: true, message: 'Vui lòng nhập tên đợt khám' }],
    description: [{ required: true, message: 'Vui lòng nhập mô tả' }],
    location: [{ required: true, message: 'Vui lòng nhập địa điểm' }],
    categories: [{ required: true, message: 'Vui lòng chọn ít nhất một loại khám' }],
    dateRange: [
      { required: true, message: 'Vui lòng chọn thời gian thực hiện' },
      {
        validator: (_, value) => {
          if (!value || !Array.isArray(value) || value.length !== 2) {
            return Promise.resolve();
          }
          
          const [startDate, endDate] = value;
          const today = dayjs();
          const minStartDate = today.add(5, 'day');
          
          // Kiểm tra ngày bắt đầu phải sau 5 ngày kể từ hôm nay
          if (startDate && startDate.isBefore(minStartDate, 'day')) {
            return Promise.reject(new Error('Ngày bắt đầu phải sau ít nhất 5 ngày kể từ hôm nay'));
          }
          
          // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
          if (startDate && endDate && endDate.isBefore(startDate, 'day')) {
            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
          }
          
          return Promise.resolve();
        }
      }
    ]
  };

  return {
    validateMinAge,
    validateMaxAge,
    validateTargetClasses,
    disabledDate,
    requiredRules
  };
};

/**
 * Helper functions for form data manipulation
 */
export const formDataHelpers = {
  /**
   * Prepare initial form data from campaign object
   */
  prepareInitialFormData: (campaign) => {
    if (!campaign) return {};
    
    return {
      ...campaign,
      dateRange: campaign.startDate && campaign.endDate ? 
        [dayjs(campaign.startDate), dayjs(campaign.endDate)] : 
        undefined,
      targetClasses: campaign.targetClasses || []
    };
  },

  /**
   * Check if form fields should trigger target count calculation
   */
  shouldCalculateTargetCount: (changedValues) => {
    return 'minAge' in changedValues || 
           'maxAge' in changedValues || 
           'targetClasses' in changedValues;
  }
};
