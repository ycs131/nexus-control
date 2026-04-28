import React from 'react';
import { Card, Select, Slider, Button, Space, Typography } from 'antd';
import type { LightingMode, RgbColor, ZoneConfig } from '../../types/ipc';

const { Text } = Typography;

interface ZoneConfigPanelProps {
  deviceId: string;
  zones: ZoneConfig[];
  onZoneChange: (zone: ZoneConfig) => void;
  onApplyAll: () => void;
}

const LIGHTING_MODES: { value: LightingMode; label: string }[] = [
  { value: 'Static', label: 'Static' },
  { value: 'Breathing', label: 'Breathing' },
  { value: 'Rainbow', label: 'Rainbow' },
  { value: 'ColorCycle', label: 'Color Cycle' },
  { value: 'Flashing', label: 'Flashing' },
  { value: 'MusicSync', label: 'Music Sync' },
];

const ZoneConfigPanel: React.FC<ZoneConfigPanelProps> = ({
  deviceId: _deviceId,
  zones,
  onZoneChange,
  onApplyAll,
}) => {
  if (!zones.length) {
    return (
      <Card title="Zone Configuration" size="small">
        <Text type="secondary">No zones configured for this device.</Text>
      </Card>
    );
  }

  return (
    <Card title="Zone Configuration" size="small">
      {zones.map((zone, idx) => (
        <div
          key={zone.zone_id}
          style={{
            marginBottom: 20,
            padding: 16,
            border: '1px solid #f0f0f0',
            borderRadius: 8,
          }}
        >
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            Zone {idx + 1}: {zone.zone_id}
          </Text>

          <div style={{ marginBottom: 12 }}>
            <Text>Mode</Text>
            <Select
              value={zone.mode}
              onChange={(mode: LightingMode) => onZoneChange({ ...zone, mode })}
              options={LIGHTING_MODES}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text>Brightness</Text>
            <Slider
              min={0}
              max={100}
              value={zone.brightness}
              onChange={(brightness) => onZoneChange({ ...zone, brightness })}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text>Speed</Text>
            <Slider
              min={0}
              max={100}
              value={zone.speed}
              onChange={(speed) => onZoneChange({ ...zone, speed })}
            />
          </div>

          {zone.mode !== 'Rainbow' && zone.mode !== 'MusicSync' && (
            <div>
              <Text>Colors</Text>
              {zone.colors.map((color: RgbColor, cIdx: number) => (
                <Space key={cIdx} style={{ marginTop: 8 }}>
                  <input
                    type="color"
                    value={`#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const r = parseInt(hex.slice(1, 3), 16);
                      const g = parseInt(hex.slice(3, 5), 16);
                      const b = parseInt(hex.slice(5, 7), 16);
                      const newColors = [...zone.colors];
                      newColors[cIdx] = { r, g, b };
                      onZoneChange({ ...zone, colors: newColors });
                    }}
                    style={{ width: 32, height: 32, padding: 0, border: 'none', cursor: 'pointer' }}
                  />
                </Space>
              ))}
            </div>
          )}
        </div>
      ))}

      <Button type="primary" onClick={onApplyAll} block>
        Sync All Lighting
      </Button>
    </Card>
  );
};

export default ZoneConfigPanel;
