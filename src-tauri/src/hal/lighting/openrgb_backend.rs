use async_trait::async_trait;
use futures::Stream;

use crate::hal::traits::*;
use crate::ipc::error::HardwareError;

/// OpenRGB backend for RGB lighting control.
///
/// Phase 1: Stub — returns simulated data.
/// Phase 2+: Integrate with openrgb-rs crate (TCP/pipe protocol).
#[derive(Debug)]
pub struct OpenRgbBackend {
    info: DeviceInfo,
}

impl OpenRgbBackend {
    pub fn new() -> Self {
        Self {
            info: DeviceInfo {
                id: "rgb-openrgb-0".to_string(),
                name: "OpenRGB Controller".to_string(),
                device_type: DeviceType::Lighting,
                vendor: "OpenRGB".to_string(),
                model: "Generic RGB".to_string(),
                backend: BackendType::OpenRgb,
            },
        }
    }
}

impl DeviceDiscovery for OpenRgbBackend {
    async fn discover(&self) -> Vec<DeviceInfo> {
        // Phase 2: connect to OpenRGB SDK server and enumerate devices
        log::info!("[OpenRgbBackend] discover called (stub)");
        vec![self.info.clone()]
    }

    fn watch(&self) -> Box<dyn Stream<Item = DeviceChangeEvent> + Send> {
        Box::new(futures::stream::empty())
    }
}

#[async_trait]
impl HardwareDevice for OpenRgbBackend {
    fn device_info(&self) -> &DeviceInfo {
        &self.info
    }

    async fn read_status(&self) -> Result<DeviceStatus, HardwareError> {
        log::debug!("[OpenRgbBackend] read_status called (stub)");
        Ok(DeviceStatus {
            device_id: self.info.id.clone(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            gpu: None,
            cooling: None,
            lighting: Some(LightingStatus {
                mode: "static".to_string(),
                color_count: 10,
                brightness: 80.0,
                is_synced: true,
            }),
        })
    }
}

#[async_trait]
impl Controllable for OpenRgbBackend {
    type Params = crate::models::lighting::LightingConfig;

    async fn apply(&self, _params: &Self::Params) -> Result<(), HardwareError> {
        log::info!("[OpenRgbBackend] apply called (stub)");
        Ok(())
    }

    async fn reset(&self) -> Result<(), HardwareError> {
        log::info!("[OpenRgbBackend] reset called (stub)");
        Ok(())
    }

    fn param_ranges(&self) -> ParamRanges {
        ParamRanges::default()
    }
}
