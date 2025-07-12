import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { CAMPAIGN_STATUS_LABELS, HEALTH_CHECK_CATEGORY_LABELS } from '../api/healthCheckApi';

/**
 * Utility functions for health check campaign operations
 * Contains data transformations, formatting, and UI helpers
 */

/**
 * Convert Java date array to dayjs object
 */
export const convertJavaDateArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray)) return null;
  try {
    const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
    return dayjs(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`);
  } catch (error) {
    console.error("Error converting date array:", dateArray, error);
    return null;
  }
};

/**
 * Get status tag component for campaign status
 */
export const getStatusTag = (status) => {
  const label = CAMPAIGN_STATUS_LABELS[status] || status;
  switch(status) {
    case 'PENDING':
      return <Tag color="orange">{label}</Tag>;
    case 'APPROVED':
      return <Tag color="green">{label}</Tag>;
    case 'REJECTED':
      return <Tag color="red">{label}</Tag>;
    case 'IN_PROGRESS':
      return <Tag color="processing">{label}</Tag>;
    case 'COMPLETED':
      return <Tag color="success">{label}</Tag>;
    case 'SCHEDULED':
      return <Tag color="blue">{label}</Tag>;
    default:
      return <Tag color="default">{label}</Tag>;
  }
};

/**
 * Get result status tag component
 */
export const getResultStatusTag = (status) => {
  switch(status) {
    case 'NORMAL':
      return <Tag color="green">Bình thường</Tag>;
    case 'ABNORMAL':
      return <Tag color="red">Bất thường</Tag>;
    case 'NEEDS_FOLLOWUP':
      return <Tag color="orange">Cần theo dõi</Tag>;
    case 'NEEDS_TREATMENT':
      return <Tag color="volcano">Cần điều trị</Tag>;
    default:
      return <Tag color="default">{status}</Tag>;
  }
};

/**
 * Transform backend results data for table display
 */
export const transformResultsForTable = (resultsData) => {
  const flattenedResults = [];
  
  resultsData.forEach((studentData) => {
    const { fullName, className, results = {} } = studentData;
    
    // Create a row for each category that has results
    Object.entries(results).forEach(([category, categoryData]) => {
      flattenedResults.push({
        id: `${studentData.studentID}-${category}`,
        studentName: fullName,
        className: className,
        category: HEALTH_CHECK_CATEGORY_LABELS[category] || category,
        status: categoryData.status,
        isAbnormal: categoryData.isAbnormal,
        resultNotes: categoryData.resultNotes,
        recommendations: categoryData.recommendations,
        createdAt: categoryData.performedAt,
        weight: categoryData.weight,
        height: categoryData.height,
        bmi: categoryData.bmi,
        nurseName: categoryData.nurseName
      });
    });
  });
  
  return flattenedResults;
};

/**
 * Get student status display information
 */
export const getStudentStatusDisplay = (record) => {
  const { status } = record;
  let color = 'default';
  let text = '';
  
  switch (status) {
    case 'CONFIRMED':
      color = 'green';
      text = 'Đã xác nhận khám';
      break;
    case 'DECLINED':
      color = 'red';
      text = 'Từ chối khám';
      break;
    case 'PENDING':
      color = 'orange';
      text = 'Chờ phản hồi';
      break;
    case 'NO_FORM':
      color = 'default';
      text = 'Chưa gửi thông báo';
      break;
    default:
      color = 'default';
      text = 'Chưa gửi thông báo';
  }
  
  return { color, text };
};

/**
 * Check if campaign can be started based on conditions
 */
export const canStartCampaign = (campaign, notificationSent) => {
  if (!campaign || campaign.status !== 'APPROVED') return false;
  
  const isScheduled = campaign.timeSlot && campaign.timeSlot !== null;
  const isStartDateReached = dayjs().isSameOrAfter(dayjs(campaign.startDate), 'day');
  
  return notificationSent && isScheduled && isStartDateReached;
};

/**
 * Get tooltip message for start campaign button
 */
export const getStartCampaignTooltip = (campaign, notificationSent) => {
  if (!campaign) return '';
  
  const isScheduled = campaign.timeSlot && campaign.timeSlot !== null;
  const isStartDateReached = dayjs().isSameOrAfter(dayjs(campaign.startDate), 'day');
  
  if (!notificationSent && !isScheduled && !isStartDateReached) {
    return 'Cần gửi thông báo, lên lịch và đến ngày bắt đầu khám mới có thể bắt đầu';
  } else if (!notificationSent && !isScheduled) {
    return 'Cần gửi thông báo và lên lịch trước khi bắt đầu khám';
  } else if (!notificationSent && !isStartDateReached) {
    return 'Cần gửi thông báo và đến ngày bắt đầu khám mới có thể bắt đầu';
  } else if (!isScheduled && !isStartDateReached) {
    return 'Cần lên lịch và đến ngày bắt đầu khám mới có thể bắt đầu';
  } else if (!notificationSent) {
    return 'Cần gửi thông báo trước khi bắt đầu khám';
  } else if (!isScheduled) {
    return 'Cần lên lịch trước khi bắt đầu khám';
  } else if (!isStartDateReached) {
    return `Chỉ có thể bắt đầu khám từ ngày ${dayjs(campaign.startDate).format('DD/MM/YYYY')}`;
  }
  
  return '';
};

/**
 * Calculate campaign statistics
 */
export const calculateCampaignStats = (campaign, eligibleStudents, results) => {
  const targetCount = campaign?.targetCount || 0;
  const eligibleCount = eligibleStudents.length;
  const completedCount = results.length;
  const abnormalCount = results.filter(r => 
    r.status === 'ABNORMAL' || 
    r.status === 'NEEDS_FOLLOWUP' || 
    r.status === 'NEEDS_TREATMENT'
  ).length;
  
  const progressPercentage = campaign?.status === 'APPROVED' && eligibleCount > 0 ? 
    Math.round((completedCount / eligibleCount) * 100) : 
    (targetCount ? Math.round((completedCount / targetCount) * 100) : 0);
  
  const confirmedCount = eligibleStudents.filter(s => s.status === 'CONFIRMED').length;
  const declinedCount = eligibleStudents.filter(s => s.status === 'DECLINED').length;
  const pendingCount = eligibleStudents.filter(s => 
    s.status === 'PENDING' || s.status === 'NO_FORM'
  ).length;
  
  return {
    targetCount: campaign?.status === 'APPROVED' ? eligibleCount : targetCount,
    completedCount,
    abnormalCount,
    progressPercentage,
    confirmedCount,
    declinedCount,
    pendingCount
  };
};
