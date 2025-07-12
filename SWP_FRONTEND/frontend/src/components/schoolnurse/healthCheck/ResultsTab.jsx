import React from 'react';
import { Table, Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { transformResultsForTable } from '../../../utils/healthCheckUtils.jsx';
import { getResultColumns } from '../../../utils/tableConfigs.jsx';

/**
 * Component for displaying campaign results
 */
const ResultsTab = ({
  results,
  resultsLoading,
  onRefreshResults
}) => {
  const resultColumns = getResultColumns();
  const transformedResults = transformResultsForTable(results);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={onRefreshResults} loading={resultsLoading}>
          <FileTextOutlined /> Làm mới kết quả
        </Button>
      </div>
      
      <Table 
        columns={resultColumns} 
        dataSource={transformedResults.map(result => ({ ...result, key: result.id }))} 
        loading={resultsLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default ResultsTab;
