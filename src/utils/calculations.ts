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
