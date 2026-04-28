import React, { useState, useEffect } from 'react';
import { Card, Button, List, Modal, Input, Space, message, Popconfirm } from 'antd';
import { invoke } from '@tauri-apps/api/core';
import type { Profile } from '../../types/ipc';

const PresetManager: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const list = await invoke<Profile[]>('list_profiles');
      setProfiles(list);
    } catch (err) {
      // Silently handle until backend is ready
      console.warn('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleApply = async (profileId: string) => {
    try {
      await invoke('apply_profile', { profileId });
      message.success('Profile applied');
    } catch (err) {
      message.error(`Failed: ${err}`);
    }
  };

  const handleDelete = async (profileId: string) => {
    try {
      await invoke('delete_profile', { profileId });
      message.success('Profile deleted');
      loadProfiles();
    } catch (err) {
      message.error(`Failed: ${err}`);
    }
  };

  const handleSave = async () => {
    if (!newProfileName.trim()) return;
    try {
      const profile: Partial<Profile> = {
        name: newProfileName.trim(),
      };
      const saved = await invoke<Profile>('save_profile', { profile });
      message.success(`Profile "${saved.name}" saved`);
      setSaveModalOpen(false);
      setNewProfileName('');
      loadProfiles();
    } catch (err) {
      message.error(`Failed to save: ${err}`);
    }
  };

  return (
    <Card title="Lighting Presets" size="small">
      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={() => setSaveModalOpen(true)}>
          Save Current as Preset
        </Button>
        <Button onClick={loadProfiles} loading={loading}>
          Refresh
        </Button>
      </Space>

      <List
        loading={loading}
        dataSource={profiles}
        locale={{ emptyText: 'No presets saved yet' }}
        renderItem={(profile) => (
          <List.Item
            actions={[
              <Button
                type="link"
                size="small"
                onClick={() => handleApply(profile.id)}
              >
                Apply
              </Button>,
              <Popconfirm
                title="Delete this preset?"
                onConfirm={() => handleDelete(profile.id)}
              >
                <Button type="link" danger size="small">
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={profile.name}
              description={`Updated: ${new Date(profile.updated_at).toLocaleDateString()}`}
            />
          </List.Item>
        )}
      />

      <Modal
        title="Save Lighting Preset"
        open={saveModalOpen}
        onOk={handleSave}
        onCancel={() => setSaveModalOpen(false)}
      >
        <Input
          placeholder="Preset name..."
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          onPressEnter={handleSave}
        />
      </Modal>
    </Card>
  );
};

export default PresetManager;
