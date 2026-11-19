import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading, Card, Btn, Pill, s } from "../../src/components/ui";
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
  const cafeName = settings.cafeName || "ARBO's Cafe";
  const [isAmountVisible, setIsAmountVisible] = useState(false);
  const [isEyeVisible, setIsEyeVisible] = useState(false);
  const eyeScale = useRef(new Animated.Value(0)).current;
  const eyeOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef(0);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
    .format(today)
    .toUpperCase();

  useEffect(
    () => () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    },
    [],
  );

  const handleLogoDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setIsEyeVisible(true);
      eyeScale.setValue(0);
      eyeOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(eyeScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(eyeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    lastTapRef.current = now;
  };

  const handleEyePress = () => {
    const shouldHideAmount = isAmountVisible;
    setIsAmountVisible(!shouldHideAmount);
    Animated.parallel([
      Animated.timing(eyeScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(eyeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsEyeVisible(false);
    });

    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    if (shouldHideAmount) {
      revealTimerRef.current = null;
      return;
    }

    revealTimerRef.current = setTimeout(() => {
      setIsAmountVisible(false);
      revealTimerRef.current = null;
    }, 6000);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.bg }}
      edges={["top"]}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 18,
          paddingTop: 8,
          paddingBottom: 18,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: 13,
              backgroundColor: C.card,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="menu-outline" size={23} color={C.dark} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text
              style={{
                color: C.muted,
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 0.7,
                marginBottom: 3,
              }}
            >
              {dateLabel}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: C.dark, fontSize: 15, fontWeight: "800" }}
            >
              {greeting}, {cafeName}
            </Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#D7EBDD",
                fontSize: 12,
                letterSpacing: 1.2,
                fontWeight: "700",
              }}
            >
              TODAY'S PAID SALES
            </Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleLogoDoubleTap}
              accessibilityRole="button"
              accessibilityLabel="ARBO's Cafe logo"
              accessibilityHint="Double-tap to show the sales reveal button"
              style={{ width: 94, height: 82, alignItems: "center" }}
            >
              <Image
                source={require("../../assets/arbos-cafe-logo.png")}
                resizeMode="contain"
                accessible={false}
                style={{ width: 94, height: 82 }}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#FFF",
                fontSize: 30,
                fontWeight: "900",
              }}
            >
              {isAmountVisible ? money(todaySales) : "••••••••"}
            </Text>
            {isEyeVisible && (
              <Animated.View
                style={{
                  marginLeft: 14,
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 8,
                  opacity: eyeOpacity,
                  transform: [{ scale: eyeScale }],
                }}
              >
                <TouchableOpacity
                  onPress={handleEyePress}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isAmountVisible
                      ? "Hide today's paid sales"
                      : "Reveal today's paid sales for six seconds"
                  }
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Ionicons name="eye-outline" size={24} color="#1E3D2F" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
          <Text style={{ color: "#D7EBDD", fontSize: 12 }}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs
            yesterday · Yesterday{" "}
            {isAmountVisible ? money(yesterdaySales) : "••••••••"}
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
      </View>
    </SafeAreaView>
  );
}
