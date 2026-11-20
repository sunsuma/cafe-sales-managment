import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { TabScreen, Heading, Card, Btn, s } from "../../src/components/ui";
import { useCafeStore } from "../../src/store/useCafeStore";
import { money } from "../../src/utils/currency";
import {
  paidSales,
  paidOrders,
  pendingOrders,
  pendingAmount,
  paidItems,
  periodOrders,
  salesTrend,
} from "../../src/utils/calculations";
import { exportCSV, exportPDF } from "../../src/services/reportService";
import { C } from "../../src/constants/colors";
const chartWidth = 360;
const chartHeight = 220;
const chartLeft = 54;
const chartRight = 12;
const chartTop = 16;
const chartBottom = 38;

function SalesTrendChart({ data }: { data: { label: string; value: number }[] }) {
  const plotWidth = chartWidth - chartLeft - chartRight;
  const plotHeight = chartHeight - chartTop - chartBottom;
  const maxValue = Math.max(...data.map((point) => point.value), 1);
  const points = data.map((point, index) => ({
    x: chartLeft + (index * plotWidth) / Math.max(data.length - 1, 1),
    y: chartTop + plotHeight * (1 - point.value / maxValue),
  }));
  const pointList = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <Svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      accessibilityLabel="Paid sales trend line chart"
    >
      {[0, 1, 2, 3].map((tick) => {
        const y = chartTop + (plotHeight * tick) / 3;
        const value = maxValue * (1 - tick / 3);
        return (
          <React.Fragment key={tick}>
            <Line
              x1={chartLeft}
              y1={y}
              x2={chartWidth - chartRight}
              y2={y}
              stroke={C.border}
              strokeWidth={1}
            />
            <SvgText
              x={chartLeft - 7}
              y={y + 3}
              fill={C.muted}
              fontSize={9}
              textAnchor="end"
            >
              {`₹${Math.round(value).toLocaleString("en-IN")}`}
            </SvgText>
          </React.Fragment>
        );
      })}
      <Polyline
        points={pointList}
        fill="none"
        stroke={C.green}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((point, index) => (
        <Circle
          key={`point-${index}`}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={C.white}
          stroke={C.green}
          strokeWidth={2}
        />
      ))}
      {data.map((point, index) => {
        if (!point.label) return null;
        return (
          <SvgText
            key={`label-${index}`}
            x={points[index].x}
            y={chartHeight - 12}
            fill={C.muted}
            fontSize={9}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function Sales() {
  const { orders, settings } = useCafeStore();
  const [period, setPeriod] = useState<"Today" | "Weekly" | "Monthly">("Today");
  const [offset, setOffset] = useState(0);
  const date = new Date();
  if (period === "Today") date.setDate(date.getDate() + offset);
  else if (period === "Weekly") date.setDate(date.getDate() + offset * 7);
  else date.setMonth(date.getMonth() + offset);
  const selected = useMemo(
    () => periodOrders(orders, period === "Today" ? "Daily" : period, date),
    [orders, period, offset],
  );
  const trend = useMemo(
    () => salesTrend(orders, period, date),
    [orders, period, offset],
  );
  const paid = paidOrders(selected),
    pending = pendingOrders(selected);
  const label =
    period === "Today"
      ? date.toLocaleDateString("en-IN", { dateStyle: "full" })
      : period === "Weekly"
        ? "Week of " + date.toLocaleDateString("en-IN")
        : date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return (
    <TabScreen>
      <Heading title="Sales overview" sub="Track your café performance" />
      <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
        {(["Today", "Weekly", "Monthly"] as const).map((p) => (
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
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
        <Card>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: "800" }}>
            {period === "Today"
              ? "Hourly paid sales"
              : period === "Weekly"
                ? "Daily paid sales"
                : "Weekly paid sales"}
          </Text>
          <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
            {period === "Today"
              ? "Sales by hour"
              : period === "Weekly"
                ? "Sales by day"
                : "Sales by week"}
          </Text>
          <View style={{ marginTop: 12, marginHorizontal: -8 }}>
            <SalesTrendChart data={trend} />
          </View>
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
    </TabScreen>
  );
}
