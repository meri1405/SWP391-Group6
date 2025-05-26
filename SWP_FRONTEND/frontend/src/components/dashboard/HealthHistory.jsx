import React, { useState } from 'react';
import '../../styles/HealthHistory.css';

const HealthHistory = () => {
  const [selectedChild, setSelectedChild] = useState('1');
  const [activeTab, setActiveTab] = useState('overview');

  const children = [
    { id: '1', name: 'Nguyễn Văn An' },
    { id: '2', name: 'Nguyễn Thị Bình' }
  ];

  const healthData = {
    allergies: ['Phấn hoa', 'Tôm cua'],
    chronicDiseases: ['Hen suyễn nhẹ'],
    treatments: [
      { date: '2025-05-15', condition: 'Cảm cúm', treatment: 'Thuốc hạ sốt, nghỉ ngơi', doctor: 'BS. Nguyễn Văn A' },
      { date: '2025-04-20', condition: 'Khám định kỳ', treatment: 'Tình trạng bình thường', doctor: 'BS. Trần Thị B' }
    ]
  };

  return (
    <div className="health-history">
      <div className="section-header">
        <h2>Tiền Sử Sức Khỏe</h2>
        <select 
          value={selectedChild} 
          onChange={(e) => setSelectedChild(e.target.value)}
          className="child-selector"
        >
          {children.map(child => (
            <option key={child.id} value={child.id}>{child.name}</option>
          ))}
        </select>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan
        </button>
        <button 
          className={activeTab === 'edit' ? 'active' : ''}
          onClick={() => setActiveTab('edit')}
        >
          Chỉnh sửa thông tin
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="health-overview">
          <div className="health-card">
            <h3><i className="fas fa-exclamation-triangle"></i> Dị ứng</h3>
            <div className="tags">
              {healthData.allergies.map((allergy, index) => (
                <span key={index} className="tag allergy">{allergy}</span>
              ))}
            </div>
          </div>

          <div className="health-card">
            <h3><i className="fas fa-heartbeat"></i> Bệnh mãn tính</h3>
            <div className="tags">
              {healthData.chronicDiseases.map((disease, index) => (
                <span key={index} className="tag chronic">{disease}</span>
              ))}
            </div>
          </div>

          <div className="health-card">
            <h3><i className="fas fa-notes-medical"></i> Lịch sử điều trị</h3>
            <div className="treatment-list">
              {healthData.treatments.map((treatment, index) => (
                <div key={index} className="treatment-item">
                  <div className="treatment-date">{treatment.date}</div>
                  <div className="treatment-details">
                    <h4>{treatment.condition}</h4>
                    <p>{treatment.treatment}</p>
                    <small>Bác sĩ: {treatment.doctor}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="health-form">
          <form>
            <div className="form-section">
              <h3>Dị ứng</h3>
              <div className="form-group">
                <label>Thêm dị ứng mới</label>
                <input type="text" placeholder="Nhập tên dị ứng..." />
                <button type="button" className="add-btn">Thêm</button>
              </div>
            </div>

            <div className="form-section">
              <h3>Bệnh mãn tính</h3>
              <div className="form-group">
                <label>Thêm bệnh mãn tính</label>
                <input type="text" placeholder="Nhập tên bệnh..." />
                <button type="button" className="add-btn">Thêm</button>
              </div>
            </div>

            <div className="form-section">
              <h3>Thêm lịch sử điều trị</h3>
              <div className="form-group">
                <label>Ngày điều trị</label>
                <input type="date" />
              </div>
              <div className="form-group">
                <label>Tình trạng/Bệnh</label>
                <input type="text" placeholder="Mô tả tình trạng..." />
              </div>
              <div className="form-group">
                <label>Phương pháp điều trị</label>
                <textarea placeholder="Mô tả phương pháp điều trị..."></textarea>
              </div>
              <div className="form-group">
                <label>Bác sĩ điều trị</label>
                <input type="text" placeholder="Tên bác sĩ..." />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Lưu thông tin</button>
              <button type="button" className="cancel-btn">Hủy</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HealthHistory;
