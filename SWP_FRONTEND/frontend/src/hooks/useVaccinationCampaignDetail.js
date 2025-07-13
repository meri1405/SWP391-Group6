import { useState, useEffect, useCallback } from "react";
import { VaccinationCampaignDetailService } from "../services/vaccinationCampaignDetailService";

export const useVaccinationCampaignDetail = (campaignId) => {
  // State management
  const [campaign, setCampaign] = useState(null);
  const [eligibleStudents, setEligibleStudents] = useState({
    eligibleStudents: [],
    ineligibleStudents: [],
  });
  const [forms, setForms] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formGenerateLoading, setFormGenerateLoading] = useState(false);
  const [formSendLoading, setFormSendLoading] = useState(false);
  const [completeCampaignLoading, setCompleteCampaignLoading] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);

  // Modal states
  const [activeTab, setActiveTab] = useState("1");
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(false);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);

  const fetchCampaignData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await VaccinationCampaignDetailService.fetchCampaignData(campaignId);
      setCampaign(data.campaign);
      setEligibleStudents(data.eligibleStudents);
      setForms(data.forms);
      setRecords(data.records);
    } catch (error) {
      // Error handling is done in the service
      console.error("Error fetching campaign data:", error);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // Fetch campaign data on mount or when campaignId changes
  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId, fetchCampaignData]);

  const handleGenerateForms = async () => {
    setFormGenerateLoading(true);
    try {
      await VaccinationCampaignDetailService.generateForms(campaignId, campaign.status);
      await fetchCampaignData(); // Refresh data
    } catch (error) {
      // Error handling is done in the service
      console.error("Error generating forms:", error);
    } finally {
      setFormGenerateLoading(false);
    }
  };

  const handleSendForms = async (customMessage = null) => {
    setFormSendLoading(true);
    try {
      await VaccinationCampaignDetailService.sendFormsToParents(campaignId, campaign.status, customMessage);
      await fetchCampaignData(); // Refresh data
    } catch (error) {
      // Error handling is done in the service
      console.error("Error sending forms:", error);
    } finally {
      setFormSendLoading(false);
    }
  };

  const handleCompleteCampaign = async (statistics) => {
    setCompleteCampaignLoading(true);
    try {
      await VaccinationCampaignDetailService.requestCampaignCompletion(
        campaignId, 
        campaign.status, 
        statistics
      );
      await fetchCampaignData(); // Refresh data
      setConfirmCompleteModal(false);
    } catch (error) {
      // Error handling is done in the service
      console.error("Error completing campaign:", error);
    } finally {
      setCompleteCampaignLoading(false);
    }
  };

  const handleVaccinationResult = async (recordData) => {
    try {
      if (!selectedForm) return;

      await VaccinationCampaignDetailService.createVaccinationRecord(
        selectedForm.id, 
        recordData, 
        campaign.status
      );
      setShowVaccinationForm(false);
      await fetchCampaignData(); // Refresh data
    } catch (error) {
      // Error handling is done in the service
      console.error("Error submitting vaccination result:", error);
    }
  };

  const handleUpdateNotes = async (values) => {
    if (!selectedRecord) return;

    setUpdatingNotes(true);
    try {
      await VaccinationCampaignDetailService.updateVaccinationRecordNotes(
        selectedRecord.id, 
        values.notes, 
        campaign.status
      );
      setShowEditNotesModal(false);
      setSelectedRecord(null);
      await fetchCampaignData(); // Refresh data
    } catch (error) {
      // Error handling is done in the service
      console.error("Error updating notes:", error);
    } finally {
      setUpdatingNotes(false);
    }
  };

  // Modal handlers
  const openVaccinationForm = (form) => {
    setSelectedForm(form);
    setShowVaccinationForm(true);
  };

  const closeVaccinationForm = () => {
    setShowVaccinationForm(false);
    setSelectedForm(null);
  };

  const openEditNotesModal = (record) => {
    setSelectedRecord(record);
    setShowEditNotesModal(true);
  };

  const closeEditNotesModal = () => {
    setShowEditNotesModal(false);
    setSelectedRecord(null);
  };

  const openCompleteModal = () => {
    setConfirmCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setConfirmCompleteModal(false);
  };

  // Custom message modal handlers
  const openCustomMessageModal = () => {
    setShowCustomMessageModal(true);
  };

  const closeCustomMessageModal = () => {
    setShowCustomMessageModal(false);
  };

  return {
    // Data
    campaign,
    eligibleStudents,
    forms,
    records,
    
    // Loading states
    loading,
    formGenerateLoading,
    formSendLoading,
    completeCampaignLoading,
    updatingNotes,
    
    // Modal states
    activeTab,
    setActiveTab,
    showVaccinationForm,
    selectedForm,
    confirmCompleteModal,
    showEditNotesModal,
    selectedRecord,
    showCustomMessageModal,
    
    // Actions
    fetchCampaignData,
    handleGenerateForms,
    handleSendForms,
    handleCompleteCampaign,
    handleVaccinationResult,
    handleUpdateNotes,
    
    // Modal handlers
    openVaccinationForm,
    closeVaccinationForm,
    openEditNotesModal,
    closeEditNotesModal,
    openCompleteModal,
    closeCompleteModal,
    openCustomMessageModal,
    closeCustomMessageModal,
  };
};