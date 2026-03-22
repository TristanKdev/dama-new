import { menuItems as staticMenuItems } from '@/data/menu-items';
import { GrabAndGoBuilder } from '@/components/grab-and-go/GrabAndGoBuilder';
import { getSquareCatalogItems } from '@/lib/square-catalog';

export const revalidate = 300; // Revalidate every 5 minutes (matches /menu)

async function getBanchanItems() {
  const staticBanchan = staticMenuItems.filter(i => i.category === 'banchan');
  try {
    const items = await getSquareCatalogItems('banchan');
    if (items.length === 0) return staticBanchan;
    return items.filter(i => i.available && !i.soldOut);
  } catch {
    return staticBanchan;
  }
}

export default async function GrabAndGoPage() {
  const banchanItems = await getBanchanItems();

  return (
    <div className="bg-dama-cream">
      <div className="pt-10 pb-4 md:pt-14 md:pb-6">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">BYOB</p>
              <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
                Grab &amp; Go Banchan Builder
              </h1>
              <p className="mt-3 text-base text-dama-charcoal/70">
                Drag and drop banchan into your tray. Pick 4, 8, or 12 from our selection of 30 authentic Korean sides.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-10 md:px-6 md:pb-16">
        <GrabAndGoBuilder banchanItems={banchanItems} />
      </div>
    </div>
  );
}
