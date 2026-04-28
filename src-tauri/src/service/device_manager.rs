use crate::hal::traits::DeviceInfo;
use crate::ipc::commands::*;
use crate::ipc::error::ApiError;
use crate::models::cooling::{AlarmConfig, PumpMode};
use crate::models::gpu::FanCurvePoint;
use crate::models::profile::Profile;

/// Manages the lifecycle of all discovered hardware devices.
///
/// Responsibilities:
/// - Device discovery and caching
/// - Routing commands to the appropriate HAL backend
/// - Hotplug event handling
#[derive(Debug)]
pub struct DeviceManager {
    devices: Vec<DeviceInfo>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            devices: Vec::new(),
        }
    }

    /// Perform a full refresh of all connected hardware.
    pub async fn refresh(&mut self) -> Vec<DeviceInfo> {
        // Phase 2: iterate all DeviceDiscovery implementations
        log::info!("[DeviceManager] refresh called (stub)");
        self.devices.clear();
        self.devices
    }

    pub async fn get_gpu_status(
        &self,
        _device_id: &str,
    ) -> Result<GetGpuStatusResponse, ApiError> {
        // Phase 2: delegate to GPU backend
        Err(ApiError::DeviceNotFound(_device_id.to_string()))
    }

    pub async fn set_gpu_fan_curve(
        &self,
        _device_id: &str,
        _fan_curve: Vec<FanCurvePoint>,
    ) -> Result<(), ApiError> {
        // Phase 2: delegate to Controllable::apply
        log::info!("[DeviceManager] set_gpu_fan_curve (stub)");
        Ok(())
    }

    pub async fn set_overclock_params(
        &self,
        _device_id: &str,
        _core_offset: i32,
        _mem_offset: i32,
        _power_limit: u8,
    ) -> Result<(), ApiError> {
        log::info!("[DeviceManager] set_overclock_params (stub)");
        Ok(())
    }

    pub async fn reset_overclock(&self, _device_id: &str) -> Result<(), ApiError> {
        log::info!("[DeviceManager] reset_overclock (stub)");
        Ok(())
    }

    pub async fn get_cooling_status(
        &self,
        _device_id: &str,
    ) -> Result<GetCoolingStatusResponse, ApiError> {
        Err(ApiError::DeviceNotFound(_device_id.to_string()))
    }

    pub async fn set_pump_mode(
        &self,
        _device_id: &str,
        _mode: PumpMode,
        _fixed_rpm: Option<u16>,
    ) -> Result<(), ApiError> {
        log::info!("[DeviceManager] set_pump_mode (stub)");
        Ok(())
    }

    pub async fn set_cooling_fan_curve(
        &self,
        _device_id: &str,
        _fan_curve: Vec<FanCurvePoint>,
    ) -> Result<(), ApiError> {
        log::info!("[DeviceManager] set_cooling_fan_curve (stub)");
        Ok(())
    }

    pub async fn set_alarm_config(
        &self,
        _device_id: &str,
        _alarm: AlarmConfig,
    ) -> Result<(), ApiError> {
        log::info!("[DeviceManager] set_alarm_config (stub)");
        Ok(())
    }

    /// Apply a full profile to all matching devices.
    pub async fn apply_profile(&self, _profile: &Profile) -> Result<(), ApiError> {
        log::info!("[DeviceManager] apply_profile (stub)");
        Ok(())
    }
}
