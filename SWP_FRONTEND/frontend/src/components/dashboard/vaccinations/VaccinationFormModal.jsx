import React from "react";
import { Alert, Tag, Tooltip, Modal, Button, Typography, Row, Col, Divider, Spin } from "antd";
import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useVaccinationFormModal } from "../../../hooks/useVaccinationFormModal";
import {
  getStatusColor,
  getStatusText,
  validateFormSubmission,
  getConfirmationDialogTitle,
  getConfirmationDialogMessage,
  getNotesPlaceholder,
  getNotesLabel,
  canModifyForm
} from "../../../utils/vaccinationFormModalUtils";
import { formatDate, parseDate } from "../../../utils/timeUtils";
import {
  validateParentFormAction,
  formatTimeRemaining,
  shouldShowFormReminderWarning,
} from "../../../utils/vaccinationTimeValidation";

const { Title, Text } = Typography;

const VaccinationFormModal = ({
  isOpen,
  onClose,
  vaccinationFormId,
  onFormUpdated,
}) => {
  const {
    form,
    loading,
    submitting,
    error,
    notes,
    showConfirmDialog,
    confirmAction,
    handleConfirmClick,
    handleDeclineClick,
    handleConfirmSubmit,
    handleCancelConfirmation,
    handleNotesChange,
  } = useVaccinationFormModal(vaccinationFormId, isOpen, onFormUpdated);

  // Helper function to format date for display (date only, no time)
  const formatDateOnly = (dateInput) => {
    if (!dateInput) return "Chưa có thông tin";

    const date = parseDate(dateInput);
    if (!date) return "Không hợp lệ";
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Chi tiết phiếu tiêm chủng"
      open={isOpen}
      onCancel={onClose}
      footer={
        form && canModifyForm(form.confirmationStatus) && (() => {
          // Check time validation for parent actions
          if (form.sentDate) {
            const validation = validateParentFormAction(form.sentDate);
            
            if (!validation.canAct) {
              return [
                <Button key="close" onClick={onClose}>
                  Đóng
                </Button>
              ];
            }
          }
          
          return [
            <Button key="decline" danger onClick={handleDeclineClick}>
              Từ chối tiêm chủng
            </Button>,
            <Button key="confirm" type="primary" onClick={handleConfirmClick}>
              Đồng ý tiêm chủng
            </Button>
          ];
        })() || [
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>
        ]
      }
      width={800}
      destroyOnClose
    >
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" tip="Đang tải thông tin..." />
        </div>
      )}

      {error && (
        <Alert
          message="Lỗi"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {form && (
        <div style={{ padding: '0' }}>
          {/* Section 1: Student Information */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
              Thông tin học sinh
            </Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Họ tên:</Text>
                  <Text>{form.studentFullName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Lớp:</Text>
                  <Text>{form.studentClassName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày sinh:</Text>
                  <Text>{formatDateOnly(form.studentBirthDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Giới tính:</Text>
                  <Text>{form.studentGender === 'M' ? 'Nam' : 'Nữ'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Trạng thái:</Text>
                  <Text style={{ color: getStatusColor(form.confirmationStatus) }}>
                    {getStatusText(form.confirmationStatus)}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Time validation warning for pending forms */}
          {form.confirmationStatus === "PENDING" && form.sentDate && (() => {
            const validation = validateParentFormAction(form.sentDate);
            const showWarning = shouldShowFormReminderWarning(form.sentDate, form.reminderSent);
            
            if (!validation.canAct) {
              return (
                <Alert
                  message="Phiếu đã hết hạn"
                  description={`Thời hạn phản hồi đã kết thúc (${validation.hoursElapsed} giờ đã trôi qua, giới hạn 48 giờ). Vui lòng liên hệ nhà trường để được hỗ trợ.`}
                  type="error"
                  showIcon
                  style={{ margin: "16px 0" }}
                  icon={<ExclamationCircleOutlined />}
                />
              );
            }
            
            if (showWarning || validation.remainingHours <= 6) {
              return (
                <Alert
                  message={showWarning ? "Nhắc nhở đã được gửi" : "Sắp hết thời hạn phản hồi"}
                  description={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ClockCircleOutlined />
                      <span>
                        Còn {formatTimeRemaining(validation.remainingHours)} để phản hồi phiếu tiêm chủng
                        {showWarning && " (Hệ thống đã gửi nhắc nhở sau 24 giờ)"}
                      </span>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ margin: "16px 0" }}
                />
              );
            }
            
            return null;
          })()}

          <Divider />

          {/* Section 2: Vaccine Information */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
              Thông tin vắc xin
            </Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tên vắc xin:</Text>
                  <Text>{form.vaccineName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              {form.vaccineBrand && (
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Thương hiệu:</Text>
                    <Text>{form.vaccineBrand}</Text>
                  </div>
                </Col>
              )}
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Liều số:</Text>
                  <Text>{form.doseNumber || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày dự kiến:</Text>
                  <Text>{formatDate(form.scheduledDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Địa điểm:</Text>
                  <Text>{form.location || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Section 3: Campaign Information */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
              Thông tin chiến dịch
            </Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tên chiến dịch:</Text>
                  <Text>{form.campaignName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày tạo:</Text>
                  <Text>{formatDate(form.createdDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Người tạo:</Text>
                  <Text>{form.createdByName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Section 4: Care Instructions */}
          {form.prePostCareInstructions && (
            <>
              <Divider />
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Hướng dẫn chăm sóc trước/sau tiêm
                </Title>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9'
                }}>
                  {form.prePostCareInstructions.split("\n").map((line, index) => (
                    <div key={index} style={{ marginBottom: index < form.prePostCareInstructions.split("\n").length - 1 ? '4px' : '0' }}>
                      <Text>{line}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section 5: Additional Information */}
          {form.additionalInfo && (
            <>
              <Divider />
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Thông tin bổ sung
                </Title>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '6px',
                  border: '1px solid #d9d9d9'
                }}>
                  {form.additionalInfo.split("\n").map((line, index) => (
                    <div key={index} style={{ marginBottom: index < form.additionalInfo.split("\n").length - 1 ? '4px' : '0' }}>
                      <Text>{line}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Section 6: Confirmation Information */}
          {form.confirmationDate && (
            <>
              <Divider />
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Thông tin xác nhận
                </Title>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                      <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày xác nhận:</Text>
                      <Text>{formatDate(form.confirmationDate)}</Text>
                    </div>
                  </Col>
                  {form.parentNotes && (
                    <Col span={24}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ marginBottom: '8px', display: 'block' }}>Ghi chú của phụ huynh:</Text>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '6px',
                          border: '1px solid #d9d9d9'
                        }}>
                          {form.parentNotes.split("\n").map((line, index) => (
                            <div key={index} style={{ marginBottom: index < form.parentNotes.split("\n").length - 1 ? '4px' : '0' }}>
                              <Text>{line}</Text>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </>
          )}

          {/* Time remaining warning in content area for pending forms */}
          {canModifyForm(form.confirmationStatus) && form.sentDate && (() => {
            const validation = validateParentFormAction(form.sentDate);
            if (validation.canAct && validation.remainingHours <= 6) {
              return (
                <div style={{ marginBottom: "16px" }}>
                  <Tag color="orange" icon={<ClockCircleOutlined />}>
                    Còn {formatTimeRemaining(validation.remainingHours)} để phản hồi
                  </Tag>
                </div>
              );
            }
            return null;
          })()}

          {/* Action not allowed message */}
          {canModifyForm(form.confirmationStatus) && form.sentDate && (() => {
            const validation = validateParentFormAction(form.sentDate);
            
            if (!validation.canAct) {
              return (
                <Alert
                  message="Không thể thực hiện hành động"
                  description="Đã quá thời hạn phản hồi (48 giờ). Vui lòng liên hệ nhà trường để được hỗ trợ."
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Modal
          title={getConfirmationDialogTitle(confirmAction)}
          open={showConfirmDialog}
          onCancel={handleCancelConfirmation}
          footer={[
            <Button key="cancel" onClick={handleCancelConfirmation}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type={confirmAction === "confirm" ? "primary" : "danger"}
              loading={submitting}
              disabled={!validateFormSubmission(confirmAction, notes)}
              onClick={handleConfirmSubmit}
            >
              {confirmAction === "confirm" ? "Xác nhận đồng ý" : "Xác nhận từ chối"}
            </Button>
          ]}
          width={500}
        >
          <div style={{ marginBottom: '16px' }}>
            <Text>{getConfirmationDialogMessage(confirmAction, form?.vaccineName)}</Text>
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              {getNotesLabel(confirmAction)}
            </Text>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder={getNotesPlaceholder(confirmAction)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              required={confirmAction === "decline"}
            />
          </div>
        </Modal>
      )}
    </Modal>
  );
};

// export { VaccinationFormModal };
export default VaccinationFormModal;
