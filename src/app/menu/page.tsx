import type { Metadata } from 'next';
import { getSquareCatalogItems } from '@/lib/square-catalog';
import { menuItems as staticMenuItems } from '@/data/menu-items';
import MenuClient from './menu-client';

export const metadata: Metadata = {
  title: 'Menu — Dosirak Sets, Banchan & Appetizers',
  description: 'Browse our full Korean menu: curated dosirak sets, 30 authentic banchan side dishes (build your own in sets of 4, 8, or 12), and Korean street-style appetizers. Delivered fresh in Jersey City.',
};

export const revalidate = 300; // Revalidate menu every 5 minutes

export default async function MenuPage() {
  let menuItems;
  try {
    menuItems = await getSquareCatalogItems();
    if (menuItems.length === 0) menuItems = staticMenuItems;
  } catch {
    menuItems = staticMenuItems;
  }

  return <MenuClient menuItems={menuItems} />;
}
