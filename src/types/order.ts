import type { MenuItem } from './menu';

export type DeliveryMethod = 'building-delivery' | 'pickup';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  deliveryDate: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  paymentReference?: string;
  userId?: string;
}
