use serde::{Deserialize, Serialize};
use thiserror::Error;

/// High-level API error returned to the frontend via Tauri IPC.
#[derive(Debug, Clone, Serialize, Deserialize, Error)]
pub enum ApiError {
    #[error("Device not found: {0}")]
    DeviceNotFound(String),

    #[error("Hardware communication error: {0}")]
    HardwareError(String),

    #[error("Parameter rejected by safety validator: {0}")]
    SafetyViolation(String),

    #[error("Operation timed out: {0}")]
    Timeout(String),

    #[error("Unsupported operation: {0}")]
    UnsupportedOperation(String),

    #[error("Internal error: {0}")]
    Internal(String),

    #[error("Profile error: {0}")]
    ProfileError(String),

    #[error("Serialization error: {0}")]
    SerializationError(String),
}

/// Internal hardware-level error (not exposed to frontend directly).
#[derive(Debug, Error)]
pub enum HardwareError {
    #[error("Device not found: {0}")]
    DeviceNotFound(String),

    #[error("Communication failed: {0}")]
    CommunicationFailed(String),

    #[error("Parameter rejected: {0}")]
    ParameterRejected(String),

    #[error("Timeout")]
    Timeout,

    #[error("Unsupported: {0}")]
    Unsupported(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

impl From<HardwareError> for ApiError {
    fn from(e: HardwareError) -> Self {
        match e {
            HardwareError::DeviceNotFound(id) => ApiError::DeviceNotFound(id),
            HardwareError::CommunicationFailed(msg) => ApiError::HardwareError(msg),
            HardwareError::ParameterRejected(msg) => ApiError::SafetyViolation(msg),
            HardwareError::Timeout => ApiError::Timeout("Hardware communication timed out".into()),
            HardwareError::Unsupported(op) => ApiError::UnsupportedOperation(op),
            HardwareError::Io(e) => ApiError::Internal(e.to_string()),
        }
    }
}

impl From<serde_json::Error> for ApiError {
    fn from(e: serde_json::Error) -> Self {
        ApiError::SerializationError(e.to_string())
    }
}
