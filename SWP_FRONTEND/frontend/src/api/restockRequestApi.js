import axios from "axios";

// Sử dụng import.meta.env thay vì process.env cho Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const BASE_URL = `${API_BASE_URL}/api/restock-requests`;

// Create a simple pub/sub mechanism for restock request updates
const subscribers = [];

// Debug function to log subscriber count
const logSubscriberCount = () => {
  console.log(`[RestockRequestApi] Current subscriber count: ${subscribers.length}`);
};

export const restockRequestApi = {
  // Subscribe to restock request updates
  subscribeToUpdates: (callback) => {
    if (typeof callback !== 'function') {
      console.error('[RestockRequestApi] Attempted to subscribe with a non-function callback');
      return () => {}; // Return empty unsubscribe function
    }
    
    console.log('[RestockRequestApi] New subscriber added');
    subscribers.push(callback);
    logSubscriberCount();
    
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
        console.log('[RestockRequestApi] Subscriber removed');
        logSubscriberCount();
      }
    };
  },
  
  // Notify all subscribers
  notifySubscribers: async () => {
    console.log(`[WebSocketService] Notifying ${subscribers.length} restock request listeners`);
    
    // Execute callbacks sequentially to ensure all operations complete
    for (const callback of subscribers) {
      try {
        // Check if callback returns a promise
        const result = callback();
        if (result && typeof result.then === 'function') {
          await result;
        }
      } catch (error) {
        console.error('[WebSocketService] Error in subscriber callback:', error);
        // Continue with other subscribers even if one fails
      }
    }
  },

  // Get all restock requests
  getAllRequests: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
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
      console.log('[RestockRequestApi] Creating new restock request');
      const token = localStorage.getItem('token');
      const response = await axios.post(BASE_URL, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[RestockRequestApi] Request created successfully, notifying subscribers');
      // Notify subscribers about the new request
      restockRequestApi.notifySubscribers();
      return response.data;
    } catch (error) {
      console.error("[RestockRequestApi] Error creating restock request:", error);
      throw error;
    }
  },

  // Update restock request
  updateRequest: async (id, requestData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, requestData);
      // Notify subscribers about the update
      restockRequestApi.notifySubscribers();
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
      // Notify subscribers about the deletion
      restockRequestApi.notifySubscribers();
    } catch (error) {
      console.error(`Error deleting restock request with id ${id}:`, error);
      throw error;
    }
  },

  // Get my restock requests
  getMyRequests: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/my-requests?userId=${userId}`);
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
      // Notify subscribers about the update
      restockRequestApi.notifySubscribers();
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
      // Notify subscribers about the update
      restockRequestApi.notifySubscribers();
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
      // Notify subscribers about the update
      restockRequestApi.notifySubscribers();
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
      const response = await axios.get(`${BASE_URL}/manager/all`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all restock requests for manager:", error);
      throw error;
    }
  },

  // Approve request with quantities (consolidated method)
  approveRequest: async (requestId, approvalData) => {
    try {
      console.log(`[RestockRequestApi] Approving restock request ${requestId}`);
      const response = await axios.post(`${BASE_URL}/${requestId}/approve`, approvalData);
      console.log('[RestockRequestApi] Request approved successfully, notifying subscribers');
      // Notify subscribers about the approval
      restockRequestApi.notifySubscribers();
      return response.data;
    } catch (error) {
      console.error(`[RestockRequestApi] Error approving restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Reject request (for managers)
  rejectRequest: async (requestId, rejectionData) => {
    try {
      console.log(`[RestockRequestApi] Rejecting restock request ${requestId}`);
      const response = await axios.post(`${BASE_URL}/${requestId}/reject`, rejectionData);
      console.log('[RestockRequestApi] Request rejected successfully, notifying subscribers');
      // Notify subscribers about the rejection
      restockRequestApi.notifySubscribers();
      return response.data;
    } catch (error) {
      console.error(`[RestockRequestApi] Error rejecting restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Complete request (for managers)
  completeRequest: async (requestId) => {
    try {
      const response = await axios.post(`${BASE_URL}/${requestId}/complete`);
      // Notify subscribers about the completion
      restockRequestApi.notifySubscribers();
      return response.data;
    } catch (error) {
      console.error(`Error completing restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Extended restock request endpoints
  // Get extended restock request by id
  // THIS ENDPOINT ALLOWS SCHOOL NURSE AND MANAGER ACCESS THIS API
  getExtendedRestockRequestById: async (requestId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${requestId}/extended`);
      return response.data;
    } catch (error){
      console.error(`Error fetching extended restock request with id ${requestId}:`, error);
      throw error;
    }
  },

  // Create extended restock request
  // THIS ENDPOINT ALLOWS SCHOOL NURSE ACCESS THIS API
  createExtendedRestockRequest: async (requestData) => {
    try {
      console.log('[RestockRequestApi] Creating new extended restock request');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.post(`${BASE_URL}/extended`, requestData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('[RestockRequestApi] Extended request created successfully, notifying subscribers');
      
      // Notify subscribers about the new request
      await restockRequestApi.notifySubscribers();
      
      return response.data;
    } catch (error){
      console.error(`Error creating extended restock request:`, error);
      throw error;
    }
  },

  // Add new supply to request
  // THIS ENDPOINT ALLOWS SCHOOL NURSE ACCESS THIS API
  addNewSupplyToRequest: async (requestId, extendedRequestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/${requestId}/items/new-supply`, extendedRequestData);
      return response.data;
    } catch (error){
      console.error(`Error adding new supply to extended restock request ${requestId}:`, error);
      throw error;
    }
  },

  // Add expired supply to request
  // THIS ENDPOINT ALLOWS SCHOOL NURSE ACCESS THIS API
  addExpiredSupplyToRequest: async (requestId, extendedRequestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/${requestId}/items/expired-supply`, extendedRequestData);
      return response.data;
    } catch (error){
      console.error(`Error adding expired supply to extended restock request ${requestId}:`, error);
      throw error;
    }
  }
};