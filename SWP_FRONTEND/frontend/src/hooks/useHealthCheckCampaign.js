import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { healthCheckCampaignService } from '../services/healthCheckCampaignService';

/**
 * Custom hook for managing health check campaign state and operations
 * Centralizes all business logic and state management
 */
export const useHealthCheckCampaign = (campaignId) => {
  // State management
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Loading states for operations
  const [sendingNotification, setSendingNotification] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [sendingResults, setSendingResults] = useState(false);

  // Use refs to prevent duplicate API calls and track component mount state
  const isMounted = useRef(true);
  const isLoadingCampaign = useRef(false);
  const isLoadingResults = useRef(false);
  const isLoadingStudents = useRef(false);

  /**
   * Fetch campaign results
   */
  const fetchResults = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingResults.current) return;
    
    isLoadingResults.current = true;
    setResultsLoading(true);
    
    try {
      const { data, error } = await healthCheckCampaignService.getCampaignResults(campaignId);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        if (error) {
          message.error(error);
          setResults([]);
        } else {
          setResults(data);
        }
      }
    } finally {
      isLoadingResults.current = false;
      if (isMounted.current) {
        setResultsLoading(false);
      }
    }
  }, [campaignId]);

  /**
   * Fetch eligible students with form status
   */
  const fetchEligibleStudents = useCallback(async () => {
    // Prevent duplicate API calls
    if (isLoadingStudents.current) return;
    
    isLoadingStudents.current = true;
    setStudentsLoading(true);
    
    try {
      const { data, error } = await healthCheckCampaignService.getEligibleStudentsWithFormStatus(campaignId);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        if (error) {
          message.error(error);
          setEligibleStudents([]);
        } else {
          setEligibleStudents(data);
          setLastRefresh(new Date());
          
          // Update notification sent status based on backend data
          const hasFormsWithSentAt = data.some(student => student.sentAt);
          setNotificationSent(hasFormsWithSentAt);
          
          // Update localStorage to reflect backend state
          localStorage.setItem(`campaign_${campaignId}_notification_sent`, hasFormsWithSentAt.toString());
        }
      }
    } finally {
      isLoadingStudents.current = false;
      if (isMounted.current) {
        setStudentsLoading(false);
      }
    }
  }, [campaignId]);

  /**
   * Load campaign data on mount
   */
  useEffect(() => {
    // Set isMounted ref to true when component mounts
    isMounted.current = true;
    
    const loadCampaignData = async () => {
      // Prevent duplicate API calls
      if (isLoadingCampaign.current) return;
      
      isLoadingCampaign.current = true;
      setLoading(true);
      
      try {
        // Fetch campaign details
        const { data: campaignData, error } = await healthCheckCampaignService.getCampaignDetails(campaignId);
        
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        if (error) {
          message.error(error);
        } else {
          setCampaign(campaignData);
          
          // Based on campaign status, fetch additional data
          if (campaignData) {
            if (campaignData.status === 'IN_PROGRESS' || campaignData.status === 'COMPLETED') {
              // Don't await these calls to avoid blocking
              fetchResults();
            }
            
            if (campaignData.status === 'APPROVED') {
              fetchEligibleStudents();
            }
          }
        }
      } finally {
        isLoadingCampaign.current = false;
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    // Load data on mount
    loadCampaignData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, [campaignId, fetchResults, fetchEligibleStudents]);

  /**
   * Handle campaign actions (start, complete)
   */
  const handleCampaignAction = async (action) => {
    setLoading(true);
    try {
      let result;
      switch (action) {
        case 'start':
          result = await healthCheckCampaignService.startCampaign(campaignId);
          break;
        case 'complete':
          result = await healthCheckCampaignService.completeCampaign(campaignId);
          break;
        case 'cancel':
          message.warning('Tính năng hủy đợt khám chưa được hỗ trợ');
          return;
        default:
          console.warn('Unknown action:', action);
          return;
      }
      
      const { data, error } = result;
      if (error) {
        message.error(error);
      } else {
        setCampaign(data);
        
        if (action === 'start' || action === 'complete') {
          fetchResults();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Schedule campaign
   */
  const scheduleCampaign = async (scheduleData) => {
    setScheduling(true);
    try {
      const { data, error } = await healthCheckCampaignService.scheduleCampaign(campaignId, scheduleData);
      
      if (error) {
        message.error(error);
        return false;
      } else {
        setCampaign(data);
        await fetchEligibleStudents();
        return true;
      }
    } finally {
      setScheduling(false);
    }
  };

  /**
   * Send notifications to parents
   */
  const sendNotifications = async (customMessage = null) => {
    setSendingNotification(true);
    try {
      // Step 1: Generate forms
      const formsResult = await healthCheckCampaignService.generateForms(campaignId);
      if (formsResult.error) {
        message.error(formsResult.error);
        return false;
      }
      
      message.success(`Đã tạo ${formsResult.data.formsGenerated || eligibleStudents.length} phiếu khám sức khỏe`);
      
      // Step 2: Send notifications
      const notificationResult = await healthCheckCampaignService.sendNotificationsToParents(campaignId, customMessage);
      if (notificationResult.error) {
        message.error(notificationResult.error);
        return false;
      }
      
      message.success(`Đã gửi thông báo thành công đến ${notificationResult.data.notificationsSent || eligibleStudents.length} phụ huynh`);
      
      // Mark notification as sent and save to localStorage
      setNotificationSent(true);
      localStorage.setItem(`campaign_${campaignId}_notification_sent`, 'true');
      
      // Refresh student data
      await fetchEligibleStudents();
      return true;
    } finally {
      setSendingNotification(false);
    }
  };

  /**
   * Manual refresh for eligible students
   */
  const refreshStudents = async () => {
    console.log('Manual refresh triggered by user');
    try {
      setStudentsLoading(true);
      const { data, error } = await healthCheckCampaignService.getEligibleStudentsWithFormStatus(campaignId);
      
      if (error) {
        message.error(error);
      } else {
        setEligibleStudents(data);
        setLastRefresh(new Date());
        
        // Update notification sent status based on backend data
        const hasFormsWithSentAt = data.some(student => student.sentAt);
        setNotificationSent(hasFormsWithSentAt);
        localStorage.setItem(`campaign_${campaignId}_notification_sent`, hasFormsWithSentAt.toString());
        
        message.success('Đã cập nhật danh sách học sinh');
      }
    } finally {
      setStudentsLoading(false);
    }
  };

  /**
   * Send health check results
   */
  const sendHealthCheckResults = async (studentIds, notificationContent, useDefaultTemplate) => {
    setSendingResults(true);
    try {
      const { error } = await healthCheckCampaignService.sendHealthCheckResultNotifications(
        campaignId, 
        studentIds, 
        notificationContent, 
        useDefaultTemplate
      );
      
      if (error) {
        message.error(error);
        return false;
      }
      
      return true;
    } finally {
      setSendingResults(false);
    }
  };

  /**
   * Refresh campaign data
   */
  const refreshCampaign = async () => {
    const { data, error } = await healthCheckCampaignService.getCampaignDetails(campaignId);
    if (error) {
      message.error(error);
    } else {
      setCampaign(data);
    }
  };

  return {
    // State
    campaign,
    loading,
    results,
    resultsLoading,
    eligibleStudents,
    studentsLoading,
    notificationSent,
    lastRefresh,
    sendingNotification,
    scheduling,
    sendingResults,

    // Actions
    fetchResults,
    fetchEligibleStudents,
    handleCampaignAction,
    scheduleCampaign,
    sendNotifications,
    refreshStudents,
    sendHealthCheckResults,
    refreshCampaign
  };
};
