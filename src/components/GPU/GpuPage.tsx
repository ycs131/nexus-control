import React from 'react';
import { Row, Col, Typography } from 'antd';
import { useParams } from 'react-router-dom';
import type { GpuStatus, GpuConfig, GpuParamRanges } from '../../types/ipc';
import FanCurveEditor from './FanCurveEditor';
import OverclockPanel from './OverclockPanel';

const { Title } = Typography;

interface GpuPageProps {
  gpuStatuses: GpuStatus[];
  gpuConfigs?: Map<string, GpuConfig>;
  paramRanges?: Map<string, GpuParamRanges>;
}

const GpuPage: React.FC<GpuPageProps> = ({ gpuStatuses, gpuConfigs, paramRanges }) => {
  const { deviceId } = useParams<{ deviceId: string }>();

  if (!deviceId) {
    return <div>No GPU selected.</div>;
  }

  const status = gpuStatuses.find((g) => g.device_id === deviceId);
  const config = gpuConfigs?.get(deviceId);
  const ranges = paramRanges?.get(deviceId);

  if (!status) {
    return <div>GPU device "{deviceId}" not found.</div>;
  }

  return (
    <div>
      <Title level={4}>{deviceId}</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <FanCurveEditor
            deviceId={deviceId}
            initialPoints={config?.fan_curve}
            paramRanges={ranges}
          />
        </Col>
        <Col xs={24} lg={10}>
          <OverclockPanel
            deviceId={deviceId}
            paramRanges={ranges}
            initialValues={
              config
                ? {
                    core_clock_offset_mhz: config.core_clock_offset_mhz,
                    memory_clock_offset_mhz: config.memory_clock_offset_mhz,
                    power_limit_percent: config.power_limit_percent,
                  }
                : undefined
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default GpuPage;
