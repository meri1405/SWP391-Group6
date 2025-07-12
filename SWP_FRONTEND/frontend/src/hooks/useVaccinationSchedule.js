import { useState, useEffect } from "react";
import { VaccinationScheduleService } from "../services/vaccinationScheduleService";

/**
 * Custom hook for managing vaccination schedule state and logic
 */
export const useVaccinationSchedule = () => {
  const [activeTab, setActiveTab] = useState("completed");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);

  // Load vaccination data on hook initialization
  useEffect(() => {
    loadVaccinationData();
  }, []);

  /**
   * Loads vaccination data from the service
   */
  const loadVaccinationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { completed, upcoming } = await VaccinationScheduleService.fetchVaccinationData();
      
      setCompletedVaccinations(completed);
      setUpcomingVaccinations(upcoming);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles tab switching
   * @param {string} tabName - Name of the tab to switch to
   */
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
  };

  /**
   * Retry loading vaccination data
   */
  const retryLoadingData = () => {
    loadVaccinationData();
  };

  return {
    // State
    activeTab,
    loading,
    error,
    completedVaccinations,
    upcomingVaccinations,
    
    // Actions
    handleTabSwitch,
    retryLoadingData,
    
    // Computed values
    completedCount: completedVaccinations.length,
    upcomingCount: upcomingVaccinations.length
  };
};
