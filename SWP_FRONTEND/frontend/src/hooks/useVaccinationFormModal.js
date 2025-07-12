import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { VaccinationFormModalService } from "../services/vaccinationFormModalService";

/**
 * Custom hook for managing vaccination form modal state and operations
 * Handles form loading, submission, and state management
 */
export const useVaccinationFormModal = (vaccinationFormId, isOpen, onFormUpdated) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'confirm' or 'decline'
  
  const { getToken } = useAuth();

  /**
   * Load vaccination form data
   */
  const loadVaccinationForm = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await VaccinationFormModalService.getVaccinationFormById(
        vaccinationFormId,
        token
      );
      if (response.success) {
        setForm(response.form);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, vaccinationFormId]);

  /**
   * Handle form submission (confirm or decline)
   */
  const handleFormSubmission = async (action, notes) => {
    const token = getToken();
    if (!token) return { success: false, error: "Token không hợp lệ" };

    try {
      setSubmitting(true);
      let response;

      if (action === "confirm") {
        response = await VaccinationFormModalService.confirmVaccinationForm(
          vaccinationFormId,
          notes,
          token
        );
      } else {
        response = await VaccinationFormModalService.declineVaccinationForm(
          vaccinationFormId,
          notes,
          token
        );
      }

      if (response.success) {
        setForm(response.form);
        setShowConfirmDialog(false);
        setNotes("");
        if (onFormUpdated) {
          onFormUpdated(response.form);
        }
        return { success: true, form: response.form };
      } else {
        const errorMessage = response.message;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || "Không thể xử lý yêu cầu. Vui lòng thử lại.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Initialize confirm action
   */
  const handleConfirmClick = () => {
    setConfirmAction("confirm");
    setShowConfirmDialog(true);
  };

  /**
   * Initialize decline action
   */
  const handleDeclineClick = () => {
    setConfirmAction("decline");
    setShowConfirmDialog(true);
  };

  /**
   * Execute the confirmation/decline action
   */
  const handleConfirmSubmit = async () => {
    const result = await handleFormSubmission(confirmAction, notes);
    if (!result.success) {
      // Error is already set in handleFormSubmission
      console.error("Form submission failed:", result.error);
    }
  };

  /**
   * Cancel confirmation dialog
   */
  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setNotes("");
  };

  /**
   * Update notes
   */
  const handleNotesChange = (newNotes) => {
    setNotes(newNotes);
  };

  // Load form when modal opens
  useEffect(() => {
    if (isOpen && vaccinationFormId) {
      loadVaccinationForm();
    }
  }, [isOpen, vaccinationFormId, loadVaccinationForm]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setForm(null);
      setError(null);
      setNotes("");
      setShowConfirmDialog(false);
      setConfirmAction(null);
    }
  }, [isOpen]);

  return {
    // State
    form,
    loading,
    submitting,
    error,
    notes,
    showConfirmDialog,
    confirmAction,
    
    // Actions
    handleConfirmClick,
    handleDeclineClick,
    handleConfirmSubmit,
    handleCancelConfirmation,
    handleNotesChange,
    loadVaccinationForm
  };
};
