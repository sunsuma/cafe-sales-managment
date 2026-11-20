import React from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { TabScreen, Heading, Card, Btn, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import { C } from "../../src/constants/colors";
export default function Items() {
  const { items, deleteItem } = useCafeStore();
  return (
    <TabScreen>
      <View style={s.row}>
        <Heading
          title="Menu items"
          sub={`${items.length} items in your café`}
        />
        <TouchableOpacity onPress={() => router.push("/items/add")}>
          <Text style={{ color: C.green, fontWeight: "800" }}>＋ Add</Text>
        </TouchableOpacity>
      </View>
      <Btn
        title="＋  Create New Order"
        onPress={() => router.push("/orders/create")}
      />
      <ScrollView
        style={{ flex: 1, marginTop: 15 }}
        showsVerticalScrollIndicator={false}
      >
        {items.map((i) => (
          <Card key={i.id}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontWeight: "800", fontSize: 15, color: C.text }}
                >
                  {i.name}
                </Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {i.category}
                </Text>
                <Text
                  style={{ fontWeight: "800", color: C.green, marginTop: 5 }}
                >
                  {money(i.price)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/items/edit/${i.id}`)}
              >
                <Text style={{ color: C.green, fontWeight: "700", padding: 8 }}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Delete item?",
                    `Remove ${i.name} from your menu? Historical orders are preserved.`,
                    [
                      { text: "Cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => deleteItem(i.id),
                      },
                    ],
                  )
                }
              >
                <Text style={{ color: C.error, fontWeight: "700", padding: 8 }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
        {!items.length && (
          <Card>
            <Text style={{ color: C.muted }}>
              Your menu is empty. Add your first café item to start taking
              orders.
            </Text>
          </Card>
        )}
      </ScrollView>
    </TabScreen>
  );
}
