import React from "react";
import { Row, Col, Input, Select, DatePicker } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { EVENT_TYPES, SEVERITY_LEVELS, FILTER_OPTIONS } from "../../../constants/medicalEventConstants";

const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Medical Event Filters Component
 */
const MedicalEventFilters = ({
  searchText,
  filterProcessed,
  filterType,
  filterSeverity,
  dateRange,
  onSearchChange,
  onProcessedFilterChange,
  onTypeFilterChange,
  onSeverityFilterChange,
  onDateRangeChange,
}) => {
  return (
    <div className="filter-section">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm học sinh, địa điểm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Trạng thái"
            value={filterProcessed}
            onChange={onProcessedFilterChange}
            style={{ width: "100%" }}
          >
            <Option value={FILTER_OPTIONS.PROCESSED.ALL}>Tất cả</Option>
            <Option value={FILTER_OPTIONS.PROCESSED.PENDING}>Chờ xử lý</Option>
            <Option value={FILTER_OPTIONS.PROCESSED.PROCESSED}>Đã xử lý</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Loại sự kiện"
            value={filterType}
            onChange={onTypeFilterChange}
            style={{ width: "100%" }}
          >
            <Option value="all">Tất cả loại</Option>
            {EVENT_TYPES.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Mức độ"
            value={filterSeverity}
            onChange={onSeverityFilterChange}
            style={{ width: "100%" }}
          >
            <Option value="all">Tất cả mức độ</Option>
            {SEVERITY_LEVELS.map((level) => (
              <Option key={level.value} value={level.value}>
                {level.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <RangePicker
            style={{ width: "100%" }}
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default MedicalEventFilters;
