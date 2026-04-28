import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Select,
  InputNumber,
  Button,
  Typography,
  message,
  Space,
  Spin,
} from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { AppSettings } from '../../types/ipc';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const s = await invoke<AppSettings>('get_settings');
        setSettings(s);
      } catch (err) {
        // Default settings until backend is ready
        setSettings({
          language: 'en',
          start_on_boot: false,
          minimize_to_tray: true,
          last_active_profile_id: '',
          auto_update_enabled: true,
          hardware_poll_interval_ms: 1000,
          theme: 'dark',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await invoke('set_settings', { settings });
      message.success('Settings saved');
    } catch (err) {
      message.error(`Failed to save settings: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <Spin style={{ display: 'block', margin: '100px auto' }} />;
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <Title level={4}>Settings</Title>

      <Card title="General" size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Switch
              checked={settings.start_on_boot}
              onChange={(v) => setSettings({ ...settings, start_on_boot: v })}
            />
            <Text>Start on boot</Text>
          </Space>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Switch
              checked={settings.minimize_to_tray}
              onChange={(v) => setSettings({ ...settings, minimize_to_tray: v })}
            />
            <Text>Minimize to system tray</Text>
          </Space>
        </div>
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Switch
              checked={settings.auto_update_enabled}
              onChange={(v) => setSettings({ ...settings, auto_update_enabled: v })}
            />
            <Text>Auto-update enabled</Text>
          </Space>
        </div>
      </Card>

      <Card title="Display" size="small" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <Text>Theme</Text>
          <Select
            value={settings.theme}
            onChange={(v) => setSettings({ ...settings, theme: v })}
            style={{ width: '100%', marginTop: 4 }}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <Text>Language</Text>
          <Select
            value={settings.language}
            onChange={(v) => setSettings({ ...settings, language: v })}
            style={{ width: '100%', marginTop: 4 }}
            options={[
              { value: 'en', label: 'English' },
              { value: 'zh', label: '中文' },
            ]}
          />
        </div>
      </Card>

      <Card title="Hardware" size="small" style={{ marginBottom: 16 }}>
        <div>
          <Text>Polling interval</Text>
          <InputNumber
            value={settings.hardware_poll_interval_ms}
            onChange={(v) =>
              v && setSettings({ ...settings, hardware_poll_interval_ms: v })
            }
            min={200}
            max={10000}
            step={100}
            style={{ width: '100%', marginTop: 4 }}
            addonAfter="ms"
          />
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            Lower values = more responsive but higher CPU usage. Recommended: 1000ms.
          </Text>
        </div>
      </Card>

      <Button type="primary" onClick={handleSave} loading={saving} size="large">
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsPage;
