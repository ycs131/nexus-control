use crate::ipc::error::ApiError;
use crate::models::cooling::AlarmConfig;
use crate::models::gpu::FanCurvePoint;

/// Dual-layer safety validator implementing ADR-006.
///
/// All user-facing parameter changes go through this validator BEFORE
/// being sent to the HAL/device layer. This is the second line of defense
/// (after UI constraints) against unsafe hardware parameters.
#[derive(Debug)]
pub struct SafetyValidator;

impl SafetyValidator {
    pub fn new() -> Self {
        Self
    }

    /// Validates a GPU fan curve against safety constraints.
    ///
    /// Rules (ADR-006):
    /// - Speed must be >= 30% (prevents fan stall / overheating)
    /// - Speed must be <= 100%
    /// - Temperature must be in [30, 100]°C
    /// - Curve must have at least 2 points
    pub fn validate_fan_curve(&self, curve: &[FanCurvePoint]) -> Result<(), ApiError> {
        if curve.len() < 2 {
            return Err(ApiError::SafetyViolation(
                "Fan curve must have at least 2 points".into(),
            ));
        }

        for point in curve {
            if point.speed_percent < 30.0 {
                return Err(ApiError::SafetyViolation(
                    format!(
                        "Fan speed {:.0}% at {:.0}°C is below minimum 30%",
                        point.speed_percent, point.temperature
                    ),
                ));
            }
            if point.speed_percent > 100.0 {
                return Err(ApiError::SafetyViolation(
                    format!(
                        "Fan speed {:.0}% exceeds maximum 100%",
                        point.speed_percent
                    ),
                ));
            }
            if point.temperature < 30.0 || point.temperature > 100.0 {
                return Err(ApiError::SafetyViolation(
                    format!(
                        "Fan curve temperature {:.0}°C is outside valid range [30, 100]",
                        point.temperature
                    ),
                ));
            }
        }

        // Verify curve is monotonically non-decreasing in temperature
        for i in 1..curve.len() {
            if curve[i].temperature <= curve[i - 1].temperature {
                return Err(ApiError::SafetyViolation(
                    "Fan curve temperatures must be strictly increasing".into(),
                ));
            }
        }

        Ok(())
    }

    /// Validates overclock parameters against safe limits.
    ///
    /// Rules (ADR-006):
    /// - Core clock offset: [-500, +300] MHz
    /// - Memory clock offset: [-500, +300] MHz
    /// - Power limit: [50%, 115%]
    pub fn validate_overclock(
        &self,
        core_offset_mhz: i32,
        mem_offset_mhz: i32,
        power_limit_pct: u8,
    ) -> Result<(), ApiError> {
        const CORE_MIN: i32 = -500;
        const CORE_MAX: i32 = 300;
        const MEM_MIN: i32 = -500;
        const MEM_MAX: i32 = 300;
        const POWER_MIN: u8 = 50;
        const POWER_MAX: u8 = 115;

        if !(CORE_MIN..=CORE_MAX).contains(&core_offset_mhz) {
            return Err(ApiError::SafetyViolation(format!(
                "Core clock offset {} MHz is outside safe range [{}, {}]",
                core_offset_mhz, CORE_MIN, CORE_MAX
            )));
        }
        if !(MEM_MIN..=MEM_MAX).contains(&mem_offset_mhz) {
            return Err(ApiError::SafetyViolation(format!(
                "Memory clock offset {} MHz is outside safe range [{}, {}]",
                mem_offset_mhz, MEM_MIN, MEM_MAX
            )));
        }
        if !(POWER_MIN..=POWER_MAX).contains(&power_limit_pct) {
            return Err(ApiError::SafetyViolation(format!(
                "Power limit {}% is outside safe range [{}, {}]",
                power_limit_pct, POWER_MIN, POWER_MAX
            )));
        }

        Ok(())
    }

    /// Validates a water-cooling fan curve.
    ///
    /// Rules:
    /// - Temperature range: [20, 65]°C
    /// - Speed: [30, 100]%
    /// - At least 2 points, monotonically increasing temperature
    pub fn validate_cooling_fan_curve(&self, curve: &[FanCurvePoint]) -> Result<(), ApiError> {
        if curve.len() < 2 {
            return Err(ApiError::SafetyViolation(
                "Cooling fan curve must have at least 2 points".into(),
            ));
        }

        for point in curve {
            if point.speed_percent < 30.0 || point.speed_percent > 100.0 {
                return Err(ApiError::SafetyViolation(format!(
                    "Fan speed {:.0}% at {:.0}°C is outside valid range [30, 100]",
                    point.speed_percent, point.temperature
                )));
            }
            if point.temperature < 20.0 || point.temperature > 65.0 {
                return Err(ApiError::SafetyViolation(format!(
                    "Water temperature {:.0}°C is outside valid range [20, 65]",
                    point.temperature
                )));
            }
        }

        for i in 1..curve.len() {
            if curve[i].temperature <= curve[i - 1].temperature {
                return Err(ApiError::SafetyViolation(
                    "Cooling fan curve temperatures must be strictly increasing".into(),
                ));
            }
        }

        Ok(())
    }

    /// Validates alarm configuration.
    ///
    /// Rules:
    /// - Water temperature threshold: [40, 80]°C
    pub fn validate_alarm_config(&self, alarm: &AlarmConfig) -> Result<(), ApiError> {
        const THRESHOLD_MIN: f32 = 40.0;
        const THRESHOLD_MAX: f32 = 80.0;

        if alarm.water_temp_threshold < THRESHOLD_MIN
            || alarm.water_temp_threshold > THRESHOLD_MAX
        {
            return Err(ApiError::SafetyViolation(format!(
                "Water temperature threshold {:.0}°C is outside valid range [{}, {}]",
                alarm.water_temp_threshold, THRESHOLD_MIN, THRESHOLD_MAX
            )));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_fan_curve() {
        let validator = SafetyValidator::new();
        let curve = vec![
            FanCurvePoint { temperature: 30.0, speed_percent: 30.0 },
            FanCurvePoint { temperature: 50.0, speed_percent: 50.0 },
            FanCurvePoint { temperature: 80.0, speed_percent: 100.0 },
        ];
        assert!(validator.validate_fan_curve(&curve).is_ok());
    }

    #[test]
    fn test_fan_curve_below_min_speed() {
        let validator = SafetyValidator::new();
        let curve = vec![
            FanCurvePoint { temperature: 30.0, speed_percent: 20.0 },
            FanCurvePoint { temperature: 80.0, speed_percent: 100.0 },
        ];
        assert!(validator.validate_fan_curve(&curve).is_err());
    }

    #[test]
    fn test_fan_curve_too_few_points() {
        let validator = SafetyValidator::new();
        let curve = vec![FanCurvePoint { temperature: 50.0, speed_percent: 50.0 }];
        assert!(validator.validate_fan_curve(&curve).is_err());
    }

    #[test]
    fn test_valid_overclock() {
        let validator = SafetyValidator::new();
        assert!(validator.validate_overclock(100, 200, 100).is_ok());
        assert!(validator.validate_overclock(0, 0, 100).is_ok());
        assert!(validator.validate_overclock(-500, -500, 50).is_ok());
        assert!(validator.validate_overclock(300, 300, 115).is_ok());
    }

    #[test]
    fn test_overclock_core_too_high() {
        let validator = SafetyValidator::new();
        assert!(validator.validate_overclock(500, 0, 100).is_err());
    }

    #[test]
    fn test_overclock_power_too_high() {
        let validator = SafetyValidator::new();
        assert!(validator.validate_overclock(0, 0, 150).is_err());
    }

    #[test]
    fn test_valid_cooling_fan_curve() {
        let validator = SafetyValidator::new();
        let curve = vec![
            FanCurvePoint { temperature: 25.0, speed_percent: 30.0 },
            FanCurvePoint { temperature: 45.0, speed_percent: 60.0 },
            FanCurvePoint { temperature: 60.0, speed_percent: 100.0 },
        ];
        assert!(validator.validate_cooling_fan_curve(&curve).is_ok());
    }

    #[test]
    fn test_alarm_config_valid() {
        let validator = SafetyValidator::new();
        let alarm = AlarmConfig {
            water_temp_threshold: 60.0,
            enabled: true,
            sound_enabled: true,
        };
        assert!(validator.validate_alarm_config(&alarm).is_ok());
    }

    #[test]
    fn test_alarm_config_threshold_too_high() {
        let validator = SafetyValidator::new();
        let alarm = AlarmConfig {
            water_temp_threshold: 85.0,
            enabled: true,
            sound_enabled: true,
        };
        assert!(validator.validate_alarm_config(&alarm).is_err());
    }
}
