import React from "react";
import { ScrollView, Text, View, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Screen,
  Heading,
  Card,
  Btn,
  Pill,
  s,
} from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import { C } from "../../src/constants/colors";
import { fmtDate } from "../../src/utils/dates";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useCafeStore((state) => state.orders.find((item) => item.id === id));
  const setStatus = useCafeStore((state) => state.setStatus);

  if (!order) {
    return (
      <Screen>
        <Text>Order not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView>
        <Heading title="Order details" />
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <Text style={{ color: C.muted, fontSize: 12, flexShrink: 0 }}>
            {order.orderNumber}
          </Text>
          {!!order.description?.trim() && (
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                marginLeft: 10,
                color: C.dark,
                fontSize: 12,
                textAlign: "right",
              }}
            >
              {order.description}
            </Text>
          )}
        </View>
        <Card>
          <View style={s.row}>
            <Text style={{ color: C.muted }}>Payment status</Text>
            <Pill
              text={order.paymentStatus}
              paid={order.paymentStatus === "PAID"}
            />
          </View>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
            Created {fmtDate(order.createdAt)}
          </Text>
          {order.paidAt && (
            <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              Paid {fmtDate(order.paidAt)}
            </Text>
          )}
        </Card>
        <Heading title="Purchased items" />
        {order.items.map((item, index) => (
          <Card key={index}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800", color: C.text }}>
                  {item.itemName}
                </Text>
                <Text style={{ fontSize: 11, color: C.muted }}>
                  {money(item.unitPrice)} × {item.quantity}
                </Text>
              </View>
              <Text style={{ fontWeight: "800" }}>
                {money(item.subtotal)}
              </Text>
            </View>
          </Card>
        ))}
        <Card>
          <View style={s.row}>
            <Text style={{ color: C.muted }}>Total items</Text>
            <Text style={{ fontWeight: "800" }}>{order.totalQuantity}</Text>
          </View>
          <View style={[s.row, { marginTop: 10 }]}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>Grand total</Text>
            <Text
              style={{ fontSize: 20, fontWeight: "900", color: C.green }}
            >
              {money(order.totalAmount)}
            </Text>
          </View>
        </Card>
        {order.paymentStatus === "PENDING" ? (
          <Btn
            title="Mark as PAID"
            onPress={() => {
              setStatus(order.id, "PAID");
              Alert.alert("Payment updated", "Order marked as paid.");
            }}
          />
        ) : (
          <Btn
            title="Mark as PENDING"
            secondary
            onPress={() => {
              setStatus(order.id, "PENDING");
              Alert.alert(
                "Payment updated",
                "Revenue has been removed from paid sales.",
              );
            }}
          />
        )}
        <Btn
          title="Edit order"
          secondary
          onPress={() => router.push(`/orders/edit/${order.id}`)}
        />
        <Btn
          title="Back to order history"
          secondary
          onPress={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}
