import React from 'react';
import { Row, Col, Card, Spin, Empty, Typography } from 'antd';
import {
  ThunderboltOutlined,
  FireOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import type { DeviceStatus, GpuStatus, CoolingStatus, LightingStatus } from '../../types/ipc';
import GpuCard from './GpuCard';
import CoolingCard from './CoolingCard';
import LightingCard from './LightingCard';

const { Title } = Typography;

interface DashboardPageProps {
  status: DeviceStatus | null;
  loading: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ status, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
        <Spin size="large" tip="Detecting hardware..." />
      </div>
    );
  }

  if (!status || (!status.gpu_devices?.length && !status.cooling_devices?.length && !status.lighting_devices?.length)) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              No compatible hardware detected. Please ensure your devices are connected.
            </span>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>
        Dashboard
      </Title>

      {status.gpu_devices && status.gpu_devices.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>
            <ThunderboltOutlined style={{ marginRight: 8 }} />
            GPU
          </Title>
          <Row gutter={[16, 16]}>
            {status.gpu_devices.map((gpu: GpuStatus) => (
              <Col xs={24} sm={12} lg={8} key={gpu.device_id}>
                <GpuCard gpu={gpu} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {status.cooling_devices && status.cooling_devices.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>
            <FireOutlined style={{ marginRight: 8 }} />
            Water Cooling
          </Title>
          <Row gutter={[16, 16]}>
            {status.cooling_devices.map((cooling: CoolingStatus) => (
              <Col xs={24} sm={12} lg={8} key={cooling.device_id}>
                <CoolingCard cooling={cooling} />
              </Col>
            ))}
          </Row>
        </div>
      )}

      {status.lighting_devices && status.lighting_devices.length > 0 && (
        <div>
          <Title level={5}>
            <BulbOutlined style={{ marginRight: 8 }} />
            Lighting
          </Title>
          <Row gutter={[16, 16]}>
            {status.lighting_devices.map((lighting: LightingStatus) => (
              <Col xs={24} sm={12} lg={8} key={lighting.device_id}>
                <LightingCard lighting={lighting} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
