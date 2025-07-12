import React from 'react';
import { Tag } from 'antd';
import dayjs from 'dayjs';
import { 
  convertJavaDateArray, 
  getResultStatusTag, 
  getStudentStatusDisplay 
} from './healthCheckUtils.jsx';

/**
 * Table column configurations for health check campaign
 */

/**
 * Get columns configuration for results table
 */
export const getResultColumns = () => [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
    render: (_, __, index) => index + 1,
  },
  {
    title: 'Tên học sinh',
    dataIndex: 'studentName',
    key: 'studentName',
    width: 150,
  },
  {
    title: 'Lớp',
    dataIndex: 'className',
    key: 'className',
    width: 80,
  },
  {
    title: 'Loại khám',
    dataIndex: 'category',
    key: 'category',
    width: 120,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status) => getResultStatusTag(status),
  },
  {
    title: 'Bất thường',
    dataIndex: 'isAbnormal',
    key: 'isAbnormal',
    width: 90,
    render: (isAbnormal) => (
      <Tag color={isAbnormal ? 'red' : 'green'}>
        {isAbnormal ? 'Có' : 'Không'}
      </Tag>
    ),
  },
  {
    title: 'Y tá thực hiện',
    dataIndex: 'nurseName',
    key: 'nurseName',
    width: 120,
  },
  {
    title: 'Thời gian',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 130,
    render: (date) => date ? convertJavaDateArray(date)?.format("HH:mm DD/MM/YYYY") : '',
  }
];

/**
 * Get columns configuration for eligible students table
 */
export const getEligibleStudentsColumns = () => [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
    render: (_, __, index) => index + 1,
  },
  {
    title: 'Họ và tên',
    dataIndex: 'fullName',
    key: 'fullName',
    width: 200,
    sorter: (a, b) => a.fullName.localeCompare(b.fullName),
  },
  {
    title: 'Lớp',
    dataIndex: 'className',
    key: 'className',
    width: 100,
    filters: [
      { text: '1A', value: '1A' },
      { text: '1B', value: '1B' },
      { text: '1C', value: '1C' },
      { text: '2A', value: '2A' },
      { text: '2B', value: '2B' },
      { text: '2C', value: '2C' },
      { text: '3A', value: '3A' },
      { text: '3B', value: '3B' },
      { text: '3C', value: '3C' },
      { text: '4A', value: '4A' },
      { text: '4B', value: '4B' },
      { text: '4C', value: '4C' },
      { text: '5A', value: '5A' },
      { text: '5B', value: '5B' },
      { text: '5C', value: '5C' },
    ],
    onFilter: (value, record) => record.className === value,
  },
  {
    title: 'Tuổi',
    dataIndex: 'age',
    key: 'age',
    width: 100,
    sorter: (a, b) => {
      const ageA = a.age || 0;
      const ageB = b.age || 0;
      return ageA - ageB;
    },
    render: (age, record) => {
      // Display age in years, similar to vaccination campaign's age in months
      if (age !== null && age !== undefined && age > 0) {
        return `${age} tuổi`;
      }
      // Fallback to calculate from dob if available
      if (record.dob) {
        const birthDate = dayjs(record.dob);
        const currentAge = dayjs().diff(birthDate, 'year');
        return `${currentAge} tuổi`;
      }
      return 'N/A';
    },
  },
  {
    title: 'Trạng thái',
    dataIndex: 'statusDisplay',
    key: 'statusDisplay',
    width: 150,
    filters: [
      { text: 'Đã xác nhận khám', value: 'CONFIRMED' },
      { text: 'Từ chối khám', value: 'DECLINED' },
      { text: 'Chờ phản hồi', value: 'PENDING' },
      { text: 'Chưa gửi thông báo', value: 'NO_FORM' },
      { text: 'Chưa phản hồi', value: 'NO_RESPONSE' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (statusDisplay, record) => {
      const { color, text } = getStudentStatusDisplay(record);
      return <Tag color={color}>{text}</Tag>;
    },
  },
];
