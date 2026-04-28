import React, { useState } from 'react';
import { Card, Slider, Button, Space, Typography, message } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { GpuParamRanges } from '../../types/ipc';

const { Text } = Typography;

interface OverclockPanelProps {
  deviceId: string;
  paramRanges?: GpuParamRanges;
  initialValues?: {
    core_clock_offset_mhz: number;
    memory_clock_offset_mhz: number;
    power_limit_percent: number;
  };
}

const OverclockPanel: React.FC<OverclockPanelProps> = ({
  deviceId,
  paramRanges,
  initialValues,
}) => {
  const [coreOffset, setCoreOffset] = useState(initialValues?.core_clock_offset_mhz ?? 0);
  const [memOffset, setMemOffset] = useState(initialValues?.memory_clock_offset_mhz ?? 0);
  const [powerLimit, setPowerLimit] = useState(initialValues?.power_limit_percent ?? 100);
  const [loading, setLoading] = useState(false);

  const coreRange = paramRanges?.core_clock_offset ?? { min: -200, max: 300, step: 10 };
  const memRange = paramRanges?.memory_clock_offset ?? { min: -500, max: 500, step: 50 };
  const pwRange = paramRanges?.power_limit ?? { min: 50, max: 120, step: 1 };

  const handleApply = async () => {
    setLoading(true);
    try {
      await invoke('set_overclock_params', {
        deviceId,
        config: {
          core_clock_offset_mhz: coreOffset,
          memory_clock_offset_mhz: memOffset,
          power_limit_percent: powerLimit,
        },
      });
      message.success('Overclock parameters applied');
    } catch (err) {
      message.error(`Failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await invoke('reset_overclock', { deviceId });
      setCoreOffset(0);
      setMemOffset(0);
      setPowerLimit(100);
      message.success('Overclock reset to default');
    } catch (err) {
      message.error(`Failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Overclock" size="small">
      <div style={{ marginBottom: 16 }}>
        <Text>Core Clock Offset: {coreOffset >= 0 ? '+' : ''}{coreOffset} MHz</Text>
        <Slider {...{ min: coreRange.min, max: coreRange.max, step: coreRange.step, value: coreOffset, onChange: setCoreOffset, marks: { [coreRange.min]: `${coreRange.min}`, 0: '0', [coreRange.max]: `+${coreRange.max}` }, trackStyle: [{ backgroundColor: coreOffset > 100 ? '#faad14' : '#1890ff' }] } as any} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text>Memory Clock Offset: {memOffset >= 0 ? '+' : ''}{memOffset} MHz</Text>
        <Slider {...{ min: memRange.min, max: memRange.max, step: memRange.step, value: memOffset, onChange: setMemOffset, marks: { [memRange.min]: `${memRange.min}`, 0: '0', [memRange.max]: `+${memRange.max}` } } as any} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text>Power Limit: {powerLimit}%</Text>
        <Slider {...{ min: pwRange.min, max: pwRange.max, step: pwRange.step, value: powerLimit, onChange: setPowerLimit, marks: { [pwRange.min]: `${pwRange.min}%`, 100: '100%', [pwRange.max]: `${pwRange.max}%` }, trackStyle: [{ backgroundColor: powerLimit > 100 ? '#faad14' : '#1890ff' }] } as any} />
      </div>

      <Space>
        <Button type="primary" onClick={handleApply} loading={loading}>
          Apply
        </Button>
        <Button danger onClick={handleReset} loading={loading}>
          Reset to Default
        </Button>
      </Space>
    </Card>
  );
};

export default OverclockPanel;
