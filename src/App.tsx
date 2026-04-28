import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './components/Dashboard/DashboardPage';
import GpuPage from './components/GPU/GpuPage';
import CoolingPage from './components/Cooling/CoolingPage';
import LightingPage from './components/Lighting/LightingPage';
import SettingsPage from './components/Settings/SettingsPage';
import NotFound from './pages/NotFound';
import { useHardwareStatus } from './hooks/useHardwareStatus';

function App() {
  const { status, devices, loading, alarms } = useHardwareStatus();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route
              element={<AppLayout devices={devices} alarmCount={alarms.length} />}
            >
              <Route
                path="/"
                element={<DashboardPage status={status} loading={loading} />}
              />
              <Route
                path="/gpu/:deviceId"
                element={
                  <GpuPage
                    gpuStatuses={status?.gpu_devices ?? []}
                  />
                }
              />
              <Route
                path="/cooling/:deviceId"
                element={
                  <CoolingPage
                    coolingStatuses={status?.cooling_devices ?? []}
                  />
                }
              />
              <Route
                path="/lighting"
                element={
                  <LightingPage
                    lightingStatuses={status?.lighting_devices ?? []}
                  />
                }
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
