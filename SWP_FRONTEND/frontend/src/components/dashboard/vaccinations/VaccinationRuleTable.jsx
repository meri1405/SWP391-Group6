import React from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { formatAge } from "../../../utils/vaccinationRuleUtils";

/**
 * Table component for displaying vaccination rules
 */
const VaccinationRuleTable = ({ 
  vaccinationRules, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  const columns = [
    {
      title: "Tên quy tắc",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Mũi thứ",
      dataIndex: "doesNumber",
      key: "doesNumber",
      width: 80,
      align: "center",
      render: (value) => <Tag color="blue">Mũi {value}</Tag>,
    },
    {
      title: "Độ tuổi",
      key: "ageRange",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Tag color="green">
          {formatAge(record.minAge)} - {formatAge(record.maxAge)}
        </Tag>
      ),
    },
    {
      title: "Ngày tối thiểu",
      dataIndex: "intervalDays",
      key: "intervalDays",
      width: 150,
      align: "center",
      render: (value) => <Tag color="orange">{value} ngày</Tag>,
    },
    {
      title: "Bắt buộc",
      dataIndex: "mandatory",
      key: "mandatory",
      width: 100,
      align: "center",
      render: (mandatory) => (
        <Tag color={mandatory ? "red" : "default"}>
          {mandatory ? "Bắt buộc" : "Tự nguyện"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa quy tắc này?"
            onConfirm={() => onDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okType="danger"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={vaccinationRules}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Tổng ${total} quy tắc`,
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default VaccinationRuleTable;
