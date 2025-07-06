import React, { useState, useEffect } from 'react';
import { message, Card, Button, Input, Switch, Spin } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';
import '../../styles/AdminComponents.css';

const SettingsManagement = () => {
  const { settings, updateSettings, loading } = useSystemSettings();
  const [formData, setFormData] = useState({
    systemName: '',
    contactEmail: '',
    twoFactorAuth: false,
    activityLogging: false,
  });
  const [saving, setSaving] = useState(false);

  // Initialize form with current settings
  useEffect(() => {
    setFormData({
      systemName: settings.systemName || '',
      contactEmail: settings.contactEmail || '',
      twoFactorAuth: settings.twoFactorAuth || false,
      activityLogging: settings.activityLogging || false,
    });
  }, [settings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const result = await updateSettings(formData);

      if (result.success) {
        message.success('Cài đặt hệ thống đã được cập nhật thành công!');
      } else {
        message.error(
          'Có lỗi xảy ra khi cập nhật cài đặt: ' +
            (result.error || 'Lỗi không xác định')
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <Spin size="large" />
        <span style={{ marginLeft: 16 }}>Đang tải cài đặt...</span>
      </div>
    );
  }

  return (
    <div className="settings-management">
      <div className="section-header">
        <h2>
          <SettingOutlined /> Cài đặt hệ thống
        </h2>
      </div>

      <div className="settings-content">
        <Card 
          title="Cài đặt chung" 
          style={{ marginBottom: 24 }}
          className="settings-card"
        >
          <div className="setting-item">
            <label className="setting-label">Tên hệ thống</label>
            <Input
              value={formData.systemName}
              onChange={(e) => handleInputChange('systemName', e.target.value)}
              placeholder="Nhập tên hệ thống"
              disabled={loading || saving}
              size="large"
            />
            <div className="setting-description">
              Tên hiển thị của hệ thống quản lý y tế trường học
            </div>
          </div>

          <div className="setting-item">
            <label className="setting-label">Email liên hệ</label>
            <Input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="admin@example.com"
              disabled={loading || saving}
              size="large"
            />
            <div className="setting-description">
              Email chính để nhận thông báo và liên hệ hệ thống
            </div>
          </div>
        </Card>

        <Card 
          title="Cài đặt bảo mật" 
          className="settings-card"
        >
          <div className="setting-item">
            <div className="setting-switch">
              <div className="switch-info">
                <label className="setting-label">Yêu cầu xác thực 2 bước</label>
                <div className="setting-description">
                  Bắt buộc người dùng sử dụng xác thực 2 bước khi đăng nhập
                </div>
              </div>
              <Switch
                checked={formData.twoFactorAuth}
                onChange={(checked) => handleInputChange('twoFactorAuth', checked)}
                disabled={loading || saving}
                size="default"
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-switch">
              <div className="switch-info">
                <label className="setting-label">Ghi log hoạt động</label>
                <div className="setting-description">
                  Ghi lại tất cả hoạt động của người dùng trong hệ thống
                </div>
              </div>
              <Switch
                checked={formData.activityLogging}
                onChange={(checked) => handleInputChange('activityLogging', checked)}
                disabled={loading || saving}
                size="default"
              />
            </div>
          </div>
        </Card>

        <div className="settings-actions">
          <Button
            type="primary"
            onClick={handleSaveSettings}
            disabled={loading || saving}
            loading={saving}
            size="large"
            icon={<SettingOutlined />}
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;
