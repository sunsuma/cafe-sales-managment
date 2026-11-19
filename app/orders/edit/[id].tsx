import React, { useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Screen, Heading, Card, Btn, Field, s } from '../../../src/components/ui';
import { useCafeStore } from '../../../src/store/useCafeStore';
import { OrderItem } from '../../../src/types/models';
import { money } from '../../../src/utils/currency';
import { C } from '../../../src/constants/colors';

export default function EditOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useCafeStore((x) => x.orders.find((o) => o.id === id));
  const menu = useCafeStore((x) => x.items);
  const update = useCafeStore((x) => x.updateOrder);

  const [lines, setLines] = useState<OrderItem[]>(() => order?.items ?? []);
  const [status, setStatus] = useState(() => order?.paymentStatus ?? 'PENDING');
  const [description, setDescription] = useState(() => order?.description ?? '');
  const total = useMemo(() => lines.reduce((a, b) => a + b.subtotal, 0), [lines]);

  if (!order) {
    return (
      <Screen>
        <Text>Order not found.</Text>
      </Screen>
    );
  }

  function change(itemId: string, delta: number) {
    setLines((old) => {
      const found = old.find((x) => x.itemId === itemId);
      if (!found) {
        const item = menu.find((x) => x.id === itemId);
        if (!item) return old;
        return [...old, { itemId: item.id, itemName: item.name, itemImage: item.imageUri, unitPrice: item.price, quantity: 1, subtotal: item.price }];
      }
      return old
        .map((x) =>
          x.itemId === itemId ? { ...x, quantity: x.quantity + delta, subtotal: (x.quantity + delta) * x.unitPrice } : x,
        )
        .filter((x) => x.quantity > 0);
    });
  }

  function save() {
    const currentOrder = order!;

    if (!lines.length) {
      Alert.alert('Order needs an item');
      return;
    }
    update(currentOrder.id, lines, status, description);
    router.back();
  }

  return (
    <Screen>
      <ScrollView>
        <Heading title="Edit order" sub={order.orderNumber} />
        <Field
          label="ORDER DESCRIPTION (OPTIONAL)"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Table 4 or customer name"
        />
        <Card>
          <Text style={{ fontWeight: '800', color: C.text, marginBottom: 10 }}>Current order items</Text>
          {lines.map((x) => (
            <View key={x.itemId} style={[s.row, { paddingVertical: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>{x.itemName}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{money(x.unitPrice)} each</Text>
              </View>
              <TouchableOpacity onPress={() => change(x.itemId, -1)}>
                <Text style={{ fontSize: 22, color: C.green, paddingHorizontal: 9 }}>−</Text>
              </TouchableOpacity>
              <Text>{x.quantity}</Text>
              <TouchableOpacity onPress={() => change(x.itemId, 1)}>
                <Text style={{ fontSize: 22, color: C.green, paddingHorizontal: 9 }}>＋</Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: '700', minWidth: 70, textAlign: 'right' }}>{money(x.subtotal)}</Text>
            </View>
          ))}
        </Card>
        <Heading title="Add menu items" />
        <Card>
          {menu
            .filter((m) => !lines.some((x) => x.itemId === m.id))
            .map((m) => (
              <TouchableOpacity key={m.id} onPress={() => change(m.id, 1)} style={[s.row, { paddingVertical: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700' }}>{m.name}</Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>{money(m.price)}</Text>
                </View>
                <Text style={{ color: C.green, fontWeight: '800' }}>＋ Add</Text>
              </TouchableOpacity>
            ))}
        </Card>
        <Card>
          <Text style={{ fontWeight: '800', marginBottom: 10 }}>Payment status</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['PENDING', 'PAID'] as const).map((x) => (
              <TouchableOpacity
                key={x}
                onPress={() => setStatus(x)}
                style={{
                  flex: 1,
                  padding: 12,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: status === x ? (x === 'PAID' ? C.paidBg : C.pendingBg) : C.secondary,
                }}
              >
                <Text style={{ fontWeight: '800', color: x === 'PAID' ? C.paid : C.pending }}>{x}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>Total quantity: {lines.reduce((a, b) => a + b.quantity, 0)}</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', color: C.green, marginTop: 5 }}>{money(total)}</Text>
        </Card>
        <Btn title="Save Order Changes" onPress={save} />
      </ScrollView>
    </Screen>
  );
}
