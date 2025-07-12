import React from "react";
import { Card, Row, Col } from "antd";

/**
 * Statistics component for vaccination rules
 */
const VaccinationRuleStats = ({ statistics }) => {
  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
      <Col span={8}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#1890ff", fontSize: "24px", margin: 0 }}>
              {statistics.total}
            </h3>
            <p style={{ margin: 0, color: "#666" }}>Tổng số quy tắc</p>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#52c41a", fontSize: "24px", margin: 0 }}>
              {statistics.mandatory}
            </h3>
            <p style={{ margin: 0, color: "#666" }}>Quy tắc bắt buộc</p>
          </div>
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#fa8c16", fontSize: "24px", margin: 0 }}>
              {statistics.optional}
            </h3>
            <p style={{ margin: 0, color: "#666" }}>Quy tắc tự nguyện</p>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default VaccinationRuleStats;
