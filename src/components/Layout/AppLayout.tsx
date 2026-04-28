import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BulbOutlined,
  SettingOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import type { DeviceInfo } from '../../types/ipc';

const { Sider, Content } = Layout;

interface SidebarProps {
  devices: DeviceInfo[];
  alarmCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ devices, alarmCount }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const gpuDevices = devices.filter((d) => d.device_type === 'gpu' && d.connected);
  const coolingDevices = devices.filter((d) => d.device_type === 'cooling' && d.connected);

  const menuItems = [
    {
      key: '/',
      icon: React.createElement(DashboardOutlined),
      label: 'Dashboard',
    },
    ...(gpuDevices.length > 0
      ? [
          {
            key: 'gpu-group',
            icon: React.createElement(ThunderboltOutlined),
            label: 'GPU Control',
            children: gpuDevices.map((gpu) => ({
              key: `/gpu/${gpu.id}`,
              label: gpu.name,
            })),
          },
        ]
      : []),
    ...(coolingDevices.length > 0
      ? [
          {
            key: 'cooling-group',
            icon: React.createElement(FireOutlined),
            label: 'Water Cooling',
            children: coolingDevices.map((c) => ({
              key: `/cooling/${c.id}`,
              label: c.name,
            })),
          },
        ]
      : []),
    {
      key: '/lighting',
      icon: React.createElement(BulbOutlined),
      label: 'Lighting',
    },
    {
      key: '/settings',
      icon: React.createElement(SettingOutlined),
      label: 'Settings',
    },
  ];

  if (alarmCount > 0) {
    menuItems.push({
      key: 'alarm-badge',
      icon: React.createElement(WarningOutlined, { style: { color: '#ff4d4f' } }),
      label: `Alarms (${alarmCount})`,
    });
  }

  return (
    <Sider width={220} theme="dark" collapsible>
      <div
        style={{
          height: 48,
          margin: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 1,
        }}
      >
        NexusControl
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => {
          if (key !== 'alarm-badge') navigate(key);
        }}
      />
    </Sider>
  );
};

const AppLayout: React.FC<{ devices: DeviceInfo[]; alarmCount: number }> = ({
  devices,
  alarmCount,
}) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar devices={devices} alarmCount={alarmCount} />
      <Layout>
        <Content style={{ margin: 16, padding: 24, background: '#f5f5f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
