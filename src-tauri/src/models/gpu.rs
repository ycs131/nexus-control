use serde::{Deserialize, Serialize};

/// GPU configuration for a single graphics card.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuConfig {
    pub device_id: String,

    /// Fan curve points: temperature -> speed percentage.
    /// X-axis: temperature °C (30-100), Y-axis: speed % (30-100).
    pub fan_curve: Vec<FanCurvePoint>,

    /// Core clock offset in MHz (negative = underclock, positive = overclock).
    pub core_clock_offset_mhz: i32,

    /// Memory clock offset in MHz.
    pub memory_clock_offset_mhz: i32,

    /// Power limit as percentage of default TDP.
    pub power_limit_percent: u8,
}

impl Default for GpuConfig {
    fn default() -> Self {
        Self {
            device_id: String::new(),
            fan_curve: vec![
                FanCurvePoint { temperature: 30.0, speed_percent: 30.0 },
                FanCurvePoint { temperature: 50.0, speed_percent: 40.0 },
                FanCurvePoint { temperature: 70.0, speed_percent: 60.0 },
                FanCurvePoint { temperature: 85.0, speed_percent: 80.0 },
                FanCurvePoint { temperature: 100.0, speed_percent: 100.0 },
            ],
            core_clock_offset_mhz: 0,
            memory_clock_offset_mhz: 0,
            power_limit_percent: 100,
        }
    }
}

/// A single point on a fan speed curve.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FanCurvePoint {
    pub temperature: f32,
    pub speed_percent: f32,
}
