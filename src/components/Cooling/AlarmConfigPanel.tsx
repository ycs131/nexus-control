import React, { useState } from 'react';
import { Card, Slider, Switch, Button, Space, Typography, message, Alert } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { AlarmConfig } from '../../types/ipc';

const { Text } = Typography;

interface AlarmConfigPanelProps {
  deviceId: string;
  initialConfig?: AlarmConfig;
  onAlarmTriggered?: (deviceId: string) => void;
}

const AlarmConfigPanel: React.FC<AlarmConfigPanelProps> = ({
  deviceId,
  initialConfig,
}) => {
  const [threshold, setThreshold] = useState(initialConfig?.water_temp_threshold ?? 60);
  const [enabled, setEnabled] = useState(initialConfig?.enabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(initialConfig?.sound_enabled ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await invoke('set_alarm_config', {
        deviceId,
        alarm: {
          water_temp_threshold: threshold,
          enabled,
          sound_enabled: soundEnabled,
        },
      });
      message.success('Alarm config saved');
    } catch (err) {
      message.error(`Failed: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Alarm Configuration" size="small">
      <Alert
        message="Safety Alert"
        description="When water temperature exceeds the threshold or pump stops, an alarm will be triggered with popup and sound."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text>Water Temperature Threshold</Text>
          <Text strong>{threshold}°C</Text>
        </div>
        <Slider {...{ min: 40, max: 80, step: 1, value: threshold, onChange: setThreshold, marks: { '40': '40°C', '60': '60°C', '80': '80°C' }, trackStyle: [{ backgroundColor: threshold >= 70 ? '#ff4d4f' : '#faad14' }] } as any} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Space>
          <Switch checked={enabled} onChange={setEnabled} />
          <Text>Enable alarm</Text>
        </Space>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Switch checked={soundEnabled} onChange={setSoundEnabled} disabled={!enabled} />
          <Text>Sound alarm</Text>
        </Space>
      </div>

      <Button type="primary" onClick={handleSave} loading={saving}>
        Save Alarm Config
      </Button>
    </Card>
  );
};

export default AlarmConfigPanel;
