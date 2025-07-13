import React from "react";
import { Button, Space, Tooltip, Tag, Typography, Popconfirm } from "antd";
import { EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { formatDate } from "../../../utils/timeUtils";
import { getEventTypeConfig, getSeverityConfig } from "../../../utils/configUtils";

const { Text } = Typography;

/**
 * Table columns configuration for Medical Events
 */
export const createMedicalEventColumns = (onViewEvent, onProcessEvent, isViewOnly) => [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
    render: (text) => <Text strong>#{text}</Text>,
  },
  {
    title: "Thời gian",
    dataIndex: "occurrenceTime",
    key: "occurrenceTime", 
    width: 140,
    render: (text) => formatDate(text),
  },
  {
    title: "Học sinh",
    key: "student",
    width: 180,
    render: (_, record) => (
      <div>
        <Text strong>
          {record.student?.firstName} {record.student?.lastName}
        </Text>
        <br />
        <Text type="secondary">{record.student?.className}</Text>
      </div>
    ),
  },
  {
    title: "Loại sự kiện",
    dataIndex: "eventType",
    key: "eventType",
    width: 140,
    render: (type) => {
      const config = getEventTypeConfig(type);
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "Mức độ",
    dataIndex: "severityLevel",
    key: "severityLevel",
    width: 120,
    render: (severity) => {
      const config = getSeverityConfig(severity);
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "Địa điểm",
    dataIndex: "location",
    key: "location",
    width: 120,
  },
  {
    title: "Trạng thái",
    dataIndex: "processed",
    key: "processed",
    width: 120,
    render: (processed, record) => (
      <div>
        <Tag color={processed ? "green" : "orange"}>
          {processed ? "Đã xử lý" : "Chờ xử lý"}
        </Tag>
        {processed && record.processedTime && (
          <div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatDate(record.processedTime)}
            </Text>
          </div>
        )}
      </div>
    ),
  },
  {
    title: "Hành động",
    key: "actions",
    width: 150,
    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onViewEvent(record.id)}
            size="small"
          />
        </Tooltip>
        {!record.processed && !isViewOnly && (
          <Popconfirm
            title="Đánh dấu đã xử lý?"
            description="Bạn có chắc chắn muốn đánh dấu sự kiện này là đã xử lý?"
            onConfirm={() => onProcessEvent(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Đánh dấu đã xử lý">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                size="small"
                style={{ color: "#52c41a" }}
              />
            </Tooltip>
          </Popconfirm>
        )}
      </Space>
    ),
  },
];
