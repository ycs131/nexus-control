import React, { useState, useCallback } from 'react';
import { Row, Col, Typography, message } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { LightingConfig, LightingStatus, ZoneConfig } from '../../types/ipc';
import LightingPreview from './LightingPreview';
import ZoneConfigPanel from './ZoneConfigPanel';
import PresetManager from './PresetManager';

const { Title } = Typography;

interface LightingPageProps {
  lightingStatuses: LightingStatus[];
  lightingConfigs?: Map<string, LightingConfig>;
}

const LightingPage: React.FC<LightingPageProps> = ({ lightingStatuses, lightingConfigs }) => {
  const [zones, setZones] = useState<Map<string, ZoneConfig[]>>(() => {
    const m = new Map<string, ZoneConfig[]>();
    lightingConfigs?.forEach((config) => {
      m.set(config.device_id, [...config.zones]);
    });
    return m;
  });

  const handleZoneChange = useCallback((deviceId: string, zone: ZoneConfig) => {
    setZones((prev) => {
      const next = new Map(prev);
      const deviceZones = [...(next.get(deviceId) ?? [])];
      const idx = deviceZones.findIndex((z) => z.zone_id === zone.zone_id);
      if (idx >= 0) deviceZones[idx] = zone;
      else deviceZones.push(zone);
      next.set(deviceId, deviceZones);
      return next;
    });
  }, []);

  const handleSyncAll = useCallback(async () => {
    try {
      const configs: LightingConfig[] = [];
      zones.forEach((deviceZones, deviceId) => {
        configs.push({ device_id: deviceId, zones: deviceZones });
      });
      await invoke('sync_all_lighting', { config: configs });
      message.success('All lighting synchronized');
    } catch (err) {
      message.error(`Failed: ${err}`);
    }
  }, [zones]);

  const currentZones = zones.get(lightingStatuses[0]?.device_id ?? '') ?? [];
  const firstZone = currentZones[0];

  return (
    <div>
      <Title level={4}>Lighting Control</Title>
      <Row gutter={[16, 16]}>
        {lightingStatuses.map((ls) => (
          <Col xs={24} lg={12} key={ls.device_id}>
            <LightingPreview
              mode={firstZone?.mode ?? 'Static'}
              colors={firstZone?.colors ?? [{ r: 255, g: 255, b: 255 }]}
              brightness={firstZone?.brightness ?? 100}
              speed={firstZone?.speed ?? 50}
            />
            <div style={{ marginTop: 16 }}>
              <ZoneConfigPanel
                deviceId={ls.device_id}
                zones={zones.get(ls.device_id) ?? []}
                onZoneChange={(zone) => handleZoneChange(ls.device_id, zone)}
                onApplyAll={handleSyncAll}
              />
            </div>
          </Col>
        ))}
        <Col xs={24} lg={12}>
          <PresetManager />
        </Col>
      </Row>
    </div>
  );
};

export default LightingPage;
