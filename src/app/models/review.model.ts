// src/app/models/review.model.ts

/**
 * A review fetched from the backend.
 */
export interface Review {
    id: number;
    userId: number;
    userName: string;
    rating: number;
    comment?: string;
    createdAt: string;  // ISO date string
  }
  
  /**
   * Payload to send when creating a new review.
   */
  export interface CreateReview {
    rating: number;     // 1–5
    comment?: string;   // optional text
  }
  