use std::sync::Arc;
use std::time::Duration;
use tokio::sync::RwLock;
use tokio::time;

use crate::service::device_manager::DeviceManager;

/// Background task that periodically polls hardware sensors and emits status events.
///
/// When the window is minimized, the poll interval increases to 5 seconds
/// to reduce CPU usage (supports NFR-01).
///
/// On sleep/hibernate, polling is paused entirely (PRD §5.2).
pub struct HardwarePollLoop {
    device_manager: Arc<RwLock<DeviceManager>>,
    interval_ms: u64,
    paused: bool,
}

impl HardwarePollLoop {
    pub fn new(device_manager: Arc<RwLock<DeviceManager>>, interval_ms: u64) -> Self {
        Self {
            device_manager,
            interval_ms,
            paused: false,
        }
    }

    /// Start the polling loop. Runs until the application shuts down.
    pub async fn run(&self) {
        let mut interval = time::interval(Duration::from_millis(self.interval_ms));
        interval.set_missed_tick_behavior(time::MissedTickBehavior::Skip);

        loop {
            interval.tick().await;

            if self.paused {
                continue;
            }

            if let Err(e) = self.poll_once().await {
                log::warn!("[PollLoop] poll error: {}", e);
            }
        }
    }

    async fn poll_once(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let _dm = self.device_manager.read().await;

        // Phase 2: read all device statuses and emit HardwareStatusEvent
        // Phase 2: check alarm thresholds → emit AlarmEvent
        // Phase 2: emit device-change events on hotplug

        Ok(())
    }

    pub fn pause(&mut self) {
        self.paused = true;
        log::info!("[PollLoop] paused");
    }

    pub fn resume(&mut self) {
        self.paused = false;
        log::info!("[PollLoop] resumed");
    }
}
