import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Typography, Spin, Alert, Row, Col, Divider } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { parentApi } from "../../../api/parentApi";
import dayjs from "dayjs";


const { Text, Title } = Typography;

const HealthCheckResults = () => {
  const [healthCheckResults, setHealthCheckResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [healthCheckDetail, setHealthCheckDetail] = useState(null);
  const { getToken } = useAuth();

  // Load health check results on component mount
  const loadHealthCheckResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await parentApi.getAllHealthCheckResultsForParent(token);

      if (response && response.results && Array.isArray(response.results)) {
        setHealthCheckResults(response.results);
      } else if (response && Array.isArray(response)) {
        setHealthCheckResults(response);
      } else {
        setHealthCheckResults([]);
      }
    } catch (err) {
      console.error("Error loading health check results:", err);
      setError(err.message || "Không thể tải kết quả khám sức khỏe");
      setHealthCheckResults([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadHealthCheckResults();
  }, [loadHealthCheckResults]);

  // Load health check details for selected result
  const loadHealthCheckDetails = useCallback(
    async (resultId) => {
      setDetailLoading(true);

      try {
        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await parentApi.getHealthCheckResultDetail(
          resultId,
          token
        );

        if (response && response.result) {
          setHealthCheckDetail(response.result);
        } else if (response) {
          setHealthCheckDetail(response);
        } else {
          setHealthCheckDetail(null);
        }
      } catch (err) {
        console.error("Error loading health check details:", err);
        setHealthCheckDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [getToken]
  );

  // Handle view button click
  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowModal(true);
    loadHealthCheckDetails(result.resultId);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
    setHealthCheckDetail(null);
  };

  // Helper function to format date
  const formatDate = (dateInput) => {
    if (!dateInput) return "Chưa cập nhật";
    
    try {
      if (Array.isArray(dateInput)) {
        const [year, month, day] = dateInput;
        return `${day}/${month}/${year}`;
      }
      return dayjs(dateInput).format("DD/MM/YYYY");
    } catch {
      return "Chưa cập nhật";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    const statusMap = {
      NORMAL: "Bình thường",
      MINOR_CONCERN: "Cần theo dõi",
      NEEDS_ATTENTION: "Cần chú ý",
      REQUIRES_FOLLOWUP: "Cần tái khám",
      URGENT: "Khẩn cấp"
    };
    return statusMap[status] || status;
  };

  // Get category text
  const getCategoryText = (category) => {
    const categoryMap = {
      VISION: "Thị lực",
      HEARING: "Thính lực", 
      ORAL: "Răng miệng",
      SKIN: "Da liễu",
      RESPIRATORY: "Hô hấp"
    };
    return categoryMap[category] || category;
  };

  // Define table columns for Ant Design Table
  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'left',
      render: (text) => text || "N/A",
    },
    {
      title: 'Loại khám',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      render: (category) => getCategoryText(category),
    },
    {
      title: 'Ngày khám',
      dataIndex: 'performedAt',
      key: 'performedAt',
      align: 'center',
      render: (date) => formatDate(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <Text>{getStatusText(status)}</Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
          size="small"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="health-check-results">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" tip="Đang tải kết quả khám sức khỏe..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="health-check-results">
        <Alert
          message="Có lỗi xảy ra"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={loadHealthCheckResults} type="primary">
              Thử lại
            </Button>
          }
          style={{ margin: '20px' }}
        />
      </div>
    );
  }

  return (
    <div className="health-check-results">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <h3>Kết quả khám sức khỏe</h3>
      </div>

      <Table
        columns={columns}
        dataSource={healthCheckResults}
        rowKey="resultId"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} kết quả`,
        }}
        locale={{
          emptyText: 'Không có kết quả khám sức khỏe nào'
        }}
        scroll={{ x: 800 }}
      />

      {/* Modal for health check details */}
      <Modal
        title="Chi tiết kết quả khám sức khỏe"
        open={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Spin size="large" tip="Đang tải kết quả khám..." />
          </div>
        ) : healthCheckDetail ? (
          <div style={{ padding: '0' }}>
            {/* Section 1: Student Information */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                Thông tin học sinh
              </Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Họ tên:</Text>
                    <Text>{healthCheckDetail.studentName || selectedResult?.studentName || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Lớp:</Text>
                    <Text>{healthCheckDetail.studentClass || selectedResult?.studentClass || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày sinh:</Text>
                    <Text>{formatDate(healthCheckDetail.dateOfBirth)}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày khám:</Text>
                    <Text>{formatDate(healthCheckDetail.performedAt || selectedResult?.performedAt)}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Section 2: Campaign Information */}
            {healthCheckDetail.campaign && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                    Thông tin chiến dịch khám
                  </Title>
                  <Row gutter={[24, 16]}>
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Tên chiến dịch:</Text>
                        <Text>{healthCheckDetail.campaign.name || "N/A"}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Địa điểm:</Text>
                        <Text>{healthCheckDetail.campaign.location || "N/A"}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày bắt đầu:</Text>
                        <Text>{formatDate(healthCheckDetail.campaign.startDate)}</Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Ngày kết thúc:</Text>
                        <Text>{formatDate(healthCheckDetail.campaign.endDate)}</Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div style={{ display: 'flex', marginBottom: '8px' }}>
                        <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Mô tả:</Text>
                        <Text>{healthCheckDetail.campaign.description || "N/A"}</Text>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Divider />
              </>
            )}

            {/* Section 3: Body Metrics */}
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                Chỉ số cơ thể
              </Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Cân nặng:</Text>
                    <Text>{healthCheckDetail.weight || selectedResult?.weight || "N/A"} kg</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Chiều cao:</Text>
                    <Text>{healthCheckDetail.height || selectedResult?.height || "N/A"} cm</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>BMI:</Text>
                    <Text>{healthCheckDetail.bmi || selectedResult?.bmi || "N/A"}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '120px', marginRight: '8px' }}>Kết luận:</Text>
                    <Text>{getStatusText(healthCheckDetail.status || selectedResult?.status)}</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Category-specific Details */}
            {healthCheckDetail.categoryDetails && Object.keys(healthCheckDetail.categoryDetails).length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                  Chi tiết khám chuyên khoa
                </Title>
                <Row gutter={[24, 16]}>
                  {/* VISION Category */}
                  {(healthCheckDetail.category || selectedResult?.category) === 'VISION' && (
                    <>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Thị lực mắt trái:</Text>
                          <Text>{healthCheckDetail.categoryDetails.visionLeft || "N/A"}/10</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Thị lực mắt phải:</Text>
                          <Text>{healthCheckDetail.categoryDetails.visionRight || "N/A"}/10</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.visionLeftWithGlass !== undefined && healthCheckDetail.categoryDetails.visionLeftWithGlass !== null && (
                        <Col span={12}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mắt trái (có kính):</Text>
                            <Text>{healthCheckDetail.categoryDetails.visionLeftWithGlass === 0 ? "Không có" : `${healthCheckDetail.categoryDetails.visionLeftWithGlass}/10`}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.visionRightWithGlass !== undefined && healthCheckDetail.categoryDetails.visionRightWithGlass !== null && (
                        <Col span={12}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mắt phải (có kính):</Text>
                            <Text>{healthCheckDetail.categoryDetails.visionRightWithGlass === 0 ? "Không có" : `${healthCheckDetail.categoryDetails.visionRightWithGlass}/10`}</Text>
                          </div>
                        </Col>
                      )}
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Cần đeo kính:</Text>
                          <Text>{healthCheckDetail.categoryDetails.needsGlasses ? "Có" : "Không"}</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.description && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mô tả:</Text>
                            <Text>{healthCheckDetail.categoryDetails.description}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.doctorName && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Bác sĩ: </Text>
                            <Text>{healthCheckDetail.categoryDetails.doctorName}</Text>
                          </div>
                        </Col>
                      )}
                    </>
                  )}

                  {/* HEARING Category */}
                  {(healthCheckDetail.category || selectedResult?.category) === 'HEARING' && (
                    <>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tai trái:</Text>
                          <Text>{healthCheckDetail.categoryDetails.leftEar || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tai phải:</Text>
                          <Text>{healthCheckDetail.categoryDetails.rightEar || "N/A"}</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.description && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mô tả:</Text>
                            <Text>{healthCheckDetail.categoryDetails.description}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.doctorName && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Bác sĩ: </Text>
                            <Text>{healthCheckDetail.categoryDetails.doctorName}</Text>
                          </div>
                        </Col>
                      )}
                    </>
                  )}

                  {/* ORAL Category */}
                  {(healthCheckDetail.category || selectedResult?.category) === 'ORAL' && (
                    <>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tình trạng răng:</Text>
                          <Text>{healthCheckDetail.categoryDetails.teethCondition || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tình trạng nướu:</Text>
                          <Text>{healthCheckDetail.categoryDetails.gumsCondition || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tình trạng lưỡi:</Text>
                          <Text>{healthCheckDetail.categoryDetails.tongueCondition || "N/A"}</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.description && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mô tả:</Text>
                            <Text>{healthCheckDetail.categoryDetails.description}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.doctorName && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Bác sĩ: </Text>
                            <Text>{healthCheckDetail.categoryDetails.doctorName}</Text>
                          </div>
                        </Col>
                      )}
                    </>
                  )}

                  {/* SKIN Category */}
                  {(healthCheckDetail.category || selectedResult?.category) === 'SKIN' && (
                    <>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Màu da:</Text>
                          <Text>{healthCheckDetail.categoryDetails.skinColor || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Phát ban:</Text>
                          <Text>{healthCheckDetail.categoryDetails.rashes}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Tổn thương:</Text>
                          <Text>{healthCheckDetail.categoryDetails.lesions}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khô da:</Text>
                          <Text>{healthCheckDetail.categoryDetails.dryness}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Eczema:</Text>
                          <Text>{healthCheckDetail.categoryDetails.eczema}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Psoriasis:</Text>
                          <Text>{healthCheckDetail.categoryDetails.psoriasis}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Nhiễm trùng da:</Text>
                          <Text>{healthCheckDetail.categoryDetails.skinInfection}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Dị ứng:</Text>
                          <Text>{healthCheckDetail.categoryDetails.allergies}</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.description && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mô tả:</Text>
                            <Text>{healthCheckDetail.categoryDetails.description}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.treatment && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Điều trị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.treatment}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.doctorName && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Bác sĩ: </Text>
                            <Text>{healthCheckDetail.categoryDetails.doctorName}</Text>
                          </div>
                        </Col>
                      )}
                    </>
                  )}

                  {/* RESPIRATORY Category */}
                  {(healthCheckDetail.category || selectedResult?.category) === 'RESPIRATORY' && (
                    <>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Nhịp thở:</Text>
                          <Text>{healthCheckDetail.categoryDetails.breathingRate || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Âm thanh thở:</Text>
                          <Text>{healthCheckDetail.categoryDetails.breathingSound || "N/A"}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khò khè:</Text>
                          <Text>{healthCheckDetail.categoryDetails.wheezing}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Ho:</Text>
                          <Text>{healthCheckDetail.categoryDetails.cough}</Text>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ display: 'flex', marginBottom: '8px' }}>
                          <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khó thở:</Text>
                          <Text>{healthCheckDetail.categoryDetails.breathingDifficulty}</Text>
                        </div>
                      </Col>
                      {healthCheckDetail.categoryDetails.description && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Mô tả:</Text>
                            <Text>{healthCheckDetail.categoryDetails.description}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.recommendations && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                            <Text>{healthCheckDetail.categoryDetails.recommendations}</Text>
                          </div>
                        </Col>
                      )}
                      {healthCheckDetail.categoryDetails.doctorName && (
                        <Col span={24}>
                          <div style={{ display: 'flex', marginBottom: '8px' }}>
                            <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Bác sĩ: </Text>
                            <Text>{healthCheckDetail.categoryDetails.doctorName}</Text>
                          </div>
                        </Col>
                      )}
                    </>
                  )}
                </Row>
              </div>
            )}

            {/* General examination details */}
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
                Kết luận
              </Title>
              <Row gutter={[24, 16]}>
                <Col span={24}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Ghi chú kết quả:</Text>
                    <Text>{healthCheckDetail.resultNotes || "Không có ghi chú"}</Text>
                  </div>
                </Col>

                {healthCheckDetail.recommendations && (
                  <Col span={24}>
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                      <Text strong style={{ minWidth: '140px', marginRight: '8px' }}>Khuyến nghị:</Text>
                      <Text>{healthCheckDetail.recommendations}</Text>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          </div>
        ) : (
          <Alert
            message="Không có dữ liệu"
            description="Không có dữ liệu khám sức khỏe cho học sinh này."
            type="warning"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default HealthCheckResults;
