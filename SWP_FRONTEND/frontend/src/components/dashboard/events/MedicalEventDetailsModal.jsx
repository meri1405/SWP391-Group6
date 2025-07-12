import React from "react";
import { Modal, Button, Row, Col, Typography, Tag } from "antd";
import dayjs from "dayjs";
import { getEventTypeConfig, getSeverityConfig } from "../../../utils/configUtils";
import { getSupplyName } from "../../../utils/medicalEventUtils";

const { Text } = Typography;

/**
 * Medical Event Details Modal Component
 */
const MedicalEventDetailsModal = ({ 
  visible, 
  onClose, 
  selectedEvent, 
  medicalSupplies 
}) => {
  if (!selectedEvent) return null;

  return (
    <Modal
      title="Chi tiết sự kiện y tế"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={800}
      styles={{
        body: { maxHeight: "70vh", overflow: "auto", paddingTop: 10 },
      }}
    >
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text strong>ID sự kiện:</Text> #{selectedEvent.id}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Thời gian:</Text>{" "}
            {dayjs(selectedEvent.occurrenceTime).format("DD/MM/YYYY HH:mm")}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Học sinh:</Text> {selectedEvent.student?.firstName}{" "}
            {selectedEvent.student?.lastName}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Lớp:</Text> {selectedEvent.student?.className}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Loại sự kiện:</Text>{" "}
            <Tag color={getEventTypeConfig(selectedEvent.eventType).color}>
              {getEventTypeConfig(selectedEvent.eventType).label}
            </Tag>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Mức độ:</Text>{" "}
            <Tag color={getSeverityConfig(selectedEvent.severityLevel).color}>
              {getSeverityConfig(selectedEvent.severityLevel).label}
            </Tag>
          </Col>
          <Col xs={24}>
            <Text strong>Địa điểm:</Text> {selectedEvent.location}
          </Col>
          <Col xs={24}>
            <Text strong>Triệu chứng:</Text>{" "}
            {selectedEvent.symptoms || "Không có"}
          </Col>
          <Col xs={24}>
            <Text strong>Xử lý ban đầu:</Text>{" "}
            {selectedEvent.firstAidActions || "Không có"}
          </Col>
          <Col xs={24}>
            <Text strong>Trạng thái:</Text>{" "}
            <Tag color={selectedEvent.processed ? "green" : "orange"}>
              {selectedEvent.processed ? "Đã xử lý" : "Chờ xử lý"}
            </Tag>
          </Col>
          {selectedEvent.processed && (
            <>
              <Col xs={24} sm={12}>
                <Text strong>Thời gian xử lý:</Text>{" "}
                {dayjs(selectedEvent.processedTime).format("DD/MM/YYYY HH:mm")}
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Người xử lý:</Text>{" "}
                {selectedEvent.processedBy?.fullName}
              </Col>
            </>
          )}
          <Col xs={24} sm={12}>
            <Text strong>Người tạo:</Text>{" "}
            {selectedEvent.createdBy?.fullName}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Ngày tạo:</Text>{" "}
            {dayjs(selectedEvent.createdAt).format("DD/MM/YYYY HH:mm")}
          </Col>
          {selectedEvent.suppliesUsed && selectedEvent.suppliesUsed.length > 0 && (
            <Col xs={24}>
              <Text strong>Vật tư y tế đã sử dụng:</Text>
              <div style={{ marginTop: 8 }}>
                {selectedEvent.suppliesUsed.map((supply, index) => {
                  const supplyInfo = getSupplyName(
                    supply.medicalSupplyId,
                    supply,
                    medicalSupplies
                  );

                  return (
                    <div
                      key={index}
                      style={{
                        padding: 8,
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                        marginBottom: 8,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <Text strong>{supplyInfo.name}</Text>
                      <br />
                      <Text>
                        Số lượng: {supply.quantityUsed} {supplyInfo.unit}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </Col>
          )}
        </Row>
      </div>
    </Modal>
  );
};

export default MedicalEventDetailsModal;
