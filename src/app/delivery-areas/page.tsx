import type { Metadata } from 'next';
import { AddressChecker } from '@/components/ui/AddressChecker';
import { eligibleBuildings as staticBuildings, deliveryNeighborhoods as staticNeighborhoods } from '@/data/eligible-buildings';
import { createServiceRoleClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Delivery Areas',
  description: 'Check if DAM:A delivers to your building in Jersey City. We serve Downtown, Waterfront, Journal Square, and more.',
};

interface Building {
  name: string;
  address: string;
  zip_code?: string;
  zipCode?: string;
  neighborhood: string;
}

async function getBuildings(): Promise<{ buildings: Building[]; neighborhoods: string[] }> {
  try {
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from('eligible_buildings')
      .select('name, address, zip_code, neighborhood')
      .eq('active', true)
      .order('neighborhood', { ascending: true })
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) throw new Error('No data');

    const neighborhoods = [...new Set(data.map((b: Building) => b.neighborhood))];
    return { buildings: data as Building[], neighborhoods };
  } catch {
    // Fallback to static data
    return {
      buildings: staticBuildings.map(b => ({ ...b, zip_code: b.zipCode })),
      neighborhoods: staticNeighborhoods,
    };
  }
}

export default async function DeliveryAreasPage() {
  const { buildings, neighborhoods } = await getBuildings();

  return (
    <div className="bg-dama-cream">
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Jersey City, NJ</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Delivery Areas
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            We currently deliver to select residential buildings in Jersey City.
            Check your address below.
          </p>
          <div className="mx-auto mt-8 max-w-lg">
            <AddressChecker />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mx-auto max-w-5xl px-4 pb-12 md:px-6">
        <div className="aspect-[2/1] w-full overflow-hidden rounded-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48372.34752724024!2d-74.0831!3d40.7282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250d225bfafdd%3A0x249f013a2cd25d9!2sJersey%20City%2C%20NJ!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="DAM:A delivery areas in Jersey City, NJ"
          />
        </div>
      </div>

      {/* Building list by neighborhood */}
      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        <h2 className="mb-8 font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl">
          Eligible Buildings
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {neighborhoods.map((neighborhood) => (
            <div key={neighborhood}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-green-600">
                {neighborhood}
              </h3>
              <ul className="space-y-2">
                {buildings
                  .filter(b => b.neighborhood === neighborhood)
                  .map(building => (
                    <li key={building.name} className="text-sm text-dama-charcoal/70">
                      <span className="font-medium text-dama-charcoal">{building.name}</span>
                      <br />
                      <span className="text-xs">{building.address}, {building.zip_code || building.zipCode}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-dama-charcoal/50">
          Don&apos;t see your building? We&apos;re expanding! Email us at hello@damajc.com to request your building.
        </p>
      </div>
    </div>
  );
}
