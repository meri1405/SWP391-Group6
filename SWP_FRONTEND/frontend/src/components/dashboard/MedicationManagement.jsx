import React, { useState } from 'react';
import '../../styles/MedicationManagement.css';

const MedicationManagement = () => {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Vitamin D',
      dosage: '1 viên/ngày',
      time: '08:00',
      duration: '30 ngày',
      status: 'active',
      submitted: false
    }
  ]);

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    time: '',
    duration: '',
    notes: ''
  });

  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const medication = {
      ...newMedication,
      id: Date.now(),
      status: 'pending',
      submitted: false
    };
    setMedications([...medications, medication]);
    setNewMedication({ name: '', dosage: '', time: '', duration: '', notes: '' });
    setShowForm(false);
  };

  const submitToSchool = (id) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, submitted: true } : med
    ));
  };

  return (
    <div className="medication-management">
      <div className="section-header">
        <h2>Quản Lý Thuốc</h2>
        <button 
          className="add-medication-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus"></i>
          Thêm thuốc mới
        </button>
      </div>

      {showForm && (
        <div className="medication-form">
          <h3>Thêm thông tin thuốc</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Tên thuốc *</label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Liều lượng *</label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="VD: 1 viên, 5ml..."
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Thời gian uống *</label>
                <input
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Thời gian sử dụng</label>
                <input
                  type="text"
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                  placeholder="VD: 7 ngày, 1 tháng..."
                />
              </div>
            </div>
            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={newMedication.notes}
                onChange={(e) => setNewMedication({...newMedication, notes: e.target.value})}
                placeholder="Ghi chú thêm về cách sử dụng..."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Lưu thuốc</button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <div className="medications-list">
        <h3>Danh sách thuốc hiện tại</h3>
        {medications.map(medication => (
          <div key={medication.id} className="medication-card">
            <div className="medication-info">
              <h4>{medication.name}</h4>
              <div className="medication-details">
                <span><i className="fas fa-pills"></i> {medication.dosage}</span>
                <span><i className="fas fa-clock"></i> {medication.time}</span>
                <span><i className="fas fa-calendar"></i> {medication.duration}</span>
              </div>
              <div className="medication-status">
                <span className={`status-badge ${medication.status}`}>
                  {medication.status === 'active' ? 'Đang sử dụng' : 'Chờ duyệt'}
                </span>
                {medication.submitted && (
                  <span className="submitted-badge">Đã gửi trường</span>
                )}
              </div>
            </div>
            <div className="medication-actions">
              {!medication.submitted && (
                <button 
                  className="submit-btn"
                  onClick={() => submitToSchool(medication.id)}
                >
                  Gửi trường
                </button>
              )}
              <button className="edit-btn">Chỉnh sửa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationManagement;
