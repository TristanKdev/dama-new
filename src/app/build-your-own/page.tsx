import { getSquareCatalogItems } from '@/lib/square-catalog';
import { menuItems as staticMenuItems } from '@/data/menu-items';
import BuildYourOwnClient from './build-your-own-client';

export const revalidate = 300;

export default async function BuildYourOwnPage() {
  let menuItems;
  try {
    menuItems = await getSquareCatalogItems();
    if (menuItems.length === 0) menuItems = staticMenuItems;
  } catch {
    menuItems = staticMenuItems;
  }

  return <BuildYourOwnClient menuItems={menuItems} />;
}
