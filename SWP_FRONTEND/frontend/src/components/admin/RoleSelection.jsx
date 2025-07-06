import React from 'react';
import { USER_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '../../constants/userRoles';

const RoleSelection = ({ onRoleSelect }) => {
  const roleOptions = [
    {
      key: USER_ROLES.SCHOOLNURSE,
      label: ROLE_LABELS[USER_ROLES.SCHOOLNURSE],
      description: ROLE_DESCRIPTIONS[USER_ROLES.SCHOOLNURSE],
      color: '#1890ff',
      backgroundColor: '#f6ffed'
    },
    {
      key: USER_ROLES.MANAGER,
      label: ROLE_LABELS[USER_ROLES.MANAGER],
      description: ROLE_DESCRIPTIONS[USER_ROLES.MANAGER],
      color: '#fa8c16',
      backgroundColor: '#fff7e6'
    },
    {
      key: USER_ROLES.ADMIN,
      label: ROLE_LABELS[USER_ROLES.ADMIN],
      description: ROLE_DESCRIPTIONS[USER_ROLES.ADMIN],
      color: '#f5222d',
      backgroundColor: '#fff1f0'
    }
  ];

  const handleMouseEnter = (e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h3 style={{ marginBottom: '32px', color: '#1890ff' }}>
        Chọn vai trò cho người dùng mới
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        {roleOptions.map(role => (
          <div
            key={role.key}
            onClick={() => onRoleSelect(role.key)}
            style={{
              border: `2px solid ${role.color}`,
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: role.backgroundColor
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h4 style={{ color: role.color, marginBottom: '8px' }}>
              {role.label}
            </h4>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              {role.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
