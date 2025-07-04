export interface Book {
  id: number;
  name: string;
  year: number;
  fav: boolean;
  author?: string;
  description?: string;
  image?: string;       // URL to cover image
  publishYear?: number; // ISO date
  lastUpdate?: string;  // ISO date
  tags?: string[];
  price?: number; // Optional price field
  category?: string; // Optional category field
  averageRating?: number; // Optional rating field
  reviews?: string[]; // Optional reviews field
  isBestseller?: boolean; // Optional field to indicate if it's a bestseller
  stock?: number; // Optional stock field
  discount?: number; // Optional discount percentage
  publisher?: string; // Optional publisher field
  language?: string; // Optional language field

}
