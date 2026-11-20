import React, { useState } from 'react';
import { ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
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
            style={{
              padding: 18,
              backgroundColor: '#F0EBE4',
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#2E7D5B', fontWeight: '700' }}>Change item image</Text>
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
