import { NextResponse } from 'next/server';
import { eligibleBuildings as staticBuildings } from '@/data/eligible-buildings';
import { createServiceRoleClient } from '@/lib/supabase';
import { sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { BUSINESS, SERVICE_AREA } from '@/lib/constants';

interface Building {
  name: string;
  address: string;
}

async function getBuildings(): Promise<Building[]> {
  try {
    const db = createServiceRoleClient();
    const { data, error } = await db
      .from('eligible_buildings')
      .select('name, address')
      .eq('active', true);

    if (error || !data || data.length === 0) {
      // Fallback to static data if DB is unavailable
      return staticBuildings;
    }
    return data;
  } catch {
    return staticBuildings;
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`address:${ip}`, RATE_LIMITS.addressCheck);
    if (!rl.success) {
      return NextResponse.json(
        { eligible: false, method: null, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { eligible: false, method: null, message: 'Please provide an address.' },
        { status: 400 }
      );
    }

    const normalizedAddress = sanitizeText(address, 500).toLowerCase().trim();

    if (!normalizedAddress) {
      return NextResponse.json(
        { eligible: false, method: null, message: 'Please provide a valid address.' },
        { status: 400 }
      );
    }

    // Check against eligible buildings (from DB with static fallback)
    const buildings = await getBuildings();
    const match = buildings.find((building) => {
      const buildingAddr = building.address.toLowerCase();
      const buildingName = building.name.toLowerCase();
      return (
        normalizedAddress.includes(buildingAddr) ||
        normalizedAddress.includes(buildingName) ||
        buildingAddr.includes(normalizedAddress) ||
        buildingName.includes(normalizedAddress)
      );
    });

    if (match) {
      return NextResponse.json({
        eligible: true,
        method: 'building-delivery',
        message: 'Great news! We deliver to your building.',
        buildingName: match.name,
      });
    }

    // Check if address is in the service area at all (using configurable constants)
    const cityName = SERVICE_AREA.city.toLowerCase();
    const isInArea = normalizedAddress.includes(cityName) ||
      SERVICE_AREA.cityAbbreviations.some(abbr => normalizedAddress.includes(abbr.toLowerCase())) ||
      SERVICE_AREA.zipCodes.some(zip => normalizedAddress.includes(zip));

    if (isInArea) {
      return NextResponse.json({
        eligible: true,
        method: 'pickup',
        message: `Your building isn't on our delivery route yet, but you can pick up from our kitchen at ${BUSINESS.pickupLocation.address}!`,
      });
    }

    return NextResponse.json({
      eligible: false,
      method: null,
      message: `We currently only serve ${SERVICE_AREA.city}, ${SERVICE_AREA.state}. We're expanding soon — stay tuned!`,
    });
  } catch (err: unknown) {
    console.error('[check-address] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { eligible: false, method: null, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
