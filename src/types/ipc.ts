// IPC API Contract — shared between frontend (React) and backend (Rust/Tauri)

/* ==================== Data Models ==================== */

export interface DeviceInfo {
  id: string;
  name: string;
  device_type: 'gpu' | 'cooling' | 'lighting';
  connected: boolean;
}

export interface GpuStatus {
  device_id: string;
  temperature_core: number;
  temperature_memory: number;
  core_clock_mhz: number;
  memory_clock_mhz: number;
  power_usage_watts: number;
  fan_speed_rpm: number;
  fan_speed_percent: number;
}

export interface CoolingStatus {
  device_id: string;
  water_temp_c: number;
  pump_rpm: number;
  pump_mode: PumpMode;
  fan_rpm: number;
  fan_speed_percent: number;
}

export interface LightingStatus {
  device_id: string;
  current_mode: LightingMode;
  brightness: number;
  connected: boolean;
}

export interface DeviceStatus {
  gpu_devices: GpuStatus[];
  cooling_devices: CoolingStatus[];
  lighting_devices: LightingStatus[];
}

/* ==================== GPU ==================== */

export interface FanCurvePoint {
  temperature: number; // °C, X axis: 30-100°C
  speed_percent: number; // Y axis: 30-100%
}

export interface GpuConfig {
  device_id: string;
  fan_curve: FanCurvePoint[];
  core_clock_offset_mhz: number;
  memory_clock_offset_mhz: number;
  power_limit_percent: number;
}

export interface GpuParamRanges {
  core_clock_offset: { min: number; max: number; step: number };
  memory_clock_offset: { min: number; max: number; step: number };
  power_limit: { min: number; max: number; step: number };
  fan_curve: {
    temp_min: number;
    temp_max: number;
    speed_min: number;
    speed_max: number;
  };
}

/* ==================== Cooling ==================== */

export type PumpMode = 'Silent' | 'Standard' | 'Extreme' | 'Custom';

export interface PumpConfig {
  mode: PumpMode;
  fixed_rpm?: number;
}

export interface CoolingConfig {
  device_id: string;
  pump: PumpConfig;
  fan_curve: FanCurvePoint[];
  alarm: AlarmConfig;
}

export interface AlarmConfig {
  water_temp_threshold: number; // °C, default 60
  enabled: boolean;
  sound_enabled: boolean;
}

/* ==================== Lighting ==================== */

export type LightingMode =
  | 'Static'
  | 'Breathing'
  | 'Rainbow'
  | 'ColorCycle'
  | 'Flashing'
  | 'MusicSync';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ZoneConfig {
  zone_id: string;
  mode: LightingMode;
  colors: RgbColor[];
  brightness: number; // 0-100
  speed: number; // 0-100
}

export interface LightingConfig {
  device_id: string;
  zones: ZoneConfig[];
}

export interface LightingPreviewState {
  mode: LightingMode;
  colors: RgbColor[];
  brightness: number;
  speed: number;
}

/* ==================== Profile ==================== */

export interface Profile {
  id: string;
  name: string;
  gpu_configs: GpuConfig[];
  cooling_configs: CoolingConfig[];
  lighting_configs: LightingConfig[];
  created_at: string;
  updated_at: string;
}

/* ==================== Settings ==================== */

export interface AppSettings {
  language: string;
  start_on_boot: boolean;
  minimize_to_tray: boolean;
  last_active_profile_id: string;
  auto_update_enabled: boolean;
  hardware_poll_interval_ms: number;
  theme: 'light' | 'dark';
}

/* ==================== IPC Commands ==================== */

export type IpcCommand =
  | { method: 'discover_devices' }
  | { method: 'refresh_devices' }
  | { method: 'get_gpu_status'; device_id: string }
  | { method: 'get_gpu_param_ranges'; device_id: string }
  | { method: 'set_gpu_fan_curve'; device_id: string; fan_curve: FanCurvePoint[] }
  | { method: 'set_overclock_params'; device_id: string; config: Pick<GpuConfig, 'core_clock_offset_mhz' | 'memory_clock_offset_mhz' | 'power_limit_percent'> }
  | { method: 'reset_overclock'; device_id: string }
  | { method: 'get_cooling_status'; device_id: string }
  | { method: 'set_pump_mode'; device_id: string; mode: PumpMode; fixed_rpm?: number }
  | { method: 'set_cooling_fan_curve'; device_id: string; fan_curve: FanCurvePoint[] }
  | { method: 'set_alarm_config'; device_id: string; alarm: AlarmConfig }
  | { method: 'get_lighting_config'; device_id: string }
  | { method: 'set_zone_lighting'; device_id: string; zone: ZoneConfig }
  | { method: 'sync_all_lighting'; config: LightingConfig[] }
  | { method: 'get_supported_modes'; device_id: string }
  | { method: 'list_profiles' }
  | { method: 'get_profile'; profile_id: string }
  | { method: 'save_profile'; profile: Profile }
  | { method: 'delete_profile'; profile_id: string }
  | { method: 'apply_profile'; profile_id: string }
  | { method: 'get_settings' }
  | { method: 'set_settings'; settings: Partial<AppSettings> };

/* ==================== IPC Events (Backend → Frontend) ==================== */

export interface HardwareStatusEvent {
  type: 'hardware-status';
  data: DeviceStatus;
}

export interface AlarmEvent {
  type: 'alarm';
  data: {
    device_id: string;
    alarm_type: 'water_temp_high' | 'pump_stopped';
    value: number;
    threshold: number;
  };
}

export interface DeviceChangeEvent {
  type: 'device-change';
  data: {
    added: DeviceInfo[];
    removed: string[];
  };
}

export interface UpdateAvailableEvent {
  type: 'update-available';
  data: {
    version: string;
    url: string;
  };
}

export type IpcEvent = HardwareStatusEvent | AlarmEvent | DeviceChangeEvent | UpdateAvailableEvent;

/* ==================== Errors ==================== */

export type ApiErrorCode =
  | 'DeviceNotFound'
  | 'HardwareError'
  | 'SafetyViolation'
  | 'Timeout'
  | 'UnsupportedOperation';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}
