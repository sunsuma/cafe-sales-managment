export type PaymentStatus = 'PAID' | 'PENDING';
export type MenuItem = { id:string; name:string; price:number; category:string; imageUri?:string; createdAt:string; updatedAt:string };
export type OrderItem = { itemId:string; itemName:string; itemImage?:string; unitPrice:number; quantity:number; subtotal:number };
export type Order = { id:string; orderNumber:string; items:OrderItem[]; totalQuantity:number; totalAmount:number; paymentStatus:PaymentStatus; createdAt:string; updatedAt:string; paidAt?:string };
export type CafeSettings = { cafeName:string; currency:string };
