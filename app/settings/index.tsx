import React, { useState } from 'react';
import { ScrollView, Alert, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Screen, Heading, Card, Field, Btn } from '../../src/components/ui';
import { useCafeStore } from '../../src/store/useCafeStore';
import { createBackup } from '../../src/services/backupService';

export default function Settings() {
  const { settings, setSettings, restore } = useCafeStore();
  const [name, setName] = useState(settings.cafeName);

  async function backup() {
    try {
      await createBackup();
    } catch (e) {
      Alert.alert('Backup failed', String(e));
    }
  }

  async function restoreBackup() {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (r.canceled) return;

    try {
      const raw = await FileSystem.readAsStringAsync(r.assets[0].uri);
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.orders) || !data.settings) {
        throw new Error('Unsupported or invalid backup file.');
      }

      Alert.alert('Restore backup?', 'This replaces the current menu and order data on this device.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            restore({ items: data.items, orders: data.orders, settings: data.settings });
            Alert.alert('Restore complete');
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Could not restore backup', String(e));
    }
  }

  return (
    <Screen>
      <ScrollView>
        <Heading title="Settings" sub="Manage your café data on this device" />
        <Card>
          <Field label="CAFÉ NAME" value={name} onChangeText={setName} />
          <Btn
            title="Save café name"
            onPress={() => {
              setSettings({ cafeName: name.trim() || 'My Café' });
              Alert.alert('Saved');
            }}
          />
        </Card>

        <Heading title="Backup & restore" sub="Your data stays on this device unless you export a backup." />
        <Card>
          <Text style={{ color: '#82766C', fontSize: 12, marginBottom: 12 }}>
            Create a JSON backup of menu items, orders and settings. Save the exported file somewhere safe to restore it later.
          </Text>
          <Btn title="Export local backup" onPress={backup} />
          <Btn title="Restore from backup" secondary onPress={restoreBackup} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
