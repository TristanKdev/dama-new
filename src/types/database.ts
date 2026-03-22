import type { MenuItem, DietaryTag, ItemCategory, BanchanSubcategory } from './menu';
import type { Order, OrderItem, OrderStatus, PaymentStatus, DeliveryMethod } from './order';
import type { Subscriber, SubscriptionFrequency, SubscriptionStatus } from './subscription';

// ── Row types matching Supabase tables ──

export interface MenuItemRow {
  id: string;
  name_ko: string;
  name_en: string;
  description: string;
  price: number;
  category: string;
  dietary_tags: string[];
  image_url: string;
  available: boolean;
  sold_out: boolean;
  serving_size: string;
  ingredients: string[] | null;
  spice_level: number | null;
  created_at: string;
  subcategory: string | null;
  badges: string[] | null;
  upgrade_price: number | null;
  set_contents: string[] | null;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_date: string;
  delivery_method: string;
  delivery_address: string | null;
  status: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  payment_reference: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ContactSubmissionRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface FAQRow {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  plan_name: string;
  price_per_delivery: number;
  frequency: string;
  delivery_day: string;
  status: string;
  delivery_address: string;
  start_date: string;
  next_delivery_date: string | null;
  paused_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  last_charged_at: string | null;
  square_customer_id: string | null;
  square_card_id: string | null;
  square_subscription_id: string | null;
}

// ── Converter functions ──

export function menuItemFromRow(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    nameKo: row.name_ko,
    nameEn: row.name_en,
    description: row.description,
    price: row.price,
    category: row.category as ItemCategory,
    dietaryTags: row.dietary_tags as DietaryTag[],
    imageUrl: row.image_url,
    available: row.available,
    soldOut: row.sold_out,
    servingSize: row.serving_size,
    ingredients: row.ingredients ?? undefined,
    spiceLevel: row.spice_level as MenuItem['spiceLevel'] ?? undefined,
    subcategory: (row.subcategory as BanchanSubcategory) ?? undefined,
    badges: row.badges ?? undefined,
    upgradePrice: row.upgrade_price ?? undefined,
    setContents: row.set_contents ?? undefined,
  };
}

export function subscriberFromRow(row: SubscriptionRow): Subscriber {
  return {
    id: row.id,
    userId: row.user_id,
    planName: row.plan_name,
    pricePerDelivery: row.price_per_delivery,
    frequency: row.frequency as SubscriptionFrequency,
    status: row.status as SubscriptionStatus,
    deliveryDay: row.delivery_day as Subscriber['deliveryDay'],
    deliveryAddress: row.delivery_address,
    startDate: row.start_date,
    nextDeliveryDate: row.next_delivery_date,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    pausedAt: row.paused_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastChargedAt: row.last_charged_at,
    squareCustomerId: row.square_customer_id,
    squareCardId: row.square_card_id,
  };
}

export function orderFromRows(
  orderRow: OrderRow,
  itemRows: OrderItemRow[],
  menuItems?: MenuItemRow[]
): Order {
  const menuMap = new Map<string, MenuItemRow>();
  if (menuItems) {
    for (const mi of menuItems) {
      menuMap.set(mi.id, mi);
    }
  }

  return {
    id: orderRow.id,
    userId: orderRow.user_id ?? undefined,
    customerName: orderRow.customer_name,
    customerEmail: orderRow.customer_email,
    customerPhone: orderRow.customer_phone,
    deliveryDate: orderRow.delivery_date,
    deliveryMethod: orderRow.delivery_method as DeliveryMethod,
    deliveryAddress: orderRow.delivery_address ?? undefined,
    status: orderRow.status as OrderStatus,
    paymentStatus: (orderRow.payment_status || 'pending') as PaymentStatus,
    subtotal: orderRow.subtotal,
    deliveryFee: orderRow.delivery_fee,
    total: orderRow.total,
    notes: orderRow.notes ?? undefined,
    paymentReference: orderRow.payment_reference ?? undefined,
    createdAt: orderRow.created_at,
    updatedAt: orderRow.updated_at ?? undefined,
    items: itemRows.map((item) => {
      const fullItem = menuMap.get(item.menu_item_id);
      return {
        menuItem: fullItem
          ? menuItemFromRow(fullItem)
          : {
              id: item.menu_item_id,
              nameEn: item.menu_item_name,
              nameKo: '',
              description: '',
              price: item.unit_price,
              category: 'banchan' as ItemCategory,
              dietaryTags: [],
              imageUrl: '',
              available: true,
              soldOut: false,
              servingSize: '',
            },
        quantity: item.quantity,
        subtotal: item.subtotal,
      };
    }),
  };
}
