import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
            accessibilityRole="button"
            accessibilityLabel={
              imageUri ? 'Replace selected item image' : 'Choose item image'
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
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
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
                <Text style={{ fontWeight: '700', color: '#2E7D5B' }}>
                  Choose item image
                </Text>
              </>
            )}
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
