import React, { useState } from 'react';
import { Upload, message, Card, Button, Modal, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import '../../styles/PrescriptionImageUpload.css';

const { Dragger } = Upload;

const PrescriptionImageUpload = ({ 
  value = [], 
  onChange, 
  maxCount = 5,
  required = true 
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file upload
  const handleUpload = async (file) => {
    try {
      // Validate file type
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ hỗ trợ định dạng JPG/PNG!');
        return false;
      }

      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      // Check max count
      if (value.length >= maxCount) {
        message.error(`Chỉ được tải lên tối đa ${maxCount} ảnh!`);
        return false;
      }

      // Convert to base64
      const base64 = await getBase64(file);
      
      // Add to list
      const newImages = [...value, {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        url: base64,
        thumbUrl: base64,
      }];

      onChange?.(newImages);
      message.success('Tải ảnh thành công!');
      
      return false; // Prevent default upload
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      message.error('Có lỗi xảy ra khi tải ảnh!');
      return false;
    }
  };

  // Handle remove image
  const handleRemove = (file) => {
    const newImages = value.filter(item => item.uid !== file.uid);
    onChange?.(newImages);
  };

  // Handle preview
  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.thumbUrl);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  // Custom upload list
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh đơn thuốc</div>
    </div>
  );

  return (
    <div className="prescription-image-upload">
      <Upload
        listType="picture-card"
        fileList={value}
        beforeUpload={handleUpload}
        onRemove={handleRemove}
        onPreview={handlePreview}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: true,
          showDownloadIcon: false,
        }}
        multiple
        accept="image/*"
      >
        {value.length >= maxCount ? null : uploadButton}
      </Upload>

      {/* Preview Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        bodyStyle={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px'
        }}
      >
        <Image
          alt="prescription"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '70vh',
            objectFit: 'contain'
          }}
          src={previewImage}
          preview={false}
        />
      </Modal>

      {/* Help text */}
      <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
        {required && <span style={{ color: 'red' }}>* </span>}
        Hỗ trợ JPG, PNG. Tối đa {maxCount} ảnh, mỗi ảnh không quá 5MB.
        {required && ' Bắt buộc phải có ít nhất 1 ảnh đơn thuốc.'}
      </div>

      {/* Validation error */}
      {required && value.length === 0 && (
        <div style={{ color: 'red', fontSize: '12px', marginTop: 4 }}>
          Vui lòng tải lên ít nhất một ảnh đơn thuốc
        </div>
      )}
    </div>
  );
};

export default PrescriptionImageUpload;
