const API_BASE_URL = "https://swp391-group6.onrender.com/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log(
    "Getting auth headers for medical supplies, token:",
    token ? `exists (${token.substring(0, 20)}...)` : "missing"
  );

  if (!token) {
    console.warn("No token found in localStorage");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const medicalSupplyApi = {
  // Get all medical supplies
  getAllSupplies: async () => {
    try {
      console.log("Fetching all medical supplies...");
      const response = await fetch(`${API_BASE_URL}/medical-supplies`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Medical supplies received:", data);
      return data;
    } catch (error) {
      console.error("Error fetching medical supplies:", error);
      throw error;
    }
  },

  // Get medical supply by id
  getSupplyById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-supplies/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching medical supply with id ${id}:`, error);
      throw error;
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/low-stock`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      throw error;
    }
  },

  // Get expiring soon items
  getExpiringSoonItems: async (days = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/expiring-soon?days=${days}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching expiring soon items:", error);
      throw error;
    }
  },

  // Get expired items
  getExpiredItems: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-supplies/expired`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching expired items:", error);
      throw error;
    }
  },

  // Get supplies by category
  getSuppliesByCategory: async (category) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/category/${category}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching supplies in category ${category}:`, error);
      throw error;
    }
  },

  // Search supplies by name
  searchSuppliesByName: async (name) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/search?name=${encodeURIComponent(
          name
        )}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error searching supplies with name ${name}:`, error);
      throw error;
    }
  },

  // Get supplies by location
  getSuppliesByLocation: async (location) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/location/${location}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching supplies at location ${location}:`, error);
      throw error;
    }
  },

  // Subtract stock (with unit conversion support)
  subtractStock: async (id, displayQuantity, displayUnit) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/${id}/subtract`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            displayQuantity: displayQuantity,
            displayUnit: displayUnit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error subtracting stock for supply ${id}:`, error);
      throw error;
    }
  },

  // Add stock (with unit conversion support)
  addStock: async (id, displayQuantity, displayUnit) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/${id}/add`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            displayQuantity: displayQuantity,
            displayUnit: displayUnit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error adding stock for supply ${id}:`, error);
      throw error;
    }
  },

  // Update base unit quantity directly
  updateBaseUnitQuantity: async (id, quantityInBaseUnit) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/${id}/quantity`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ quantityInBaseUnit }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        `Error updating base unit quantity for supply ${id}:`,
        error
      );
      throw error;
    }
  },

  // Enable supply
  enableSupply: async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/${id}/enable`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error enabling supply ${id}:`, error);
      throw error;
    }
  },

  // Disable supply
  disableSupply: async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/medical-supplies/${id}/disable`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content response
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error disabling supply ${id}:`, error);
      throw error;
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-supplies/stats`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching inventory statistics:", error);
      throw error;
    }
  },

  // Create new medical supply
  createSupply: async (supplyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-supplies`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(supplyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating medical supply:", error);
      throw error;
    }
  },

  // Update medical supply
  updateSupply: async (id, supplyData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/medical-supplies/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(supplyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error updating medical supply ${id}:`, error);
      throw error;
    }
  },
};
