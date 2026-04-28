use crate::ipc::commands::*;
use crate::ipc::error::ApiError;
use crate::models::profile::Profile;
use crate::models::settings::AppSettings;

/// Manages reading, writing, and applying hardware configuration profiles.
///
/// Profiles are stored as individual JSON files in:
///   %APPDATA%/NexusControl/profiles/
///
/// Settings are stored at:
///   %APPDATA%/NexusControl/settings.json
///
/// All writes use atomic rename (write to .tmp, then rename) for crash safety.
#[derive(Debug)]
pub struct ProfileManager {
    profiles: Vec<Profile>,
    settings: AppSettings,
}

impl ProfileManager {
    pub async fn new() -> Self {
        // Phase 2: load from disk
        Self {
            profiles: vec![],
            settings: AppSettings::default(),
        }
    }

    pub async fn list(&self) -> Result<Vec<ProfileSummary>, ApiError> {
        Ok(self
            .profiles
            .iter()
            .map(|p| {
                let device_count = p.gpu_configs.len() as u32
                    + p.cooling_configs.len() as u32
                    + p.lighting_configs.len() as u32;
                ProfileSummary {
                    id: p.id.clone(),
                    name: p.name.clone(),
                    device_count,
                    created_at: p.created_at.clone(),
                    updated_at: p.updated_at.clone(),
                }
            })
            .collect())
    }

    pub async fn get(&self, profile_id: &str) -> Result<Profile, ApiError> {
        self.profiles
            .iter()
            .find(|p| p.id == profile_id)
            .cloned()
            .ok_or_else(|| ApiError::ProfileError(format!("Profile not found: {}", profile_id)))
    }

    pub async fn save(&mut self, req: SaveProfileRequest) -> Result<Profile, ApiError> {
        let mut profile = Profile::new(req.name);
        profile.gpu_configs = req.gpu_configs;
        profile.cooling_configs = req.cooling_configs;
        profile.lighting_configs = req.lighting_configs;
        profile.update_timestamp();

        // Phase 2: persist to disk with atomic write
        self.profiles.push(profile.clone());
        Ok(profile)
    }

    pub async fn delete(&mut self, profile_id: &str) -> Result<(), ApiError> {
        let idx = self
            .profiles
            .iter()
            .position(|p| p.id == profile_id)
            .ok_or_else(|| ApiError::ProfileError(format!("Profile not found: {}", profile_id)))?;
        self.profiles.remove(idx);
        // Phase 2: remove from disk
        Ok(())
    }

    pub async fn get_settings(&self) -> AppSettings {
        self.settings.clone()
    }

    pub async fn set_settings(&mut self, settings: AppSettings) -> Result<(), ApiError> {
        self.settings = settings;
        // Phase 2: persist to disk with atomic write
        Ok(())
    }
}
