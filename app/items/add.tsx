import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Screen, Heading, Card, Field, Btn } from '../../src/components/ui';
import { useCafeStore } from '../../src/store/useCafeStore';
import { makeImagePermanent } from '../../src/services/imageService';

export default function AddItem() {
  const add = useCafeStore((state) => state.addItem);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState('');

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function save() {
    if (
      !name.trim() ||
      !category.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      Alert.alert(
        'Check item details',
        'Enter an item name, category and price greater than zero.',
      );
      return;
    }

    try {
      const imageName = imageUri
        ? await makeImagePermanent(imageUri)
        : undefined;
      add({
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
        <Heading title="Add menu item" sub="Add a product to your café menu" />
        <Card>
          <TouchableOpacity
            onPress={pickImage}
            style={{
              padding: 18,
              backgroundColor: '#F0EBE4',
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 15,
            }}
          >
            <Text style={{ fontSize: 28 }}>＋</Text>
            <Text style={{ fontWeight: '700', color: '#2E7D5B' }}>
              {imageUri ? 'Change selected image' : 'Choose item image'}
            </Text>
          </TouchableOpacity>
          <Field
            label="ITEM NAME"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Masala Tea"
          />
          <Field
            label="SELLING PRICE (₹)"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 20"
            keyboardType="decimal-pad"
          />
          <Field
            label="CATEGORY"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Beverages"
          />
          <Btn title="Save Item" onPress={save} />
        </Card>
      </ScrollView>
    </Screen>
  );
}
