import React from 'react';
import { Card, Descriptions, Tag, Progress } from 'antd';
import type { GpuStatus } from '../../types/ipc';

interface GpuCardProps {
  gpu: GpuStatus;
}

const GpuCard: React.FC<GpuCardProps> = ({ gpu }) => {
  const tempColor = gpu.temperature_core > 85 ? '#ff4d4f' : gpu.temperature_core > 70 ? '#faad14' : '#52c41a';

  return (
    <Card
      title={gpu.device_id}
      size="small"
      extra={
        <Tag color={tempColor}>{gpu.temperature_core.toFixed(1)}°C</Tag>
      }
    >
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Core Temp">
          <span style={{ color: tempColor, fontWeight: 600 }}>
            {gpu.temperature_core.toFixed(1)}°C
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Memory Temp">
          {gpu.temperature_memory.toFixed(1)}°C
        </Descriptions.Item>
        <Descriptions.Item label="Core Clock">
          {gpu.core_clock_mhz} MHz
        </Descriptions.Item>
        <Descriptions.Item label="Memory Clock">
          {gpu.memory_clock_mhz} MHz
        </Descriptions.Item>
        <Descriptions.Item label="Power">
          {gpu.power_usage_watts} W
        </Descriptions.Item>
        <Descriptions.Item label="Fan Speed">
          {gpu.fan_speed_rpm} RPM
        </Descriptions.Item>
      </Descriptions>
      <Progress
        percent={gpu.fan_speed_percent}
        size="small"
        format={(p) => `${p}%`}
        strokeColor={gpu.fan_speed_percent > 80 ? '#ff4d4f' : '#1890ff'}
      />
    </Card>
  );
};

export default GpuCard;
