import { useState, useEffect, useCallback } from 'react';
import { nurseApi } from '../api/nurseApi';
import { message } from 'antd';

/**
 * Custom hook for managing School Nurse Dashboard Statistics
 * Provides comprehensive statistics with time filtering capabilities
 */
export const useNurseDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all-time'); // Default to all-time instead of today
  const [customFilter, setCustomFilter] = useState({
    filterType: 'daily',
    date: null,
    month: null,
    year: null,
    startDate: null,
    endDate: null
  });

  // Generic function to load statistics
  const loadStatistics = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Loading statistics...");
      const response = await apiCall();
      console.log("Statistics response:", response);
      
      if (response.success) {
        setStats(response.data);
        console.log("Statistics set successfully:", response.data);
      } else {
        setError(response.message);
        message.error(response.message);
        console.error("Statistics loading failed:", response.message);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load statistics';
      setError(errorMessage);
      message.error(errorMessage);
      console.error("Statistics loading error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load different types of statistics
  const loadTodayStats = useCallback(() => {
    return loadStatistics(() => nurseApi.getTodayStatistics());
  }, [loadStatistics]);

  const loadMonthStats = useCallback(() => {
    return loadStatistics(() => nurseApi.getMonthStatistics());
  }, [loadStatistics]);

  const loadYearStats = useCallback(() => {
    return loadStatistics(() => nurseApi.getYearStatistics());
  }, [loadStatistics]);

  const loadAllTimeStats = useCallback(() => {
    return loadStatistics(() => nurseApi.getAllTimeStatistics());
  }, [loadStatistics]);

  const loadCustomStats = useCallback((filter) => {
    return loadStatistics(() => nurseApi.getDashboardStatistics(filter));
  }, [loadStatistics]);

  // Main function to load statistics based on current filter type
  const loadCurrentStats = useCallback(() => {
    switch (filterType) {
      case 'today':
        return loadTodayStats();
      case 'month':
        return loadMonthStats();
      case 'year':
        return loadYearStats();
      case 'all-time':
        return loadAllTimeStats();
      case 'custom':
        return loadCustomStats(customFilter);
      default:
        return loadTodayStats();
    }
  }, [filterType, customFilter, loadTodayStats, loadMonthStats, loadYearStats, loadAllTimeStats, loadCustomStats]);

  // Load statistics when filter type changes
  useEffect(() => {
    loadCurrentStats();
  }, [loadCurrentStats]);

  // Helper function to set daily filter
  const setDailyFilter = useCallback((date) => {
    setFilterType('custom');
    setCustomFilter({
      filterType: 'daily',
      date: date,
      month: null,
      year: null,
      startDate: null,
      endDate: null
    });
  }, []);

  // Helper function to set monthly filter
  const setMonthlyFilter = useCallback((month) => {
    setFilterType('custom');
    setCustomFilter({
      filterType: 'monthly',
      date: null,
      month: month,
      year: null,
      startDate: null,
      endDate: null
    });
  }, []);

  // Helper function to set yearly filter
  const setYearlyFilter = useCallback((year) => {
    setFilterType('custom');
    setCustomFilter({
      filterType: 'yearly',
      date: null,
      month: null,
      year: year,
      startDate: null,
      endDate: null
    });
  }, []);

  // Helper function to set date range filter
  const setDateRangeFilter = useCallback((startDate, endDate) => {
    setFilterType('custom');
    setCustomFilter({
      filterType: 'range',
      date: null,
      month: null,
      year: null,
      startDate: startDate,
      endDate: endDate
    });
  }, []);

  // Refresh current statistics
  const refresh = useCallback(() => {
    loadCurrentStats();
  }, [loadCurrentStats]);

  // Extract key metrics for quick access
  const getKeyMetrics = useCallback(() => {
    if (!stats) return null;

    return {
      // Medication requests
      totalMedicationRequests: stats.medicationRequests?.totalRequests || 0,
      pendingMedicationRequests: stats.medicationRequests?.pendingRequests || 0,
      approvedMedicationRequests: stats.medicationRequests?.approvedRequests || 0,
      rejectedMedicationRequests: stats.medicationRequests?.rejectedRequests || 0,

      // Medical events
      totalMedicalEvents: stats.medicalEvents?.totalEvents || 0,
      pendingMedicalEvents: stats.medicalEvents?.pendingEvents || 0,
      resolvedMedicalEvents: stats.medicalEvents?.resolvedEvents || 0,

      // Medical inventory
      totalSupplies: stats.medicalInventory?.totalSupplies || 0,
      lowStockSupplies: stats.medicalInventory?.lowStockSupplies || 0,
      expiringSoonSupplies: stats.medicalInventory?.expiringSoonSupplies || 0,
      expiredSupplies: stats.medicalInventory?.expiredSupplies || 0,

      // Health profiles
      pendingHealthProfiles: stats.healthProfiles?.pendingProfiles || 0,
      approvedHealthProfiles: stats.healthProfiles?.approvedProfiles || 0,
      studentsWithoutProfiles: stats.healthProfiles?.studentsWithoutProfiles || 0,

      // Campaigns
      totalVaccinationCampaigns: stats.vaccinationCampaigns?.totalCampaigns || 0,
      totalHealthCheckCampaigns: stats.healthCheckCampaigns?.totalCampaigns || 0,

      // Medication intake
      totalDoses: stats.medicationIntake?.totalDoses || 0,
      takenDoses: stats.medicationIntake?.takenDoses || 0,
      missedDoses: stats.medicationIntake?.missedDoses || 0,
      pendingDoses: stats.medicationIntake?.pendingDoses || 0
    };
  }, [stats]);

  // Get approval rates
  const getApprovalRates = useCallback(() => {
    if (!stats) return null;

    const medicationApprovalRate = stats.medicationRequests?.totalRequests > 0 
      ? ((stats.medicationRequests.approvedRequests / stats.medicationRequests.totalRequests) * 100).toFixed(1)
      : 0;

    const healthProfileApprovalRate = stats.healthProfiles?.totalProfiles > 0 
      ? ((stats.healthProfiles.approvedProfiles / stats.healthProfiles.totalProfiles) * 100).toFixed(1)
      : 0;

    return {
      medicationApprovalRate,
      healthProfileApprovalRate
    };
  }, [stats]);

  // Check for urgent alerts
  const getUrgentAlerts = useCallback(() => {
    if (!stats) return [];

    const alerts = [];
    
    // Low stock alert
    if (stats.medicalInventory?.lowStockSupplies > 0) {
      alerts.push({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${stats.medicalInventory.lowStockSupplies} medical supplies are running low`,
        count: stats.medicalInventory.lowStockSupplies
      });
    }

    // Expired supplies alert
    if (stats.medicalInventory?.expiredSupplies > 0) {
      alerts.push({
        type: 'error',
        title: 'Expired Supplies',
        message: `${stats.medicalInventory.expiredSupplies} medical supplies have expired`,
        count: stats.medicalInventory.expiredSupplies
      });
    }

    // Pending requests alert
    if (stats.medicationRequests?.pendingRequests > 5) {
      alerts.push({
        type: 'info',
        title: 'Pending Medication Requests',
        message: `${stats.medicationRequests.pendingRequests} medication requests awaiting review`,
        count: stats.medicationRequests.pendingRequests
      });
    }

    // Unresolved medical events
    if (stats.medicalEvents?.pendingEvents > 3) {
      alerts.push({
        type: 'warning',
        title: 'Unresolved Medical Events',
        message: `${stats.medicalEvents.pendingEvents} medical events need attention`,
        count: stats.medicalEvents.pendingEvents
      });
    }

    return alerts;
  }, [stats]);

  return {
    // Data
    stats,
    loading,
    error,
    filterType,
    customFilter,

    // Actions
    setFilterType,
    setCustomFilter,
    setDailyFilter,
    setMonthlyFilter,
    setYearlyFilter,
    setDateRangeFilter,
    refresh,

    // Computed values
    keyMetrics: getKeyMetrics(),
    approvalRates: getApprovalRates(),
    urgentAlerts: getUrgentAlerts(),

    // Direct load functions
    loadTodayStats,
    loadMonthStats,
    loadYearStats,
    loadAllTimeStats,
    loadCustomStats
  };
};
