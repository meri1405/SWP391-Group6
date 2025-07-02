import React, { useState } from "react";
import { Card, Modal } from "antd";
import VaccinationCampaignList from "./VaccinationCampaignList";
import VaccinationCampaignForm from "./VaccinationCampaignForm";
import VaccinationCampaignDetail from "./VaccinationCampaignDetail";

const VaccinationCampaignManagement = () => {
  const [activeView, setActiveView] = useState("list");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const handleViewDetails = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setActiveView("detail");
  };

  const handleBackToList = () => {
    setActiveView("list");
    setSelectedCampaignId(null);
    setCampaignToEdit(null);
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
  };

  return (
    <div className="vaccination-campaign-management">
      {activeView === "list" && (
        <VaccinationCampaignList
          onCreateNew={handleCreateNew}
          onViewDetails={handleViewDetails}
        />
      )}

      {activeView === "detail" && selectedCampaignId && (
        <VaccinationCampaignDetail
          campaignId={selectedCampaignId}
          onBack={handleBackToList}
          onEdit={handleCreateNew}
        />
      )}

      <Modal
        title={
          campaignToEdit
            ? "Chỉnh sửa chiến dịch tiêm chủng"
            : "Tạo chiến dịch tiêm chủng mới"
        }
        open={showFormModal}
        onCancel={handleFormCancel}
        footer={null}
        width={800}
        destroyOnHidden={true}
      >
        <VaccinationCampaignForm
          campaign={campaignToEdit}
          onCancel={handleFormCancel}
          onSuccess={handleFormSuccess}
        />
      </Modal>
    </div>
  );
};

export default VaccinationCampaignManagement;
