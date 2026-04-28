use serde::{Deserialize, Serialize};

use crate::hal::traits::DeviceInfo;
use crate::ipc::error::ApiError;
use crate::models::cooling::{AlarmConfig, CoolingConfig, PumpMode};
use crate::models::gpu::{FanCurvePoint, GpuConfig};
use crate::models::lighting::{LightingConfig, LightingMode};
use crate::models::profile::Profile;
use crate::models::settings::AppSettings;

// ---------------------------------------------------------------------------
// Tauri IPC Command Input/Output Types
//
// These types serve as the API contract between the Rust backend and
// the React frontend. See ADR-007 for the Command/Event pattern.
// ---------------------------------------------------------------------------

// --- Discovery ---

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscoverDevicesResponse {
    pub devices: Vec<DeviceInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RefreshDevicesResponse {
    pub devices: Vec<DeviceInfo>,
}

// --- GPU ---

#[derive(Debug, Serialize, Deserialize)]
pub struct GetGpuStatusResponse {
    pub device_id: String,
    pub temperature_core_c: f32,
    pub temperature_memory_c: Option<f32>,
    pub core_clock_mhz: u32,
    pub memory_clock_mhz: u32,
    pub fan_speed_rpm: u32,
    pub fan_speed_percent: f32,
    pub power_usage_watts: f32,
    pub power_limit_watts: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetGpuFanCurveRequest {
    pub device_id: String,
    pub fan_curve: Vec<FanCurvePoint>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetOverclockParamsRequest {
    pub device_id: String,
    pub core_clock_offset_mhz: i32,
    pub memory_clock_offset_mhz: i32,
    pub power_limit_percent: u8,
}

// --- Cooling ---

#[derive(Debug, Serialize, Deserialize)]
pub struct GetCoolingStatusResponse {
    pub device_id: String,
    pub water_temperature_c: f32,
    pub pump_speed_rpm: u32,
    pub pump_speed_percent: f32,
    pub fan_speed_rpm: u32,
    pub fan_speed_percent: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetPumpModeRequest {
    pub device_id: String,
    pub mode: PumpMode,
    pub fixed_rpm: Option<u16>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetCoolingFanCurveRequest {
    pub device_id: String,
    pub fan_curve: Vec<FanCurvePoint>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetAlarmConfigRequest {
    pub device_id: String,
    pub alarm: AlarmConfig,
}

// --- Lighting ---

#[derive(Debug, Serialize, Deserialize)]
pub struct GetLightingConfigResponse {
    pub device_id: String,
    pub zones: Vec<LightingZoneInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LightingZoneInfo {
    pub zone_id: String,
    pub mode: LightingMode,
    pub colors: Vec<String>, // hex colors
    pub brightness: f32,
    pub speed: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SetZoneLightingRequest {
    pub device_id: String,
    pub zone_id: String,
    pub mode: LightingMode,
    pub colors: Vec<String>,
    pub brightness: f32,
    pub speed: f32,
}

// --- Profile ---

#[derive(Debug, Serialize, Deserialize)]
pub struct ListProfilesResponse {
    pub profiles: Vec<ProfileSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileSummary {
    pub id: String,
    pub name: String,
    pub device_count: u32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaveProfileRequest {
    pub name: String,
    pub gpu_configs: Vec<GpuConfig>,
    pub cooling_configs: Vec<CoolingConfig>,
    pub lighting_configs: Vec<LightingConfig>,
}

// --- Events (backend -> frontend) ---

/// Event payload for hardware-status events.
/// Emitted every `hardware_poll_interval_ms` (default 1000ms).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareStatusEvent {
    pub devices: Vec<GetGpuStatusResponse>,
    pub cooling: Vec<GetCoolingStatusResponse>,
}

/// Event payload for alarm events.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlarmEvent {
    pub device_id: String,
    pub alarm_type: AlarmType,
    pub value: f32,
    pub threshold: f32,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlarmType {
    WaterTemperature,
    PumpStopped,
}

/// Event payload for device change (hotplug) events.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceChangeEvent {
    pub added: Vec<DeviceInfo>,
    pub removed: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateAvailableEvent {
    pub version: String,
    pub download_url: String,
}

// ---------------------------------------------------------------------------
// Tauri Command Handler Implementations (registered via #[tauri::command])
//
// These functions will be connected to Tauri in Phase 2 when the frontend is ready.
// For now, they serve as the API contract for the frontend team.
// ---------------------------------------------------------------------------

pub async fn cmd_discover_devices(
    _state: &crate::AppState,
) -> Result<DiscoverDevicesResponse, ApiError> {
    // Phase 2: iterate DeviceDiscovery implementations
    Ok(DiscoverDevicesResponse {
        devices: vec![],
    })
}

pub async fn cmd_refresh_devices(
    state: &crate::AppState,
) -> Result<RefreshDevicesResponse, ApiError> {
    let mut dm = state.device_manager.write().await;
    let devices = dm.refresh().await;
    Ok(RefreshDevicesResponse { devices })
}

pub async fn cmd_get_gpu_status(
    state: &crate::AppState,
    device_id: String,
) -> Result<GetGpuStatusResponse, ApiError> {
    let dm = state.device_manager.read().await;
    let status = dm.get_gpu_status(&device_id).await?;
    Ok(status)
}

pub async fn cmd_set_gpu_fan_curve(
    state: &crate::AppState,
    req: SetGpuFanCurveRequest,
) -> Result<(), ApiError> {
    // Validate safety constraints (ADR-006)
    state.safety_validator.validate_fan_curve(&req.fan_curve)?;

    let dm = state.device_manager.read().await;
    dm.set_gpu_fan_curve(&req.device_id, req.fan_curve).await
}

pub async fn cmd_set_overclock_params(
    state: &crate::AppState,
    req: SetOverclockParamsRequest,
) -> Result<(), ApiError> {
    state.safety_validator.validate_overclock(
        req.core_clock_offset_mhz,
        req.memory_clock_offset_mhz,
        req.power_limit_percent,
    )?;

    let dm = state.device_manager.read().await;
    dm.set_overclock_params(
        &req.device_id,
        req.core_clock_offset_mhz,
        req.memory_clock_offset_mhz,
        req.power_limit_percent,
    ).await
}

pub async fn cmd_reset_overclock(
    state: &crate::AppState,
    device_id: String,
) -> Result<(), ApiError> {
    let dm = state.device_manager.read().await;
    dm.reset_overclock(&device_id).await
}

pub async fn cmd_get_cooling_status(
    state: &crate::AppState,
    device_id: String,
) -> Result<GetCoolingStatusResponse, ApiError> {
    let dm = state.device_manager.read().await;
    dm.get_cooling_status(&device_id).await
}

pub async fn cmd_set_pump_mode(
    state: &crate::AppState,
    req: SetPumpModeRequest,
) -> Result<(), ApiError> {
    let dm = state.device_manager.read().await;
    dm.set_pump_mode(&req.device_id, req.mode, req.fixed_rpm).await
}

pub async fn cmd_set_cooling_fan_curve(
    state: &crate::AppState,
    req: SetCoolingFanCurveRequest,
) -> Result<(), ApiError> {
    state.safety_validator.validate_cooling_fan_curve(&req.fan_curve)?;

    let dm = state.device_manager.read().await;
    dm.set_cooling_fan_curve(&req.device_id, req.fan_curve).await
}

pub async fn cmd_set_alarm_config(
    state: &crate::AppState,
    req: SetAlarmConfigRequest,
) -> Result<(), ApiError> {
    state.safety_validator.validate_alarm_config(&req.alarm)?;

    let dm = state.device_manager.read().await;
    dm.set_alarm_config(&req.device_id, req.alarm).await
}

pub async fn cmd_list_profiles(
    state: &crate::AppState,
) -> Result<ListProfilesResponse, ApiError> {
    let pm = state.profile_manager.read().await;
    let summaries = pm.list().await?;
    Ok(ListProfilesResponse { profiles: summaries })
}

pub async fn cmd_get_profile(
    state: &crate::AppState,
    profile_id: String,
) -> Result<Profile, ApiError> {
    let pm = state.profile_manager.read().await;
    pm.get(&profile_id).await
}

pub async fn cmd_save_profile(
    state: &crate::AppState,
    req: SaveProfileRequest,
) -> Result<Profile, ApiError> {
    let mut pm = state.profile_manager.write().await;
    pm.save(req).await
}

pub async fn cmd_delete_profile(
    state: &crate::AppState,
    profile_id: String,
) -> Result<(), ApiError> {
    let mut pm = state.profile_manager.write().await;
    pm.delete(&profile_id).await
}

pub async fn cmd_apply_profile(
    state: &crate::AppState,
    profile_id: String,
) -> Result<(), ApiError> {
    let profile = {
        let pm = state.profile_manager.read().await;
        pm.get(&profile_id).await?
    };

    let dm = state.device_manager.read().await;
    dm.apply_profile(&profile).await
}

pub async fn cmd_get_settings(state: &crate::AppState) -> Result<AppSettings, ApiError> {
    let pm = state.profile_manager.read().await;
    Ok(pm.get_settings().await)
}

pub async fn cmd_set_settings(
    state: &crate::AppState,
    settings: AppSettings,
) -> Result<(), ApiError> {
    let mut pm = state.profile_manager.write().await;
    pm.set_settings(settings).await
}
