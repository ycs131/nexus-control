import React from 'react';
import { Row, Col, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import type { CoolingConfig, CoolingStatus } from '../../types/ipc';
import PumpControlPanel from './PumpControlPanel';
import WaterFanCurveEditor from './WaterFanCurveEditor';
import AlarmConfigPanel from './AlarmConfigPanel';

const { Title } = Typography;

interface CoolingPageProps {
  coolingStatuses: CoolingStatus[];
  coolingConfigs?: Map<string, CoolingConfig>;
}

const CoolingPage: React.FC<CoolingPageProps> = ({ coolingStatuses, coolingConfigs }) => {
  const { deviceId } = useParams<{ deviceId: string }>();

  if (!deviceId) {
    return <div>No cooling device selected.</div>;
  }

  const status = coolingStatuses.find((c) => c.device_id === deviceId);
  const config = coolingConfigs?.get(deviceId);

  if (!status) {
    return <div>Cooling device "{deviceId}" not found.</div>;
  }

  return (
    <div>
      <Title level={4}>{deviceId}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <PumpControlPanel
            deviceId={deviceId}
            initialMode={config?.pump.mode}
            initialRpm={config?.pump.fixed_rpm}
          />
        </Col>
        <Col xs={24} lg={12}>
          <AlarmConfigPanel
            deviceId={deviceId}
            initialConfig={config?.alarm}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <WaterFanCurveEditor
            deviceId={deviceId}
            initialPoints={config?.fan_curve}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CoolingPage;
