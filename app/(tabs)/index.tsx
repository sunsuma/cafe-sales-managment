import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Screen, Heading, Card, Btn, Pill, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import {
  paidSales,
  pendingOrders,
  pendingAmount,
  paidOrders,
  hourlySales,
  bestSellers,
  salesForDay,
} from "../../src/utils/calculations";
import { C } from "../../src/constants/colors";
export default function Home() {
  const { orders, items, settings } = useCafeStore();
  const today = new Date(),
    yesterday = new Date(Date.now() - 86400000),
    todayOrders = salesForDay(orders, today),
    yesterdaySales = paidSales(salesForDay(orders, yesterday)),
    todaySales = paidSales(todayOrders),
    todayPending = pendingOrders(orders).filter(
      (o) => new Date(o.createdAt).toDateString() === today.toDateString(),
    ),
    hours = hourlySales(orders, today),
    best = bestSellers(todayOrders).slice(0, 5);
  const change = yesterdaySales
    ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
    : 0;
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.row}>
          <View>
            <Text style={{ color: C.muted, fontSize: 12 }}>WELCOME BACK</Text>
            <Heading title={settings.cafeName} />
          </View>
          <TouchableOpacity onPress={() => router.push("/settings")}>
            <Text style={{ fontSize: 23 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
          <Text style={{ color: "#D7EBDD", fontSize: 12 }}>
            TODAY'S PAID SALES
          </Text>
          <Text
            style={{
              color: "#FFF",
              fontSize: 30,
              fontWeight: "900",
              marginVertical: 7,
            }}
          >
            {money(todaySales)}
          </Text>
          <Text style={{ color: "#D7EBDD", fontSize: 12 }}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs
            yesterday · Yesterday {money(yesterdaySales)}
          </Text>
        </Card>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 11 }}>PAID ORDERS</Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: C.dark }}>
              {paidOrders(todayOrders).length}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: C.muted, fontSize: 11 }}>PENDING</Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: C.pending }}>
              {todayPending.length}
            </Text>
            <Text style={{ fontSize: 11, color: C.muted }}>
              {money(pendingAmount(todayPending))} total
            </Text>
          </Card>
        </View>
        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>
          Today's orders: {todayOrders.length + todayPending.length} total ·{" "}
          {todayPending.length} pending
        </Text>
        <Btn
          title="＋  Create New Order"
          onPress={() => router.push("/orders/create")}
        />
        <Heading
          title="Today's sales by hour"
          sub="Paid transactions · payment completion time"
        />
        <Card>
          <View
            style={{
              height: 112,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {hours.map((v, i) => (
              <View key={i} style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    height: Math.max(
                      3,
                      Math.max(...hours, 1)
                        ? (v / Math.max(...hours, 1)) * 80
                        : 3,
                    ),
                    width: 5,
                    borderRadius: 5,
                    backgroundColor: v ? C.green : C.secondary,
                  }}
                />
                <Text style={{ fontSize: 8, color: C.faint, marginTop: 5 }}>
                  {i % 3 === 0 ? `${i}` : ""}
                </Text>
              </View>
            ))}
          </View>
          <Text style={{ color: C.muted, fontSize: 10, marginTop: 7 }}>
            12 AM 12 PM 11 PM
          </Text>
        </Card>
        <View style={s.row}>
          <Heading title="Best sellers" sub="Today's paid orders" />
          <TouchableOpacity onPress={() => router.push("/(tabs)/sales")}>
            <Text style={{ color: C.green, fontWeight: "700" }}>See all</Text>
          </TouchableOpacity>
        </View>
        {best.length ? (
          best.map((x, i) => (
            <Card key={i}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", color: C.text }}>
                    {x.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {x.qty} sold · {money(x.price)} each
                  </Text>
                </View>
                <Text style={{ fontWeight: "800", color: C.green }}>
                  {money(x.revenue)}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={{ color: C.muted }}>
              Paid orders will appear here once you record sales.
            </Text>
          </Card>
        )}
        <Text
          style={{
            textAlign: "center",
            color: C.faint,
            fontSize: 10,
            marginVertical: 16,
          }}
        >
          {items.length} menu items · Offline data stored on this device
        </Text>
      </ScrollView>
    </Screen>
  );
}
