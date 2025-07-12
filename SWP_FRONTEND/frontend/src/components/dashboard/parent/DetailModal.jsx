import React from 'react';
import { Modal, Tag } from 'antd';
import {
  getAllergyStatusText,
  getAllergyStatusColor,
  getChronicDiseaseStatusText,
  getChronicDiseaseStatusColor,
  formatDate
} from '../../../utils/healthProfileUtils';

/**
 * Detail Modal component for displaying detailed information about health records
 */
export const DetailModal = ({ 
  visible, 
  onClose, 
  data, 
  type 
}) => {
  const renderAllergyDetail = (allergyData) => (
    <div>
      <p><strong>Chất gây dị ứng:</strong> {allergyData.allergen}</p>
      <p><strong>Mô tả:</strong> {allergyData.description}</p>
      <p><strong>Mức độ nghiêm trọng:</strong>
        <Tag color={getAllergyStatusColor(allergyData.status)}>
          {getAllergyStatusText(allergyData.status)}
        </Tag>
      </p>
      {allergyData.onsetDate && (
        <p><strong>Ngày khởi phát:</strong> {formatDate(allergyData.onsetDate)}</p>
      )}
    </div>
  );

  const renderChronicDiseaseDetail = (diseaseData) => (
    <div>
      <p><strong>Tên bệnh:</strong> {diseaseData.diseaseName}</p>
      <p><strong>Mô tả:</strong> {diseaseData.description}</p>
      <p><strong>Trạng thái:</strong>
        <Tag color={getChronicDiseaseStatusColor(diseaseData.status)}>
          {getChronicDiseaseStatusText(diseaseData.status)}
        </Tag>
      </p>
      {diseaseData.dateDiagnosed && (
        <p><strong>Ngày chẩn đoán:</strong> {formatDate(diseaseData.dateDiagnosed)}</p>
      )}
      {diseaseData.placeOfTreatment && (
        <p><strong>Nơi điều trị:</strong> {diseaseData.placeOfTreatment}</p>
      )}
    </div>
  );

  const renderTreatmentDetail = (treatmentData) => (
    <div>
      <p><strong>Loại điều trị:</strong> {treatmentData.treatmentType}</p>
      <p><strong>Mô tả:</strong> {treatmentData.description}</p>
      <p><strong>Bác sĩ điều trị:</strong> {treatmentData.doctorName}</p>
      {treatmentData.dateOfAdmission && (
        <p><strong>Ngày nhập viện:</strong> {formatDate(treatmentData.dateOfAdmission)}</p>
      )}
      {treatmentData.dateOfDischarge && (
        <p><strong>Ngày xuất viện:</strong> {formatDate(treatmentData.dateOfDischarge)}</p>
      )}
      {treatmentData.placeOfTreatment && (
        <p><strong>Nơi điều trị:</strong> {treatmentData.placeOfTreatment}</p>
      )}
    </div>
  );

  const renderContent = () => {
    if (!data || !type) return null;

    switch (type) {
      case 'allergy':
        return renderAllergyDetail(data);
      case 'chronicDisease':
        return renderChronicDiseaseDetail(data);
      case 'treatment':
        return renderTreatmentDetail(data);
      default:
        return <p>Không có thông tin chi tiết</p>;
    }
  };

  return (
    <Modal
      title="Chi tiết thông tin"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {renderContent()}
    </Modal>
  );
};

export default DetailModal;
