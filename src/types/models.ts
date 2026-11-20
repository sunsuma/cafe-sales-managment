export type PaymentStatus = 'PAID' | 'PENDING';
export type MenuItem = { id:string; name:string; price:number; category:string; imageName?:string; createdAt:string; updatedAt:string };
export type OrderItem = { itemId:string; itemName:string; imageName?:string; unitPrice:number; quantity:number; subtotal:number };
export type Order = { id:string; orderNumber:string; description?:string; items:OrderItem[]; totalQuantity:number; totalAmount:number; paymentStatus:PaymentStatus; readyQuantities?:Record<string,number>; createdAt:string; updatedAt:string; paidAt?:string };
export type CafeSettings = { cafeName:string; currency:string };
