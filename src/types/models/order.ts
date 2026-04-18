export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
  city: string;
  address: string;
  isZaytoonah?: boolean;
  gender?: 'ذكر' | 'أنثى';
}

export interface Order {
  id: string; // Changed from id? to id
  items: OrderItem[];
  total: number;
  customer: CustomerInfo;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  paymentMethod: 'cod';
  shippingFee: number;
  createdAt: any; // Firestore Timestamp
}
