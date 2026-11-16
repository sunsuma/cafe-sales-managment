import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { Screen, Heading, Card, Btn, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import {
  paidSales,
  paidOrders,
  pendingOrders,
  pendingAmount,
  paidItems,
  periodOrders,
} from "../../src/utils/calculations";
import { exportCSV, exportPDF } from "../../src/services/reportService";
import { C } from "../../src/constants/colors";
export default function Sales() {
  const { orders, settings } = useCafeStore();
  const [period, setPeriod] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [offset, setOffset] = useState(0);
  const date = new Date();
  if (period === "Daily") date.setDate(date.getDate() + offset);
  else if (period === "Weekly") date.setDate(date.getDate() + offset * 7);
  else date.setMonth(date.getMonth() + offset);
  const selected = useMemo(
    () => periodOrders(orders, period, date),
    [orders, period, offset],
  );
  const paid = paidOrders(selected),
    pending = pendingOrders(selected);
  const label =
    period === "Daily"
      ? date.toLocaleDateString("en-IN", { dateStyle: "full" })
      : period === "Weekly"
        ? "Week of " + date.toLocaleDateString("en-IN")
        : date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Heading title="Sales overview" sub="Track your café performance" />
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
          {(["Daily", "Weekly", "Monthly"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => {
                setPeriod(p);
                setOffset(0);
              }}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 10,
                backgroundColor: period === p ? C.green : C.secondary,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: period === p ? C.white : C.muted,
                  fontWeight: "700",
                }}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Card>
          <View style={s.row}>
            <TouchableOpacity onPress={() => setOffset((x) => x - 1)}>
              <Text style={{ fontSize: 20, color: C.green }}>‹</Text>
            </TouchableOpacity>
            <Text
              style={{
                fontWeight: "700",
                color: C.text,
                flex: 1,
                textAlign: "center",
              }}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={() => setOffset((x) => Math.min(0, x + 1))}
              disabled={offset === 0}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: offset === 0 ? C.faint : C.green,
                }}
              >
                ›
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
        <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
          <Text style={{ color: "#D7EBDD" }}>TOTAL PAID SALES</Text>
          <Text
            style={{
              color: C.white,
              fontSize: 29,
              fontWeight: "900",
              marginVertical: 8,
            }}
          >
            {money(paidSales(selected))}
          </Text>
          <Text style={{ color: "#D7EBDD", fontSize: 12 }}>
            {paid.length} paid orders · {paidItems(selected)} items sold
          </Text>
        </Card>
        <View style={{ flexDirection: "row", gap: 9 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: C.muted }}>PENDING ORDERS</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: C.pending }}>
              {pending.length}
            </Text>
            <Text style={{ fontSize: 11, color: C.muted }}>
              {money(pendingAmount(selected))}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: C.muted }}>
              AVG. PAID ORDER
            </Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: C.dark }}>
              {money(paid.length ? paidSales(selected) / paid.length : 0)}
            </Text>
          </Card>
        </View>
        <Heading
          title="Transactions"
          sub="Payment completion date determines paid sales"
        />
        {selected.length ? (
          selected.map((o) => (
            <Card key={o.id}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", color: C.text }}>
                    {o.orderNumber}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {new Date(o.createdAt).toLocaleString("en-IN")}
                  </Text>
                </View>
                <Text style={{ fontWeight: "800" }}>
                  {money(o.totalAmount)}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: o.paymentStatus === "PAID" ? C.paid : C.pending,
                  marginTop: 5,
                }}
              >
                {o.paymentStatus} · {o.totalQuantity} items
              </Text>
            </Card>
          ))
        ) : (
          <Card>
            <Text style={{ color: C.muted }}>
              No transactions in this period.
            </Text>
          </Card>
        )}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Btn
              title="Export PDF"
              onPress={() =>
                exportPDF(selected, settings.cafeName, label).catch((e) =>
                  Alert.alert("Export failed", String(e)),
                )
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Btn
              title="Export CSV"
              secondary
              onPress={() =>
                exportCSV(selected, settings.cafeName).catch((e) =>
                  Alert.alert("Export failed", String(e)),
                )
              }
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
