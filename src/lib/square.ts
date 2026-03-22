import { SquareClient, SquareEnvironment } from 'square';

let client: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (!client) {
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      throw new Error('SQUARE_ACCESS_TOKEN is not set');
    }

    const isSandbox = process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'sandbox';

    client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
      environment: isSandbox
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production,
    });
  }

  return client;
}

export function getLocationId(): string {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) {
    throw new Error('SQUARE_LOCATION_ID is not set');
  }
  return locationId;
}

// ── Lead sync: find-or-create Square customer ──

interface LeadData {
  email: string;
  name?: string;
  phone?: string;
  note?: string;
}

export async function syncLeadToSquare(data: LeadData): Promise<string | null> {
  try {
    if (!process.env.SQUARE_ACCESS_TOKEN) return null;

    const sq = getSquareClient();
    const email = data.email.toLowerCase().trim();

    // Search for existing customer
    const search = await sq.customers.search({
      query: { filter: { emailAddress: { exact: email } } },
    });

    if (search.customers && search.customers.length > 0) {
      // Update with any new info (phone, note)
      const existing = search.customers[0];
      if (data.phone && !existing.phoneNumber) {
        await sq.customers.update({
          customerId: existing.id!,
          phoneNumber: data.phone,
        }).catch(() => {});
      }
      return existing.id!;
    }

    // Create new customer
    const res = await sq.customers.create({
      emailAddress: email,
      givenName: data.name || undefined,
      phoneNumber: data.phone || undefined,
      note: data.note || undefined,
      idempotencyKey: `lead-${email}`,
    });

    return res.customer?.id || null;
  } catch (err) {
    console.error('[square] Lead sync error:', err instanceof Error ? err.message : err);
    return null;
  }
}
