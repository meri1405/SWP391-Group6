import React from "react";
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Space,
  Spin,
  Modal,
  Row,
  Col,
  Badge,
  Typography,
  Statistic,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileAddOutlined,
  SendOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { formatDate } from "../../../utils/timeUtils";
import { useVaccinationCampaignDetail } from "../../../hooks/useVaccinationCampaignDetail";
import {
  getStatusTag,
  calculateCampaignStatistics,
  validateCampaignPermissions,
  canGenerateFormsCheck,
  canSendFormsCheck,
} from "../../../utils/vaccinationCampaignUtils.jsx";
import {
  getEligibleStudentsColumns,
  getIneligibleStudentsColumns,
  getVaccinationFormsColumns,
  getVaccinationRecordsColumns,
} from "../../../utils/vaccinationCampaignTableConfig.jsx";
import VaccinationResultForm from "./VaccinationResultForm";
import EditVaccinationNotesForm from "./EditVaccinationNotesForm";

const { Title } = Typography;

const VaccinationCampaignDetail = ({ campaignId, onBack, onEdit }) => {
  const {
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
    
    // Actions
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
  } = useVaccinationCampaignDetail(campaignId);

  // Calculate statistics and permissions
  const statistics = calculateCampaignStatistics(forms, records);
  const permissions = validateCampaignPermissions(campaign);
  
  const canGenerateForms = canGenerateFormsCheck(campaign, forms);
  const canSendForms = canSendFormsCheck(campaign, forms);

  // Handle completion with statistics
  const handleCompleteWithStats = () => {
    handleCompleteCampaign(statistics);
  };

  // Get table columns
  const eligibleStudentsColumns = getEligibleStudentsColumns();
  const ineligibleStudentsColumns = getIneligibleStudentsColumns();
  const vaccinationFormsColumns = getVaccinationFormsColumns(
    records, 
    permissions.isCampaignCompleted, 
    openVaccinationForm
  );
  const vaccinationRecordsColumns = getVaccinationRecordsColumns(
    permissions.isCampaignCompleted, 
    openEditNotesModal
  );

  // Tab items configuration
  const getTabItems = () => {
    return [
      {
        key: "1",
        label: "Học sinh đủ điều kiện",
        children: (
          <Table
            columns={eligibleStudentsColumns}
            dataSource={
              eligibleStudents.eligibleStudents?.map((student, i) => ({
                ...student,
                key: `eligible-${i}`,
              })) || []
            }
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        ),
      },
      {
        key: "2",
        label: "Học sinh không đủ điều kiện",
        children: (
          <Table
            columns={ineligibleStudentsColumns}
            dataSource={
              eligibleStudents.ineligibleStudents?.map((student, i) => ({
                ...student,
                key: `ineligible-${i}`,
              })) || []
            }
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        ),
      },
      {
        key: "3",
        label: (
          <Badge
            count={forms.length}
            style={{ backgroundColor: forms.length ? "#1890ff" : "#d9d9d9" }}
          >
            <span style={{ padding: "0 8px" }}>Mẫu đơn tiêm chủng</span>
          </Badge>
        ),
        children: (
          <Table
            columns={vaccinationFormsColumns}
            dataSource={forms.map((form) => ({ ...form, key: form.id }))}
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        ),
      },
      {
        key: "4",
        label: (
          <Badge
            count={records.length}
            style={{ backgroundColor: records.length ? "#52c41a" : "#d9d9d9" }}
          >
            <span style={{ padding: "0 8px" }}>Kết quả tiêm chủng</span>
          </Badge>
        ),
        children: (
          <Table
            columns={vaccinationRecordsColumns}
            dataSource={records.map((record) => ({
              ...record,
              key: record.id,
            }))}
            pagination={{ pageSize: 10 }}
            loading={loading}
          />
        ),
      },
    ];
  };

  if (loading && !campaign) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "30px" }}>
          <Spin size="large" />
          <p>Đang tải thông tin chiến dịch...</p>
        </div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <ExclamationCircleOutlined
            style={{ fontSize: "48px", color: "#f5222d" }}
          />
          <Title level={4} style={{ marginTop: "16px" }}>
            Không tìm thấy thông tin chiến dịch
          </Title>
          <Button
            type="primary"
            onClick={onBack}
            icon={<ArrowLeftOutlined />}
            style={{ marginTop: "16px" }}
          >
            Quay lại
          </Button>
        </div>
      </Card>
    );
  }

  // Calculate statistics
  const {
    confirmedForms,
    rejectedForms,
    pendingForms,
    completedRecords,
    postponedRecords,
  } = statistics;

  return (
    <div className="vaccination-campaign-detail">
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            style={{ marginRight: 16 }}
          >
            Quay lại
          </Button>
          <span style={{ flex: 1 }}>
            <Title level={4} style={{ margin: 0 }}>
              {campaign.name} {getStatusTag(campaign.status)}
            </Title>
          </span>
          <Space>
            {permissions.canEditCampaign && (
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => onEdit(campaign)}
              >
                Chỉnh sửa
              </Button>
            )}

            {canGenerateForms && (
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                loading={formGenerateLoading}
                onClick={handleGenerateForms}
              >
                Tạo mẫu đơn
              </Button>
            )}

            {canSendForms && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={formSendLoading}
                onClick={handleSendForms}
              >
                {forms.some((form) => form.sentDate)
                  ? "Gửi đơn còn lại đến phụ huynh"
                  : "Gửi đơn đến phụ huynh"}
              </Button>
            )}

            {permissions.canCompleteCampaign && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={openCompleteModal}
              >
                Hoàn thành chiến dịch
              </Button>
            )}
          </Space>
        </div>

        {/* Alert for PENDING status */}
        {campaign.status === "PENDING" && (
          <Alert
            message="Chiến dịch đang chờ duyệt"
            description="Danh sách học sinh đủ điều kiện và các tính năng khác chỉ khả dụng sau khi chiến dịch được quản lý duyệt."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Descriptions title="Thông tin chiến dịch" bordered column={2}>
          <Descriptions.Item label="Tên chiến dịch">
            {campaign.name}
          </Descriptions.Item>
          <Descriptions.Item label="Loại vắc xin">
            {campaign.vaccineName}
          </Descriptions.Item>
          <Descriptions.Item label="Nhãn hiệu">
            {campaign.vaccineBrand || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Liều số">
            {campaign.doseNumber || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày thực hiện">
            {formatDate(campaign.scheduledDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Địa điểm">
            {campaign.location}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            {getStatusTag(campaign.status)}
          </Descriptions.Item>
          <Descriptions.Item label="Số vắc xin dự kiến">
            {campaign.estimatedVaccineCount}
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả" span={2}>
            {campaign.description}
          </Descriptions.Item>
          <Descriptions.Item label="Hướng dẫn chăm sóc" span={2}>
            {campaign.prePostCareInstructions}
          </Descriptions.Item>
        </Descriptions>

        <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Số học sinh đủ điều kiện"
                value={eligibleStudents.eligibleStudents.length}
                valueStyle={{ color: "#1890ff" }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã xác nhận tiêm"
                value={confirmedForms}
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã từ chối tiêm"
                value={rejectedForms}
                valueStyle={{ color: "#f5222d" }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã tiêm thành công"
                value={completedRecords}
                valueStyle={{ color: "#722ed1" }}
                prefix={<MedicineBoxOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
        />
      </Card>

      {/* Vaccination Form Modal */}
      <Modal
        title="Ghi nhận kết quả tiêm chủng"
        open={showVaccinationForm}
        onCancel={closeVaccinationForm}
        footer={null}
        width={800}
      >
        {selectedForm && (
          <VaccinationResultForm
            form={selectedForm}
            onSubmit={handleVaccinationResult}
            onCancel={closeVaccinationForm}
          />
        )}
      </Modal>

      {/* Edit Notes Modal */}
      <Modal
        title="Chỉnh sửa ghi chú kết quả tiêm chủng"
        open={showEditNotesModal}
        onCancel={closeEditNotesModal}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <EditVaccinationNotesForm
            record={selectedRecord}
            onSubmit={handleUpdateNotes}
            onCancel={closeEditNotesModal}
            loading={updatingNotes}
          />
        )}
      </Modal>

      {/* Complete Campaign Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1890ff",
            }}
          >
            Yêu cầu hoàn thành chiến dịch tiêm chủng
          </div>
        }
        open={confirmCompleteModal}
        onOk={handleCompleteWithStats}
        onCancel={closeCompleteModal}
        confirmLoading={completeCampaignLoading}
        okText="Gửi yêu cầu hoàn thành"
        cancelText="Hủy bỏ"
        width={650}
        className="completion-modal"
        okButtonProps={{
          size: "large",
          style: {
            background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
            border: "none",
            borderRadius: "8px",
            height: "45px",
            fontWeight: "600",
            fontSize: "16px",
          },
        }}
        cancelButtonProps={{
          size: "large",
          style: {
            borderRadius: "8px",
            height: "45px",
            fontWeight: "600",
            fontSize: "16px",
          },
        }}
      >
        <div style={{ padding: "20px 0" }}>
          {/* Main Question */}
          <div
            style={{
              background: "linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #91d5ff",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#262626",
                }}
              >
                Xác nhận gửi yêu cầu hoàn thành chiến dịch
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                color: "#595959",
                lineHeight: "1.6",
              }}
            >
              Bạn có chắc chắn muốn gửi yêu cầu hoàn thành chiến dịch tiêm chủng{" "}
              <strong>"{campaign?.name}"</strong> đến quản lý để phê duyệt? Sau
              khi gửi, yêu cầu sẽ được chuyển đến quản lý để xem xét và quyết
              định.
            </p>
          </div>

          {/* Statistics Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #f6ffed 0%, #f9ffed 100%)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #b7eb8f",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#262626",
                }}
              >
                Thống kê chiến dịch hiện tại
              </span>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#52c41a",
                      marginBottom: "4px",
                    }}
                  >
                    {completedRecords}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#595959",
                    }}
                  >
                    Đã tiêm chủng
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#faad14",
                      marginBottom: "4px",
                    }}
                  >
                    {postponedRecords}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#595959",
                    }}
                  >
                    Hoãn tiêm
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      color: "#f5222d",
                      marginBottom: "4px",
                    }}
                  >
                    {pendingForms}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#595959",
                    }}
                  >
                    Chưa xác nhận
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* Important Note */}
          <Alert
            message="Lưu ý quan trọng"
            description={
              <div style={{ marginTop: "8px" }}>
                <p style={{ margin: "0 0 8px 0" }}>
                  Vui lòng kiểm tra kỹ thống tin và tình hình tiêm chủng trước
                  khi gửi yêu cầu
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  Quản lý sẽ xem xét và phê duyệt yêu cầu hoàn thành chiến dịch
                  này
                </p>
                <p style={{ margin: 0 }}>
                  Sau khi được phê duyệt, chiến dịch sẽ chuyển sang trạng thái
                  "Đã hoàn thành"
                </p>
              </div>
            }
            type="info"
            showIcon
            style={{
              borderRadius: "8px",
              border: "1px solid #91d5ff",
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default VaccinationCampaignDetail;
