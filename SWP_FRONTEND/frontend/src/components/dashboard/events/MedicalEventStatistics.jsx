import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

/**
 * Medical Event Statistics Component
 */
const MedicalEventStatistics = ({ statistics }) => {
  return (
    <Row gutter={[16, 16]} className="statistics-row">
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Tổng số sự kiện"
            value={statistics.total}
            prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Chờ xử lý"
            value={statistics.pending}
            prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Đã xử lý"
            value={statistics.processed}
            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default MedicalEventStatistics;
