// src/app/models/order.model.ts
export interface OrderSummary {
    id: number;
    createdAt: string; // ISO
    total: number;
  }
  
  export interface OrderItem {
    bookId: number;
    bookName: string;
    quantity: number;
    unitPrice: number;
  }
  
  export interface OrderDetail {
    id: number;
    createdAt: string;
    total: number;
    items: OrderItem[];
  }
  