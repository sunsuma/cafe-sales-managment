import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Order } from "../types/models";
import { money } from "../utils/currency";
import {
  paidSales,
  paidOrders,
  pendingOrders,
  pendingAmount,
} from "../utils/calculations";
const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
export async function exportCSV(orders: Order[], cafeName: string) {
  const rows = [
    ["Cafe", cafeName],
    [
      "Order ID",
      "Created At",
      "Paid At",
      "Status",
      "Items",
      "Quantity",
      "Total",
    ],
  ];
  orders.forEach((o) =>
    rows.push([
      o.orderNumber,
      o.createdAt,
      o.paidAt || "",
      o.paymentStatus,
      o.items.map((i) => `${i.itemName} x${i.quantity}`).join("; "),
      String(o.totalQuantity),
      String(o.totalAmount),
    ]),
  );
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const uri = `${FileSystem.cacheDirectory}cafe-sales-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(uri, csv);
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(uri, {
      mimeType: "text/csv",
      dialogTitle: "Share sales CSV",
    });
  return uri;
}
export async function exportPDF(
  orders: Order[],
  cafeName: string,
  period: string,
) {
  const html = `<html><body style="font-family:Arial;padding:28px;color:#29231F"><h1>${cafeName}</h1><h2>Sales report · ${period}</h2><p>Paid sales: <b>${money(paidSales(orders))}</b></p><p>Paid orders: ${paidOrders(orders).length}</p><p>Pending orders: ${pendingOrders(orders).length}</p><p>Pending amount: ${money(pendingAmount(orders))}</p><h3>Transactions</h3><table style="width:100%;border-collapse:collapse"><tr><th align="left">Order</th><th>Status</th><th align="right">Total</th></tr>${orders.map((o) => `<tr><td>${o.orderNumber}</td><td>${o.paymentStatus}</td><td align="right">${money(o.totalAmount)}</td></tr>`).join("")}</table></body></html>`;
  const f = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync())
    await Sharing.shareAsync(f.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share sales PDF",
    });
  return f.uri;
}
