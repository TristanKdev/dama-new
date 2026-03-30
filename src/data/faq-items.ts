import type { FAQItem } from '@/types/faq';

export const faqItems: FAQItem[] = [
  // Ordering
  {
    id: 'faq-1',
    question: 'How do I place an order?',
    answer: 'Browse our weekly menu, add items to your cart, select your preferred delivery date (Tuesday, Thursday, or Saturday), and check out. You\'ll receive a confirmation email with your order details.',
    category: 'Ordering',
  },
  {
    id: 'faq-2',
    question: 'What is the order cutoff time?',
    answer: 'Orders must be placed by 10:00 PM the night before your selected delivery date. For example, for a Tuesday delivery, your order must be placed by Monday at 10:00 PM.',
    category: 'Ordering',
  },
  {
    id: 'faq-3',
    question: 'Is there a minimum order amount?',
    answer: 'There is no minimum order amount for pickup. For building delivery, we have a $15 minimum order to ensure efficient delivery routes.',
    category: 'Ordering',
  },
  {
    id: 'faq-4',
    question: 'Can I modify or cancel my order?',
    answer: 'You can modify or cancel your order up until the cutoff time (10:00 PM the night before delivery). After that, orders are final as we begin preparation early in the morning.',
    category: 'Ordering',
  },
  // Delivery
  {
    id: 'faq-5',
    question: 'Where do you deliver?',
    answer: 'We currently deliver to select residential buildings in Jersey City, NJ — primarily in the Downtown, Waterfront, and Journal Square areas. Use our address checker to see if your building is eligible.',
    category: 'Delivery',
  },
  {
    id: 'faq-6',
    question: 'What are the delivery days and times?',
    answer: 'We deliver on Tuesdays, Thursdays, and Saturdays by 12:00 PM. You\'ll receive a notification when your order is on its way.',
    category: 'Delivery',
  },
  {
    id: 'faq-7',
    question: 'How much does delivery cost?',
    answer: 'Building delivery is free for orders over $30. For orders under $30, there is a $3 delivery fee. Pickup is always free.',
    category: 'Delivery',
  },
  {
    id: 'faq-8',
    question: 'What if I\'m not home during delivery?',
    answer: 'For building deliveries, we leave orders with your building\'s concierge or in a designated secure area. All items are packed in insulated containers to maintain freshness for up to 4 hours.',
    category: 'Delivery',
  },
  {
    id: 'faq-9',
    question: 'Can I pick up my order instead?',
    answer: 'Yes! You can pick up your order from our kitchen at 16 Bright Street Unit H, Jersey City, NJ 07302. Pickup is available on delivery days (Tuesday, Thursday, Saturday).',
    category: 'Delivery',
  },
  // Subscriptions
  {
    id: 'faq-10',
    question: 'How does the subscription work?',
    answer: 'Choose your plan, select your delivery day, and we\'ll send you a curated selection of banchan every week (or every other week). You can customize dietary preferences and pause or cancel anytime.',
    category: 'Subscriptions',
  },
  {
    id: 'faq-11',
    question: 'Can I pause or cancel my subscription?',
    answer: 'Absolutely. You can pause your subscription for up to 4 weeks or cancel at any time from your account page. No cancellation fees, ever.',
    category: 'Subscriptions',
  },
  {
    id: 'faq-12',
    question: 'Do I get to choose what\'s in my subscription box?',
    answer: 'Subscription boxes are curated by our chef based on seasonal availability and your dietary preferences. We rotate items weekly so you always get variety.',
    category: 'Subscriptions',
  },
  // Food & Quality
  {
    id: 'faq-13',
    question: 'How long does the food stay fresh?',
    answer: 'Most banchan stay fresh for 3\u20135 days when refrigerated and sealed. However, some items have shorter windows \u2014 always check the individual item card for specific freshness notes. Key exceptions: Japchae (glass noodles) should be eaten the same day as delivery; Kimbap is best enjoyed same day and does not refrigerate well after slicing; Tteok (rice cakes) are best within 24 hours of delivery. Kimchi continues to ferment and deepen in flavor over 3\u20137 days in the refrigerator \u2014 it only gets better.',
    category: 'Food & Quality',
  },
  {
    id: 'faq-14',
    question: 'Are your containers eco-friendly?',
    answer: 'Yes! We use reusable glass containers with a deposit system. Return your clean containers on your next delivery and we\'ll credit your account. Zero waste is a core part of our mission.',
    category: 'Food & Quality',
  },
  {
    id: 'faq-15',
    question: 'Do you accommodate allergies?',
    answer: 'We clearly label all dietary tags (vegan, gluten-friendly, contains nuts, etc.) on every item. While we take precautions, our kitchen handles common allergens. Please contact us for severe allergy concerns.',
    category: 'Food & Quality',
  },
  {
    id: 'faq-16',
    question: 'Where do you source your ingredients?',
    answer: 'We source locally whenever possible, working with New Jersey farms for seasonal produce. Specialty Korean ingredients are sourced from trusted suppliers to ensure authenticity.',
    category: 'Food & Quality',
  },
  // Other
  {
    id: 'faq-17',
    question: 'Do you cater events?',
    answer: 'We offer catering for events of 10 or more people. Contact us at hello@damajc.com with your event details, and we\'ll create a custom banchan spread for your gathering.',
    category: 'Other',
  },
  {
    id: 'faq-18',
    question: 'How can I contact you?',
    answer: 'Email us at hello@damajc.com, call us at (201) 923-0773, or use the contact form on our website. We typically respond within 24 hours.',
    category: 'Other',
  },
  {
    id: 'faq-19',
    question: 'Do you offer gift options?',
    answer: 'Yes! You can purchase a DAM:A gift card for any amount, or we can put together a special banchan gift box. Contact us for custom gift orders.',
    category: 'Other',
  },
];

export const faqCategories = [...new Set(faqItems.map(item => item.category))] as const;
