import React, { useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { TabScreen, Heading, Card, Pill, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import { C } from "../../src/constants/colors";
export default function History() {
  const { orders } = useCafeStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("ALL");

  const normalizedQuery = q.trim().toLowerCase();

  const list = useMemo(
    () =>
      orders.filter((o) => {
        const orderNumber = String(o.orderNumber ?? "");
        const matchesQuery = orderNumber.toLowerCase().includes(normalizedQuery);
        return (filter === "ALL" || o.paymentStatus === filter) && matchesQuery;
      }),
    [orders, filter, normalizedQuery],
  );

  const openOrder = (id: string) => {
    router.push({ pathname: "/orders/[id]", params: { id } });
  };

  return (
    <TabScreen>
      <Heading title="Order history" sub={`${orders.length} total orders`} />
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search order ID..."
        placeholderTextColor={C.faint}
        style={{
          backgroundColor: C.input,
          padding: 13,
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: C.border,
        }}
      />
      <View style={{ flexDirection: "row", gap: 7, marginBottom: 13 }}>
        {["ALL", "PAID", "PENDING"].map((x) => (
          <TouchableOpacity
            key={x}
            onPress={() => setFilter(x)}
            style={{
              backgroundColor: filter === x ? C.green : C.secondary,
              padding: 10,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: filter === x ? C.white : C.muted,
                fontWeight: "700",
                fontSize: 11,
              }}
            >
              {x === "ALL" ? "All Orders" : x}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {list.map((o) => {
          const createdDate = o.createdAt ? new Date(o.createdAt) : null;
          const safeDate = createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.toLocaleString("en-IN") : "Unknown date";

          return (
            <TouchableOpacity key={o.id} onPress={() => openOrder(o.id)}>
              <Card>
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "800", color: C.text }}>
                      {o.orderNumber ?? "Unknown order"}
                    </Text>
                    {!!o.description?.trim() && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: C.dark,
                          marginTop: 3,
                        }}
                      >
                        {o.description.trim()}
                      </Text>
                    )}
                    <Text style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {safeDate}
                    </Text>
                  </View>
                  <Text style={{ fontWeight: "800", fontSize: 15 }}>
                    {money(o.totalAmount ?? 0)}
                  </Text>
                </View>
                <View style={[s.row, { marginTop: 9 }]}>
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {(o.totalQuantity ?? 0)} items
                  </Text>
                  <Pill text={o.paymentStatus} paid={o.paymentStatus === "PAID"} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
        {!list.length && (
          <Card>
            <Text style={{ color: C.muted }}>No matching orders found.</Text>
          </Card>
        )}
      </ScrollView>
    </TabScreen>
  );
}
