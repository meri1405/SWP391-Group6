/**
 * Utility functions for health check form data initialization and validation
 */

/**
 * Get initial data structure for each health check category
 * @param {string} category - The health check category
 * @returns {Object} Initial data structure for the category
 */
export const getInitialCategoryData = (category) => {
  switch (category) {
    case "BASIC_INFO":
      return {
        height: null,
        weight: null,
        bmi: null
      };
    case "VISION":
      return {
        visionLeft: "",
        visionRight: "",
        visionLeftWithGlass: "",
        visionRightWithGlass: "",
        visionDescription: "",
        doctorName: "",
        eyeMovement: "NORMAL",
        eyePressure: "",
        needsGlasses: false,
        isAbnormal: false,
        recommendations: "",
        dateOfExamination: new Date().toISOString().split("T")[0],
      };
    case "HEARING":
      return {
        leftEar: null,
        rightEar: null,
        description: "",
        doctorName: "",
        hearingAcuity: "NORMAL",
        tympanometry: "NORMAL",
        earWaxPresent: false,
        earInfection: false,
        isAbnormal: false,
        recommendations: "",
        dateOfExamination: new Date().toISOString().split("T")[0],
      };
    case "ORAL":
      return {
        teethCondition: "",
        gumsCondition: "",
        tongueCondition: "",
        description: "",
        doctorName: "",
        oralHygiene: "GOOD",
        cavitiesCount: 0,
        plaquePresent: false,
        gingivitis: false,
        mouthUlcers: false,
        isAbnormal: false,
        recommendations: "",
        dateOfExamination: new Date().toISOString().split("T")[0],
      };
    case "SKIN":
      return {
        skinColor: "",
        rashes: false,
        lesions: false,
        dryness: false,
        eczema: false,
        psoriasis: false,
        skinInfection: false,
        allergies: false,
        description: "",
        treatment: "",
        doctorName: "",
        acne: false,
        scars: false,
        birthmarks: false,
        skinTone: "NORMAL",
        isAbnormal: false,
        recommendations: "",
        followUpDate: "",
        dateOfExamination: new Date().toISOString().split("T")[0],
      };
    case "RESPIRATORY":
      return {
        breathingRate: "",
        breathingSound: "",
        wheezing: false,
        cough: false,
        breathingDifficulty: false,
        oxygenSaturation: "",
        treatment: "",
        description: "",
        doctorName: "",
        chestExpansion: "NORMAL",
        lungSounds: "CLEAR",
        asthmaHistory: false,
        allergicRhinitis: false,
        isAbnormal: false,
        recommendations: "",
        followUpDate: "",
        dateOfExamination: new Date().toISOString().split("T")[0],
      };
    default:
      return {};
  }
};

/**
 * Initialize form data with overall measurements and category data
 * @param {Object} campaign - Campaign data containing categories
 * @returns {Object} Initial form data structure
 */
export const initializeFormData = (campaign) => {
  const initialData = {
    weight: "",
    height: "",
  };
  
  // Always include BASIC_INFO (not as a category, but as required basic information)
  initialData.BASIC_INFO = getInitialCategoryData("BASIC_INFO");
  
  // Add campaign categories
  if (campaign?.categories) {
    campaign.categories.forEach((category) => {
      initialData[category] = getInitialCategoryData(category);
    });
  }
  
  return initialData;
};

/**
 * Map existing results from backend to frontend form structure
 * @param {Object} studentResults - Existing results from backend
 * @param {Object} campaign - Campaign data
 * @returns {Object} Mapped form data
 */
export const mapExistingResultsToFormData = (studentResults, campaign) => {
  console.log('Loading existing results for student:', studentResults);

  const loadedData = {
    weight: studentResults.weight || studentResults.overallResults?.weight || "",
    height: studentResults.height || studentResults.overallResults?.height || "",
  };

  // Always include BASIC_INFO (not as a category, but as required basic information)
  loadedData.BASIC_INFO = {
    height: studentResults.height || studentResults.overallResults?.height || null,
    weight: studentResults.weight || studentResults.overallResults?.weight || null,
    bmi: studentResults.bmi || studentResults.overallResults?.bmi || null,
  };

  // Load category-specific data if available
  if (campaign?.categories) {
    campaign.categories.forEach((category) => {
      console.log(`Processing category ${category} for student`);

      let categoryData = null;

      // The backend returns category data in the 'results' object with category name as key
      if (studentResults.results && studentResults.results[category]) {
        categoryData = studentResults.results[category];
        console.log(`Found category data in results.${category}:`, categoryData);
      }
      // Fallback: try direct category key
      else if (studentResults[category]) {
        categoryData = studentResults[category];
        console.log(`Found category data with direct key ${category}:`, categoryData);
      }

      if (categoryData) {
        // Map the backend data to frontend form structure
        const mappedData = { ...getInitialCategoryData(category) };

        // Map common fields
        if (categoryData.doctorName) mappedData.doctorName = categoryData.doctorName;
        if (categoryData.isAbnormal !== undefined) mappedData.isAbnormal = categoryData.isAbnormal;
        if (categoryData.recommendations) mappedData.recommendations = categoryData.recommendations;
        if (categoryData.dateOfExamination) mappedData.dateOfExamination = categoryData.dateOfExamination;

        // Map category-specific fields based on category type
        if (category === "VISION") {
          if (categoryData.visionLeft !== undefined) mappedData.visionLeft = categoryData.visionLeft;
          if (categoryData.visionRight !== undefined) mappedData.visionRight = categoryData.visionRight;
          if (categoryData.visionLeftWithGlass !== undefined) mappedData.visionLeftWithGlass = categoryData.visionLeftWithGlass;
          if (categoryData.visionRightWithGlass !== undefined) mappedData.visionRightWithGlass = categoryData.visionRightWithGlass;
          if (categoryData.visionDescription) mappedData.visionDescription = categoryData.visionDescription;
          if (categoryData.eyeMovement) mappedData.eyeMovement = categoryData.eyeMovement;
          if (categoryData.eyePressure !== undefined) mappedData.eyePressure = categoryData.eyePressure;
          if (categoryData.needsGlasses !== undefined) mappedData.needsGlasses = categoryData.needsGlasses;
        } else if (category === "HEARING") {
          if (categoryData.leftEar !== undefined) mappedData.leftEar = categoryData.leftEar;
          if (categoryData.rightEar !== undefined) mappedData.rightEar = categoryData.rightEar;
          if (categoryData.description) mappedData.description = categoryData.description;
          if (categoryData.hearingAcuity) mappedData.hearingAcuity = categoryData.hearingAcuity;
          if (categoryData.tympanometry) mappedData.tympanometry = categoryData.tympanometry;
          if (categoryData.earWaxPresent !== undefined) mappedData.earWaxPresent = categoryData.earWaxPresent;
          if (categoryData.earInfection !== undefined) mappedData.earInfection = categoryData.earInfection;
        } else if (category === "ORAL") {
          if (categoryData.teethCondition) mappedData.teethCondition = categoryData.teethCondition;
          if (categoryData.gumsCondition) mappedData.gumsCondition = categoryData.gumsCondition;
          if (categoryData.tongueCondition) mappedData.tongueCondition = categoryData.tongueCondition;
          if (categoryData.description) mappedData.description = categoryData.description;
          if (categoryData.oralHygiene) mappedData.oralHygiene = categoryData.oralHygiene;
          if (categoryData.cavitiesCount !== undefined) mappedData.cavitiesCount = categoryData.cavitiesCount;
          if (categoryData.plaquePresent !== undefined) mappedData.plaquePresent = categoryData.plaquePresent;
          if (categoryData.gingivitis !== undefined) mappedData.gingivitis = categoryData.gingivitis;
          if (categoryData.mouthUlcers !== undefined) mappedData.mouthUlcers = categoryData.mouthUlcers;
        } else if (category === "SKIN") {
          if (categoryData.skinColor) mappedData.skinColor = categoryData.skinColor;
          if (categoryData.rashes !== undefined) mappedData.rashes = categoryData.rashes;
          if (categoryData.lesions !== undefined) mappedData.lesions = categoryData.lesions;
          if (categoryData.dryness !== undefined) mappedData.dryness = categoryData.dryness;
          if (categoryData.eczema !== undefined) mappedData.eczema = categoryData.eczema;
          if (categoryData.psoriasis !== undefined) mappedData.psoriasis = categoryData.psoriasis;
          if (categoryData.skinInfection !== undefined) mappedData.skinInfection = categoryData.skinInfection;
          if (categoryData.allergies !== undefined) mappedData.allergies = categoryData.allergies;
          if (categoryData.acne !== undefined) mappedData.acne = categoryData.acne;
          if (categoryData.scars !== undefined) mappedData.scars = categoryData.scars;
          if (categoryData.birthmarks !== undefined) mappedData.birthmarks = categoryData.birthmarks;
          if (categoryData.skinTone) mappedData.skinTone = categoryData.skinTone;
          if (categoryData.description) mappedData.description = categoryData.description;
          if (categoryData.treatment) mappedData.treatment = categoryData.treatment;
          if (categoryData.followUpDate) mappedData.followUpDate = categoryData.followUpDate;
        } else if (category === "RESPIRATORY") {
          if (categoryData.breathingRate !== undefined) mappedData.breathingRate = categoryData.breathingRate;
          if (categoryData.breathingSound) mappedData.breathingSound = categoryData.breathingSound;
          if (categoryData.wheezing !== undefined) mappedData.wheezing = categoryData.wheezing;
          if (categoryData.cough !== undefined) mappedData.cough = categoryData.cough;
          if (categoryData.breathingDifficulty !== undefined) mappedData.breathingDifficulty = categoryData.breathingDifficulty;
          if (categoryData.oxygenSaturation !== undefined) mappedData.oxygenSaturation = categoryData.oxygenSaturation;
          if (categoryData.chestExpansion) mappedData.chestExpansion = categoryData.chestExpansion;
          if (categoryData.lungSounds) mappedData.lungSounds = categoryData.lungSounds;
          if (categoryData.asthmaHistory !== undefined) mappedData.asthmaHistory = categoryData.asthmaHistory;
          if (categoryData.allergicRhinitis !== undefined) mappedData.allergicRhinitis = categoryData.allergicRhinitis;
          if (categoryData.treatment) mappedData.treatment = categoryData.treatment;
          if (categoryData.description) mappedData.description = categoryData.description;
          if (categoryData.followUpDate) mappedData.followUpDate = categoryData.followUpDate;
        }

        loadedData[category] = mappedData;
        console.log(`Mapped category data for ${category}:`, mappedData);
      } else {
        console.log(`No existing data found for category ${category}, using initial data`);
        loadedData[category] = getInitialCategoryData(category);
      }
    });
  }

  console.log('Final loaded data for view mode:', loadedData);
  return loadedData;
};

/**
 * Basic validation for health check form data
 * @param {Object} formData - Form data to validate
 * @param {string} modalMode - Current modal mode ('record' or 'view')
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFormData = (formData, modalMode) => {
  const errors = [];
  
  if (modalMode === 'record') {
    // Check if at least one category has meaningful data
    const healthCategories = ['VISION', 'HEARING', 'ORAL', 'SKIN', 'RESPIRATORY'];
    const hasAtLeastOneCategory = healthCategories.some(category => {
      const categoryData = formData[category];
      if (!categoryData) return false;
      
      // Check if category has meaningful data
      return Object.keys(categoryData).some(key => {
        const value = categoryData[key];
        if (key === 'dateOfExamination') return true; // Always include date
        if (typeof value === 'boolean') return value; // Include if true
        if (typeof value === 'number') return value > 0; // Include if > 0
        if (typeof value === 'string') return value.trim().length > 0; // Include if not empty
        return false;
      });
    });

    if (!hasAtLeastOneCategory) {
      errors.push('Vui lòng điền thông tin cho ít nhất một hạng mục khám sức khỏe');
    }
    
    // Validate required overall measurements
    if (!formData.weight) {
      errors.push('Cân nặng là bắt buộc');
    }
    if (!formData.height) {
      errors.push('Chiều cao là bắt buộc');
    }
    
    // Validate vision data if present
    if (formData.VISION) {
      if (formData.VISION.visionLeft === "" || formData.VISION.visionLeft === null) {
        errors.push('Thị lực mắt trái là bắt buộc');
      }
      if (formData.VISION.visionRight === "" || formData.VISION.visionRight === null) {
        errors.push('Thị lực mắt phải là bắt buộc');
      }
    }
    
    // Validate hearing data if present - enhanced validation
    if (formData.HEARING) {
      const leftEar = formData.HEARING.leftEar;
      const rightEar = formData.HEARING.rightEar;
      
      if (leftEar === "" || leftEar === null || leftEar === undefined || isNaN(Number(leftEar))) {
        errors.push('Thính lực tai trái là bắt buộc và phải là một số hợp lệ (0-120 dB)');
      } else if (Number(leftEar) < 0 || Number(leftEar) > 120) {
        errors.push('Thính lực tai trái phải trong khoảng 0-120 dB');
      }
      
      if (rightEar === "" || rightEar === null || rightEar === undefined || isNaN(Number(rightEar))) {
        errors.push('Thính lực tai phải là bắt buộc và phải là một số hợp lệ (0-120 dB)');
      } else if (Number(rightEar) < 0 || Number(rightEar) > 120) {
        errors.push('Thính lực tai phải phải trong khoảng 0-120 dB');
      }
    }
    
    // Validate oral health data if present
    if (formData.ORAL) {
      if (!formData.ORAL.teethCondition?.trim()) {
        errors.push('Tình trạng răng là bắt buộc');
      }
      if (!formData.ORAL.gumsCondition?.trim()) {
        errors.push('Tình trạng nướu là bắt buộc');
      }
      if (!formData.ORAL.tongueCondition?.trim()) {
        errors.push('Tình trạng lưỡi là bắt buộc');
      }
    }
    
    // Validate skin data if present
    if (formData.SKIN) {
      if (!formData.SKIN.skinColor?.trim()) {
        errors.push('Màu da là bắt buộc');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
