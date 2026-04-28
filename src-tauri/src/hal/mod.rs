/// Hardware Abstraction Layer (HAL)
///
/// Provides a unified interface for discovering and controlling
/// various hardware devices (GPU, cooling, lighting) through
/// backend-specific implementations.
pub mod traits;
pub mod device;
pub mod gpu;
pub mod cooling;
pub mod lighting;
