import { supabase } from './supabase';
import { menuItemFromRow, orderFromRows, subscriberFromRow } from '@/types/database';
import type { MenuItemRow, OrderRow, OrderItemRow, SubscriptionRow } from '@/types/database';
import type { MenuItem } from '@/types/menu';
import type { Order } from '@/types/order';
import type { Subscriber } from '@/types/subscription';

type SupabaseClient = typeof supabase;

// ── Menu queries ──

export async function getMenuItems(category?: string): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*')
    .order('created_at', { ascending: true });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as MenuItemRow[]).map(menuItemFromRow);
}

export async function getFeaturedItems(): Promise<MenuItem[]> {
  const featuredIds = ['dosirak-premium-dinner', 'dosirak-signature-lunch', 'dosirak-temple-vegan', 'dosirak-mini-kimbap'];
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .in('id', featuredIds)
    .eq('available', true);

  if (error) throw error;
  return (data as MenuItemRow[]).map(menuItemFromRow);
}

export async function getMenuItemsByIds(ids: string[]): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .in('id', ids);

  if (error) throw error;
  return (data as MenuItemRow[]).map(menuItemFromRow);
}

// ── Order queries ──

interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryDate: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  paymentReference?: string;
  userId?: string;
  items: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

export async function createOrder(orderData: CreateOrderData, client?: SupabaseClient): Promise<string> {
  const db = client || supabase;

  // Idempotency: if payment_reference already exists, return the existing order
  if (orderData.paymentReference) {
    const { data: existing } = await db
      .from('orders')
      .select('id')
      .eq('payment_reference', orderData.paymentReference)
      .maybeSingle();

    if (existing) return existing.id;
  }

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      customer_phone: orderData.customerPhone,
      delivery_date: orderData.deliveryDate,
      delivery_method: orderData.deliveryMethod,
      delivery_address: orderData.deliveryAddress || null,
      subtotal: orderData.subtotal,
      delivery_fee: orderData.deliveryFee,
      total: orderData.total,
      notes: orderData.notes || null,
      payment_reference: orderData.paymentReference || null,
      payment_status: orderData.paymentReference ? 'completed' : 'pending',
      user_id: orderData.userId || null,
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    menu_item_name: item.menuItemName,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await db
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order.id;
}

export async function getOrderById(id: string, client?: SupabaseClient): Promise<Order | null> {
  const db = client || supabase;

  // Single query: fetch order with nested order_items
  const { data, error: orderError } = await db
    .from('orders')
    .select('*, order_items(id, order_id, menu_item_id, menu_item_name, quantity, unit_price, subtotal)')
    .eq('id', id)
    .single();

  if (orderError) {
    if (orderError.code === 'PGRST116') return null;
    throw orderError;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any;
  const itemRows = (raw.order_items ?? []) as OrderItemRow[];
  // Remove nested field before passing to converter
  const { order_items: _, ...orderRow } = raw;

  // Second query: fetch menu item details for richer display
  const menuItemIds = itemRows.map(i => i.menu_item_id);
  let menuItems: MenuItemRow[] | undefined;
  if (menuItemIds.length > 0) {
    const { data: menuData } = await db
      .from('menu_items')
      .select('*')
      .in('id', menuItemIds);
    if (menuData) menuItems = menuData as MenuItemRow[];
  }

  return orderFromRows(orderRow as OrderRow, itemRows, menuItems);
}

export async function getOrdersByEmail(email: string, client?: SupabaseClient): Promise<Order[]> {
  const db = client || supabase;
  // Single query: orders with nested order_items
  const { data: ordersData, error: ordersError } = await db
    .from('orders')
    .select('*, order_items(id, order_id, menu_item_id, menu_item_name, quantity, unit_price, subtotal)')
    .eq('customer_email', email.toLowerCase())
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;
  if (!ordersData || ordersData.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ordersData.map((raw: any) => {
    const itemRows = (raw.order_items ?? []) as OrderItemRow[];
    const { order_items: _, ...orderRow } = raw;
    return orderFromRows(orderRow as OrderRow, itemRows);
  });
}

// ── Profile queries ──

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  delivery_address: string | null;
  role: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: { full_name?: string; phone?: string; delivery_address?: string }
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

export async function getOrdersByUserId(userId: string, client?: SupabaseClient): Promise<Order[]> {
  const db = client || supabase;
  // Single query: orders with nested order_items
  const { data: ordersData, error: ordersError } = await db
    .from('orders')
    .select('*, order_items(id, order_id, menu_item_id, menu_item_name, quantity, unit_price, subtotal)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (ordersError) throw ordersError;
  if (!ordersData || ordersData.length === 0) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ordersData.map((raw: any) => {
    const itemRows = (raw.order_items ?? []) as OrderItemRow[];
    const { order_items: _, ...orderRow } = raw;
    return orderFromRows(orderRow as OrderRow, itemRows);
  });
}

// ── Subscription queries ──

interface CreateSubscriptionData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  planName?: string;
  pricePerDelivery?: number;
  frequency: string;
  deliveryDay: string;
  deliveryAddress: string;
  userId?: string;
  squareCustomerId?: string;
  squareCardId?: string;
  squareSubscriptionId?: string;
}

export function calculateNextDeliveryDate(deliveryDay: string): string {
  const dayMap: Record<string, number> = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const targetDay = dayMap[deliveryDay];
  if (targetDay === undefined) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  const now = new Date();
  const today = now.getDay();
  let daysUntil = targetDay - today;
  if (daysUntil <= 0) daysUntil += 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

export async function createSubscription(data: CreateSubscriptionData, client?: SupabaseClient): Promise<string> {
  const db = client || supabase;
  const nextDelivery = calculateNextDeliveryDate(data.deliveryDay);

  const { data: sub, error } = await db
    .from('subscriptions')
    .insert({
      customer_name: data.customerName,
      customer_email: data.customerEmail.toLowerCase(),
      customer_phone: data.customerPhone || '',
      plan_name: data.planName || 'Weekly Banchan Box',
      price_per_delivery: data.pricePerDelivery ?? 35.0,
      frequency: data.frequency,
      delivery_day: data.deliveryDay,
      delivery_address: data.deliveryAddress,
      next_delivery_date: nextDelivery,
      user_id: data.userId || null,
      square_customer_id: data.squareCustomerId || null,
      square_card_id: data.squareCardId || null,
      square_subscription_id: data.squareSubscriptionId || null,
    })
    .select('id')
    .single();

  if (error) throw error;
  return sub.id;
}

export async function getSubscriptionByUserId(userId: string): Promise<Subscriber | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return subscriberFromRow(data as SubscriptionRow);
}

export async function getSubscriptionsByEmail(email: string): Promise<Subscriber[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_email', email.toLowerCase())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as SubscriptionRow[]).map(subscriberFromRow);
}

// ── Contact queries ──

export async function createContactSubmission(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}, client?: SupabaseClient): Promise<void> {
  const db = client || supabase;
  const { error } = await db
    .from('contact_submissions')
    .insert(data);

  if (error) throw error;
}
