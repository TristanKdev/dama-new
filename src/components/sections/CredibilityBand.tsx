import { HandLeaf } from '@/components/icons/HandLeaf';
import { BuildingArrow } from '@/components/icons/BuildingArrow';
import { JarZero } from '@/components/icons/JarZero';
import { CalendarCheck } from '@/components/icons/CalendarCheck';

const proofPoints = [
  {
    icon: HandLeaf,
    title: 'Balanced Nutrition',
    description: 'Seasonal ingredients, wholesome Korean recipes',
  },
  {
    icon: BuildingArrow,
    title: 'Delivered Fresh',
    description: 'Straight to your building in Jersey City',
  },
  {
    icon: JarZero,
    title: 'Sustainable Packaging',
    description: 'Reusable glass containers, zero waste',
  },
  {
    icon: CalendarCheck,
    title: 'Your Schedule',
    description: 'Order weekly, subscribe, or customize',
  },
];

export function CredibilityBand() {
  return (
    <section className="bg-dama-ivory py-12" aria-label="Why choose DAM:A">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {proofPoints.map((point) => (
            <div key={point.title} className="flex flex-col items-center text-center">
              <point.icon size={32} className="mb-3 text-dama-green-600" />
              <h3 className="text-sm font-semibold text-dama-charcoal">{point.title}</h3>
              <p className="mt-1 text-xs text-dama-charcoal/60">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
