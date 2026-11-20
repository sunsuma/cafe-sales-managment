import { Order } from "../types/models";
import { startOfDay, startOfWeek, startOfMonth } from "./dates";
export const paidOrders = (orders: Order[]) =>
  orders.filter((o) => o.paymentStatus === "PAID" && !!o.paidAt);
export const paidSales = (orders: Order[]) =>
  paidOrders(orders).reduce((s, o) => s + o.totalAmount, 0);
export const pendingOrders = (orders: Order[]) =>
  orders.filter((o) => o.paymentStatus === "PENDING");
export const pendingAmount = (orders: Order[]) =>
  pendingOrders(orders).reduce((s, o) => s + o.totalAmount, 0);
export const paidItems = (orders: Order[]) =>
  paidOrders(orders).reduce((s, o) => s + o.totalQuantity, 0);
export function salesForDay(orders: Order[], day: Date) {
  const a = startOfDay(day).getTime(),
    b = a + 86400000;
  return paidOrders(orders).filter((o) => {
    const t = new Date(o.paidAt!).getTime();
    return t >= a && t < b;
  });
}
export function hourlySales(orders: Order[], day: Date) {
  const arr = Array(24).fill(0) as number[];
  salesForDay(orders, day).forEach(
    (o) => (arr[new Date(o.paidAt!).getHours()] += o.totalAmount),
  );
  return arr;
}
export function salesTrend(
  orders: Order[],
  period: "Today" | "Weekly" | "Monthly",
  date: Date,
) {
  if (period === "Today") {
    return hourlySales(orders, date).map((value, hour) => ({
      label:
        hour === 0
          ? "12a"
          : hour < 12
            ? hour % 6 === 0
              ? `${hour}a`
              : ""
            : hour === 12
              ? "12p"
              : hour === 18
                ? "6p"
                : hour === 23
                  ? "11p"
                  : "",
      value,
    }));
  }

  if (period === "Weekly") {
    const weekStart = startOfWeek(date);
    return Array.from({ length: 7 }, (_, day) => {
      const currentDay = new Date(weekStart);
      currentDay.setDate(currentDay.getDate() + day);
      const weekday = currentDay.toLocaleDateString("en-IN", {
        weekday: "short",
      });
      return {
        label: weekday,
        value: paidSales(salesForDay(orders, currentDay)),
      };
    });
  }

  const monthStart = startOfMonth(date);
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0,
  ).getDate();
  const weekCount = Math.ceil(daysInMonth / 7);
  const values = Array(weekCount).fill(0) as number[];
  paidOrders(orders).forEach((order) => {
    const paidDate = new Date(order.paidAt!);
    if (
      paidDate.getFullYear() === monthStart.getFullYear() &&
      paidDate.getMonth() === monthStart.getMonth()
    ) {
      values[Math.floor((paidDate.getDate() - 1) / 7)] += order.totalAmount;
    }
  });
  return values.map((value, week) => ({
    label: `${week * 7 + 1}-${Math.min((week + 1) * 7, daysInMonth)}`,
    value,
  }));
}
export function bestSellers(orders: Order[]) {
  const m = new Map<
    string,
    {
      name: string;
      image?: string;
      price: number;
      qty: number;
      revenue: number;
    }
  >();
  paidOrders(orders).forEach((o) =>
    o.items.forEach((i) => {
      const x = m.get(i.itemId) || {
        name: i.itemName,
        image: i.itemImage,
        price: i.unitPrice,
        qty: 0,
        revenue: 0,
      };
      x.qty += i.quantity;
      x.revenue += i.subtotal;
      m.set(i.itemId, x);
    }),
  );
  return [...m.values()].sort((a, b) => b.qty - a.qty);
}
export function periodOrders(
  orders: Order[],
  period: "Daily" | "Weekly" | "Monthly",
  date: Date,
) {
  const start =
    period === "Daily"
      ? startOfDay(date)
      : period === "Weekly"
        ? startOfWeek(date)
        : startOfMonth(date);
  const end = new Date(start);
  if (period === "Daily") end.setDate(end.getDate() + 1);
  else if (period === "Weekly") end.setDate(end.getDate() + 7);
  else end.setMonth(end.getMonth() + 1);
  return orders.filter((o) => {
    const t = new Date(
      o.paymentStatus === "PAID" && o.paidAt ? o.paidAt : o.createdAt,
    ).getTime();
    return t >= start.getTime() && t < end.getTime();
  });
}
