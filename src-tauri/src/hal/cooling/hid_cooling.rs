use async_trait::async_trait;
use futures::Stream;

use crate::hal::traits::*;
use crate::ipc::error::HardwareError;

/// USB HID water cooling backend (Corsair Hydro X, EKWB, etc.).
///
/// Phase 1: Stub — returns simulated data.
/// Phase 2+: Implement hidapi-rs protocol for each supported device family.
#[derive(Debug)]
pub struct HidCoolingBackend {
    info: DeviceInfo,
}

impl HidCoolingBackend {
    pub fn new(vendor: &str, model: &str) -> Self {
        Self {
            info: DeviceInfo {
                id: format!("cooling-{}-{}", vendor.to_lowercase(), model.to_lowercase()),
                name: format!("{} {}", vendor, model),
                device_type: DeviceType::Cooling,
                vendor: vendor.to_string(),
                model: model.to_string(),
                backend: BackendType::HidCooling,
            },
        }
    }
}

impl DeviceDiscovery for HidCoolingBackend {
    async fn discover(&self) -> Vec<DeviceInfo> {
        // Phase 2: enumerate HID devices matching known VID/PID
        log::info!("[HidCoolingBackend] discover called (stub)");
        vec![self.info.clone()]
    }

    fn watch(&self) -> Box<dyn Stream<Item = DeviceChangeEvent> + Send> {
        Box::new(futures::stream::empty())
    }
}

#[async_trait]
impl HardwareDevice for HidCoolingBackend {
    fn device_info(&self) -> &DeviceInfo {
        &self.info
    }

    async fn read_status(&self) -> Result<DeviceStatus, HardwareError> {
        log::debug!("[HidCoolingBackend] read_status called (stub)");
        Ok(DeviceStatus {
            device_id: self.info.id.clone(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            gpu: None,
            cooling: Some(CoolingStatus {
                water_temperature_c: 35.0,
                pump_speed_rpm: 2200,
                pump_speed_percent: 60.0,
                fan_speed_rpm: 800,
                fan_speed_percent: 35.0,
            }),
            lighting: None,
        })
    }
}

#[async_trait]
impl Controllable for HidCoolingBackend {
    type Params = crate::models::cooling::CoolingConfig;

    async fn apply(&self, _params: &Self::Params) -> Result<(), HardwareError> {
        log::info!("[HidCoolingBackend] apply called (stub)");
        Ok(())
    }

    async fn reset(&self) -> Result<(), HardwareError> {
        log::info!("[HidCoolingBackend] reset called (stub)");
        Ok(())
    }

    fn param_ranges(&self) -> ParamRanges {
        ParamRanges::default()
    }
}
