import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  CafeSettings,
  MenuItem,
  Order,
  OrderItem,
  PaymentStatus,
} from '../types/models';
import { makeOrderNumber } from '../utils/orderId';

type State = {
  items: MenuItem[];
  orders: Order[];
  settings: CafeSettings;
  addItem: (x: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, x: Partial<MenuItem>) => void;
  deleteItem: (id: string) => void;
  createOrder: (items: OrderItem[], description?: string) => Order;
  updateOrder: (id: string, items: OrderItem[], status: PaymentStatus, description?: string) => void;
  setStatus: (id: string, status: PaymentStatus) => void;
  markItemReady: (orderId: string, itemId: string) => void;
  unmarkItemReady: (orderId: string, itemId: string) => void;
  deleteOrder: (id: string) => void;
  setSettings: (x: Partial<CafeSettings>) => void;
  restore: (data: Pick<State, 'items' | 'orders' | 'settings'>) => void;
};

export const useCafeStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      settings: { cafeName: 'My Café', currency: 'INR' },
      addItem: (x) => {
        const now = new Date().toISOString();
        set((s) => ({
          items: [
            {
              ...x,
              id: `itm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: now,
              updatedAt: now,
            },
            ...s.items,
          ],
        }));
      },
      updateItem: (id, x) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...x, updatedAt: new Date().toISOString() } : i,
          ),
        })),
      deleteItem: (id) =>
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
        })),
      createOrder: (items, description) => {
        const now = new Date().toISOString();
        const s = get();
        const orderNumber = makeOrderNumber(s.orders.map((o) => o.orderNumber));
        const order: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          orderNumber,
          description: description?.trim() || undefined,
          items,
          totalQuantity: items.reduce((a, b) => a + b.quantity, 0),
          totalAmount: items.reduce((a, b) => a + b.subtotal, 0),
          paymentStatus: 'PENDING',
          createdAt: now,
          updatedAt: now,
        };

        set((v) => ({ orders: [order, ...v.orders] }));
        return order;
      },
      updateOrder: (id, items, status, description) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const now = new Date().toISOString();
            return {
              ...o,
              description: description?.trim() ?? o.description,
              items,
              readyQuantities: items.reduce<Record<string, number>>(
                (ready, item) => {
                  const count = Math.min(
                    Math.floor(item.quantity),
                    Math.max(0, Math.floor(o.readyQuantities?.[item.itemId] ?? 0)),
                  );
                  if (count > 0) ready[item.itemId] = count;
                  return ready;
                },
                {},
              ),
              totalQuantity: items.reduce((a, b) => a + b.quantity, 0),
              totalAmount: items.reduce((a, b) => a + b.subtotal, 0),
              paymentStatus: status,
              paidAt:
                status === 'PAID' ? (o.paymentStatus === 'PAID' ? o.paidAt : now) : undefined,
              updatedAt: now,
            };
          }),
        })),
      setStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id !== id
              ? o
              : {
                  ...o,
                  paymentStatus: status,
                  paidAt:
                    status === 'PAID'
                      ? o.paymentStatus === 'PAID'
                        ? o.paidAt
                        : new Date().toISOString()
                      : undefined,
                  updatedAt: new Date().toISOString(),
                },
          ),
        })),
      markItemReady: (orderId, itemId) =>
        set((s) => ({
          orders: s.orders.map((order) => {
            if (order.id !== orderId || order.paymentStatus !== 'PENDING') {
              return order;
            }

            const item = order.items.find((line) => line.itemId === itemId);
            if (!item) return order;

            const quantity = Math.max(0, Math.floor(item.quantity));
            const ready = Math.min(
              quantity,
              Math.max(0, Math.floor(order.readyQuantities?.[itemId] ?? 0)),
            );
            if (ready >= quantity) return order;

            return {
              ...order,
              readyQuantities: {
                ...order.readyQuantities,
                [itemId]: ready + 1,
              },
            };
          }),
        })),
      unmarkItemReady: (orderId, itemId) =>
        set((s) => ({
          orders: s.orders.map((order) => {
            if (order.id !== orderId || order.paymentStatus !== 'PENDING') {
              return order;
            }

            const item = order.items.find((line) => line.itemId === itemId);
            if (!item) return order;

            const quantity = Math.max(0, Math.floor(item.quantity));
            const ready = Math.min(
              quantity,
              Math.max(0, Math.floor(order.readyQuantities?.[itemId] ?? 0)),
            );
            if (ready === 0) return order;

            return {
              ...order,
              readyQuantities: {
                ...order.readyQuantities,
                [itemId]: ready - 1,
              },
            };
          }),
        })),
      deleteOrder: (id) =>
        set((s) => ({
          orders: s.orders.filter((o) => o.id !== id),
        })),
      setSettings: (x) =>
        set((s) => ({
          settings: { ...s.settings, ...x },
        })),
      restore: (data) =>
        set({
          items: data.items,
          orders: data.orders,
          settings: data.settings,
        }),
    }),
    {
      name: 'cafe-sales-local-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
