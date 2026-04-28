use serde::{Deserialize, Serialize};
use std::fmt::Debug;

use super::traits::{BackendType, DeviceInfo, DeviceType};

/// Unified device identifier used throughout the application.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct DeviceId(pub String);

/// Top-level device enumeration.
/// Each variant wraps a concrete backend implementation at runtime.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Device {
    Gpu {
        info: DeviceInfo,
        #[serde(skip)]
        backend: GpuBackend,
    },
    Cooling {
        info: DeviceInfo,
        #[serde(skip)]
        backend: CoolingBackend,
    },
    Lighting {
        info: DeviceInfo,
        #[serde(skip)]
        backend: LightingBackend,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GpuBackend {
    Amd,
    Nvidia,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CoolingBackend {
    CorsairCommanderPro,
    CorsairCommanderCoreXt,
    CorsairHydroX,
    EkwbConnect,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LightingBackend {
    OpenRgb,
    DirectHid,
}

impl Device {
    pub fn device_info(&self) -> &DeviceInfo {
        match self {
            Device::Gpu { info, .. } => info,
            Device::Cooling { info, .. } => info,
            Device::Lighting { info, .. } => info,
        }
    }
}

/// List of known USB VID/PID pairs for supported cooling devices.
pub const SUPPORTED_COOLING_DEVICES: &[(&str, &str, &str, CoolingBackend)] = &[
    ("1b1c", "0c10", "Corsair Commander Pro", CoolingBackend::CorsairCommanderPro),
    ("1b1c", "0c2a", "Corsair Commander Core XT", CoolingBackend::CorsairCommanderCoreXt),
    ("1b1c", "0c18", "Corsair Hydro X (XD5/XD3)", CoolingBackend::CorsairHydroX),
    ("2341", "8037", "EKWB EK-Connect", CoolingBackend::EkwbConnect),
];
