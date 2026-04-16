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
}

export interface Order {
  id?: string;
  items: OrderItem[];
  total: number;
  customer: CustomerInfo;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  shippingFee: number;
  createdAt: any; // Firestore Timestamp
}
