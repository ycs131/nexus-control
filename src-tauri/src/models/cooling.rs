use serde::{Deserialize, Serialize};

use super::gpu::FanCurvePoint;

/// Water cooling system configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoolingConfig {
    pub device_id: String,
    pub pump: PumpConfig,

    /// Fan curve referenced to water temperature (X: 20-65°C).
    pub fan_curve: Vec<FanCurvePoint>,

    /// Alarm/alert configuration for abnormal conditions.
    pub alarm: AlarmConfig,
}

impl Default for CoolingConfig {
    fn default() -> Self {
        Self {
            device_id: String::new(),
            pump: PumpConfig::default(),
            fan_curve: vec![
                FanCurvePoint { temperature: 20.0, speed_percent: 30.0 },
                FanCurvePoint { temperature: 35.0, speed_percent: 40.0 },
                FanCurvePoint { temperature: 45.0, speed_percent: 60.0 },
                FanCurvePoint { temperature: 55.0, speed_percent: 80.0 },
                FanCurvePoint { temperature: 65.0, speed_percent: 100.0 },
            ],
            alarm: AlarmConfig::default(),
        }
    }
}

/// Pump speed control configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PumpConfig {
    pub mode: PumpMode,
    /// Fixed RPM for Custom mode.
    pub fixed_rpm: Option<u16>,
}

impl Default for PumpConfig {
    fn default() -> Self {
        Self {
            mode: PumpMode::Standard,
            fixed_rpm: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PumpMode {
    Silent,
    Standard,
    Extreme,
    Custom,
}

/// Water cooling alarm configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlarmConfig {
    /// Water temperature threshold in °C that triggers the alarm.
    pub water_temp_threshold: f32,
    pub enabled: bool,
    pub sound_enabled: bool,
}

impl Default for AlarmConfig {
    fn default() -> Self {
        Self {
            water_temp_threshold: 60.0,
            enabled: true,
            sound_enabled: true,
        }
    }
}
