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
  createOrder: (items: OrderItem[]) => Order;
  updateOrder: (id: string, items: OrderItem[], status: PaymentStatus) => void;
  setStatus: (id: string, status: PaymentStatus) => void;
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
      createOrder: (items) => {
        const now = new Date().toISOString();
        const s = get();
        const orderNumber = makeOrderNumber(s.orders.map((o) => o.orderNumber));
        const order: Order = {
          id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          orderNumber,
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
      updateOrder: (id, items, status) =>
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const now = new Date().toISOString();
            return {
              ...o,
              items,
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
