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
} from "antd";
import { SmileOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OralForm = ({ categoryData, onDataChange, modalMode }) => (
  <Card
    className="mb-6"
    style={{
      background: "linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)",
      border: "1px solid #9c27b0",
      marginTop: "20px",
    }}
  >
    <div className="mb-6">
      <Space align="center" size="middle">
        <Avatar
          size={40}
          icon={<SmileOutlined />}
          style={{ backgroundColor: "#7b1fa2" }}
        />
        <Title level={3} style={{ margin: 0, color: "#6a1b9a" }}>
          Răng miệng
        </Title>
      </Space>
    </div>

    <Row gutter={[24, 24]}>
      {/* Basic Oral Assessment */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Kiểm tra cơ bản</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Tình trạng răng *
              </Text>
              <Input
                value={categoryData.teethCondition}
                onChange={(e) =>
                  onDataChange("ORAL", "teethCondition", e.target.value)
                }
                placeholder="Ví dụ: Tốt, có sâu răng, mất răng..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Tình trạng nướu *
              </Text>
              <Input
                value={categoryData.gumsCondition}
                onChange={(e) =>
                  onDataChange("ORAL", "gumsCondition", e.target.value)
                }
                placeholder="Ví dụ: Hồng, sưng, chảy máu..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Tình trạng lưỡi *
              </Text>
              <Input
                value={categoryData.tongueCondition}
                onChange={(e) =>
                  onDataChange("ORAL", "tongueCondition", e.target.value)
                }
                placeholder="Ví dụ: Bình thường, có vết loét..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Vệ sinh răng miệng</Text>
              <Select
                value={categoryData.oralHygiene}
                onChange={(value) =>
                  onDataChange("ORAL", "oralHygiene", value)
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              >
                <Option value="EXCELLENT">Rất tốt</Option>
                <Option value="GOOD">Tốt</Option>
                <Option value="FAIR">Trung bình</Option>
                <Option value="POOR">Kém</Option>
              </Select>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Detailed Oral Examination */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Kiểm tra chi tiết</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Số răng sâu</Text>
              <InputNumber
                min={0}
                max={32}
                value={categoryData.cavitiesCount}
                onChange={(value) =>
                  onDataChange("ORAL", "cavitiesCount", value || 0)
                }
                placeholder="0"
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Triệu chứng</Text>
              <div style={{ marginTop: 8 }}>
                <Checkbox
                  checked={categoryData.plaquePresent}
                  onChange={(e) =>
                    onDataChange(
                      "ORAL",
                      "plaquePresent",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Có mảng bám</Text>
                </Checkbox>
              </div>
              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.gingivitis}
                  onChange={(e) =>
                    onDataChange("ORAL", "gingivitis", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Viêm nướu</Text>
                </Checkbox>
              </div>
              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.mouthUlcers}
                  onChange={(e) =>
                    onDataChange("ORAL", "mouthUlcers", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Loét miệng</Text>
                </Checkbox>
              </div>

              <div style={{ marginTop: 8 }}>
                <Text strong>Tên bác sĩ khám</Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) =>
                    onDataChange("ORAL", "doctorName", e.target.value)
                  }
                  placeholder="Nhập tên bác sĩ thực hiện khám"
                  style={{ width: "100%", marginTop: 4 }}
                  disabled={modalMode === "view"}
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.isAbnormal}
                  onChange={(e) =>
                    onDataChange("ORAL", "isAbnormal", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text style={{ color: "#d32f2f" }}>Bất thường</Text>
                </Checkbox>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Notes and Recommendations */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Ghi chú & Khuyến nghị</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Mô tả chi tiết</Text>
              <TextArea
                value={categoryData.description}
                onChange={(e) =>
                  onDataChange("ORAL", "description", e.target.value)
                }
                placeholder="Mô tả tình trạng răng miệng của học sinh..."
                rows={3}
                style={{ marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Khuyến nghị</Text>
              <TextArea
                value={categoryData.recommendations}
                onChange={(e) =>
                  onDataChange("ORAL", "recommendations", e.target.value)
                }
                placeholder="Khuyến nghị về vệ sinh, điều trị..."
                rows={3}
                style={{ marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  </Card>
);

export default OralForm;
