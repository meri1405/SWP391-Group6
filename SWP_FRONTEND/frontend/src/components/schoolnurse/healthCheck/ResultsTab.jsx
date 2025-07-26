import React, { useState } from 'react';
import { Table, Button, Modal, Descriptions } from 'antd';
import { FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import { transformResultsForTable } from '../../../utils/healthCheckUtils.jsx';
import { getResultColumns } from '../../../utils/tableConfigs.jsx';
import { formatDate } from '../../../utils/timeUtils.js';

/**
 * Component for displaying campaign results
 */
const ResultsTab = ({
  results,
  resultsLoading,
  onRefreshResults
}) => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const handleViewResult = (record) => {
    setSelectedResult(record);
    setViewModalVisible(true);
  };

  const handleCloseModal = () => {
    setViewModalVisible(false);
    setSelectedResult(null);
  };

  const getStatusText = (status) => {
    const statusMap = {
      NORMAL: "Bình thường",
      MINOR_CONCERN: "Cần theo dõi",
      NEEDS_ATTENTION: "Cần chú ý",
      REQUIRES_FOLLOWUP: "Cần tái khám",
      URGENT: "Khẩn cấp"
    };
    return statusMap[status] || status;
  };

  const resultColumns = getResultColumns();
  // Add action column with View Result button
  const columnsWithActions = [
    ...resultColumns,
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewResult(record)}
        >
          Xem kết quả
        </Button>
      ),
    },
  ];
  const transformedResults = transformResultsForTable(results);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={onRefreshResults} loading={resultsLoading}>
          <FileTextOutlined /> Làm mới kết quả
        </Button>
      </div>
      <Table 
        columns={columnsWithActions} 
        dataSource={transformedResults.map(result => ({ ...result, key: result.id }))} 
        loading={resultsLoading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal xem chi tiết kết quả */}
      <Modal
        title="Chi tiết kết quả khám sức khỏe"
        open={viewModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        {selectedResult ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Họ và tên">{selectedResult.studentName}</Descriptions.Item>
            <Descriptions.Item label="Lớp">{selectedResult.className}</Descriptions.Item>
            <Descriptions.Item label="Loại khám">{selectedResult.examType || selectedResult.category || '-'}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusText(selectedResult.status) || '-'}</Descriptions.Item>
            <Descriptions.Item label="Bất thường">{selectedResult.abnormal ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Y tá thực hiện">{selectedResult.nurseName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Thời gian">{formatDate(selectedResult.createdAt) || selectedResult.date || '-'}</Descriptions.Item>
            {/* Thêm các trường khác nếu cần */}
          </Descriptions>
        ) : null}
      </Modal>
    </div>
  );
};

export default ResultsTab;
