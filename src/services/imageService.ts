import * as FileSystem from 'expo-file-system/legacy';

function getDocumentDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('The app document directory is unavailable.');
  }
  return FileSystem.documentDirectory;
}

function getImageExtension(uri: string) {
  const fileName = uri.split(/[?#]/, 1)[0].split(/[\\/]/).pop() ?? '';
  return fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? 'jpg';
}

export async function makeImagePermanent(uri: string) {
  const imageName = `menu-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${getImageExtension(uri)}`;
  const destination = `${getDocumentDirectory()}${imageName}`;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return imageName;
}

export async function migrateLegacyImage(uri: string) {
  const imageName = uri.split(/[?#]/, 1)[0].split(/[\\/]/).pop();
  if (!imageName) {
    throw new Error('A saved menu image has an invalid file path.');
  }

  const destination = `${getDocumentDirectory()}${imageName}`;
  if (uri === destination) return imageName;

  const sourceInfo = await FileSystem.getInfoAsync(uri);
  if (!sourceInfo.exists) {
    console.warn('A saved menu image is missing and could not be migrated.');
    return undefined;
  }

  const destinationInfo = await FileSystem.getInfoAsync(destination);
  if (!destinationInfo.exists) {
    await FileSystem.copyAsync({ from: uri, to: destination });
  }
  return imageName;
}
