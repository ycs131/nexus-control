import React, { useState } from 'react';
import { Card, Button, Radio, InputNumber, Typography, message } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { PumpMode } from '../../types/ipc';

const { Text } = Typography;

interface PumpControlPanelProps {
  deviceId: string;
  initialMode?: PumpMode;
  initialRpm?: number;
}

const PumpControlPanel: React.FC<PumpControlPanelProps> = ({
  deviceId,
  initialMode = 'Standard',
  initialRpm,
}) => {
  const [mode, setMode] = useState<PumpMode>(initialMode);
  const [customRpm, setCustomRpm] = useState<number>(initialRpm ?? 1500);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await invoke('set_pump_mode', {
        deviceId,
        mode,
        fixedRpm: mode === 'Custom' ? customRpm : undefined,
      });
      message.success(`Pump mode set to ${mode}`);
    } catch (err) {
      message.error(`Failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Pump Control" size="small">
      <div style={{ marginBottom: 16 }}>
        <Text strong>Pump Speed Mode</Text>
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value as PumpMode)}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
        >
          <Radio value="Silent">Silent — lowest noise</Radio>
          <Radio value="Standard">Standard — balanced</Radio>
          <Radio value="Extreme">Extreme — maximum cooling</Radio>
          <Radio value="Custom">Custom — fixed RPM</Radio>
        </Radio.Group>
      </div>

      {mode === 'Custom' && (
        <div style={{ marginBottom: 16 }}>
          <Text>Fixed RPM</Text>
          <InputNumber
            min={800}
            max={5000}
            step={100}
            value={customRpm}
            onChange={(v) => v && setCustomRpm(v)}
            style={{ width: 160, marginTop: 8 }}
            addonAfter="RPM"
          />
        </div>
      )}

      <Button type="primary" onClick={handleApply} loading={loading}>
        Apply Pump Mode
      </Button>
    </Card>
  );
};

export default PumpControlPanel;
