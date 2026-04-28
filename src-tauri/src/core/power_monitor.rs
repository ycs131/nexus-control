use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc;

/// Monitors system power events (sleep/resume) to pause/resume hardware polling.
///
/// When the system enters sleep/hibernate:
/// - Hardware polling is paused to reduce power usage (PRD §5.2)
/// - Hardware state is preserved
///
/// On resume:
/// - Polling is restarted
/// - Device cache is refreshed
///
/// Phase 1: Stub — uses a manual signal mechanism.
/// Phase 2+: Integrate with Windows API power event notifications
///           (SetWindowsHookEx / WM_POWERBROADCAST via tauri window).
#[derive(Debug)]
pub struct PowerMonitor {
    paused: Arc<AtomicBool>,
}

impl PowerMonitor {
    pub fn new() -> Self {
        Self {
            paused: Arc::new(AtomicBool::new(false)),
        }
    }

    /// Returns whether the system is currently in sleep/power-save mode.
    pub fn is_paused(&self) -> bool {
        self.paused.load(Ordering::SeqCst)
    }

    /// Signal that the system has entered sleep mode.
    pub fn notify_sleep(&self) {
        self.paused.store(true, Ordering::SeqCst);
        log::info!("[PowerMonitor] System sleeping — paused hardware polling");
    }

    /// Signal that the system has resumed from sleep mode.
    pub fn notify_resume(&self) {
        self.paused.store(false, Ordering::SeqCst);
        log::info!("[PowerMonitor] System resumed — restarted hardware polling");
    }
}

/// Alias for the channel type used to deliver power events.
pub type PowerEventSender = mpsc::Sender<PowerEvent>;

#[derive(Debug, Clone)]
pub enum PowerEvent {
    Sleep,
    Resume,
}
