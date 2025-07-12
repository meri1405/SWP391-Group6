import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AutoTokenRefresh = () => {
  const { refreshSession } = useAuth();

  useEffect(() => {
    let intervalId;
    
    const autoRefreshToken = () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      if (!loginTimestamp) return;
      
      const elapsedTime = Date.now() - parseInt(loginTimestamp, 10);
      const refreshInterval = 30 * 60 * 1000; // 30 minutes
      
      // Auto-refresh token every 30 minutes
      if (elapsedTime >= refreshInterval) {
        console.log('Auto-refreshing token after 30 minutes...');
        refreshSession();
        // Update login timestamp for next refresh cycle
        localStorage.setItem('loginTimestamp', Date.now().toString());
      }
    };
    
    // Check every minute (60 seconds) for better performance
    intervalId = setInterval(autoRefreshToken, 60 * 1000);
    
    // Also set up a direct 30-minute interval for token refresh
    const refreshIntervalId = setInterval(() => {
      console.log('Scheduled token refresh (30 minutes)...');
      refreshSession();
    }, 30 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(refreshIntervalId);
    };
  }, [refreshSession]);
  
  // This component doesn't render anything - it's just for background token refresh
  return null;
};

export default AutoTokenRefresh;
