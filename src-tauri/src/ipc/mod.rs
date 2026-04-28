/// IPC (Inter-Process Communication) layer.
///
/// Defines the Tauri Command/Event interface between the Rust backend
/// and the React frontend. See ADR-007 for design rationale.
pub mod error;
pub mod commands;

pub use error::ApiError;
pub use commands::*;
