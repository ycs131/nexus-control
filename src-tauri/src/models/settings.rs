use serde::{Deserialize, Serialize};

/// Application-level settings (not part of hardware profiles).
/// Persisted at: %APPDATA%/NexusControl/settings.json
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub language: String,
    pub start_on_boot: bool,
    pub minimize_to_tray: bool,
    pub last_active_profile_id: Option<String>,
    pub auto_update_enabled: bool,
    pub hardware_poll_interval_ms: u64,
    pub theme: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            language: "zh-CN".to_string(),
            start_on_boot: false,
            minimize_to_tray: true,
            last_active_profile_id: None,
            auto_update_enabled: true,
            hardware_poll_interval_ms: 1000,
            theme: "dark".to_string(),
        }
    }
}
