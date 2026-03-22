export type FAQCategory = 'Ordering' | 'Delivery' | 'Subscriptions' | 'Food & Quality' | 'Other';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}
