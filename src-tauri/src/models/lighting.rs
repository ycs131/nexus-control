use serde::{Deserialize, Serialize};

/// RGB lighting configuration for a single device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightingConfig {
    pub device_id: String,
    pub zones: Vec<ZoneConfig>,
}

/// Configuration for a single lighting zone on a device.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZoneConfig {
    pub zone_id: String,
    pub mode: LightingMode,
    pub colors: Vec<RgbColor>,
    pub brightness: f32,
    pub speed: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LightingMode {
    Static,
    Breathing,
    Rainbow,
    ColorCycle,
    Flashing,
    MusicSync, // Phase 2
}

/// An RGB color value.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RgbColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl RgbColor {
    pub const fn new(r: u8, g: u8, b: u8) -> Self {
        Self { r, g, b }
    }
}
