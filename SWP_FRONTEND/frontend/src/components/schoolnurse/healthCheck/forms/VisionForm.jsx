import React from "react";
import {
  Card,
  Input,
  InputNumber,
  Space,
  Row,
  Col,
  Typography,
  Avatar,
  Switch,
  DatePicker,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const VisionForm = ({ categoryData, onDataChange, readOnly }) => (
  <Card
    className="mb-6"
    style={{
      background: "linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)",
      border: "1px solid #2196f3",
      marginTop: "20px",
    }}
  >
    <div className="mb-6">
      <Space align="center" size="middle">
        <Avatar
          size={40}
          icon={<EyeOutlined />}
          style={{ backgroundColor: "#1976d2" }}
        />
        <Title level={3} style={{ margin: 0, color: "#1976d2" }}>
          Thị lực
        </Title>
      </Space>
    </div>

    <Row gutter={[24, 24]}>
      {/* Vision Tests */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Độ thị lực</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Thị lực mắt trái (không kính) *
              </Text>
              <InputNumber
                min={0}
                max={10}
                step={1}
                value={categoryData.visionLeft}
                onChange={(value) =>
                  onDataChange("VISION", "visionLeft", value || 0)
                }
                placeholder="Ví dụ: 10/10"
                style={{ width: "100%", marginTop: 4 }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Thị lực mắt phải (không kính) *
              </Text>
              <InputNumber
                min={0}
                max={10}
                step={1}
                value={categoryData.visionRight}
                onChange={(value) =>
                  onDataChange("VISION", "visionRight", value || 0)
                }
                placeholder="Ví dụ: 10/10"
                style={{ width: "100%", marginTop: 4 }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Text strong>Thị lực mắt trái (có kính)</Text>
              <InputNumber
                min={0}
                max={10}
                step={1}
                value={categoryData.visionLeftWithGlass}
                onChange={(value) =>
                  onDataChange(
                    "VISION",
                    "visionLeftWithGlass",
                    value || 0
                  )
                }
                placeholder="Để trống nếu không đeo kính"
                style={{ width: "100%", marginTop: 4 }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Text strong>Thị lực mắt phải (có kính)</Text>
              <InputNumber
                min={0}
                max={10}
                step={1}
                value={categoryData.visionRightWithGlass}
                onChange={(value) =>
                  onDataChange(
                    "VISION",
                    "visionRightWithGlass",
                    value || 0
                  )
                }
                placeholder="Để trống nếu không đeo kính"
                style={{ width: "100%", marginTop: 4 }}
                disabled={readOnly}
              />
            </div>
          </Space>
        </Card>
      </Col>

      {/* Additional Vision Tests */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Thông tin bổ sung</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Tên bác sĩ khám *
              </Text>
              <Input
                value={categoryData.doctorName}
                onChange={(e) =>
                  onDataChange("VISION", "doctorName", e.target.value)
                }
                placeholder="Nhập tên bác sĩ..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Text strong>Ngày khám</Text>
              <DatePicker
                value={categoryData.dateOfExamination ? dayjs(categoryData.dateOfExamination) : dayjs()}
                placeholder="Ngày khám được tự động ghi nhận"
                style={{ width: "100%", marginTop: 4 }}
                disabled={true}
                format="DD/MM/YYYY"
              />
            </div>

            <div>
              <Text strong>Kết quả bất thường</Text>
              <div style={{ marginTop: 4 }}>
                <Switch
                  checked={categoryData.isAbnormal || false}
                  onChange={(checked) =>
                    onDataChange("VISION", "isAbnormal", checked)
                  }
                  disabled={readOnly}
                  checkedChildren="Có"
                  unCheckedChildren="Không"
                />
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
                value={categoryData.visionDescription}
                onChange={(e) =>
                  onDataChange(
                    "VISION",
                    "visionDescription",
                    e.target.value
                  )
                }
                placeholder="Mô tả tình trạng thị lực của học sinh..."
                rows={3}
                style={{ marginTop: 4 }}
                disabled={readOnly}
              />
            </div>

            <div>
              <Text strong>Khuyến nghị</Text>
              <TextArea
                value={categoryData.recommendations}
                onChange={(e) =>
                  onDataChange(
                    "VISION",
                    "recommendations",
                    e.target.value
                  )
                }
                placeholder="Khuyến nghị điều trị hoặc theo dõi..."
                rows={3}
                style={{ marginTop: 4 }}
                disabled={readOnly}
              />
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  </Card>
);

export default VisionForm;
