import React, { useState } from 'react';
import '../../styles/Profile.css';

const Profile = ({ userInfo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userInfo?.firstName || '',
    lastName: userInfo?.lastName || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    jobTitle: 'Kế toán'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call to update profile
    console.log('Updating profile:', formData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <h2>Hồ Sơ Cá Nhân</h2>
        <button 
          className="edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'}`}></i>
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
            <h3>{formData.firstName} {formData.lastName}</h3>
            <p className="role-badge">Phụ Huynh</p>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Nghề nghiệp</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Lưu thay đổi</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <div className="info-item">
                  <label>Họ và tên</label>
                  <span>{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{formData.email}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <span>{formData.phone}</span>
                </div>
                <div className="info-item">
                  <label>Nghề nghiệp</label>
                  <span>{formData.jobTitle}</span>
                </div>
              </div>

              <div className="info-item">
                <label>Địa chỉ</label>
                <span>{formData.address}</span>
              </div>
            </div>
          )}
        </div>

        <div className="children-info">
          <h3>Thông tin con em</h3>
          <div className="children-list">
            <div className="child-item">
              <div className="child-avatar">
                <i className="fas fa-child"></i>
              </div>
              <div className="child-details">
                <h4>Nguyễn Văn An</h4>
                <p>Lớp 5A - Sinh năm 2015</p>
                <div className="child-actions">
                  <button className="view-btn">Xem hồ sơ</button>
                  <button className="edit-btn">Chỉnh sửa</button>
                </div>
              </div>
            </div>
            
            <div className="child-item">
              <div className="child-avatar">
                <i className="fas fa-child"></i>
              </div>
              <div className="child-details">
                <h4>Nguyễn Thị Bình</h4>
                <p>Lớp 3B - Sinh năm 2017</p>
                <div className="child-actions">
                  <button className="view-btn">Xem hồ sơ</button>
                  <button className="edit-btn">Chỉnh sửa</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
