use serde::{Deserialize, Serialize};

use super::cooling::CoolingConfig;
use super::gpu::GpuConfig;
use super::lighting::LightingConfig;

/// A named profile containing the complete hardware configuration.
///
/// Profiles are persisted as individual JSON files in:
///   %APPDATA%/NexusControl/profiles/
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub gpu_configs: Vec<GpuConfig>,
    pub cooling_configs: Vec<CoolingConfig>,
    pub lighting_configs: Vec<LightingConfig>,
    pub created_at: String,
    pub updated_at: String,
}

impl Profile {
    pub fn new(name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Self {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            gpu_configs: Vec::new(),
            cooling_configs: Vec::new(),
            lighting_configs: Vec::new(),
            created_at: now.clone(),
            updated_at: now,
        }
    }

    pub fn update_timestamp(&mut self) {
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }
}
