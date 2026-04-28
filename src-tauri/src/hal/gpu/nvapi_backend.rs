use async_trait::async_trait;
use futures::Stream;

use crate::hal::traits::*;
use crate::ipc::error::HardwareError;

/// NVIDIA GPU backend using NVAPI.
///
/// Phase 1: Stub — monitoring only, no control.
/// Phase 2+: Integrate with NVAPI for temperature/fan/power monitoring.
#[derive(Debug)]
pub struct NvapiBackend {
    info: DeviceInfo,
}

impl NvapiBackend {
    pub fn new() -> Self {
        Self {
            info: DeviceInfo {
                id: "gpu-nvidia-0".to_string(),
                name: "NVIDIA GPU".to_string(),
                device_type: DeviceType::Gpu,
                vendor: "NVIDIA".to_string(),
                model: "GeForce (NVAPI)".to_string(),
                backend: BackendType::Nvapi,
            },
        }
    }
}

impl DeviceDiscovery for NvapiBackend {
    async fn discover(&self) -> Vec<DeviceInfo> {
        log::info!("[NvapiBackend] discover called (stub)");
        vec![]
    }

    fn watch(&self) -> Box<dyn Stream<Item = DeviceChangeEvent> + Send> {
        Box::new(futures::stream::empty())
    }
}

#[async_trait]
impl HardwareDevice for NvapiBackend {
    fn device_info(&self) -> &DeviceInfo {
        &self.info
    }

    async fn read_status(&self) -> Result<DeviceStatus, HardwareError> {
        log::debug!("[NvapiBackend] read_status called (stub)");
        Ok(DeviceStatus {
            device_id: self.info.id.clone(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            gpu: Some(GpuStatus {
                temperature_core_c: 50.0,
                temperature_memory_c: None,
                core_clock_mhz: 1600,
                memory_clock_mhz: 1800,
                fan_speed_rpm: 0,
                fan_speed_percent: 0.0,
                power_usage_watts: 120.0,
                power_limit_watts: 200.0,
            }),
            cooling: None,
            lighting: None,
        })
    }
}
