/**
 * Structured data (JSON-LD) generators for SEO
 */

export interface StructuredDataProps {
  [key: string]: any;
}

/**
 * Organization schema for Iron Oasis
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Iron Oasis',
    url: 'https://ironnedoasis.com',
    logo: 'https://ironnedoasis.com/logo.png',
    description: 'Premium fitness experience with 3D visualization and personalized training',
    sameAs: [
      'https://instagram.com/ironoasis',
      'https://twitter.com/ironoasis',
      'https://facebook.com/ironoasis',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'contact@ironnedoasis.com',
    },
  };
}

/**
 * Local Business schema with location data
 */
export function localBusinessSchema(locationData: {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  latitude: number;
  longitude: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: locationData.name,
    image: 'https://ironnedoasis.com/gym-image.jpg',
    description: 'Premium fitness and training facility',
    telephone: locationData.phone,
    url: 'https://ironnedoasis.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: locationData.address,
      addressLocality: locationData.city,
      addressRegion: locationData.state,
      postalCode: locationData.postalCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    },
    priceRange: '$$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '06:00',
        closes: '22:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '08:00',
        closes: '20:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
  };
}

/**
 * Service schema for fitness services
 */
export function serviceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: 'Iron Oasis Fitness Experience',
    description: 'Premium fitness training with immersive 3D visualization technology',
    offers: {
      '@type': 'Offer',
      price: '99',
      priceCurrency: 'USD',
      name: 'Monthly Membership',
      description: 'Unlimited access to facilities and personalized training',
      url: 'https://ironnedoasis.com/apply',
    },
    areaServed: 'US',
  };
}

/**
 * Breadcrumb schema for navigation
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Event schema for fitness classes/sessions
 */
export function eventSchema(event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    eventStatus: 'EventScheduled',
    location: {
      '@type': 'Place',
      name: event.location,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Iron Oasis',
      url: 'https://ironnedoasis.com',
    },
  };
}

/**
 * FAQPage schema
 */
export function faqSchema(
  faqs: Array<{
    question: string;
    answer: string;
  }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Render structured data JSON string for script tag
 * Usage: Add to layout's head element:
 * <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderStructuredData(organizationSchema()) }} />
 */
export function renderStructuredData(data: StructuredDataProps): string {
  return JSON.stringify(data);
}
