import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Button,
  Tabs,
  Table,
  Tag,
  Space,
  Tooltip,
  message,
  Spin,
  Modal,
  Divider,
  Row,
  Col,
  Badge,
  Typography,
  Statistic,
  Form,
  Input,
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
  CheckOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { vaccinationCampaignApi } from "../../../api/vaccinationCampaignApi";
import VaccinationResultForm from "./VaccinationResultForm";

// const { TabPane } = Tabs; // Deprecated
const { Title, Text } = Typography;
const { TextArea } = Input;

const VaccinationCampaignDetail = ({ campaignId, onBack, onEdit }) => {
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
  const [activeTab, setActiveTab] = useState("1");
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [confirmCompleteModal, setConfirmCompleteModal] = useState(false);
  const [showEditNotesModal, setShowEditNotesModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updatingNotes, setUpdatingNotes] = useState(false);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    setLoading(true);
    try {
      const campaignData = await vaccinationCampaignApi.getCampaignById(
        campaignId
      );
      setCampaign(campaignData);

      try {
        // Fetch eligible students with separate try-catch để không bị fail toàn bộ quá trình nếu chỉ một API lỗi
        const students = await vaccinationCampaignApi.getEligibleStudents(
          campaignId
        );
        setEligibleStudents(students);

        // Hiển thị thông báo nếu API trả về lỗi liên quan đến trạng thái campaign
        if (
          students.error ||
          (students.message && students.message.includes("chưa được phê duyệt"))
        ) {
          message.warning(students.message);
        }
      } catch (studentError) {
        console.error("Error fetching eligible students:", studentError);
        message.error(
          "Không thể tải danh sách học sinh đủ điều kiện tiêm chủng"
        );
        // Khởi tạo giá trị mặc định nếu API bị lỗi
        setEligibleStudents({ eligibleStudents: [], ineligibleStudents: [] });
      }

      try {
        // Fetch forms with separate try-catch
        const formsData = await vaccinationCampaignApi.getCampaignForms(
          campaignId
        );
        setForms(formsData);
      } catch (formsError) {
        console.error("Error fetching forms:", formsError);
        message.error("Không thể tải danh sách mẫu đơn tiêm chủng");
        setForms([]);
      }

      try {
        // Fetch records with separate try-catch
        const recordsData = await vaccinationCampaignApi.getCampaignRecords(
          campaignId
        );
        setRecords(recordsData);
      } catch (recordsError) {
        console.error("Error fetching vaccination records:", recordsError);
        message.error("Không thể tải danh sách kết quả tiêm chủng");
        setRecords([]);
      }
    } catch (error) {
      message.error("Không thể tải thông tin chi tiết chiến dịch");
      console.error("Error fetching campaign details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForms = async () => {
    setFormGenerateLoading(true);
    try {
      await vaccinationCampaignApi.generateForms(campaignId);
      message.success("Đã tạo mẫu đơn tiêm chủng cho học sinh đủ điều kiện");
      fetchCampaignData(); // Refresh data
    } catch (error) {
      message.error("Không thể tạo mẫu đơn tiêm chủng");
      console.error("Error generating forms:", error);
    } finally {
      setFormGenerateLoading(false);
    }
  };

  const handleSendForms = async () => {
    setFormSendLoading(true);
    try {
      await vaccinationCampaignApi.sendFormsToParents(campaignId);
      message.success("Đã gửi mẫu đơn tiêm chủng đến phụ huynh");
      fetchCampaignData(); // Refresh data
    } catch (error) {
      message.error("Không thể gửi mẫu đơn tiêm chủng");
      console.error("Error sending forms:", error);
    } finally {
      setFormSendLoading(false);
    }
  };

  const handleCompleteCampaign = async () => {
    setCompleteCampaignLoading(true);
    try {
      await vaccinationCampaignApi.completeCampaign(campaignId);
      message.success("Đã hoàn thành chiến dịch tiêm chủng");
      fetchCampaignData(); // Refresh data
      setConfirmCompleteModal(false);
    } catch (error) {
      message.error("Không thể hoàn thành chiến dịch");
      console.error("Error completing campaign:", error);
    } finally {
      setCompleteCampaignLoading(false);
    }
  };

  const openVaccinationForm = (form) => {
    setSelectedForm(form);
    setShowVaccinationForm(true);
  };

  const openEditNotesModal = (record) => {
    setSelectedRecord(record);
    setShowEditNotesModal(true);
  };

  const handleUpdateNotes = async (values) => {
    if (!selectedRecord) return;

    setUpdatingNotes(true);
    try {
      await vaccinationCampaignApi.updateVaccinationRecord(selectedRecord.id, {
        notes: values.notes,
      });
      message.success("Đã cập nhật ghi chú thành công");
      setShowEditNotesModal(false);
      setSelectedRecord(null);
      fetchCampaignData(); // Refresh data
    } catch (error) {
      message.error("Không thể cập nhật ghi chú");
      console.error("Error updating vaccination record notes:", error);
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleVaccinationResult = async (recordData) => {
    try {
      if (!selectedForm) return;

      await vaccinationCampaignApi.createVaccinationRecord(
        selectedForm.id,
        recordData
      );
      message.success("Đã ghi nhận kết quả tiêm chủng");
      setShowVaccinationForm(false);
      fetchCampaignData(); // Refresh data
    } catch (error) {
      message.error("Không thể ghi nhận kết quả tiêm chủng");
      console.error("Error creating vaccination record:", error);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Chưa duyệt</Tag>;
      case "APPROVED":
        return <Tag color="green">Đã duyệt</Tag>;
      case "REJECTED":
        return <Tag color="red">Đã từ chối</Tag>;
      case "IN_PROGRESS":
        return <Tag color="blue">Đang thực hiện</Tag>;
      case "COMPLETED":
        return <Tag color="purple">Đã hoàn thành</Tag>;
      case "CANCELLED":
        return <Tag color="gray">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getConfirmationStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Chưa xác nhận</Tag>;
      case "CONFIRMED":
        return <Tag color="green">Đã xác nhận</Tag>;
      case "REJECTED":
        return <Tag color="red">Đã từ chối</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPreVaccinationStatusTag = (status) => {
    switch (status) {
      case "NORMAL":
        return <Tag color="green">Bình thường</Tag>;
      case "ABNORMAL":
        return <Tag color="red">Bất thường</Tag>;
      case "POSTPONED":
        return <Tag color="orange">Hoãn tiêm</Tag>;
      default:
        return <Tag color="default">{status || "Chưa kiểm tra"}</Tag>;
    }
  };

  const eligibleStudentsColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Họ và tên",
      dataIndex: "studentFullName",
      key: "studentFullName",
      sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
    },
    {
      title: "Tuổi (tháng)",
      dataIndex: "ageInMonths",
      key: "ageInMonths",
      sorter: (a, b) => a.ageInMonths - b.ageInMonths,
    },
    {
      title: "Tiêm chủng trước đó",
      dataIndex: "previousVaccinations",
      key: "previousVaccinations",
      render: (vaccinations) =>
        vaccinations && vaccinations.length > 0 ? (
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            {vaccinations.map((v, index) => (
              <li key={index}>
                {v.vaccineName} (liều {v.doseNumber}) -{" "}
                {dayjs(v.dateOfVaccination).format("DD/MM/YYYY")}
              </li>
            ))}
          </ul>
        ) : (
          <span>Không có</span>
        ),
    },
  ];

  const ineligibleStudentsColumns = [
    ...eligibleStudentsColumns.slice(0, 4),
    {
      title: "Lý do không đủ điều kiện",
      dataIndex: "ineligibilityReason",
      key: "ineligibilityReason",
    },
    eligibleStudentsColumns[4],
  ];

  const vaccinationFormsColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Họ và tên học sinh",
      dataIndex: "studentFullName",
      key: "studentFullName",
      sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
    },
    {
      title: "Lớp",
      dataIndex: "studentClassName",
      key: "studentClassName",
      render: (className) => className || "N/A",
    },
    {
      title: "Phụ huynh",
      dataIndex: "parentFullName",
      key: "parentFullName",
    },
    {
      title: "Trạng thái",
      dataIndex: "confirmationStatus",
      key: "confirmationStatus",
      render: (status) => getConfirmationStatusTag(status),
      filters: [
        { text: "Chưa xác nhận", value: "PENDING" },
        { text: "Đã xác nhận", value: "CONFIRMED" },
        { text: "Đã từ chối", value: "REJECTED" },
      ],
      onFilter: (value, record) => record.confirmationStatus === value,
    },
    {
      title: "Ngày gửi",
      dataIndex: "sentDate",
      key: "sentDate",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "Chưa gửi",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          {record.confirmationStatus === "CONFIRMED" &&
          !records.find((r) => r.vaccinationFormId === record.id) ? (
            <Button
              type="primary"
              size="small"
              onClick={() => openVaccinationForm(record)}
              icon={<MedicineBoxOutlined />}
            >
              Tiêm chủng
            </Button>
          ) : (
            <Tooltip title="Xem ghi chú">
              <Button
                type="default"
                size="small"
                icon={<InfoCircleOutlined />}
                onClick={() => {
                  if (record.parentNotes) {
                    Modal.info({
                      title: "Ghi chú của phụ huynh",
                      content: record.parentNotes,
                      okText: "Đóng",
                    });
                  } else {
                    message.info("Không có ghi chú");
                  }
                }}
                disabled={!record.parentNotes}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const vaccinationRecordsColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
    },
    {
      title: "Họ và tên học sinh",
      dataIndex: "studentFullName",
      key: "studentFullName",
      sorter: (a, b) => a.studentFullName.localeCompare(b.studentFullName),
    },
    {
      title: "Ngày tiêm",
      dataIndex: "vaccinationDate",
      key: "vaccinationDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tình trạng trước tiêm",
      dataIndex: "preVaccinationStatus",
      key: "preVaccinationStatus",
      render: (status) => getPreVaccinationStatusTag(status),
    },
    {
      title: "Số lô vắc xin",
      dataIndex: "lotNumber",
      key: "lotNumber",
    },
    {
      title: "Y tá thực hiện",
      dataIndex: "administeredBy",
      key: "administeredBy",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      render: (notes, record) => {
        // Nếu trạng thái bất thường hoặc hoãn tiêm, hiển thị lý do
        if (
          record.preVaccinationStatus === "ABNORMAL" ||
          record.preVaccinationStatus === "POSTPONED"
        ) {
          return record.preVaccinationNotes || "Không có lý do";
        }

        // Đối với trạng thái bình thường, lọc bỏ thông tin preVaccinationStatus khỏi notes
        if (notes) {
          // Loại bỏ phần "Pre-vaccination status: ..." khỏi ghi chú
          const cleanNotes = notes
            .replace(/Pre-vaccination status: [^;]+;?\s*/g, "")
            .replace(/^\s*;\s*/, "") // Loại bỏ dấu ; đầu
            .trim();

          return cleanNotes || "Không có";
        }

        return "Không có";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa ghi chú">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditNotesModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Tạo items config cho Tabs mới
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
  const confirmedForms = forms.filter(
    (form) => form.confirmationStatus === "CONFIRMED"
  ).length;
  const rejectedForms = forms.filter(
    (form) => form.confirmationStatus === "REJECTED"
  ).length;
  const pendingForms = forms.filter(
    (form) => form.confirmationStatus === "PENDING"
  ).length;
  const completedRecords = records.filter(
    (record) => record.preVaccinationStatus === "NORMAL"
  ).length;
  const postponedRecords = records.filter(
    (record) =>
      record.preVaccinationStatus === "ABNORMAL" ||
      record.preVaccinationStatus === "POSTPONED"
  ).length;

  const canEditCampaign = campaign.status === "PENDING";
  const canGenerateForms = campaign.status === "APPROVED" && forms.length === 0;
  const canSendForms =
    campaign.status === "APPROVED" &&
    forms.length > 0 &&
    !forms.some((form) => form.sentDate);
  const canCompleteCampaign = campaign.status === "APPROVED";

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
            {canEditCampaign && (
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
                Gửi đơn đến phụ huynh
              </Button>
            )}

            {canCompleteCampaign && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setConfirmCompleteModal(true)}
              >
                Hoàn thành chiến dịch
              </Button>
            )}
          </Space>
        </div>

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
            {dayjs(campaign.scheduledDate).format("DD/MM/YYYY HH:mm")}
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
        onCancel={() => setShowVaccinationForm(false)}
        footer={null}
        width={800}
      >
        {selectedForm && (
          <VaccinationResultForm
            form={selectedForm}
            onSubmit={handleVaccinationResult}
            onCancel={() => setShowVaccinationForm(false)}
          />
        )}
      </Modal>

      {/* Edit Notes Modal */}
      <Modal
        title="Chỉnh sửa ghi chú kết quả tiêm chủng"
        open={showEditNotesModal}
        onCancel={() => {
          setShowEditNotesModal(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <EditVaccinationNotesForm
            record={selectedRecord}
            onSubmit={handleUpdateNotes}
            onCancel={() => {
              setShowEditNotesModal(false);
              setSelectedRecord(null);
            }}
            loading={updatingNotes}
          />
        )}
      </Modal>

      {/* Complete Campaign Modal */}
      <Modal
        title="Xác nhận hoàn thành chiến dịch"
        open={confirmCompleteModal}
        onOk={handleCompleteCampaign}
        onCancel={() => setConfirmCompleteModal(false)}
        confirmLoading={completeCampaignLoading}
      >
        <p>
          Bạn có chắc chắn muốn hoàn thành chiến dịch tiêm chủng này? Hành động
          này không thể hoàn tác.
        </p>
        <p>
          Tổng số học sinh đã tiêm: <strong>{completedRecords}</strong>
        </p>
        <p>
          Tổng số học sinh hoãn tiêm: <strong>{postponedRecords}</strong>
        </p>
        <p>
          Tổng số mẫu đơn phụ huynh chưa xác nhận:{" "}
          <strong>{pendingForms}</strong>
        </p>
      </Modal>
    </div>
  );
};

// Component for editing vaccination notes
const EditVaccinationNotesForm = ({ record, onSubmit, onCancel, loading }) => {
  const [form] = Form.useForm();

  const getCurrentNotes = () => {
    // Lấy ghi chú hiện tại dựa trên trạng thái
    if (
      record.preVaccinationStatus === "ABNORMAL" ||
      record.preVaccinationStatus === "POSTPONED"
    ) {
      return record.preVaccinationNotes || "";
    }

    // Lọc bỏ phần preVaccinationStatus khỏi notes để lấy ghi chú thực
    if (record.notes) {
      const cleanNotes = record.notes
        .replace(/Pre-vaccination status: [^;]+;?\s*/g, "")
        .replace(/^\s*;\s*/, "")
        .trim();
      return cleanNotes || "";
    }

    return "";
  };

  const getPreVaccinationStatusText = (status) => {
    switch (status) {
      case "NORMAL":
        return "Bình thường";
      case "ABNORMAL":
        return "Bất thường";
      case "POSTPONED":
        return "Hoãn tiêm";
      default:
        return status || "Chưa xác định";
    }
  };

  return (
    <div>
      {/* Thông tin chỉ đọc */}
      <Alert
        message="Thông tin kết quả tiêm chủng"
        description={
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p>
                  <strong>Học sinh:</strong> {record.studentFullName}
                </p>
                <p>
                  <strong>Mã học sinh:</strong> {record.studentCode}
                </p>
                <p>
                  <strong>Ngày tiêm:</strong>{" "}
                  {dayjs(record.vaccinationDate).format("DD/MM/YYYY HH:mm")}
                </p>
              </Col>
              <Col span={12}>
                <p>
                  <strong>Tình trạng trước tiêm:</strong>{" "}
                  {getPreVaccinationStatusText(record.preVaccinationStatus)}
                </p>
                <p>
                  <strong>Số lô vắc xin:</strong> {record.lotNumber}
                </p>
                <p>
                  <strong>Y tá thực hiện:</strong> {record.administeredBy}
                </p>
              </Col>
            </Row>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Form chỉnh sửa ghi chú */}
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{
          notes: getCurrentNotes(),
        }}
      >
        <Form.Item
          name="notes"
          label={
            record.preVaccinationStatus === "ABNORMAL" ||
            record.preVaccinationStatus === "POSTPONED"
              ? "Lý do không thể tiêm / hoãn tiêm"
              : "Ghi chú"
          }
        >
          <TextArea
            rows={4}
            placeholder={
              record.preVaccinationStatus === "ABNORMAL" ||
              record.preVaccinationStatus === "POSTPONED"
                ? "Nhập lý do chi tiết..."
                : "Nhập ghi chú thêm (nếu có)..."
            }
          />
        </Form.Item>

        <Form.Item>
          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={onCancel}>Hủy</Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Lưu thay đổi
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default VaccinationCampaignDetail;
