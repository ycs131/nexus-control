pub mod hal;
pub mod models;
pub mod ipc;
pub mod service;
pub mod core;

use std::sync::Arc;
use tokio::sync::RwLock;
use service::device_manager::DeviceManager;
use service::profile_manager::ProfileManager;
use service::safety_validator::SafetyValidator;

/// Shared application state accessible from Tauri IPC commands.
pub struct AppState {
    pub device_manager: Arc<RwLock<DeviceManager>>,
    pub profile_manager: Arc<RwLock<ProfileManager>>,
    pub safety_validator: Arc<SafetyValidator>,
}

/// Initialize the core services and return shared state.
pub async fn initialize() -> AppState {
    let safety_validator = Arc::new(SafetyValidator::new());
    let device_manager = Arc::new(RwLock::new(DeviceManager::new()));
    let profile_manager = Arc::new(RwLock::new(ProfileManager::new().await));

    AppState {
        device_manager,
        profile_manager,
        safety_validator,
    }
}

/// Register all Tauri IPC command handlers.
pub fn register_commands<R: tauri::Runtime>(builder: tauri::AppHandle<R>) {
    // Commands are registered via the invoke_handler macro in main.rs
    let _ = builder;
}
