/// Data models for application configuration, profiles, and settings.
pub mod profile;
pub mod gpu;
pub mod cooling;
pub mod lighting;
pub mod settings;

pub use profile::Profile;
pub use gpu::GpuConfig;
pub use cooling::{CoolingConfig, PumpConfig, PumpMode, AlarmConfig};
pub use lighting::{LightingConfig, ZoneConfig, LightingMode, RgbColor};
pub use settings::AppSettings;
