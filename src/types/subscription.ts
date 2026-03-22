export type SubscriptionFrequency = 'weekly' | 'biweekly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  pricePerWeek: number;
  itemCount: number;
  features: string[];
  popular: boolean;
}

export interface Subscriber {
  id: string;
  userId: string | null;
  planName: string;
  pricePerDelivery: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  deliveryDay: 'Tuesday' | 'Thursday' | 'Saturday';
  deliveryAddress: string;
  startDate: string;
  nextDeliveryDate: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pausedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastChargedAt: string | null;
  squareCustomerId: string | null;
  squareCardId: string | null;
}
