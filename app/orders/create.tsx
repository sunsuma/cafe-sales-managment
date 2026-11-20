import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Screen, Heading, Card, Btn, Field, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import { C } from "../../src/constants/colors";

export default function CreateOrder() {
  const items = useCafeStore((x) => x.items);
  const create = useCafeStore((x) => x.createOrder);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [description, setDescription] = useState("");

  const selected = useMemo(
    () =>
      items
        .filter((item) => (qty[item.id] || 0) > 0)
        .map((item) => ({
          itemId: item.id,
          itemName: item.name,
          itemImage: item.imageUri,
          unitPrice: item.price,
          quantity: qty[item.id],
          subtotal: item.price * qty[item.id],
        })),
    [items, qty],
  );
  const total = selected.reduce((sum, item) => sum + item.subtotal, 0);
  const count = selected.reduce((sum, item) => sum + item.quantity, 0);

  function save() {
    if (!selected.length) {
      Alert.alert("No items selected", "Add at least one menu item.");
      return;
    }

    const order = create(selected, description);
    router.replace(`/orders/${order.id}`);
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading title="New order" sub="Select items and adjust quantities" />
        <Field
          label="ORDER DESCRIPTION (OPTIONAL)"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. Table 4 or customer name"
        />
        {items.map((item) => (
          <Card key={item.id}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: C.text }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12, color: C.muted }}>
                  {item.category} · {money(item.price)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setQty((current) => ({
                    ...current,
                    [item.id]: Math.max(0, (current[item.id] || 0) - 1),
                  }))
                }
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 22, color: C.green }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontWeight: "800", minWidth: 20, textAlign: "center" }}>
                {qty[item.id] || 0}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setQty((current) => ({
                    ...current,
                    [item.id]: (current[item.id] || 0) + 1,
                  }))
                }
                style={{ padding: 8 }}
              >
                <Text style={{ fontSize: 22, color: C.green }}>＋</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        {!items.length && (
          <Card>
            <Text style={{ color: C.muted }}>
              Add menu items before creating an order.
            </Text>
          </Card>
        )}
        <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
          <Text style={{ color: "#D7EBDD" }}>ORDER SUMMARY</Text>
          <Text
            style={{
              color: C.white,
              fontSize: 25,
              fontWeight: "900",
              marginTop: 5,
            }}
          >
            {money(total)}
          </Text>
          <Text style={{ color: "#D7EBDD", fontSize: 12 }}>
            {count} total items · {selected.length} products
          </Text>
          {selected.map((item) => (
            <Text
              key={item.itemId}
              style={{ color: C.white, fontSize: 12, marginTop: 5 }}
            >
              {item.itemName} × {item.quantity} · {money(item.subtotal)}
            </Text>
          ))}
        </Card>
        <Btn title="Save Order · Pending" onPress={save} />
      </ScrollView>
    </Screen>
  );
}
