import axios from "axios";

const BASE_URL = "/api/medical-supplies";

export const medicalSupplyApi = {
  // Get all medical supplies
  getAllSupplies: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching medical supplies:", error);
      throw error;
    }
  },

  // Get medical supply by id
  getSupplyById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medical supply with id ${id}:`, error);
      throw error;
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/low-stock`);
      return response.data;
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      throw error;
    }
  },

  // Get expiring soon items
  getExpiringSoonItems: async (days = 30) => {
    try {
      const response = await axios.get(`${BASE_URL}/expiring-soon`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching expiring soon items:", error);
      throw error;
    }
  },

  // Get expired items
  getExpiredItems: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/expired`);
      return response.data;
    } catch (error) {
      console.error("Error fetching expired items:", error);
      throw error;
    }
  },

  // Get supplies by category
  getSuppliesByCategory: async (category) => {
    try {
      const response = await axios.get(`${BASE_URL}/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplies in category ${category}:`, error);
      throw error;
    }
  },

  // Search supplies by name
  searchSuppliesByName: async (name) => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching supplies with name ${name}:`, error);
      throw error;
    }
  },

  // Get supplies by location
  getSuppliesByLocation: async (location) => {
    try {
      const response = await axios.get(`${BASE_URL}/location/${location}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplies at location ${location}:`, error);
      throw error;
    }
  },

  // Subtract stock
  subtractStock: async (id, quantity) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}/subtract-stock`, { quantity });
      return response.data;
    } catch (error) {
      console.error(`Error subtracting stock for supply ${id}:`, error);
      throw error;
    }
  }
}; 