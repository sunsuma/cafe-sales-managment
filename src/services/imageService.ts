import * as FileSystem from 'expo-file-system';

export async function makeImagePermanent(uri: string) {
  const dir = `${FileSystem.documentDirectory}menu-images/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  const ext = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const dest = `${dir}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
