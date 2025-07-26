import React from "react";
import {
  Card,
  Input,
  Select,
  Checkbox,
  Space,
  Row,
  Col,
  Typography,
  Avatar,
  Divider,
} from "antd";
import { SkinOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SkinForm = ({ categoryData, onDataChange, modalMode }) => (
  <Card
    className="mb-6"
    style={{
      background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
      border: "1px solid #ff9800",
      marginTop: "20px",
    }}
  >
    <div className="mb-6">
      <Space align="center" size="middle">
        <Avatar
          size={40}
          icon={<SkinOutlined />}
          style={{ backgroundColor: "#f57c00" }}
        />
        <Title level={3} style={{ margin: 0, color: "#e65100" }}>
          Da
        </Title>
      </Space>
    </div>

    <Row gutter={[24, 24]}>
      {/* Basic Skin Assessment */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Đánh giá cơ bản</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong style={{ color: "#d32f2f" }}>
                Màu da *
              </Text>
              <Input
                value={categoryData.skinColor}
                onChange={(e) =>
                  onDataChange("SKIN", "skinColor", e.target.value)
                }
                placeholder="Ví dụ: Hồng, vàng, xanh..."
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <div>
              <Text strong>Tông màu da</Text>
              <Select
                value={categoryData.skinTone}
                onChange={(value) =>
                  onDataChange("SKIN", "skinTone", value)
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              >
                <Option value="NORMAL">Bình thường</Option>
                <Option value="PALE">Nhợt nhạt</Option>
                <Option value="FLUSHED">Đỏ bừng</Option>
                <Option value="CYANOTIC">Tím tái</Option>
                <Option value="JAUNDICED">Vàng da</Option>
              </Select>
            </div>

            <div>
              <Text strong>Điều trị</Text>
              <Input
                value={categoryData.treatment}
                onChange={(e) =>
                  onDataChange("SKIN", "treatment", e.target.value)
                }
                placeholder="Thuốc bôi, kem dưỡng ẩm..."
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
                  onDataChange("SKIN", "followUpDate", e.target.value)
                }
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>
          </Space>
        </Card>
      </Col>

      {/* Skin Conditions */}
      <Col xs={24} md={8}>
        <Card
          title={<Text strong>Tình trạng da</Text>}
          size="small"
          className="h-full"
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.rashes}
                  onChange={(e) =>
                    onDataChange("SKIN", "rashes", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Phát ban</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.lesions}
                  onChange={(e) =>
                    onDataChange("SKIN", "lesions", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Tổn thương</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.dryness}
                  onChange={(e) =>
                    onDataChange("SKIN", "dryness", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Khô da</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.eczema}
                  onChange={(e) =>
                    onDataChange("SKIN", "eczema", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Chàm</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.psoriasis}
                  onChange={(e) =>
                    onDataChange("SKIN", "psoriasis", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Vảy nến</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.skinInfection}
                  onChange={(e) =>
                    onDataChange(
                      "SKIN",
                      "skinInfection",
                      e.target.checked
                    )
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Nhiễm trùng da</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.allergies}
                  onChange={(e) =>
                    onDataChange("SKIN", "allergies", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Dị ứng</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.acne}
                  onChange={(e) =>
                    onDataChange("SKIN", "acne", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Mụn trứng cá</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.scars}
                  onChange={(e) =>
                    onDataChange("SKIN", "scars", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Sẹo</Text>
                </Checkbox>
              </Col>
              <Col span={12}>
                <Checkbox
                  checked={categoryData.birthmarks}
                  onChange={(e) =>
                    onDataChange("SKIN", "birthmarks", e.target.checked)
                  }
                  disabled={modalMode === "view"}
                >
                  <Text>Vết bớt</Text>
                </Checkbox>
              </Col>
            </Row>

            <Divider style={{ margin: "12px 0" }} />

            <div>
              <Text strong>Tên bác sĩ khám</Text>
              <Input
                value={categoryData.doctorName}
                onChange={(e) =>
                  onDataChange("SKIN", "doctorName", e.target.value)
                }
                placeholder="Nhập tên bác sĩ thực hiện khám"
                style={{ width: "100%", marginTop: 4 }}
                disabled={modalMode === "view"}
              />
            </div>

            <Checkbox
              checked={categoryData.isAbnormal}
              onChange={(e) =>
                onDataChange("SKIN", "isAbnormal", e.target.checked)
              }
              disabled={modalMode === "view"}
            >
              <Text style={{ color: "#d32f2f" }}>Bất thường</Text>
            </Checkbox>
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
                  onDataChange("SKIN", "description", e.target.value)
                }
                placeholder="Mô tả tình trạng da của học sinh..."
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
                  onDataChange("SKIN", "recommendations", e.target.value)
                }
                placeholder="Khuyến nghị chăm sóc da, điều trị..."
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

export default SkinForm;
