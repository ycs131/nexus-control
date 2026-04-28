import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import type { LightingStatus } from '../../types/ipc';

interface LightingCardProps {
  lighting: LightingStatus;
}

const LightingCard: React.FC<LightingCardProps> = ({ lighting }) => {
  return (
    <Card title={lighting.device_id} size="small" extra={<Tag>{lighting.current_mode}</Tag>}>
      <Descriptions column={2} size="small">
        <Descriptions.Item label="Mode">
          {lighting.current_mode}
        </Descriptions.Item>
        <Descriptions.Item label="Brightness">
          {lighting.brightness}%
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={lighting.connected ? 'green' : 'red'}>
            {lighting.connected ? 'Connected' : 'Disconnected'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default LightingCard;
