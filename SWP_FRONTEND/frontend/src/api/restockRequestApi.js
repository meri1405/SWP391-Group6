import axios from "axios";

const BASE_URL = "/api/restock-requests";

export const restockRequestApi = {
  // Get all restock requests
  getAllRequests: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching restock requests:", error);
      throw error;
    }
  },

  // Get restock request by id
  getRequestById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restock request with id ${id}:`, error);
      throw error;
    }
  },

  // Create restock request
  createRequest: async (requestData) => {
    try {
      const response = await axios.post(BASE_URL, requestData);
      return response.data;
    } catch (error) {
      console.error("Error creating restock request:", error);
      throw error;
    }
  },

  // Update restock request
  updateRequest: async (id, requestData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, requestData);
      return response.data;
    } catch (error) {
      console.error(`Error updating restock request with id ${id}:`, error);
      throw error;
    }
  },

  // Delete restock request
  deleteRequest: async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting restock request with id ${id}:`, error);
      throw error;
    }
  },

  // Get my restock requests
  getMyRequests: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/my-requests`);
      return response.data;
    } catch (error) {
      console.error("Error fetching my restock requests:", error);
      throw error;
    }
  },

  // Get requests by status
  getRequestsByStatus: async (status) => {
    try {
      const response = await axios.get(`${BASE_URL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching restock requests with status ${status}:`, error);
      throw error;
    }
  },

  // Add item to request
  addItemToRequest: async (requestId, itemData) => {
    try {
      const response = await axios.post(`${BASE_URL}/${requestId}/items`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Error adding item to restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Remove item from request
  removeItemFromRequest: async (requestId, itemId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${requestId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing item ${itemId} from restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Update request item
  updateRequestItem: async (requestId, itemId, itemData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${requestId}/items/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      console.error(`Error updating item ${itemId} in restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Manager endpoints
  // Get pending requests (for managers)
  getPendingRequests: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pending restock requests:", error);
      throw error;
    }
  },

  // Get all requests (for managers)
  getAllRequestsForManager: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all restock requests for manager:", error);
      throw error;
    }
  },

  // Approve request with quantities (for managers)
  approveRequestWithQuantities: async (requestId, approvalData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${requestId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      console.error(`Error approving restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Reject request (for managers)
  rejectRequest: async (requestId, rejectionData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${requestId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Complete request (for managers)
  completeRequest: async (requestId) => {
    try {
      const response = await axios.put(`${BASE_URL}/${requestId}/complete`);
      return response.data;
    } catch (error) {
      console.error(`Error completing restock request ${requestId}:`, error);
      throw error;
    }
  }
};