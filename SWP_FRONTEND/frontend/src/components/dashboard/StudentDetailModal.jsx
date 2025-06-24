import React from 'react';
import { Modal, Card, Row, Col, Button, Typography, Divider, message } from 'antd';
import { UserOutlined, HomeOutlined, PhoneOutlined, CalendarOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const InfoRow = ({ icon, label, value }) => (
    <Row style={{ marginBottom: 8 }} align="middle">
        <Col span={6} style={{ color: '#888', fontWeight: 500 }}>{icon} {label}:</Col>
        <Col span={18} style={{ color: '#222', fontWeight: 600 }}>{value || <span style={{ color: '#bbb' }}>-</span>}</Col>
    </Row>
);

const ParentCard = ({ parent, type, onRemove }) => (
    <Card
        title={<span>{type === 'father' ? '👨 Cha' : '👩 Mẹ'}</span>}
        style={{ marginBottom: 16, borderRadius: 10, border: '1.5px solid #e0e7ff', background: '#f8fafc' }}
        extra={parent && (
            <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => onRemove(type)}
            >
                Xóa liên kết
            </Button>
        )}
        bodyStyle={{ padding: 16 }}
    >
        {parent ? (
            <>
                <InfoRow icon={<UserOutlined />} label="Họ tên" value={parent.firstName + ' ' + parent.lastName} />
                <InfoRow icon={<PhoneOutlined />} label="SĐT" value={parent.phone} />
                <InfoRow icon={<CalendarOutlined />} label="Ngày sinh" value={parent.dob} />
                <InfoRow icon={<HomeOutlined />} label="Địa chỉ" value={parent.address} />
                <InfoRow icon={<UserOutlined />} label="Giới tính" value={parent.gender === 'M' ? 'Nam' : parent.gender === 'F' ? 'Nữ' : parent.gender} />
                <InfoRow icon={<UserOutlined />} label="Nghề nghiệp" value={parent.jobTitle} />
            </>
        ) : <span style={{ color: '#bbb' }}>Không có thông tin</span>}
    </Card>
);

const StudentDetailModal = ({ open, onClose, student, onRemoveParent, loading }) => {
    if (!student) return null;
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            title={<span style={{ fontWeight: 700, fontSize: 22, color: '#374151' }}>Chi tiết học sinh</span>}
        >
            <Card style={{ borderRadius: 10, marginBottom: 16, border: '1.5px solid #e0e7ff', background: '#f0f4fa' }} bodyStyle={{ padding: 16 }}>
                <Title level={5} style={{ marginBottom: 12, color: '#667eea' }}>Thông tin học sinh</Title>
                <InfoRow icon={<UserOutlined />} label="Họ tên" value={student.first_name + ' ' + student.last_name} />
                <InfoRow icon={<CalendarOutlined />} label="Ngày sinh" value={student.dob} />
                <InfoRow icon={<UserOutlined />} label="Giới tính" value={student.gender === 'M' ? 'Nam' : student.gender === 'F' ? 'Nữ' : student.gender} />
                <InfoRow icon={<HomeOutlined />} label="Nơi sinh" value={student.birth_place} />
                <InfoRow icon={<HomeOutlined />} label="Địa chỉ" value={student.address} />
                <InfoRow icon={<UserOutlined />} label="Lớp" value={student.class_name} />
                <InfoRow icon={<UserOutlined />} label="Quốc tịch" value={student.citizenship} />
                <InfoRow icon={<UserOutlined />} label="Trạng thái" value={student.disabled ? 'Đã vô hiệu hóa' : 'Đang hoạt động'} />
            </Card>
            <Divider style={{ margin: '16px 0' }}>Phụ huynh</Divider>
            <Row gutter={16}>
                <Col span={12}>
                    <ParentCard parent={student.father} type="father" onRemove={onRemoveParent} />
                </Col>
                <Col span={12}>
                    <ParentCard parent={student.mother} type="mother" onRemove={onRemoveParent} />
                </Col>
            </Row>
        </Modal>
    );
};

export default StudentDetailModal; 