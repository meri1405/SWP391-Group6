import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Typography, Row, Col, Divider, Spin, Alert } from "antd";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import { HEALTH_CHECK_CATEGORY_LABELS } from "../../../api/healthCheckApi";
import { formatDate, parseDate } from "../../../utils/timeUtils";

const { Title, Text } = Typography;

const HealthCheckFormModal = ({
  isOpen,
  onClose,
  healthCheckFormId,
  onFormUpdated,
}) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'confirm' or 'decline'
  const { getToken } = useAuth();

  const loadHealthCheckForm = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    if (!healthCheckFormId) {
      console.log("No healthCheckFormId provided");
      return;
    }

    console.log("Loading health check form with ID:", healthCheckFormId);

    try {
      setLoading(true);
      setError(null);
      const formData = await parentApi.getHealthCheckFormById(
        healthCheckFormId,
        token
      );
      console.log("Received form data:", formData);
      setForm(formData);
    } catch (error) {
      console.error("Error loading health check form:", error);
      setError("Không thể tải thông tin phiếu khám sức khỏe");
    } finally {
      setLoading(false);
    }
  }, [getToken, healthCheckFormId]);

  useEffect(() => {
    if (isOpen && healthCheckFormId) {
      loadHealthCheckForm();
    }
  }, [isOpen, healthCheckFormId, loadHealthCheckForm]);

  const handleConfirmClick = () => {
    setConfirmAction("confirm");
    setShowConfirmDialog(true);
  };

  const handleDeclineClick = () => {
    setConfirmAction("decline");
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setSubmitting(true);
      setError(null);
      let response;

      console.log('Submitting form with action:', confirmAction, 'and notes:', notes);

      if (confirmAction === "confirm") {
        response = await parentApi.confirmHealthCheckForm(
          healthCheckFormId,
          notes,
          token
        );
      } else {
        response = await parentApi.declineHealthCheckForm(
          healthCheckFormId,
          notes,
          token
        );
      }

      console.log('Form submission response:', response);

      // Handle both possible response formats
      const formData = response?.form || response;
      
      if (formData && (formData.id || formData.form?.id)) {
        // Update form state with the correct data structure
        const updatedForm = formData.form || formData;
        setForm(updatedForm);
        
        // Then close dialog and clear notes
        setShowConfirmDialog(false);
        setNotes("");
        
        // Finally notify parent component
        if (onFormUpdated) {
          onFormUpdated(updatedForm);
        }
      } else {
        console.error('Invalid response format:', response);
        setError("Không thể xử lý yêu cầu - phản hồi không hợp lệ");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "Không thể xử lý yêu cầu. Vui lòng thử lại.";
      
      // Extract error message from response if available
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDateOnly = (dateInput) => {
    if (!dateInput) return "Chưa có thông tin";

    const date = parseDate(dateInput);
    if (!date) return "Không hợp lệ";
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "#52c41a";
      case "DECLINED":
        return "#ff4d4f";
      case "PENDING":
        return "#faad14";
      case "EXPIRED":
        return "#8c8c8c";
      default:
        return "#d9d9d9";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "DECLINED":
        return "Đã từ chối";
      case "PENDING":
        return "Chờ xác nhận";
      case "EXPIRED":
        return "Đã hết hạn";
      default:
        return status;
    }
  };

  const getHealthCheckTypeText = (type) => {
    return HEALTH_CHECK_CATEGORY_LABELS[type] || type || "Không xác định";
  };


  if (!isOpen) return null;

  return (
    <Modal
      title="Chi tiết phiếu đăng ký khám sức khỏe"
      open={isOpen}
      onCancel={onClose}
      footer={
        form && form.status === "PENDING" ? [
          <Button key="decline" danger onClick={handleDeclineClick}>
            Từ chối khám sức khỏe
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmClick}>
            Đồng ý khám sức khỏe
          </Button>
        ] : [
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
                  <Text>{formatDateOnly(form.studentDateOfBirth)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Trạng thái:</Text>
                  <Text style={{ color: getStatusColor(form.status) }}>
                    {getStatusText(form.status)}
                  </Text>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Section 2: Campaign Information */}
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
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Địa điểm:</Text>
                  <Text>{form.location || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày bắt đầu:</Text>
                  <Text>{formatDateOnly(form.campaignStartDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày kết thúc:</Text>
                  <Text>{formatDateOnly(form.campaignEndDate)}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Loại khám:</Text>
                  <Text>
                    {form.categories && form.categories.length > 0 
                      ? form.categories.map(cat => getHealthCheckTypeText(cat)).join(', ')
                      : 'Chưa có thông tin'
                    }
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày tạo:</Text>
                  <Text>{formatDate(form.createdAt)}</Text>
                </div>
              </Col>
              {form.campaignDescription && (
                <Col span={24}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Mô tả chiến dịch:</Text>
                    <Text>{form.campaignDescription}</Text>
                  </div>
                </Col>
              )}
              {form.campaignNotes && (
                <Col span={24}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ghi chú chiến dịch:</Text>
                    <Text>{form.campaignNotes}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>

          <Divider />

          {/* Section 3: Appointment Information */}
          {(form.appointmentTime || form.appointmentLocation) && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Thông tin lịch hẹn
                </Title>
                <Row gutter={[24, 16]}>
                  {form.appointmentTime && (
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Thời gian hẹn:</Text>
                        <Text>{formatDate(form.appointmentTime)}</Text>
                      </div>
                    </Col>
                  )}
                  {form.appointmentLocation && (
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Địa điểm khám:</Text>
                        <Text>{form.appointmentLocation}</Text>
                      </div>
                    </Col>
                  )}
                  {form.checkedIn && (
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Check-in:</Text>
                        <Text style={{ color: '#52c41a' }}>
                          Đã check-in {form.checkedInAt && `lúc ${formatDate(form.checkedInAt)}`}
                        </Text>
                      </div>
                    </Col>
                  )}
                  {form.reminderSent && (
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Nhắc nhở:</Text>
                        <Text style={{ color: '#1890ff' }}>Đã gửi nhắc nhở</Text>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
              <Divider />
            </>
          )}

          {/* Section 4: Parent Information */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
              Thông tin phụ huynh
            </Title>
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Họ tên:</Text>
                  <Text>{form.parentFullName || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Số điện thoại:</Text>
                  <Text>{form.parentPhone || 'Chưa có thông tin'}</Text>
                </div>
              </Col>
            </Row>
          </div>

          {/* Section 5: Response Information */}
          {form.respondedAt && (
            <>
              <Divider />
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Thông tin phản hồi
                </Title>
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                      <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày phản hồi:</Text>
                      <Text>{formatDate(form.respondedAt)}</Text>
                    </div>
                  </Col>
                  {form.parentNote && (
                    <Col span={24}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text strong style={{ marginBottom: '8px', display: 'block' }}>Ghi chú của phụ huynh:</Text>
                        <div style={{ 
                          padding: '12px', 
                          backgroundColor: '#f5f5f5', 
                          borderRadius: '6px',
                          border: '1px solid #d9d9d9'
                        }}>
                          <Text>{form.parentNote}</Text>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Modal
          title={confirmAction === "confirm" ? "Xác nhận đồng ý" : "Xác nhận từ chối"}
          open={showConfirmDialog}
          onCancel={() => {
            setShowConfirmDialog(false);
            setNotes("");
          }}
          footer={[
            <Button key="cancel" onClick={() => {
              setShowConfirmDialog(false);
              setNotes("");
            }}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type={confirmAction === "confirm" ? "primary" : "danger"}
              loading={submitting}
              disabled={confirmAction === "decline" && !notes.trim()}
              onClick={handleConfirmSubmit}
            >
              {confirmAction === "confirm" ? "Xác nhận đồng ý" : "Xác nhận từ chối"}
            </Button>
          ]}
          width={500}
        >
          <div style={{ marginBottom: '16px' }}>
            <Text>
              {confirmAction === "confirm"
                ? `Bạn có chắc chắn muốn đồng ý cho con tham gia chiến dịch khám sức khỏe "${form?.campaignName}"?`
                : `Bạn có chắc chắn muốn từ chối cho con tham gia chiến dịch khám sức khỏe "${form?.campaignName}"?`
              }
            </Text>
          </div>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              Ghi chú {confirmAction === "decline" ? "(bắt buộc)" : "(tùy chọn)"}:
            </Text>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                confirmAction === "confirm"
                  ? "Ghi chú thêm (nếu có)..."
                  : "Vui lòng ghi rõ lý do từ chối..."
              }
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

export default HealthCheckFormModal;
