import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SessionTimeout.css';

const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const { refreshSession, logout } = useAuth();

  useEffect(() => {
    let intervalId;
    let warningTimerId;
    
    const checkSessionTime = () => {
      const loginTimestamp = localStorage.getItem('loginTimestamp');
      if (!loginTimestamp) return;
      
      const elapsedTime = Date.now() - parseInt(loginTimestamp, 10);
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const warningTime = 25 * 60 * 1000; // Show warning after 25 minutes
      
      // Calculate remaining time in minutes and seconds
      const remaining = Math.max(0, sessionTimeout - elapsedTime);
      setRemainingTime(Math.floor(remaining / 1000));
      
      // Show warning when 5 minutes remaining
      if (elapsedTime >= warningTime && elapsedTime < sessionTimeout) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };
    
    // Check every second
    intervalId = setInterval(checkSessionTime, 1000);
    
    return () => {
      clearInterval(intervalId);
      if (warningTimerId) clearTimeout(warningTimerId);
    };
  }, [logout]);
  
  // Format remaining time as minutes:seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle continue session
  const handleContinueSession = () => {
    refreshSession();
    setShowWarning(false);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  if (!showWarning) return null;
  
  return (
    <div className="session-timeout-warning">
      <div className="timeout-content">
        <h3>Phiên làm việc sắp hết hạn</h3>
        <p>Bạn sẽ tự động đăng xuất sau <span className="timeout-counter">{formatTime(remainingTime)}</span></p>
        <div className="timeout-actions">
          <button onClick={handleContinueSession} className="continue-btn">
            Tiếp tục phiên làm việc
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
