import { Timestamp } from "firebase/firestore";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  content: string;
  createdAt: Timestamp;
  isRead: boolean;
}
