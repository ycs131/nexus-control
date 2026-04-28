/// GPU backends for AMD (ADL) and NVIDIA (NVAPI) hardware.
pub mod adl_backend;
pub mod nvapi_backend;

pub use adl_backend::AdlBackend;
pub use nvapi_backend::NvapiBackend;
