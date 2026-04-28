import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import type { CoolingStatus } from '../../types/ipc';

interface CoolingCardProps {
  cooling: CoolingStatus;
}

const CoolingCard: React.FC<CoolingCardProps> = ({ cooling }) => {
  const waterTempColor =
    cooling.water_temp_c >= 60 ? '#ff4d4f' : cooling.water_temp_c >= 50 ? '#faad14' : '#52c41a';

  return (
    <Card
      title={cooling.device_id}
      size="small"
      extra={
        <Tag color={waterTempColor}>{cooling.water_temp_c.toFixed(1)}°C</Tag>
      }
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Water Temp">
          <span style={{ color: waterTempColor, fontWeight: 600 }}>
            {cooling.water_temp_c.toFixed(1)}°C
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Pump RPM">
          {cooling.pump_rpm}
        </Descriptions.Item>
        <Descriptions.Item label="Pump Mode">
          <Tag>{cooling.pump_mode}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Fan RPM">
          {cooling.fan_rpm}
        </Descriptions.Item>
        <Descriptions.Item label="Fan Speed">
          {cooling.fan_speed_percent}%
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default CoolingCard;
