import React from "react";
import { Button, Space, Tooltip, Modal, Tag, message } from "antd";
import {
  MedicineBoxOutlined,
  InfoCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { formatDate } from "./timeUtils";
import {
  getConfirmationStatusTag,
  getPreVaccinationStatusTag,
  cleanNotesForDisplay,
} from "./vaccinationCampaignUtils.jsx";
import dayjs from "dayjs";

/**
 * Check if vaccination can be performed based on scheduled time
 */
const canPerformVaccination = (campaign) => {
  if (!campaign?.scheduledDate) return false;
  
  const now = dayjs();
  
  // Handle array format from Java backend [year, month, day, hour, minute]
  let scheduledDate;
  if (Array.isArray(campaign.scheduledDate)) {
    const [year, month, day, hour = 0, minute = 0] = campaign.scheduledDate;
    scheduledDate = dayjs().year(year).month(month - 1).date(day).hour(hour).minute(minute);
  } else {
    scheduledDate = dayjs(campaign.scheduledDate);
  }
  
  // Debug logging
  console.log('[Vaccination Validation]', {
    now: now.format('YYYY-MM-DD HH:mm:ss'),
    scheduledDate: scheduledDate.format('YYYY-MM-DD HH:mm:ss'),
    campaignScheduledDate: campaign.scheduledDate,
    isArray: Array.isArray(campaign.scheduledDate),
    isSameOrAfter: now.isSameOrAfter(scheduledDate, 'minute'),
    isAfter: now.isAfter(scheduledDate),
    isSame: now.isSame(scheduledDate, 'minute'),
    canVaccinate: now.isSameOrAfter(scheduledDate, 'minute')
  });
  
  // Allow vaccination from the scheduled date onwards (compare by minute for exact time)
  return now.isSameOrAfter(scheduledDate, 'minute');
};

/**
 * Get column configuration for eligible students table
 */
export const getEligibleStudentsColumns = () => [
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
              {formatDate(v.dateOfVaccination)}
            </li>
          ))}
        </ul>
      ) : (
        <span>Không có</span>
      ),
  },
];

/**
 * Get column configuration for ineligible students table
 */
export const getIneligibleStudentsColumns = () => {
  const eligibleColumns = getEligibleStudentsColumns();
  return [
    ...eligibleColumns.slice(0, 4),
    {
      title: "Lý do không đủ điều kiện",
      dataIndex: "ineligibilityReason",
      key: "ineligibilityReason",
    },
    eligibleColumns[4],
  ];
};

/**
 * Get column configuration for vaccination forms table
 */
export const getVaccinationFormsColumns = (
  records, 
  isCampaignCompleted, 
  openVaccinationForm,
  campaign
) => [
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
    render: (date) => formatDate(date),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => {
      const canVaccinate = canPerformVaccination(campaign);
      const isConfirmedAndNotVaccinated = record.confirmationStatus === "CONFIRMED" &&
        !records.find((r) => r.vaccinationFormId === record.id);
      
      // Debug logging for button state
      console.log('[Button State]', {
        studentName: record.studentFullName,
        canVaccinate,
        isConfirmedAndNotVaccinated,
        confirmationStatus: record.confirmationStatus,
        isCampaignCompleted,
        campaignStatus: campaign?.status,
        buttonDisabled: isCampaignCompleted || !canVaccinate,
        reason: isCampaignCompleted ? 'Campaign completed' : !canVaccinate ? 'Time not reached' : 'Should be enabled'
      });
      
      return (
        <Space size="small">
          {isConfirmedAndNotVaccinated ? (
            <Tooltip
              title={
                !canVaccinate
                  ? `Chỉ có thể tiêm chủng từ ${formatDate(campaign?.scheduledDate)} trở đi`
                  : isCampaignCompleted
                  ? "Chiến dịch đã hoàn thành"
                  : "Thực hiện tiêm chủng"
              }
            >
              <Button
                type="primary"
                size="small"
                onClick={() => openVaccinationForm(record)}
                icon={<MedicineBoxOutlined />}
                disabled={isCampaignCompleted || !canVaccinate}
              >
                Tiêm chủng
              </Button>
            </Tooltip>
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
      );
    },
  },
];

/**
 * Get column configuration for vaccination records table
 */
export const getVaccinationRecordsColumns = (
  isCampaignCompleted, 
  openEditNotesModal
) => [
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
    render: (date) => formatDate(date),
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
    render: (notes, record) => cleanNotesForDisplay(notes, record),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <Space size="small">
        <Tooltip
          title={
            isCampaignCompleted
              ? "Chiến dịch đã hoàn thành, không thể chỉnh sửa"
              : "Chỉnh sửa ghi chú"
          }
        >
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditNotesModal(record)}
            disabled={isCampaignCompleted}
          />
        </Tooltip>
      </Space>
    ),
  },
];