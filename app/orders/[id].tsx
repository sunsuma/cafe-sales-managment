import React, { useRef } from "react";
import {
  ScrollView,
  Text,
  View,
  Alert,
  Pressable,
  Image,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
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
  const markItemReady = useCafeStore((state) => state.markItemReady);
  const unmarkItemReady = useCafeStore((state) => state.unmarkItemReady);
  const lastTapRef = useRef<Record<string, number>>({});
  const longPressHandledRef = useRef(false);

  function handleItemPress(itemId: string) {
    if (longPressHandledRef.current) {
      longPressHandledRef.current = false;
      return;
    }

    const now = Date.now();
    const lastTap = lastTapRef.current[itemId] ?? 0;
    if (now - lastTap < 300) {
      lastTapRef.current[itemId] = 0;
      unmarkItemReady(order!.id, itemId);
    } else {
      lastTapRef.current[itemId] = now;
    }
  }

  if (!order) {
    return (
      <Screen>
        <Text>Order not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
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
        {order.paymentStatus === "PENDING" && (
          <Text
            style={{
              color: C.muted,
              fontSize: 12,
              marginTop: -10,
              marginBottom: 10,
            }}
          >
            Long press an item to mark one unit ready.
          </Text>
        )}
        {order.items.map((item) => {
          const quantity = Math.max(0, Math.floor(item.quantity));
          const readyCount = Math.min(
            quantity,
            Math.max(
              0,
              Math.floor(order.readyQuantities?.[item.itemId] ?? 0),
            ),
          );
          return (
            <Pressable
              key={item.itemId}
              onPressIn={() => {
                longPressHandledRef.current = false;
              }}
              onPress={() => handleItemPress(item.itemId)}
              onLongPress={() => {
                longPressHandledRef.current = true;
                lastTapRef.current[item.itemId] = 0;
                markItemReady(order.id, item.itemId);
              }}
              disabled={order.paymentStatus !== "PENDING"}
              accessibilityRole="button"
              accessibilityLabel={`${item.itemName}, ${readyCount} of ${quantity} ready`}
              accessibilityHint="Long press to mark one unit ready"
            >
              <Card>
                <View style={s.row}>
                  {item.imageName && FileSystem.documentDirectory ? (
                    <Image
                      source={{
                        uri: `${FileSystem.documentDirectory}${item.imageName}`,
                      }}
                      accessibilityLabel={`${item.itemName} image`}
                      resizeMode="cover"
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 10,
                        marginRight: 10,
                      }}
                    />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "800", color: C.text }}>
                      {item.itemName}
                    </Text>
                    <Text style={{ fontSize: 11, color: C.muted }}>
                      {money(item.unitPrice)} × {item.quantity}
                    </Text>
                    {order.paymentStatus === "PENDING" && readyCount > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                        }}
                      >
                        {Array.from({ length: readyCount }, (_, index) => (
                          <View
                            key={index}
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: 5,
                              backgroundColor: C.pending,
                              marginRight: 5,
                            }}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                  <Text style={{ fontWeight: "800" }}>
                    {money(item.subtotal)}
                  </Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
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
