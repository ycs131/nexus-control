use async_trait::async_trait;
use futures::Stream;
use std::pin::Pin;
use std::task::{Context, Poll};

use crate::hal::traits::*;
use crate::ipc::error::HardwareError;

/// AMD GPU backend using the AMD Display Library (ADL).
///
/// Phase 1: Stub — returns simulated data for development.
/// Phase 2+: Integrate with ADL C API via FFI (adl-sys crate).
#[derive(Debug)]
pub struct AdlBackend {
    info: DeviceInfo,
}

impl AdlBackend {
    pub fn new() -> Self {
        Self {
            info: DeviceInfo {
                id: "gpu-amd-0".to_string(),
                name: "AMD Radeon GPU".to_string(),
                device_type: DeviceType::Gpu,
                vendor: "AMD".to_string(),
                model: "Radeon (ADL)".to_string(),
                backend: BackendType::Adl,
            },
        }
    }
}

impl DeviceDiscovery for AdlBackend {
    async fn discover(&self) -> Vec<DeviceInfo> {
        // Phase 2: call ADL_Main_Control_Create / ADL_Adapter_NumberOfAdapters
        log::info!("[AdlBackend] discover called (stub)");
        vec![self.info.clone()]
    }

    fn watch(&self) -> Box<dyn Stream<Item = DeviceChangeEvent> + Send> {
        Box::new(DeviceWatchStream { polled: false })
    }
}

#[async_trait]
impl HardwareDevice for AdlBackend {
    fn device_info(&self) -> &DeviceInfo {
        &self.info
    }

    async fn read_status(&self) -> Result<DeviceStatus, HardwareError> {
        // Phase 2: call ADL_Overdrive5_CurrentActivity_Get
        log::debug!("[AdlBackend] read_status called (stub)");
        Ok(DeviceStatus {
            device_id: self.info.id.clone(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            gpu: Some(GpuStatus {
                temperature_core_c: 45.0,
                temperature_memory_c: Some(52.0),
                core_clock_mhz: 1800,
                memory_clock_mhz: 2000,
                fan_speed_rpm: 1200,
                fan_speed_percent: 40.0,
                power_usage_watts: 150.0,
                power_limit_watts: 250.0,
            }),
            cooling: None,
            lighting: None,
        })
    }
}

#[async_trait]
impl Controllable for AdlBackend {
    type Params = crate::models::gpu::GpuConfig;

    async fn apply(&self, _params: &Self::Params) -> Result<(), HardwareError> {
        // Phase 2: call ADL_Overdrive5_FanControl and ADL_Overdrive5_SetClock
        log::info!("[AdlBackend] apply called (stub)");
        Ok(())
    }

    async fn reset(&self) -> Result<(), HardwareError> {
        // Phase 2: call ADL_Overdrive5 to restore defaults
        log::info!("[AdlBackend] reset called (stub)");
        Ok(())
    }

    fn param_ranges(&self) -> ParamRanges {
        ParamRanges::default()
    }
}

// Simple one-shot stream for device watch (placeholder)
struct DeviceWatchStream {
    polled: bool,
}

impl Stream for DeviceWatchStream {
    type Item = DeviceChangeEvent;

    fn poll_next(mut self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        if self.polled {
            Poll::Ready(None)
        } else {
            self.polled = true;
            Poll::Pending
        }
    }
}
