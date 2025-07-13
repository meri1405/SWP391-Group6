/**
 * Notification Event Service
 * Manages global notification events to keep navbar in sync with actions
 */
class NotificationEventService {
  constructor() {
    this.listeners = new Set();
  }

  /**
   * Add a listener for notification refresh events
   */
  addRefreshListener(callback) {
    this.listeners.add(callback);
    
    // Return cleanup function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Trigger notification refresh for all listeners
   * This should be called after any action that creates new notifications
   */
  triggerRefresh() {
    console.log('NotificationEventService: Triggering refresh for', this.listeners.size, 'listeners');
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in notification refresh listener:', error);
      }
    });
  }

  /**
   * Clear all listeners (for cleanup)
   */
  clearAllListeners() {
    this.listeners.clear();
  }
}

// Create singleton instance
const notificationEventService = new NotificationEventService();

export default notificationEventService;
