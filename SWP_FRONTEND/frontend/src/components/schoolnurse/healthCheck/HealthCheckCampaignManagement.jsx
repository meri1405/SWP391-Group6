import React, { useState } from "react";
import { Modal } from "antd";
import HealthCheckCampaignList from "./HealthCheckCampaignList";
import HealthCheckCampaignForm from "./HealthCheckCampaignForm";
import HealthCheckCampaignDetail from "./HealthCheckCampaignDetail";

const HealthCheckCampaignManagement = () => {
  const [activeView, setActiveView] = useState("list");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleViewDetails = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setActiveView("detail");
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedCampaignId(null);
    setCampaignToEdit(null);
    // Refresh the list when returning from detail view
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateNew = (campaignData = null) => {
    setCampaignToEdit(campaignData);
    setShowFormModal(true);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setCampaignToEdit(null);
  };

  const handleFormSuccess = (result) => {
    setShowFormModal(false);
    if (activeView === "detail") {
      // If we were editing from detail view, stay on detail but refresh the data
      setSelectedCampaignId(result.id);
    } else {
      // If we were creating/editing from list view, back to list
      setActiveView("list");
    }
    setCampaignToEdit(null);
    // Trigger a refresh of the campaign list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="health-check-campaign-management">
      {activeView === "list" && (
        <HealthCheckCampaignList
          onCreateNew={handleCreateNew}
          onViewDetails={handleViewDetails}
          refreshTrigger={refreshTrigger}
        />
      )}

      {activeView === "detail" && selectedCampaignId && (
        <HealthCheckCampaignDetail
          campaignId={selectedCampaignId}
          onBack={handleBackToList}
          onEdit={handleCreateNew}
        />
      )}

      <Modal
        title={
          campaignToEdit
            ? "Chỉnh sửa đợt khám sức khỏe"
            : "Tạo đợt khám sức khỏe mới"
        }
        open={showFormModal}
        onCancel={handleFormCancel}
        footer={null}
        width={800}
        destroyOnHidden={true}
      >
        <HealthCheckCampaignForm
          campaign={campaignToEdit}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default HealthCheckCampaignManagement;
