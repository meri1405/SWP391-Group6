import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Button, message, Modal, Row, Col } from 'antd';
import dayjs from 'dayjs';
import '../../styles/VaccinationSchedule.css';

const { Option } = Select;

const VaccinationSchedule = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('completed');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    vaccine: '',
    date: '',
    location: '',
    batchNumber: '',
    nextDue: '',
    notes: ''
  });

  // Mock data for completed vaccinations
  const [completedVaccinations] = useState([
    {
      id: 1,
      vaccine: 'Viêm gan B (lần 1)',
      date: '2023-03-15',
      location: 'Trung tâm Y tế Quận 1',
      batchNumber: 'HB2023-001',
      nextDue: '2023-04-15',
      status: 'completed'
    },
    {
      id: 2,
      vaccine: 'DPT (lần 1)',
      date: '2023-04-20',
      location: 'Bệnh viện Nhi Đồng',
      batchNumber: 'DPT2023-045',
      nextDue: '2023-06-20',
      status: 'completed'
    },
    {
      id: 3,
      vaccine: 'MMR (Sởi - Quai bị - Rubella)',
      date: '2023-05-10',
      location: 'Trung tâm Y tế Quận 3',
      batchNumber: 'MMR2023-078',
      nextDue: null,
      status: 'completed'
    }
  ]);

  // Mock data for upcoming vaccinations
  const [upcomingVaccinations] = useState([
    {
      id: 4,
      vaccine: 'Viêm gan B (lần 2)',
      scheduledDate: '2024-01-15',
      location: 'Trung tâm Y tế Quận 1',
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 5,
      vaccine: 'DPT (lần 2)',
      scheduledDate: '2024-02-20',
      location: 'Bệnh viện Nhi Đồng',
      status: 'scheduled',
      priority: 'medium'
    },
    {
      id: 6,
      vaccine: 'Polio (lần 1)',
      scheduledDate: '2024-03-10',
      location: 'Trung tâm Y tế Quận 3',
      status: 'scheduled',
      priority: 'medium'
    }
  ]);

  const handleAddVaccination = async (values) => {
    try {
      setLoading(true);
      // API call to add vaccination record
      console.log('Adding vaccination:', values);
      message.success('Thêm thông tin tiêm chủng thành công!');
      setShowAddModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm thông tin tiêm chủng!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return '';
    }
  };

  return (
    <div className="vaccination-container">
      <div className="vaccination-header">
        <h2>Lịch Tiêm Chủng</h2>
        <button
          className="add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus"></i>
          Thêm mới
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <i className="fas fa-check-circle"></i>
          Đã tiêm ({completedVaccinations.length})
        </button>
        <button
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <i className="fas fa-calendar-alt"></i>
          Sắp tới ({upcomingVaccinations.length})
        </button>
      </div>

      {activeTab === 'completed' && (
        <div className="tab-content">
          <div className="vaccination-list">
            {completedVaccinations.map(vaccination => (
              <div key={vaccination.id} className="vaccination-card completed">
                <div className="card-header">
                  <h3>{vaccination.vaccine}</h3>
                  <span className="status-badge completed">
                    <i className="fas fa-check"></i>
                    Đã tiêm
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">
                      <i className="fas fa-calendar"></i>
                      Ngày tiêm:
                    </span>
                    <span className="value">{formatDate(vaccination.date)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">
                      <i className="fas fa-map-marker-alt"></i>
                      Địa điểm:
                    </span>
                    <span className="value">{vaccination.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">
                      <i className="fas fa-barcode"></i>
                      Số lô:
                    </span>
                    <span className="value">{vaccination.batchNumber}</span>
                  </div>
                  {vaccination.nextDue && (
                    <div className="info-row">
                      <span className="label">
                        <i className="fas fa-clock"></i>
                        Tiêm tiếp theo:
                      </span>
                      <span className="value">{formatDate(vaccination.nextDue)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div className="tab-content">
          <div className="vaccination-list">
            {upcomingVaccinations.map(vaccination => (
              <div key={vaccination.id} className="vaccination-card upcoming">
                <div className="card-header">
                  <h3>{vaccination.vaccine}</h3>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: getPriorityColor(vaccination.priority),
                      color: 'white'
                    }}
                  >
                    {getPriorityText(vaccination.priority)}
                  </span>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">
                      <i className="fas fa-calendar"></i>
                      Ngày dự kiến:
                    </span>
                    <span className="value">{formatDate(vaccination.scheduledDate)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">
                      <i className="fas fa-map-marker-alt"></i>
                      Địa điểm:
                    </span>
                    <span className="value">{vaccination.location}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="confirm-btn">
                    <i className="fas fa-check"></i>
                    Xác nhận đặt lịch
                  </button>
                  <button className="reschedule-btn">
                    <i className="fas fa-calendar-alt"></i>
                    Dời lịch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Vaccination Modal */}
      {showAddModal && (
        <Modal
          title="Thêm thông tin tiêm chủng"
          open={showAddModal}
          onCancel={() => {
            setShowAddModal(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
          centered
        >
          <div className="guide-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <h3 style={{ marginBottom: '10px', color: '#ff6b35' }}>Hướng dẫn nhập thông tin</h3>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Vaccine: Chọn từ danh sách vaccine có sẵn</li>
              <li>Ngày tiêm: Phải là ngày trong quá khứ</li>
              <li>Nơi tiêm: Tên cơ sở y tế nơi thực hiện tiêm chủng</li>
              <li>Số lô: Theo định dạng Mã vaccine + Năm + Số thứ tự (ví dụ: HB2023-001)</li>
              <li>Ngày hết hạn: Phải là ngày trong tương lai</li>
              <li>Ghi chú: Thông tin bổ sung (nếu có)</li>
            </ul>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddVaccination}
            style={{ maxWidth: '100%' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vaccine"
                  label="Vaccine"
                  rules={[{ required: true, message: 'Vui lòng chọn vaccine!' }]}
                >
                  <Select placeholder="Chọn vaccine">
                    <Option value="Viêm gan B (lần 1)">Viêm gan B (lần 1)</Option>
                    <Option value="Viêm gan B (lần 2)">Viêm gan B (lần 2)</Option>
                    <Option value="DPT (lần 1)">DPT (lần 1)</Option>
                    <Option value="DPT (lần 2)">DPT (lần 2)</Option>
                    <Option value="MMR">MMR (Sởi - Quai bị - Rubella)</Option>
                    <Option value="Polio (lần 1)">Polio (lần 1)</Option>
                    <Option value="Polio (lần 2)">Polio (lần 2)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vaccinationDate"
                  label="Ngày tiêm"
                  rules={[
                    { required: true, message: 'Vui lòng chọn ngày tiêm!' },
                    {
                      validator: (_, value) => {
                        if (value && value.isAfter(dayjs())) {
                          return Promise.reject('Ngày tiêm không thể là ngày trong tương lai!');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày tiêm"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Nơi tiêm"
                  rules={[
                    { required: true, message: 'Vui lòng nhập nơi tiêm!' },
                    { min: 3, message: 'Nơi tiêm phải có ít nhất 3 ký tự!' }
                  ]}
                >
                  <Input placeholder="Nhập nơi tiêm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="batchNumber"
                  label="Số lô"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số lô!' },
                    {
                      pattern: /^[A-Z]{2}\d{4}-\d{3}$/,
                      message: 'Số lô phải theo định dạng: Mã vaccine + Năm + Số thứ tự (ví dụ: HB2023-001)'
                    }
                  ]}
                >
                  <Input placeholder="Nhập số lô (ví dụ: HB2023-001)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="nextDueDate"
                  label="Ngày hết hạn"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (value && value.isBefore(dayjs())) {
                          return Promise.reject('Ngày hết hạn phải là ngày trong tương lai!');
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày hết hạn"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="notes"
                  label="Ghi chú"
                >
                  <Input.TextArea
                    placeholder="Nhập ghi chú (nếu có)"
                    rows={4}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  form.resetFields();
                }}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
              >
                Thêm mới
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default VaccinationSchedule;
