import { Timestamp } from "firebase/firestore";

export interface Coupon {
  id: string;
  code: string;           // The discount code (e.g., "SATR20")
  discountPercent: number; // Discount percentage (e.g., 20 for 20%)
  maxUses: number;         // Maximum number of uses (0 = unlimited)
  usedCount: number;       // How many times it has been used
  isActive: boolean;       // Whether the coupon is active
  expiresAt?: Timestamp;   // Optional expiration date
  createdAt: Timestamp;    // When it was created
}
