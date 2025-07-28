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
import { HeartOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RespiratoryForm = ({ categoryData, onDataChange, modalMode }) => (
  <Card
    className="mb-6"
    style={{
      background: "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)",
      border: "1px solid #f44336",
    }}
  >
    <div className="mb-6">
      <Space align="center" size="middle">
        <Avatar
          size={40}
          icon={<HeartOutlined />}
          style={{ backgroundColor: "#d32f2f" }}
        />
        <Title level={3} style={{ margin: 0, color: "#c62828" }}>
          Hô hấp
        </Title>
      </Space>
    </div>

    <Row gutter={[24, 24]}>
      {/* Vital Signs */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Dấu hiệu sinh tồn</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Nhịp thở (lần/phút) *
              </Text>
              <InputNumber
                min={0}
                max={200}
                value={categoryData.breathingRate}
                onChange={(value) =>
                  onDataChange(
                    "RESPIRATORY",
                    "breathingRate",
                    value || 0
                  )
                }
                placeholder="Ví dụ: 20"
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Bình thường: 12-20 lần/phút
              </Text>
            </div>

            <div>
              <Text strong>SpO2 (%)</Text>
              <InputNumber
                min={0}
                max={100}
                value={categoryData.oxygenSaturation}
                onChange={(value) =>
                  onDataChange(
                    "RESPIRATORY",
                    "oxygenSaturation",
                    value || null
                  )
                }
                placeholder="Ví dụ: 98"
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Bình thường: ≥ 95%
              </Text>
            </div>

            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Âm thở *
              </Text>
              <Input
                value={categoryData.breathingSound}
                onChange={(e) =>
                  onDataChange(
                    "RESPIRATORY",
                    "breathingSound",
                    e.target.value
                  )
                }
                placeholder="Ví dụ: Rõ, bình thường"
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Âm phổi</Text>
              <Select
                value={categoryData.lungSounds}
                onChange={(value) =>
                  onDataChange("RESPIRATORY", "lungSounds", value)
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              >
                <Option value="CLEAR">Rõ</Option>
                <Option value="WHEEZE">Khò khè</Option>
                <Option value="CRACKLES">Ran ẩm</Option>
                <Option value="RHONCHI">Ran khô</Option>
                <Option value="DIMINISHED">Giảm</Option>
                <Option value="ABSENT">Mất</Option>
              </Select>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Physical Assessment */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Đánh giá thể chất</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Sự nở ngực</Text>
              <Select
                value={categoryData.chestExpansion}
                onChange={(value) =>
                  onDataChange("RESPIRATORY", "chestExpansion", value)
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              >
                <Option value="NORMAL">Bình thường</Option>
                <Option value="DECREASED">Giảm</Option>
                <Option value="ASYMMETRIC">Không đối xứng</Option>
                <Option value="BARREL_CHEST">Ngực thùng</Option>
              </Select>
            </div>

            <div>
              <Text strong>Điều trị</Text>
              <Input
                value={categoryData.treatment}
                onChange={(e) =>
                  onDataChange(
                    "RESPIRATORY",
                    "treatment",
                    e.target.value
                  )
                }
                placeholder="Thuốc, xịt, oxy..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Ngày tái khám</Text>
              <Input
                type="date"
                value={categoryData.followUpDate}
                onChange={(e) =>
                  onDataChange(
                    "RESPIRATORY",
                    "followUpDate",
                    e.target.value
                  )
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <Divider style={{ margin: "12px 0" }} />

            <div>
              <Text strong>Tiền sử</Text>
              <div style={{ marginTop: 8 }}>
                <Checkbox
                  checked={categoryData.asthmaHistory}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "asthmaHistory",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Tiền sử hen suyễn</Text>
                </Checkbox>
              </div>
              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.allergicRhinitis}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "allergicRhinitis",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Viêm mũi dị ứng</Text>
                </Checkbox>
              </div>
            </div>
          </Space>
        </Card>
      </Col>

      {/* Symptoms and Notes */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Triệu chứng & Ghi chú</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Triệu chứng</Text>
              <div style={{ marginTop: 8 }}>
                <Checkbox
                  checked={categoryData.wheezing}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "wheezing",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Thở khò khè</Text>
                </Checkbox>
              </div>
              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.cough}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "cough",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Ho</Text>
                </Checkbox>
              </div>
              <div style={{ marginTop: 4 }}>
                <Checkbox
                  checked={categoryData.breathingDifficulty}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "breathingDifficulty",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Khó thở</Text>
                </Checkbox>
              </div>

              <div style={{ marginTop: 8 }}>
                <Text strong>Tên bác sĩ khám</Text>
                <Input
                  value={categoryData.doctorName}
                  onChange={(e) =>
                    onDataChange(
                      "RESPIRATORY",
                      "doctorName",
                      e.target.value
                    )
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
                    onDataChange(
                      "RESPIRATORY",
                      "isAbnormal",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text style={{ color: "#d32f2f" }}>Bất thường</Text>
                </Checkbox>
              </div>
            </div>

            <div>
              <Text strong>Mô tả chi tiết</Text>
              <TextArea
                value={categoryData.description}
                onChange={(e) =>
                  onDataChange(
                    "RESPIRATORY",
                    "description",
                    e.target.value
                  )
                }
                placeholder="Mô tả tình trạng hô hấp của học sinh..."
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
                  onDataChange(
                    "RESPIRATORY",
                    "recommendations",
                    e.target.value
                  )
                }
                placeholder="Khuyến nghị điều trị, theo dõi..."
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

export default RespiratoryForm;
