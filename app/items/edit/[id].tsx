import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Heading, Card, Field, Btn } from '../../../src/components/ui';
import { useCafeStore } from '../../../src/store/useCafeStore';
import { makeImagePermanent } from '../../../src/services/imageService';

export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCafeStore((s) => s.items.find((x) => x.id === id));
  const update = useCafeStore((s) => s.updateItem);

  const [name, setName] = useState(() => item?.name ?? '');
  const [price, setPrice] = useState(() => String(item?.price ?? ''));
  const [category, setCategory] = useState(() => item?.category ?? '');
  const [selectedImageUri, setSelectedImageUri] = useState<string>();

  if (!item) {
    return (
      <Screen>
        <Text>Item not found.</Text>
      </Screen>
    );
  }

  const previewUri =
    selectedImageUri ??
    (item.imageName && FileSystem.documentDirectory
      ? `${FileSystem.documentDirectory}${item.imageName}`
      : undefined);

  async function pick() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!r.canceled) setSelectedImageUri(r.assets[0].uri);
  }

  async function save() {
    if (!item) {
      Alert.alert('Item not found.');
      return;
    }

    if (!name.trim() || !category.trim() || Number(price) <= 0) {
      Alert.alert('Invalid details');
      return;
    }

    try {
      const imageName = selectedImageUri
        ? await makeImagePermanent(selectedImageUri)
        : item.imageName;
      update(item.id, {
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        imageName,
      });
      router.back();
    } catch (error) {
      Alert.alert('Could not save item', String(error));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading title="Edit item" />
        <Card>
          <TouchableOpacity
            onPress={pick}
            accessibilityRole="button"
            accessibilityLabel={
              previewUri ? 'Replace item image' : 'Choose item image'
            }
            style={{
              height: 160,
              backgroundColor: '#F0EBE4',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 15,
              overflow: 'hidden',
            }}
          >
            {previewUri ? (
              <>
                <Image
                  source={{ uri: previewUri }}
                  resizeMode="cover"
                  accessible={false}
                  style={{ width: '100%', height: '100%' }}
                />
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 26, color: '#2E7D5B' }}>＋</Text>
                </View>
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    alignSelf: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Tap + to replace image
                  </Text>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 28 }}>＋</Text>
                <Text style={{ color: '#2E7D5B', fontWeight: '700' }}>
                  Choose item image
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Field label="ITEM NAME" value={name} onChangeText={setName} />
          <Field label="PRICE (₹)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          <Field label="CATEGORY" value={category} onChangeText={setCategory} />
          <Btn title="Save Changes" onPress={save} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
