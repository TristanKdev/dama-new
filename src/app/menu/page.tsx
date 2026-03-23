import type { Metadata } from 'next';
import { getSquareCatalogItems } from '@/lib/square-catalog';
import { menuItems as staticMenuItems } from '@/data/menu-items';
import { dosirakSets } from '@/data/dosirak-sets';
import MenuClient from './menu-client';

export const metadata: Metadata = {
  title: 'Menu — Dosirak Sets & Banchan Sides',
  description: 'Choose your dosirak meal box and add banchan sides. 3 signature Korean meal boxes and 30 authentic banchan. Delivered fresh in Jersey City.',
};

export const revalidate = 300;

export default async function MenuPage() {
  let menuItems;
  try {
    menuItems = await getSquareCatalogItems();
    if (menuItems.length === 0) menuItems = staticMenuItems;
  } catch {
    menuItems = staticMenuItems;
  }

  return <MenuClient menuItems={menuItems} dosirakSets={dosirakSets} />;
}
