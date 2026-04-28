use async_trait::async_trait;
use futures::Stream;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;

use crate::ipc::error::HardwareError;

// ---------------------------------------------------------------------------
// DeviceInfo — static metadata returned at discovery time
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub id: String,
    pub name: String,
    pub device_type: DeviceType,
    pub vendor: String,
    pub model: String,
    pub backend: BackendType,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum DeviceType {
    Gpu,
    Cooling,
    Lighting,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BackendType {
    Adl,           // AMD Display Library
    Nvapi,         // NVIDIA NVAPI (monitoring only)
    HidCooling,    // USB HID water cooling (Corsair, EKWB)
    OpenRgb,       // OpenRGB protocol
    DirectHidRgb,  // Direct HID RGB control
}

// ---------------------------------------------------------------------------
// DeviceStatus — live sensor readings
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceStatus {
    pub device_id: String,
    pub timestamp: String,
    pub gpu: Option<GpuStatus>,
    pub cooling: Option<CoolingStatus>,
    pub lighting: Option<LightingStatus>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuStatus {
    pub temperature_core_c: f32,
    pub temperature_memory_c: Option<f32>,
    pub core_clock_mhz: u32,
    pub memory_clock_mhz: u32,
    pub fan_speed_rpm: u32,
    pub fan_speed_percent: f32,
    pub power_usage_watts: f32,
    pub power_limit_watts: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoolingStatus {
    pub water_temperature_c: f32,
    pub pump_speed_rpm: u32,
    pub pump_speed_percent: f32,
    pub fan_speed_rpm: u32,
    pub fan_speed_percent: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightingStatus {
    pub mode: String,
    pub color_count: u32,
    pub brightness: f32,
    pub is_synced: bool,
}

// ---------------------------------------------------------------------------
// ParamRanges — safe operating ranges for controllable parameters
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParamRanges {
    pub fan_speed_min_percent: f32,
    pub fan_speed_max_percent: f32,
    pub core_clock_offset_min_mhz: i32,
    pub core_clock_offset_max_mhz: i32,
    pub memory_clock_offset_min_mhz: i32,
    pub memory_clock_offset_max_mhz: i32,
    pub power_limit_min_percent: u8,
    pub power_limit_max_percent: u8,
    pub water_temp_min_c: f32,
    pub water_temp_max_c: f32,
    pub pump_speed_min_rpm: u16,
    pub pump_speed_max_rpm: u16,
}

impl Default for ParamRanges {
    fn default() -> Self {
        Self {
            fan_speed_min_percent: 30.0,
            fan_speed_max_percent: 100.0,
            core_clock_offset_min_mhz: -500,
            core_clock_offset_max_mhz: 300,
            memory_clock_offset_min_mhz: -500,
            memory_clock_offset_max_mhz: 300,
            power_limit_min_percent: 50,
            power_limit_max_percent: 115,
            water_temp_min_c: 20.0,
            water_temp_max_c: 65.0,
            pump_speed_min_rpm: 0,
            pump_speed_max_rpm: 5000,
        }
    }
}

// ---------------------------------------------------------------------------
// DeviceChangeEvent — emitted on hotplug
// ---------------------------------------------------------------------------

#[derive(Debug, Clone)]
pub enum DeviceChangeEvent {
    Added(DeviceInfo),
    Removed(String), // device_id
}

// ---------------------------------------------------------------------------
// Core HAL Traits
// ---------------------------------------------------------------------------

/// Capability: discover available hardware devices.
#[async_trait]
pub trait DeviceDiscovery: Send + Sync + Debug {
    /// Perform a full discovery scan of all supported hardware.
    async fn discover(&self) -> Vec<DeviceInfo>;

    /// Return a stream that emits events when devices are added or removed.
    fn watch(&self) -> Box<dyn Stream<Item = DeviceChangeEvent> + Send>;
}

/// Capability: read live sensor data from a hardware device.
#[async_trait]
pub trait HardwareDevice: Send + Sync + Debug {
    fn device_info(&self) -> &DeviceInfo;

    /// Read the current status (sensors) from the device.
    async fn read_status(&self) -> Result<DeviceStatus, HardwareError>;
}

/// Capability: apply configuration parameters to a hardware device.
#[async_trait]
pub trait Controllable: HardwareDevice {
    type Params: serde::Serialize + serde::de::DeserializeOwned + Send + Sync;

    /// Apply the given parameters to the hardware device.
    async fn apply(&self, params: &Self::Params) -> Result<(), HardwareError>;

    /// Reset the device to its default/factory state.
    async fn reset(&self) -> Result<(), HardwareError>;

    /// Return the safe operating parameter ranges for this device.
    fn param_ranges(&self) -> ParamRanges;
}
