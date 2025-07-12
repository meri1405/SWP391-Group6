import React from 'react';
import {
  Card, List, Descriptions, Empty, Button, Row, Col, Tag, Typography
} from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import {
  calculateBMI,
  getBMICategory,
  getAllergyStatusText,
  getAllergyStatusColor,
  getChronicDiseaseStatusText,
  getChronicDiseaseStatusColor,
  hasContent,
  formatDate
} from '../../../utils/healthProfileUtils';

const { Text } = Typography;

/**
 * Render basic health information
 */
export const renderBasicInfo = (profile) => {
  if (!profile) return null;

  return (
    <Descriptions bordered size="small" column={2}>
      <Descriptions.Item label="Cân nặng" span={1}>
        {profile.weight} kg
      </Descriptions.Item>
      <Descriptions.Item label="Chiều cao" span={1}>
        {profile.height} cm
      </Descriptions.Item>
      <Descriptions.Item label="Nhóm máu" span={1}>
        {profile.bloodType || 'N/A'}
      </Descriptions.Item>
      <Descriptions.Item label="BMI" span={1}>
        {calculateBMI(profile.weight, profile.height)}
      </Descriptions.Item>
      <Descriptions.Item label="Phân loại BMI" span={1}>
        {getBMICategory(profile.weight, profile.height)}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày tạo" span={1}>
        {formatDate(profile.createdAt)}
      </Descriptions.Item>
      <Descriptions.Item label="Ngày duyệt" span={1}>
        {formatDate(profile.updatedAt)}
      </Descriptions.Item>
      <Descriptions.Item label="Y tá duyệt" span={1}>
        {profile.additionalFields?.schoolNurseFullName || 'N/A'}
      </Descriptions.Item>
      <Descriptions.Item label="Trạng thái" span={1}>
        <Tag color="success">Đã duyệt</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Ghi chú của phụ huynh" span={2}>
        {profile.note || 'Không có ghi chú'}
      </Descriptions.Item>
      {profile.nurseNote && (
        <Descriptions.Item label="Ghi chú của Y tá" span={2}>
          <Text style={{ fontStyle: 'italic', color: '#1890ff' }}>
            {profile.nurseNote}
          </Text>
        </Descriptions.Item>
      )}
    </Descriptions>
  );
};

/**
 * Render allergies information
 */
export const renderAllergies = (allergies, onViewDetail) => (
  <Card title="Dị ứng" className="approved-health-card">
    {hasContent(allergies) ? (
      <List
        dataSource={allergies}
        renderItem={(allergy) => (
          <List.Item
            actions={[
              <Button
                key="view-detail"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(allergy, 'allergy')}
              >
                Xem chi tiết
              </Button>
            ]}
          >
            <List.Item.Meta
              title={allergy.allergen}
              description={
                <div>
                  <p>{allergy.description}</p>
                  <Tag color={getAllergyStatusColor(allergy.status)}>
                    {getAllergyStatusText(allergy.status)}
                  </Tag>
                  {allergy.onsetDate && (
                    <span style={{ marginLeft: '8px', color: '#666' }}>
                      Khởi phát: {formatDate(allergy.onsetDate)}
                    </span>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có thông tin dị ứng' }}
      />
    ) : (
      <Empty description="Không có thông tin dị ứng" />
    )}
  </Card>
);

/**
 * Render chronic diseases information
 */
export const renderChronicDiseases = (diseases, onViewDetail) => (
  <Card title="Bệnh mãn tính" className="approved-health-card">
    {hasContent(diseases) ? (
      <List
        dataSource={diseases}
        renderItem={(disease) => (
          <List.Item
            actions={[
              <Button
                key="view-detail"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(disease, 'chronicDisease')}
              >
                Xem chi tiết
              </Button>
            ]}
          >
            <List.Item.Meta
              title={disease.diseaseName}
              description={
                <div>
                  <p>{disease.description}</p>
                  <Tag color={getChronicDiseaseStatusColor(disease.status)}>
                    {getChronicDiseaseStatusText(disease.status)}
                  </Tag>
                  {disease.dateDiagnosed && (
                    <span style={{ marginLeft: '8px', color: '#666' }}>
                      Chẩn đoán: {formatDate(disease.dateDiagnosed)}
                    </span>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có thông tin bệnh mãn tính' }}
      />
    ) : (
      <Empty description="Không có thông tin bệnh mãn tính" />
    )}
  </Card>
);

/**
 * Render treatments information
 */
export const renderTreatments = (treatments, onViewDetail) => (
  <Card title="Lịch sử điều trị" className="approved-health-card">
    {hasContent(treatments) ? (
      <List
        dataSource={treatments}
        renderItem={(treatment) => (
          <List.Item
            actions={[
              <Button
                key="view-detail"
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onViewDetail(treatment, 'treatment')}
              >
                Xem chi tiết
              </Button>
            ]}
          >
            <List.Item.Meta
              title={treatment.treatmentType}
              description={
                <div>
                  <p>{treatment.description}</p>
                  <p><strong>Bác sĩ:</strong> {treatment.doctorName}</p>
                  {treatment.dateOfAdmission && (
                    <p>Nhập viện: {formatDate(treatment.dateOfAdmission)}</p>
                  )}
                  {treatment.placeOfTreatment && (
                    <p>Nơi điều trị: {treatment.placeOfTreatment}</p>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có lịch sử điều trị' }}
      />
    ) : (
      <Empty description="Không có lịch sử điều trị" />
    )}
  </Card>
);

/**
 * Render vision data information
 */
export const renderVisionData = (vision) => (
  <Card title="Thị lực" className="approved-health-card">
    {hasContent(vision) ? (
      <List
        dataSource={vision}
        renderItem={(visionItem) => (
          <List.Item>
            <List.Item.Meta
              title={`Khám ngày ${formatDate(visionItem.dateOfExamination)}`}
              description={
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <p><strong>Mắt trái:</strong> {visionItem.visionLeft}</p>
                      <p><strong>Mắt trái (có kính):</strong> {visionItem.visionLeftWithGlass || 'Không có'}</p>
                    </Col>
                    <Col span={12}>
                      <p><strong>Mắt phải:</strong> {visionItem.visionRight}</p>
                      <p><strong>Mắt phải (có kính):</strong> {visionItem.visionRightWithGlass || 'Không có'}</p>
                    </Col>
                  </Row>
                  {visionItem.visionDescription && (
                    <p><strong>Mô tả:</strong> {visionItem.visionDescription}</p>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có dữ liệu thị lực' }}
      />
    ) : (
      <Empty description="Không có dữ liệu thị lực" />
    )}
  </Card>
);

/**
 * Render hearing data information
 */
export const renderHearingData = (hearing) => (
  <Card title="Thính lực" className="approved-health-card">
    {hasContent(hearing) ? (
      <List
        dataSource={hearing}
        renderItem={(hearingItem) => (
          <List.Item>
            <List.Item.Meta
              title={`Khám ngày ${formatDate(hearingItem.dateOfExamination)}`}
              description={
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <p><strong>Tai trái:</strong> {hearingItem.leftEar}</p>
                    </Col>
                    <Col span={12}>
                      <p><strong>Tai phải:</strong> {hearingItem.rightEar}</p>
                    </Col>
                  </Row>
                  {hearingItem.description && (
                    <p><strong>Mô tả:</strong> {hearingItem.description}</p>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có dữ liệu thính lực' }}
      />
    ) : (
      <Empty description="Không có dữ liệu thính lực" />
    )}
  </Card>
);
