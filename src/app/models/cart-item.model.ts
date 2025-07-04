import { Book } from "./book.model";

// src/app/models/cart-item.model.ts

export interface CartItem {
    id: number;
    bookId: number;
    bookName: string;   // was nested under book.name
    bookPrice: number;  // was nested under book.price
    quantity: number;
  }
  