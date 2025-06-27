const API_BASE_URL = "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    console.warn("No token found in localStorage");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const unitConversionApi = {
  // Get all unit conversions
  getAllConversions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching unit conversions:", error);
      throw error;
    }
  },

  // Get enabled unit conversions
  getEnabledConversions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/enabled`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching enabled unit conversions:", error);
      throw error;
    }
  },

  // Get all available units
  getAllUnits: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/units`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching available units:", error);
      throw error;
    }
  },

  // Get convertible units for a given unit
  getConvertibleUnits: async (fromUnit) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/convertible-units/${encodeURIComponent(fromUnit)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching convertible units:", error);
      throw error;
    }
  },

  // Create unit conversion
  createConversion: async (conversionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(conversionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating unit conversion:", error);
      throw error;
    }
  },

  // Update unit conversion
  updateConversion: async (id, conversionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(conversionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating unit conversion:", error);
      throw error;
    }
  },

  // Delete unit conversion
  deleteConversion: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting unit conversion:", error);
      throw error;
    }
  },

  // Convert quantity
  convertQuantity: async (quantity, fromUnit, toUnit) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/convert`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity, fromUnit, toUnit }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error converting quantity:", error);
      throw error;
    }
  },

  // Check if units can be converted
  canConvert: async (fromUnit, toUnit) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/unit-conversions/can-convert?fromUnit=${encodeURIComponent(fromUnit)}&toUnit=${encodeURIComponent(toUnit)}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.canConvert;
    } catch (error) {
      console.error("Error checking conversion possibility:", error);
      throw error;
    }
  },

  // Get conversions for a specific unit
  getConversionsForUnit: async (unit) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/for-unit/${encodeURIComponent(unit)}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching conversions for unit:", error);
      throw error;
    }
  },

  // Seed default conversions
  seedDefaultConversions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/seed-defaults`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error seeding default conversions:", error);
      throw error;
    }
  },

  // Enable unit conversion
  enableConversion: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/${id}/enable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error enabling unit conversion:", error);
      throw error;
    }
  },

  // Disable unit conversion
  disableConversion: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unit-conversions/${id}/disable`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error("Error disabling unit conversion:", error);
      throw error;
    }
  },
};
