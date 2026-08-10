'use client';

import { Layout, Dropdown, MenuProps, Avatar, Space, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Header({ collapsed, onToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <span className="font-semibold">{user?.name}</span>,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        logout();
      },
    },
  ];

  return (
    <AntHeader
      className="circuit-bg shadow-sm"
      style={{
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%'
      }}
    >
      <div className="flex items-center gap-4">
        {onToggle && (
          <div
            onClick={onToggle}
            className="cursor-pointer text-white hover:text-blue-300 transition-colors flex items-center justify-center p-1 rounded-md hover:bg-white/10"
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ fontSize: 20 }} />
            ) : (
              <MenuFoldOutlined style={{ fontSize: 20 }} />
            )}
          </div>
        )}
        <h4 className="text-xl md:text-2xl font-extrabold text-white tracking-wide m-0 drop-shadow-sm">
          RJL - Inventory System
        </h4>
      </div>

      <Space size={16} className="flex items-center">
        <Badge count={0} size="small">
          <BellOutlined style={{ fontSize: 18, color: 'white', cursor: 'pointer' }} />
        </Badge>

        {/* Sekarang akan muncul: Hello, Wissa Gamma */}
        <span className="hidden md:inline-block text-white font-medium">
          Hello, {user?.name}
        </span>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <div className="cursor-pointer flex items-center gap-2">
            <Avatar icon={<UserOutlined />} />
          </div>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}