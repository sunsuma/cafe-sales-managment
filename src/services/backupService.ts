import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useCafeStore } from '../store/useCafeStore';

export async function createBackup() {
  const s = useCafeStore.getState();
  const uri = `${FileSystem.cacheDirectory}cafe-backup-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), items: s.items, orders: s.orders, settings: s.settings }, null, 2));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/json' });
  }
}
