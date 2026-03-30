import type { Metadata } from 'next';
import { getSquareCatalogItems } from '@/lib/square-catalog';
import { menuItems as staticMenuItems } from '@/data/menu-items';
import GrabAndGoClient from './grab-and-go-client';

export const metadata: Metadata = {
  title: 'Grab & Go — Build Your Banchan',
  description:
    'Fresh Korean banchan available for individual pickup. Choose from 30 authentic side dishes at DAM:A in Jersey City.',
};

export const revalidate = 300;

export default async function GrabAndGoPage() {
  let menuItems;
  try {
    menuItems = await getSquareCatalogItems();
    if (menuItems.length === 0) menuItems = staticMenuItems;
  } catch {
    menuItems = staticMenuItems;
  }

  return <GrabAndGoClient menuItems={menuItems} />;
}
