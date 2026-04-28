import { useState, useEffect, useCallback, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import type {
  DeviceStatus,
  HardwareStatusEvent,
  AlarmEvent,
  IpcEvent,
  DeviceInfo,
} from '../types/ipc';
import { invoke } from '@tauri-apps/api/core';

interface UseHardwareStatusReturn {
  status: DeviceStatus | null;
  devices: DeviceInfo[];
  error: string | null;
  loading: boolean;
  refreshDevices: () => Promise<void>;
  alarms: AlarmEvent['data'][];
  clearAlarm: (deviceId: string) => void;
}

export function useHardwareStatus(): UseHardwareStatusReturn {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alarms, setAlarms] = useState<AlarmEvent['data'][]>([]);
  const unlistenRef = useRef<(() => void)[]>([]);

  const refreshDevices = useCallback(async () => {
    try {
      const result = await invoke<DeviceInfo[]>('discover_devices');
      setDevices(result);
    } catch (err) {
      setError(String(err));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        // Initial device discovery
        const discovered = await invoke<DeviceInfo[]>('discover_devices');
        if (!cancelled) setDevices(discovered);
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    setup();

    // Listen for hardware-status events
    const setupListeners = async () => {
      const unlisten1 = await listen<HardwareStatusEvent['data']>(
        'hardware-status',
        (event) => {
          if (!cancelled) {
            setStatus(event.payload);
            setError(null);
          }
        }
      );
      const unlisten2 = await listen<AlarmEvent['data']>(
        'alarm',
        (event) => {
          if (!cancelled) {
            setAlarms((prev) => [...prev, event.payload]);
          }
        }
      );
      const unlisten3 = await listen<IpcEvent['data']>(
        'device-change',
        (event) => {
          if (!cancelled) {
            const change = event.payload as { added: DeviceInfo[]; removed: string[] };
            if (change.added?.length) {
              setDevices((prev) => [...prev, ...change.added]);
            }
            if (change.removed?.length) {
              setDevices((prev) =>
                prev.filter((d) => !change.removed.includes(d.id))
              );
            }
          }
        }
      );

      unlistenRef.current = [unlisten1, unlisten2, unlisten3];
    };
    setupListeners();

    return () => {
      cancelled = true;
      unlistenRef.current.forEach((unlisten) => unlisten());
    };
  }, []);

  const clearAlarm = useCallback((deviceId: string) => {
    setAlarms((prev) => prev.filter((a) => a.device_id !== deviceId));
  }, []);

  return {
    status,
    devices,
    error,
    loading,
    refreshDevices,
    alarms,
    clearAlarm,
  };
}
