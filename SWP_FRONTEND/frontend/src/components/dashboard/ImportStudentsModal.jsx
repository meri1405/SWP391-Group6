import React, { useState } from 'react';
import { 
  Modal, 
  Upload, 
  Button, 
  message, 
  Alert, 
  Typography,
  Space,
  List,
  Divider
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  FileExcelOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { importStudentsFromExcel, downloadExcelTemplate } from '../../api/studentApi';
import { VIETNAMESE_MOBILE_PREFIXES } from '../../utils/phoneValidator';
import '../../styles/StudentManagement.css';

const { Title, Text } = Typography;

const ImportStudentsModal = ({ visible, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Import_Hoc_Sinh.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Tải template thành công');
    } catch (error) {
      message.error('Không thể tải template: ' + error.message);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('Chỉ được upload file Excel (.xlsx, .xls)!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel để import');
      return;
    }

    setLoading(true);
    try {
      const file = fileList[0];
      const response = await importStudentsFromExcel(file);
      
      // Extract counts from response
      const studentsCount = response.students?.length || 0;
      
      // Try to extract parent count from the message or fallback to simple calculation
      let parentsCount = 0;
      if (response.message) {
        const match = response.message.match(/(\d+) học sinh, (\d+) phụ huynh/);
        if (match && match[2]) {
          parentsCount = parseInt(match[2], 10);
        } else {
          parentsCount = (response.father ? 1 : 0) + (response.mother ? 1 : 0);
        }
      } else {
        parentsCount = (response.father ? 1 : 0) + (response.mother ? 1 : 0);
      }
      
      message.success(`Import thành công! Đã tạo ${studentsCount} học sinh và ${parentsCount} phụ huynh`);
      setFileList([]);
      onSuccess && onSuccess(response);
      onCancel();
    } catch (error) {
      message.error('Import thất bại: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <FileExcelOutlined />
          <span>Import học sinh từ Excel</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />} 
          onClick={handleDownloadTemplate}
        >
          Tải template
        </Button>,
        <Button 
          key="import" 
          type="primary" 
          loading={loading}
          onClick={handleImport}
          disabled={fileList.length === 0}
        >
          Import
        </Button>,      ]}
      width={700}
      className="import-modal"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Hướng dẫn */}
        <Alert
          message="Hướng dẫn import file Excel"
          description={
            <div>
              <Text>
                Để import thành công, vui lòng làm theo các bước sau:
              </Text>
              <List
                size="small"
                dataSource={[
                  '1. Tải template Excel mẫu',
                  '2. Điền thông tin học sinh và phụ huynh vào template',
                  '3. Lưu file và upload tại đây'
                ]}
                renderItem={item => (
                  <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </div>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        <Divider />

        {/* Upload area */}
        <div>
          <Title level={5}>Chọn file Excel:</Title>
          <Upload.Dragger {...uploadProps} style={{ padding: '20px' }}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">
              Nhấp hoặc kéo file Excel vào đây để upload
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ file .xlsx và .xls, kích thước tối đa 10MB
            </p>
          </Upload.Dragger>
        </div>

        {fileList.length > 0 && (
          <Alert
            message={`Đã chọn file: ${fileList[0].name}`}
            type="success"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};

export default ImportStudentsModal;
