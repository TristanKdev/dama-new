export interface EligibleBuilding {
  name: string;
  address: string;
  zipCode: string;
  neighborhood: string;
}

export const eligibleBuildings: EligibleBuilding[] = [
  { name: 'The Beacon', address: '85 River Drive South', zipCode: '07310', neighborhood: 'Waterfront' },
  { name: 'Ellipse', address: '25 River Drive South', zipCode: '07310', neighborhood: 'Waterfront' },
  { name: 'Crystal Point', address: '2 2nd Street', zipCode: '07302', neighborhood: 'Exchange Place' },
  { name: 'Portofino', address: '1 2nd Street', zipCode: '07302', neighborhood: 'Exchange Place' },
  { name: '70 Columbus', address: '70 Columbus Drive', zipCode: '07302', neighborhood: 'Downtown' },
  { name: 'Liberty Towers', address: '33 Hudson Street', zipCode: '07302', neighborhood: 'Paulus Hook' },
  { name: 'Paulus Hook Towers', address: '100 Montgomery Street', zipCode: '07302', neighborhood: 'Paulus Hook' },
  { name: 'The Morgan', address: '140 Morgan Street', zipCode: '07302', neighborhood: 'Downtown' },
  { name: 'Dixon Mills', address: '1 Mill Street', zipCode: '07302', neighborhood: 'Downtown' },
  { name: 'Journal Squared', address: '615 Pavonia Avenue', zipCode: '07306', neighborhood: 'Journal Square' },
  { name: 'Urby', address: '200 Greene Street', zipCode: '07311', neighborhood: 'Waterfront' },
  { name: 'Monaco', address: '475 Washington Boulevard', zipCode: '07310', neighborhood: 'Waterfront' },
  { name: 'The Vantage', address: '1 Vantage Court', zipCode: '07302', neighborhood: 'Hamilton Park' },
  { name: 'BLVD Collection', address: '18 Park Street', zipCode: '07306', neighborhood: 'Journal Square' },
  { name: '225 Grand', address: '225 Grand Street', zipCode: '07302', neighborhood: 'Downtown' },
  { name: 'Grove Pointe', address: '150 Bay Street', zipCode: '07302', neighborhood: 'Downtown' },
  { name: 'Hamilton House', address: '50 Hamilton Street', zipCode: '07302', neighborhood: 'Hamilton Park' },
  { name: 'The Heights Tower', address: '350 Central Avenue', zipCode: '07307', neighborhood: 'The Heights' },
];

export const deliveryNeighborhoods = [...new Set(eligibleBuildings.map(b => b.neighborhood))];
