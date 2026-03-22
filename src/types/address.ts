export interface Address {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface AddressCheckResult {
  eligible: boolean;
  method: 'building-delivery' | 'pickup' | null;
  message: string;
  buildingName?: string;
}
