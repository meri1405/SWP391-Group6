import React from "react";
import {
  Card,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Space,
  Row,
  Col,
  Typography,
  Avatar,
  Divider,
} from "antd";
import { AudioOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HearingForm = ({ categoryData, onDataChange, modalMode }) => (
  <Card
    style={{
      marginBottom: "24px",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      marginTop: "20px",
    }}
  >
    {/* Header */}
    <div
      style={{
        background: "#f5f5f5",
        padding: "16px 20px",
        margin: "-1px -1px 20px -1px",
        borderRadius: "8px 8px 0 0",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Space align="center" size="middle">
        <Avatar
          size={40}
          icon={<AudioOutlined />}
          style={{ backgroundColor: "#1890ff" }}
        />
        <div>
          <Title level={4} style={{ margin: 0, color: "#333" }}>
            Thính lực
          </Title>
          <Text style={{ color: "#666", fontSize: "14px" }}>
            Đánh giá chức năng nghe và kiểm tra tai
          </Text>
        </div>
      </Space>
    </div>

    <div style={{ padding: "0 20px 20px" }}>
      <Row gutter={[24, 24]}>
        {/* Hearing Tests */}
        <Col xs={24} lg={8}>
          <Card
            title="Kiểm tra thính lực"
            size="small"
            style={{
              height: "100%",
              borderRadius: "6px",
              border: "1px solid #f0f0f0",
            }}
            headStyle={{
              background: "#fafafa",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <div>
                <Text strong style={{ color: "#d32f2f", fontSize: "14px" }}>
                  Tai trái (dB) *
                </Text>
                <InputNumber
                  min={0}
                  max={120}
                  value={categoryData.leftEar}
                  onChange={(value) => {
                    // Ensure we pass a valid number or null, not undefined
                    const validValue = value !== null && value !== undefined && !isNaN(value) ? Number(value) : null;
                    onDataChange("HEARING", "leftEar", validValue);
                  }}
                  placeholder="Ví dụ: 20"
                  style={{
                    width: "100%",
                    marginTop: "4px",
                  }}
                  size="large"
                  disabled={modalMode === "view"}
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Bình thường: ≤ 25dB
                </Text>
              </div>

              <div>
                <Text strong style={{ color: "#d32f2f", fontSize: "14px" }}>
                  Tai phải (dB) *
                </Text>
                <InputNumber
                  min={0}
                  max={120}
                  value={categoryData.rightEar}
                  onChange={(value) => {
                    // Ensure we pass a valid number or null, not undefined
                    const validValue = value !== null && value !== undefined && !isNaN(value) ? Number(value) : null;
                    onDataChange("HEARING", "rightEar", validValue);
                  }}
                  placeholder="Ví dụ: 20"
                  style={{
                    width: "100%",
                    marginTop: "4px",
                  }}
                  size="large"
                  disabled={modalMode === "view"}
                />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Bình thường: ≤ 25dB
                </Text>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  Độ nhạy thính lực
                </Text>
                <Select
                  value={categoryData.hearingAcuity}
                  onChange={(value) =>
                    onDataChange("HEARING", "hearingAcuity", value)
                  }
                  style={{
                    width: "100%",
                    marginTop: "4px",
                  }}
                  size="large"
                  placeholder="Chọn mức độ"
                  disabled={modalMode === "view"}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="MILD_LOSS">Giảm nhẹ</Option>
                  <Option value="MODERATE_LOSS">Giảm vừa</Option>
                  <Option value="SEVERE_LOSS">Giảm nặng</Option>
                  <Option value="PROFOUND_LOSS">Điếc</Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  Đo thính lực
                </Text>
                <Select
                  value={categoryData.tympanometry}
                  onChange={(value) =>
                    onDataChange("HEARING", "tympanometry", value)
                  }
                  style={{
                    width: "100%",
                    marginTop: "4px",
                  }}
                  size="large"
                  placeholder="Chọn loại"
                  disabled={modalMode === "view"}
                >
                  <Option value="NORMAL">Bình thường</Option>
                  <Option value="FLAT">Phẳng</Option>
                  <Option value="NEGATIVE">Âm</Option>
                  <Option value="SHALLOW">Nông</Option>
                  <Option value="DEEP">Sâu</Option>
                </Select>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Ear Examination */}
        <Col xs={24} lg={8}>
          <Card
            title="Kiểm tra tai"
            size="small"
            style={{
              height: "100%",
              borderRadius: "6px",
              border: "1px solid #f0f0f0",
            }}
            headStyle={{
              background: "#fafafa",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <div>
                <Text
                  strong
                  style={{ marginBottom: "8px", display: "block" }}
                >
                  Tình trạng tai
                </Text>
                <Space direction="vertical" size="small">
                  <Checkbox
                    checked={categoryData.earWaxPresent}
                    onChange={(e) =>
                      onDataChange(
                        "HEARING",
                        "earWaxPresent",
                        e.target.checked
                      )
                    }
                    disabled={modalMode === "view"}
                  >
                    <Text>Có ráy tai</Text>
                  </Checkbox>

                  <Checkbox
                    checked={categoryData.earInfection}
                    onChange={(e) =>
                      onDataChange(
                        "HEARING",
                        "earInfection",
                        e.target.checked
                      )
                    }
                    disabled={modalMode === "view"}
                  >
                    <Text style={{ color: "#d32f2f" }}>Nhiễm trùng tai</Text>
                  </Checkbox>
                </Space>
              </div>

              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  Tên bác sĩ khám
                </Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) =>
                    onDataChange("HEARING", "doctorName", e.target.value)
                  }
                  placeholder="Nhập tên bác sĩ thực hiện khám"
                  style={{ marginTop: "4px" }}
                  size="large"
                  disabled={modalMode === "view"}
                />
              </div>

              <Divider style={{ margin: "12px 0" }} />

              <div>
                <Checkbox
                  checked={categoryData.isAbnormal}
                  onChange={(e) =>
                    onDataChange(
                      "HEARING",
                      "isAbnormal",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text
                    style={{
                      color: categoryData.isAbnormal ? "#d32f2f" : "#52c41a",
                      fontWeight: "500",
                    }}
                  >
                    {categoryData.isAbnormal ? "Bất thường" : "Bình thường"}
                  </Text>
                </Checkbox>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Notes and Recommendations */}
        <Col xs={24} lg={8}>
          <Card
            title="Ghi chú & Khuyến nghị"
            size="small"
            style={{
              height: "100%",
              borderRadius: "6px",
              border: "1px solid #f0f0f0",
            }}
            headStyle={{
              background: "#fafafa",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "6px 6px 0 0",
            }}
          >
            <Space
              direction="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  Mô tả chi tiết
                </Text>
                <TextArea
                  value={categoryData.description}
                  onChange={(e) =>
                    onDataChange(
                      "HEARING",
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Mô tả tình trạng thính lực của học sinh..."
                  rows={4}
                  style={{
                    marginTop: "4px",
                    resize: "none",
                  }}
                  showCount
                  maxLength={500}
                  disabled={modalMode === "view"}
                />
              </div>

              <div>
                <Text strong style={{ fontSize: "14px" }}>
                  Khuyến nghị
                </Text>
                <TextArea
                  value={categoryData.recommendations}
                  onChange={(e) =>
                    onDataChange(
                      "HEARING",
                      "recommendations",
                      e.target.value
                    )
                  }
                  placeholder="Khuyến nghị điều trị hoặc theo dõi..."
                  rows={4}
                  style={{
                    marginTop: "4px",
                    resize: "none",
                  }}
                  showCount
                  maxLength={500}
                  disabled={modalMode === "view"}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  </Card>
);

export default HearingForm;
