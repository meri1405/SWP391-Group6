import React from 'react';
import { Button } from 'antd';
import {
  PlayCircleOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  SendOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { canStartCampaign, getStartCampaignTooltip } from '../../../utils/healthCheckUtils.jsx';

/**
 * Component for rendering action buttons based on campaign status
 */
const ActionButtons = ({ 
  campaign, 
  notificationSent, 
  onConfirmAction, 
  onScheduleCampaign, 
  onSendResults 
}) => {
  if (!campaign) return null;

  const buttons = [];
  
  switch (campaign.status) {
    case 'APPROVED': {
      // Add schedule button if notifications have been sent and not yet scheduled
      if (notificationSent && !campaign.timeSlot) {
        buttons.push(
          <Button 
            key="schedule" 
            type="primary" 
            style={{ marginRight: 8 }}
            icon={<CalendarOutlined />} 
            onClick={onScheduleCampaign}
          >
            Lên lịch khám
          </Button>
        );
      }
      
      // Only show "Bắt đầu khám" button if conditions are met
      const canStart = canStartCampaign(campaign, notificationSent);
      const tooltipMessage = getStartCampaignTooltip(campaign, notificationSent);
      
      buttons.push(
        <Button 
          key="start" 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          disabled={!canStart}
          onClick={() => onConfirmAction(
            'start', 
            'Xác nhận bắt đầu', 
            'Bạn có chắc chắn muốn bắt đầu đợt khám này?'
          )}
          title={tooltipMessage}
        >
          Bắt đầu khám
        </Button>
      );
      break;
    }
    case 'IN_PROGRESS': {       
      buttons.push(
        <Button 
          key="complete" 
          type="primary" 
          icon={<CheckOutlined />} 
          onClick={() => onConfirmAction(
            'complete', 
            'Xác nhận hoàn thành', 
            'Bạn có chắc chắn muốn đánh dấu đợt khám này là đã hoàn thành?'
          )}
        >
          Hoàn thành
        </Button>
      );
      break;
    }
    default:
      break;
  }
  
  // Add cancel button for certain statuses (note: backend doesn't support cancel yet)
  if (['PENDING'].includes(campaign.status)) {
    buttons.push(
      <Button 
        key="cancel" 
        danger 
        icon={<CloseCircleOutlined />} 
        onClick={() => onConfirmAction(
          'cancel', 
          'Xác nhận hủy', 
          'Bạn có chắc chắn muốn hủy đợt khám này? (Chức năng này chưa được hỗ trợ)'
        )}
      >
        Hủy
      </Button>
    );
  }
  
  // Add Send Results button only for COMPLETED campaigns
  if (campaign.status === 'COMPLETED') {
    buttons.push(
      <Button 
        key="sendResults" 
        type="primary"
        style={{ marginLeft: 8 }}
        icon={<SendOutlined />} 
        onClick={onSendResults}
      >
        Gửi thông báo kết quả
      </Button>
    );
  }

  return buttons;
};

export default ActionButtons;
