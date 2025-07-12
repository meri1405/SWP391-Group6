import React, { useState } from 'react';
import {
  Card,
  Button,
  Spin,
  Tabs,
  Space,
  Modal,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useHealthCheckCampaign } from '../../../hooks/useHealthCheckCampaign';
import NotificationModal from './NotificationModal';
import ScheduleModal from './ScheduleModal';
import RecordResultsTab from './RecordResultsTab';
import SendResultsModal from './SendResultsModal';
import ActionButtons from './ActionButtons';
import CampaignInfoTab from './CampaignInfoTab';
import ResultsTab from './ResultsTab';

const { Title, Paragraph, Text } = Typography;

const HealthCheckCampaignDetail = ({ campaignId, onBack, onEdit }) => {
  // State for modals
  const [activeTab, setActiveTab] = useState('info');
  const [confirmModal, setConfirmModal] = useState({ visible: false, action: null, title: '', message: '' });
  const [notificationModal, setNotificationModal] = useState({ visible: false });
  const [scheduleModal, setScheduleModal] = useState({ visible: false });
  const [sendResultsModal, setSendResultsModal] = useState({ visible: false });

  // Use the custom hook for all campaign-related logic
  const {
    campaign,
    loading,
    results,
    resultsLoading,
    eligibleStudents,
    studentsLoading,
    notificationSent,
    lastRefresh,
    sendingNotification,
    scheduling,
    sendingResults,
    fetchResults,
    handleCampaignAction,
    scheduleCampaign,
    sendNotifications,
    refreshStudents,
    sendHealthCheckResults
  } = useHealthCheckCampaign(campaignId);

  // Handle tab change and fetch results when results tab is activated
  const handleTabChange = (key) => {
    setActiveTab(key);
    
    // Auto-fetch results when results tab is activated
    if (key === 'results' && campaign && 
        (campaign.status === 'IN_PROGRESS' || campaign.status === 'COMPLETED')) {
      console.log('Results tab activated - fetching results...');
      fetchResults();
    }
  };

  // Modal handlers
  const showConfirmModal = (action, title, message) => {
    setConfirmModal({ visible: true, action, title, message });
  };

  const hideConfirmModal = () => {
    setConfirmModal({ visible: false, action: null, title: '', message: '' });
  };

  const handleConfirmAction = async () => {
    const { action } = confirmModal;
    hideConfirmModal();
    await handleCampaignAction(action);
  };

  const handleEdit = () => {
    if (campaign && campaign.status === 'PENDING') {
      onEdit(campaign);
    } else {
      message.warning('Chỉ có thể chỉnh sửa đợt khám ở trạng thái CHƯA DUYỆT');
    }
  };

  // Notification modal handlers
  const handleSendNotifications = () => {
    setNotificationModal({ visible: true });
  };

  const handleNotificationModalCancel = () => {
    setNotificationModal({ visible: false });
  };

  const handleNotificationModalConfirm = async (customMessage) => {
    setNotificationModal({ visible: false });
    await sendNotifications(customMessage);
  };

  // Schedule modal handlers
  const handleScheduleCampaign = () => {
    setScheduleModal({ visible: true });
  };

  const handleScheduleModalCancel = () => {
    setScheduleModal({ visible: false });
  };

  const handleScheduleModalConfirm = async (scheduleData) => {
    const success = await scheduleCampaign(scheduleData);
    if (success) {
      setScheduleModal({ visible: false });
    }
  };

  // Send results modal handlers
  const showSendResultsModal = () => {
    setSendResultsModal({ visible: true });
  };

  const handleSendResultsModalCancel = () => {
    setSendResultsModal({ visible: false });
  };

  const handleSendResults = async (studentIds, notificationContent, useDefaultTemplate) => {
    const success = await sendHealthCheckResults(studentIds, notificationContent, useDefaultTemplate);
    if (success) {
      setSendResultsModal({ visible: false });
    }
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Đang tải thông tin đợt khám...</p>
        </div>
      </Card>
    );
  }

  if (!campaign) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <Title level={4}>Không tìm thấy thông tin đợt khám</Title>
          <Button type="primary" onClick={onBack}>Quay lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
            {campaign && campaign.status === 'PENDING' && (
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Chỉnh sửa
              </Button>
            )}
            <ActionButtons
              campaign={campaign}
              notificationSent={notificationSent}
              onConfirmAction={showConfirmModal}
              onScheduleCampaign={handleScheduleCampaign}
              onSendResults={showSendResultsModal}
            />
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'info',
              label: 'Thông tin chung',
              children: (
                <CampaignInfoTab
                  campaign={campaign}
                  eligibleStudents={eligibleStudents}
                  results={results}
                  studentsLoading={studentsLoading}
                  notificationSent={notificationSent}
                  sendingNotification={sendingNotification}
                  lastRefresh={lastRefresh}
                  onSendNotifications={handleSendNotifications}
                  onRefreshStudents={refreshStudents}
                />
              )
            },
            {
              key: 'record-results',
              label: 'Ghi kết quả khám',
              disabled: campaign.status !== 'IN_PROGRESS',
              children: (
                <RecordResultsTab 
                  campaignId={campaignId}
                  campaign={campaign}
                  onRefreshData={() => {
                    // Refresh results when a new result is recorded
                    fetchResults();
                  }}
                />
              )
            },
            {
              key: 'results',
              label: 'Xem kết quả khám',
              disabled: campaign.status !== 'IN_PROGRESS' && campaign.status !== 'COMPLETED',
              children: (
                <ResultsTab
                  results={results}
                  resultsLoading={resultsLoading}
                  onRefreshResults={fetchResults}
                />
              )
            }
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

      <NotificationModal
        visible={notificationModal.visible}
        onCancel={handleNotificationModalCancel}
        onConfirm={handleNotificationModalConfirm}
        title="Gửi thông báo khám sức khỏe"
        message="Bạn có chắc chắn muốn gửi thông báo khám sức khỏe đến phụ huynh học sinh trong đợt khám này?"
        customMessagePlaceholder="Nhập nội dung thông báo tùy chỉnh (tuỳ chọn)"
        loading={sendingNotification}
        studentCount={eligibleStudents.length}
        campaignName={campaign?.name || ''}
      />

      <ScheduleModal 
        visible={scheduleModal.visible}
        onCancel={handleScheduleModalCancel}
        onConfirm={handleScheduleModalConfirm}
        title="Lên lịch khám sức khỏe"
        initialValues={campaign.timeSlot ? {
          date: dayjs(campaign.timeSlot.start),
          time: dayjs(campaign.timeSlot.start).format('HH:mm'),
          duration: campaign.timeSlot.duration || 60,
        } : null}
        loading={scheduling}
        confirmedCount={campaign?.confirmedCount || 0}
      />

      <SendResultsModal
        visible={sendResultsModal.visible}
        onCancel={handleSendResultsModalCancel}
        onConfirm={handleSendResults}
        loading={sendingResults}
        students={results}
        campaignName={campaign?.name || ''}
      />
    </>
  );
};

export default HealthCheckCampaignDetail;
