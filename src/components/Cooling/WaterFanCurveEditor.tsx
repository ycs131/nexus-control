import React from 'react';
import { Typography } from 'antd';
import type { FanCurvePoint } from '../../types/ipc';
import FanCurveEditor from '../GPU/FanCurveEditor';

const { Text } = Typography;

interface WaterFanCurveEditorProps {
  deviceId: string;
  initialPoints?: FanCurvePoint[];
}

const WaterFanCurveEditor: React.FC<WaterFanCurveEditorProps> = ({
  deviceId,
  initialPoints,
}) => {
  return (
    <div>
      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        Fan speed based on water temperature (20–65°C)
      </Text>
      <FanCurveEditor
        deviceId={deviceId}
        initialPoints={
          initialPoints ?? [
            { temperature: 30, speed_percent: 30 },
            { temperature: 40, speed_percent: 45 },
            { temperature: 50, speed_percent: 65 },
            { temperature: 60, speed_percent: 85 },
            { temperature: 65, speed_percent: 100 },
          ]
        }
        paramRanges={{
          fan_curve: { temp_min: 20, temp_max: 65, speed_min: 30, speed_max: 100 },
          core_clock_offset: { min: -200, max: 200, step: 10 },
          memory_clock_offset: { min: -500, max: 500, step: 50 },
          power_limit: { min: 50, max: 120, step: 1 },
        }}
      />
    </div>
  );
};

export default WaterFanCurveEditor;
