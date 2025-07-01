import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Button,
  Spin,
  Tabs,
  Table,
  Tag,
  Space,
  message,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  PlayCircleOutlined,
  CheckOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { healthCheckApi } from "../../../api/healthCheckApi";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

const HealthCheckCampaignDetail = ({ campaignId, onBack, onEdit }) => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: null,
    title: "",
    message: "",
  });
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    console.log(
      "🚀 RELOAD DEBUG: fetchCampaignDetails called for campaignId:",
      campaignId
    );
    setLoading(true);
    try {
      console.log("📡 RELOAD DEBUG: Calling getCampaignById API...");
      const data = await healthCheckApi.getCampaignById(campaignId);
      console.log("📥 RELOAD DEBUG: Campaign data received:", {
        id: data.id,
        name: data.name,
        status: data.status,
        minAge: data.minAge,
        maxAge: data.maxAge,
        targetClasses: data.targetClasses,
        fullData: data,
      });

      setCampaign(data);
      console.log("✅ RELOAD DEBUG: Campaign state updated");

      // If campaign has started, fetch results
      if (data.status === "IN_PROGRESS" || data.status === "COMPLETED") {
        console.log(
          "📊 RELOAD DEBUG: Campaign in progress/completed, fetching results..."
        );
        fetchResults();
      }

      // If campaign is approved, fetch eligible students
      if (data.status === "APPROVED") {
        console.log(
          "🎯 RELOAD DEBUG: Campaign is APPROVED, about to fetch eligible students..."
        );
        console.log(
          "🔍 RELOAD DEBUG: Campaign data being passed to fetchEligibleStudents:",
          {
            name: data.name,
            minAge: data.minAge,
            maxAge: data.maxAge,
            targetClasses: data.targetClasses,
            status: data.status,
          }
        );

        // Add small delay to ensure state is updated
        setTimeout(() => {
          console.log(
            "⏰ RELOAD DEBUG: Delayed call to fetchEligibleStudents..."
          );
          fetchEligibleStudents(data);
        }, 100);
      } else {
        console.log(
          `ℹ️ RELOAD DEBUG: Campaign status is ${data.status}, not fetching eligible students`
        );
      }
    } catch (error) {
      console.error("❌ RELOAD DEBUG: Error fetching campaign details:", error);
      message.error("Không thể tải thông tin chi tiết đợt khám");
    } finally {
      setLoading(false);
      console.log("🏁 RELOAD DEBUG: fetchCampaignDetails completed");
    }
  };

  const fetchResults = async () => {
    setResultsLoading(true);
    try {
      const data = await healthCheckApi.getResultsByCampaign(campaignId);
      setResults(data);
    } catch (error) {
      console.error("Error fetching campaign results:", error);
      message.error("Không thể tải kết quả khám sức khỏe");
      setResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchEligibleStudents = async (campaignData = null) => {
    console.log("🎯 RELOAD DEBUG: fetchEligibleStudents START");
    console.log("📋 RELOAD DEBUG: Function called with params:", {
      campaignData: campaignData ? "PROVIDED" : "NULL",
      campaignState: campaign ? "EXISTS" : "NULL",
      campaignId: campaignId,
    });

    setStudentsLoading(true);
    try {
      // Use the provided campaign data or fall back to current state
      const dataToUse = campaignData || campaign;

      console.log("🔍 RELOAD DEBUG: Data selection logic:", {
        campaignId,
        providedData: !!campaignData,
        currentCampaignState: !!campaign,
        selectedDataSource: campaignData ? "PROVIDED_PARAM" : "CURRENT_STATE",
        dataToUse: dataToUse
          ? {
              name: dataToUse.name,
              minAge: dataToUse.minAge,
              maxAge: dataToUse.maxAge,
              targetClasses: dataToUse.targetClasses,
              targetCount: dataToUse.targetCount,
              status: dataToUse.status,
            }
          : null,
      });

      if (!dataToUse) {
        console.error(
          "❌ RELOAD DEBUG: No campaign data available - ABORTING!"
        );
        message.error(
          "Không có thông tin chiến dịch để tải danh sách học sinh"
        );
        return;
      }

      // Show campaign criteria to user for debugging
      const criteriaDisplay = [
        dataToUse.minAge !== null && dataToUse.minAge !== undefined
          ? `Tuổi tối thiểu: ${dataToUse.minAge}`
          : null,
        dataToUse.maxAge !== null && dataToUse.maxAge !== undefined
          ? `Tuổi tối đa: ${dataToUse.maxAge}`
          : null,
        dataToUse.targetClasses && dataToUse.targetClasses.length > 0
          ? `Lớp mục tiêu: ${
              Array.isArray(dataToUse.targetClasses)
                ? dataToUse.targetClasses.join(", ")
                : "N/A"
            }`
          : "Tất cả các lớp",
      ]
        .filter(Boolean)
        .join(" | ");

      console.log(`📋 RELOAD DEBUG: Campaign criteria: ${criteriaDisplay}`);

      // Pass campaign data to ensure we use the same filtering criteria
      console.log(
        "📡 RELOAD DEBUG: About to call API getEligibleStudentsWithStatus..."
      );
      console.log("🔗 RELOAD DEBUG: API call parameters:", {
        campaignId: campaignId,
        campaignData: {
          minAge: dataToUse.minAge,
          maxAge: dataToUse.maxAge,
          targetClasses: dataToUse.targetClasses,
        },
      });

      const apiStartTime = Date.now();
      const data = await healthCheckApi.getEligibleStudentsWithStatus(
        campaignId,
        dataToUse
      );
      const apiEndTime = Date.now();

      console.log(
        `⏱️ RELOAD DEBUG: API call completed in ${apiEndTime - apiStartTime}ms`
      );
      console.log("📥 RELOAD DEBUG: Raw API response:", {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : "N/A",
        sample: Array.isArray(data) && data.length > 0 ? data[0] : null,
        fullResponse: data,
      });

      // Ensure data is an array
      const studentsArray = Array.isArray(data) ? data : [];
      console.log(
        `🔄 RELOAD DEBUG: Processed students array length: ${studentsArray.length}`
      );

      setEligibleStudents(studentsArray);
      console.log("✅ RELOAD DEBUG: eligibleStudents state updated");

      if (studentsArray.length === 0) {
        console.warn(
          "⚠️ RELOAD DEBUG: ZERO eligible students found! Campaign criteria:",
          {
            minAge: dataToUse?.minAge,
            maxAge: dataToUse?.maxAge,
            targetClasses: dataToUse?.targetClasses,
            campaignStatus: dataToUse?.status,
          }
        );

        // Enhanced user message with detailed criteria
        const detailedMessage =
          `RELOAD DEBUG: Không tìm thấy học sinh nào đủ điều kiện.\n\n` +
          `Tiêu chí chiến dịch "${dataToUse.name}":\n` +
          `${criteriaDisplay}\n\n` +
          `Vui lòng kiểm tra console để debug thêm.`;

        message.warning(detailedMessage, 10); // Show for 10 seconds
      } else {
        console.log(
          `✅ RELOAD DEBUG: Successfully loaded ${studentsArray.length} eligible students`
        );

        // Show success with breakdown
        const statusBreakdown = studentsArray.reduce((acc, student) => {
          acc[student.status] = (acc[student.status] || 0) + 1;
          return acc;
        }, {});

        const breakdownText = Object.entries(statusBreakdown)
          .map(([status, count]) => `${status}: ${count}`)
          .join(", ");

        console.log(
          "📊 RELOAD DEBUG: Student status breakdown:",
          statusBreakdown
        );

        message.success(
          `RELOAD DEBUG: Đã tải ${studentsArray.length} học sinh đủ điều kiện (${breakdownText})`,
          5
        );
      }
    } catch (error) {
      console.error("❌ RELOAD DEBUG: Error in fetchEligibleStudents:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        stack: error.stack,
      });

      // Show detailed error to user
      const errorDetails = error.response?.status
        ? `Lỗi ${error.response.status}: ${
            error.response.data?.message || error.message
          }`
        : error.message;

      message.error(
        `RELOAD DEBUG: Không thể tải danh sách học sinh đủ điều kiện.\nChi tiết: ${errorDetails}`,
        8
      );
      setEligibleStudents([]);
    } finally {
      setStudentsLoading(false);
      console.log("🏁 RELOAD DEBUG: fetchEligibleStudents COMPLETED");
    }
  };

  const showConfirmModal = (action, title, message) => {
    setConfirmModal({ visible: true, action, title, message });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ visible: false, action: null, title: "", message: "" });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmModal;
    hideConfirmModal();

    setLoading(true);
    try {
      let response;
      switch (action) {
        case "start":
          response = await healthCheckApi.startCampaign(campaignId);
          message.success("Đã bắt đầu đợt khám");
          break;
        case "complete":
          response = await healthCheckApi.completeCampaign(campaignId);
          message.success("Đã hoàn thành đợt khám");
          break;
        case "cancel":
          response = await healthCheckApi.cancelCampaign(
            campaignId,
            "Cancelled by nurse"
          );
          message.success("Đã hủy đợt khám");
          break;
        case "sendNotifications":
          await executeSendNotifications();
          return; // Don't update campaign state for this action
        default:
          console.warn("Unknown action:", action);
          return;
      }

      setCampaign(response);

      if (action === "start" || action === "complete") {
        fetchResults();
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      message.error(`Không thể thực hiện hành động: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (campaign && campaign.status === "PENDING") {
      onEdit(campaign);
    } else {
      message.warning("Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT");
    }
  };

  const handleSendNotifications = () => {
    showConfirmModal(
      "sendNotifications",
      "Xác nhận gửi thông báo",
      `Bạn có chắc chắn muốn gửi thông báo khám sức khỏe cho phụ huynh của các học sinh đủ điều kiện? Thông báo sẽ được gửi đến ${eligibleStudents.length} học sinh.`
    );
  };

  const executeSendNotifications = async () => {
    setSendingNotification(true);
    try {
      console.log("Sending notifications for campaign:", campaignId);
      const response = await healthCheckApi.sendNotificationsToParents(
        campaignId
      );
      console.log("Notification response:", response);

      if (response.notificationsSent > 0) {
        message.success(
          `Đã gửi thông báo thành công đến ${response.notificationsSent} phụ huynh`
        );
        setNotificationSent(true);
      } else {
        // Show detailed error message
        const errorMessage =
          response.diagnostic || "Không có thông báo nào được gửi";
        message.warning({
          content: errorMessage,
          duration: 10,
        });

        // Show possible causes if available
        if (response.possibleCauses && response.possibleCauses.length > 0) {
          console.log("Possible causes:", response.possibleCauses);
          Modal.warning({
            title: "Nguyên nhân có thể:",
            content: (
              <ul>
                {response.possibleCauses.map((cause, index) => (
                  <li key={index}>{cause}</li>
                ))}
              </ul>
            ),
            width: 600,
          });
        }
      }

      // Refresh the eligible students list to update any changes
      fetchEligibleStudents();
    } catch (error) {
      console.error("Error sending notifications:", error);
      message.error("Không thể gửi thông báo đến phụ huynh");
    } finally {
      setSendingNotification(false);
    }
  };

  const handleFixParentData = () => {
    Modal.confirm({
      title: "Khắc phục dữ liệu phụ huynh",
      content: (
        <div>
          <p>Điều này sẽ:</p>
          <ul>
            <li>✅ Kích hoạt tất cả tài khoản phụ huynh bị disabled</li>
            <li>✅ Tạo tài khoản phụ huynh mẫu cho học sinh chưa có</li>
            <li>✅ Liên kết phụ huynh với học sinh</li>
          </ul>
          <p>
            <strong>Bạn có muốn tiếp tục?</strong>
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          setSendingNotification(true);
          const response = await healthCheckApi.fixParentData(campaignId);
          message.success(
            `Đã khắc phục thành công! ${response.studentsFixed} học sinh đã có phụ huynh`
          );
          // Refresh data
          fetchEligibleStudents();
        } catch (error) {
          console.error("Error fixing parent data:", error);
          message.error("Không thể khắc phục dữ liệu phụ huynh");
        } finally {
          setSendingNotification(false);
        }
      },
    });
  };

  const handleFixTargetClasses = () => {
    Modal.confirm({
      title: "Khắc phục Target Classes",
      content: (
        <div>
          <p>
            <strong>🎯 Vấn đề phát hiện:</strong> Campaign có thể có
            targetClasses bị null/empty, gây ra lỗi "0 students found".
          </p>
          <p>Điều này sẽ:</p>
          <ul>
            <li>✅ Kiểm tra targetClasses hiện tại của campaign</li>
            <li>✅ Đặt targetClasses = ["2B"] nếu null/empty</li>
            <li>✅ Giải quyết vấn đề backend không tìm thấy học sinh</li>
          </ul>
          <p>
            <strong>Bạn có muốn tiếp tục?</strong>
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          setSendingNotification(true);
          const response = await healthCheckApi.fixTargetClasses(campaignId);

          if (response.success) {
            message.success(`🎯 Đã khắc phục thành công! ${response.message}`);
            // Refresh campaign data
            fetchCampaignDetails();
            fetchEligibleStudents();
          } else {
            message.info(response.message);
          }
        } catch (error) {
          console.error("Error fixing target classes:", error);
          message.error("Không thể khắc phục target classes");
        } finally {
          setSendingNotification(false);
        }
      },
    });
  };

  const handleResetForms = () => {
    Modal.confirm({
      title: "Reset Forms - Xóa tất cả phiếu khám",
      content: (
        <div>
          <p>
            <strong>⚠️ CẢNH BÁO:</strong> Hành động này sẽ xóa tất cả các phiếu
            khám đã tạo cho chiến dịch này!
          </p>
          <p>Điều này sẽ:</p>
          <ul>
            <li>🗑️ Xóa tất cả form/phiếu khám hiện có</li>
            <li>📤 Cho phép gửi lại thông báo tới phụ huynh</li>
            <li>🔄 Reset trạng thái "Chưa phản hồi" cho tất cả học sinh</li>
          </ul>
          <p>
            <strong style={{ color: "red" }}>
              Tất cả phản hồi từ phụ huynh sẽ bị mất!
            </strong>
          </p>
          <p>
            <strong>Bạn có chắc chắn muốn tiếp tục?</strong>
          </p>
        </div>
      ),
      okText: "Có, Reset Forms",
      okType: "danger",
      onOk: async () => {
        try {
          setSendingNotification(true);
          const response = await healthCheckApi.resetCampaignForms(campaignId);

          if (response.status === "success") {
            message.success(
              `🔄 Đã reset thành công! Đã xóa ${response.formsDeleted} phiếu khám.`
            );
            // Refresh data
            fetchCampaignDetails();
            fetchEligibleStudents();
            setNotificationSent(false); // Reset notification sent state
          } else {
            message.info(response.message);
          }
        } catch (error) {
          console.error("Error resetting forms:", error);
          message.error("Không thể reset forms");
        } finally {
          setSendingNotification(false);
        }
      },
    });
  };

  const testDirectApiCalls = async () => {
    if (!campaign) return;

    console.log("🧪 === DIRECT API DEBUG TEST ===");
    console.log("Campaign data:", {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      minAge: campaign.minAge,
      maxAge: campaign.maxAge,
      targetClasses: campaign.targetClasses,
      targetCount: campaign.targetCount,
    });

    // Create axios client with same config as the API
    const token = localStorage.getItem("token");
    const apiClient = axios.create({
      baseURL: "http://localhost:8080/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    try {
      // Test 1: Basic forms endpoint
      console.log("🧪 Test 1: Get forms for campaign...");
      const formsResponse = await apiClient.get(
        `/health-check/forms/campaign/${campaign.id}`
      );
      console.log("Forms response:", formsResponse.data);

      // Test 2: Direct eligible students endpoint without filters
      console.log("🧪 Test 2: Get eligible students without filters...");
      const basicStudentsResponse = await apiClient.get(
        `/health-check/forms/campaign/${campaign.id}/eligible-students`
      );
      console.log("Basic students response:", basicStudentsResponse.data);

      // Test 3: Direct eligible students endpoint with filters
      if (campaign.targetClasses && campaign.targetClasses.length > 0) {
        console.log("🧪 Test 3: Get eligible students with class filters...");
        const params = new URLSearchParams();
        campaign.targetClasses.forEach((className) => {
          if (className && className.trim()) {
            params.append("classNames", className.trim());
          }
        });
        if (campaign.minAge) params.append("minAge", campaign.minAge);
        if (campaign.maxAge) params.append("maxAge", campaign.maxAge);

        const filteredUrl = `/health-check/forms/campaign/${
          campaign.id
        }/eligible-students?${params.toString()}`;
        console.log("Filtered URL:", filteredUrl);

        const filteredStudentsResponse = await apiClient.get(filteredUrl);
        console.log(
          "Filtered students response:",
          filteredStudentsResponse.data
        );
      }

      // Test 4: Alternative student endpoint
      console.log("🧪 Test 4: Try alternative student endpoint...");
      try {
        const altResponse = await apiClient.get(
          `/students/eligible-for-campaign/${campaign.id}`
        );
        console.log("Alternative endpoint response:", altResponse.data);
      } catch (altError) {
        console.log("Alternative endpoint failed:", altError.message);
      }

      // Test 5: Check if any students exist in system
      console.log("🧪 Test 5: Check all students in system...");
      try {
        const allStudentsResponse = await apiClient.get("/students");
        console.log("All students response:", {
          count: Array.isArray(allStudentsResponse.data)
            ? allStudentsResponse.data.length
            : "Not array",
          sample:
            Array.isArray(allStudentsResponse.data) &&
            allStudentsResponse.data.length > 0
              ? allStudentsResponse.data[0]
              : null,
        });
      } catch (studentsError) {
        console.log("All students endpoint failed:", studentsError.message);
      }

      message.success(
        "🧪 Debug test completed! Check console for detailed results.",
        8
      );
    } catch (error) {
      console.error("🧪 Debug test failed:", error);
      message.error(
        `Debug test failed: ${error.response?.status || "Unknown"} - ${
          error.message
        }`
      );
    }
  };

  const getActionButtons = () => {
    if (!campaign) return null;

    const buttons = [];

    switch (campaign.status) {
      case "APPROVED":
        buttons.push(
          <Button
            key="start"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() =>
              showConfirmModal(
                "start",
                "Xác nhận bắt đầu",
                "Bạn có chắc chắn muốn bắt đầu đợt khám này?"
              )
            }
          >
            Bắt đầu khám
          </Button>
        );
        break;
      case "IN_PROGRESS":
        buttons.push(
          <Button
            key="complete"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() =>
              showConfirmModal(
                "complete",
                "Xác nhận hoàn thành",
                "Bạn có chắc chắn muốn đánh dấu đợt khám này là đã hoàn thành?"
              )
            }
          >
            Hoàn thành
          </Button>
        );
        break;
      default:
        break;
    }

    // Add cancel button for certain statuses
    if (["PENDING", "APPROVED"].includes(campaign.status)) {
      buttons.push(
        <Button
          key="cancel"
          danger
          icon={<CloseCircleOutlined />}
          onClick={() =>
            showConfirmModal(
              "cancel",
              "Xác nhận hủy",
              "Bạn có chắc chắn muốn hủy đợt khám này?"
            )
          }
        >
          Hủy
        </Button>
      );
    }

    return buttons;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange">Chưa duyệt</Tag>;
      case "APPROVED":
        return <Tag color="green">Đã duyệt</Tag>;
      case "IN_PROGRESS":
        return <Tag color="processing">Đang diễn ra</Tag>;
      case "COMPLETED":
        return <Tag color="success">Đã hoàn thành</Tag>;
      case "CANCELED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getResultStatusTag = (status) => {
    switch (status) {
      case "NORMAL":
        return <Tag color="green">Bình thường</Tag>;
      case "ABNORMAL":
        return <Tag color="red">Bất thường</Tag>;
      case "NEEDS_FOLLOWUP":
        return <Tag color="orange">Cần theo dõi</Tag>;
      case "NEEDS_TREATMENT":
        return <Tag color="volcano">Cần điều trị</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const resultColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Tên học sinh",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Loại khám",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getResultStatusTag(status),
    },
    {
      title: "Ghi chú",
      dataIndex: "resultNotes",
      key: "resultNotes",
      ellipsis: true,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
  ];

  const eligibleStudentsColumns = [
    {
      title: "Mã học sinh",
      dataIndex: "studentCode",
      key: "studentCode",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      width: 100,
    },
    {
      title: "Tuổi",
      dataIndex: "ageDisplay",
      key: "ageDisplay",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "statusDisplay",
      key: "statusDisplay",
      width: 150,
      render: (statusDisplay, record) => {
        const { status } = record;
        let color = "default";
        if (status === "CONFIRMED") {
          color = "green";
        } else if (status === "DECLINED") {
          color = "red";
        } else if (status === "PENDING") {
          color = "orange";
        } else {
          color = "orange"; // Default to orange for "Chưa phản hồi"
        }
        return <Tag color={color}>{statusDisplay}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p>Đang tải thông tin đợt khám...</p>
        </div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "30px" }}>
          <Title level={4}>Không tìm thấy thông tin đợt khám</Title>
          <Button type="primary" onClick={onBack}>
            Quay lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              style={{ marginRight: 16 }}
              onClick={onBack}
            />
            <span>Chi tiết đợt khám sức khỏe</span>
          </div>
        }
        extra={
          <Space>
            {campaign && campaign.status === "PENDING" && (
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                Chỉnh sửa
              </Button>
            )}
            {getActionButtons()}
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "info",
              label: "Thông tin chung",
              children: (
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <Card variant="outlined">
                      <Title level={4}>{campaign.name}</Title>
                      <div style={{ marginBottom: 16 }}>
                        {getStatusTag(campaign.status)}
                      </div>
                      <Paragraph>{campaign.description}</Paragraph>
                    </Card>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Card title="Thông tin đợt khám" variant="outlined">
                      <Descriptions column={1}>
                        <Descriptions.Item label="Mã đợt khám">
                          #{campaign.id}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian bắt đầu">
                          {dayjs(campaign.startDate).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian kết thúc">
                          {dayjs(campaign.endDate).format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa điểm">
                          {campaign.location}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tạo">
                          {campaign.nurse?.fullName || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                          {dayjs(campaign.createdAt).format("DD/MM/YYYY HH:mm")}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col xs={24} sm={24} md={12}>
                    <Card title="Phạm vi khám" variant="outlined">
                      <Descriptions column={1}>
                        <Descriptions.Item label="Độ tuổi">
                          {campaign.minAge} - {campaign.maxAge} tuổi
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp mục tiêu">
                          {campaign.targetClasses || "Tất cả các lớp"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại khám">
                          <div>
                            {campaign.categories?.map((category) => (
                              <Tag
                                key={category}
                                color="blue"
                                style={{ marginBottom: 4 }}
                              >
                                {category === "VISION" && "Khám mắt"}
                                {category === "HEARING" && "Khám tai"}
                                {category === "ORAL" && "Khám răng miệng"}
                                {category === "SKIN" && "Khám da liễu"}
                                {category === "RESPIRATORY" && "Khám hô hấp"}
                              </Tag>
                            ))}
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  {campaign.status !== "PENDING" && (
                    <Col span={24}>
                      <Card title="Thống kê" variant="outlined">
                        <Row gutter={16}>
                          <Col span={6}>
                            <Statistic
                              title="Học sinh đủ điều kiện"
                              value={
                                campaign.status === "APPROVED"
                                  ? eligibleStudents.length
                                  : campaign.targetCount || 0
                              }
                              prefix={<UserOutlined />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Đã khám"
                              value={results.length}
                              suffix={
                                campaign.status === "APPROVED"
                                  ? `/ ${eligibleStudents.length}`
                                  : `/ ${campaign.targetCount || 0}`
                              }
                              prefix={<CheckCircleOutlined />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Kết quả bất thường"
                              value={
                                results.filter(
                                  (r) =>
                                    r.status === "ABNORMAL" ||
                                    r.status === "NEEDS_FOLLOWUP" ||
                                    r.status === "NEEDS_TREATMENT"
                                ).length
                              }
                              prefix={<CloseCircleOutlined />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Tiến độ"
                              value={
                                campaign.status === "APPROVED" &&
                                eligibleStudents.length > 0
                                  ? Math.round(
                                      (results.length /
                                        eligibleStudents.length) *
                                        100
                                    )
                                  : campaign.targetCount
                                  ? Math.round(
                                      (results.length / campaign.targetCount) *
                                        100
                                    )
                                  : 0
                              }
                              suffix="%"
                            />
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  )}

                  {/* Eligible Students List - shown when campaign is approved */}
                  {campaign.status === "APPROVED" && (
                    <Col span={24}>
                      <Card
                        title="Danh sách học sinh đủ điều kiện"
                        variant="outlined"
                      >
                        {/* Statistics Row */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                          <Col span={6}>
                            <Statistic
                              title="Tổng số học sinh"
                              value={eligibleStudents.length}
                              prefix={<UserOutlined />}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Đã xác nhận"
                              value={
                                eligibleStudents.filter(
                                  (s) => s.status === "CONFIRMED"
                                ).length
                              }
                              prefix={<CheckCircleOutlined />}
                              valueStyle={{ color: "#52c41a" }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Từ chối"
                              value={
                                eligibleStudents.filter(
                                  (s) => s.status === "DECLINED"
                                ).length
                              }
                              prefix={<CloseCircleOutlined />}
                              valueStyle={{ color: "#ff4d4f" }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Chưa phản hồi"
                              value={
                                eligibleStudents.filter(
                                  (s) =>
                                    s.status === "PENDING" ||
                                    s.status === "NO_FORM"
                                ).length
                              }
                              prefix={<UsergroupAddOutlined />}
                              valueStyle={{ color: "#faad14" }}
                            />
                          </Col>
                        </Row>

                        <div style={{ marginBottom: 16 }}>
                          <Space>
                            <Button
                              type="primary"
                              icon={<SendOutlined />}
                              onClick={handleSendNotifications}
                              loading={sendingNotification}
                              disabled={notificationSent}
                            >
                              {notificationSent
                                ? "Đã gửi thông báo"
                                : "Gửi thông báo cho phụ huynh"}
                            </Button>
                            <Button
                              icon={<UsergroupAddOutlined />}
                              onClick={() => fetchEligibleStudents(campaign)}
                              loading={studentsLoading}
                            >
                              Làm mới danh sách
                            </Button>
                            <Button
                              type="dashed"
                              danger
                              onClick={handleFixParentData}
                              loading={sendingNotification}
                            >
                              🔧 Fix Parent Data
                            </Button>
                            <Button
                              type="dashed"
                              onClick={handleFixTargetClasses}
                              loading={sendingNotification}
                            >
                              🎯 Fix Target Classes
                            </Button>
                            <Button
                              type="dashed"
                              onClick={handleResetForms}
                              loading={sendingNotification}
                            >
                              🔄 Reset Forms
                            </Button>
                            <Button
                              type="dashed"
                              danger
                              onClick={testDirectApiCalls}
                              style={{ marginLeft: 8 }}
                            >
                              🧪 Debug API
                            </Button>
                          </Space>
                        </div>

                        <Table
                          columns={eligibleStudentsColumns}
                          dataSource={eligibleStudents.map((student) => ({
                            ...student,
                            key: student.studentID || student.studentCode,
                          }))}
                          loading={studentsLoading}
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 800 }}
                        />
                      </Card>
                    </Col>
                  )}
                </Row>
              ),
            },
            {
              key: "results",
              label: "Kết quả khám",
              disabled:
                campaign.status !== "IN_PROGRESS" &&
                campaign.status !== "COMPLETED",
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Button onClick={fetchResults} loading={resultsLoading}>
                      <FileTextOutlined /> Làm mới kết quả
                    </Button>
                  </div>

                  <Table
                    columns={resultColumns}
                    dataSource={results.map((result) => ({
                      ...result,
                      key: result.id,
                    }))}
                    loading={resultsLoading}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={confirmModal.title}
        open={confirmModal.visible}
        onOk={handleConfirmAction}
        onCancel={hideConfirmModal}
        confirmLoading={loading}
      >
        <p>{confirmModal.message}</p>
      </Modal>
    </>
  );
};

export default HealthCheckCampaignDetail;
