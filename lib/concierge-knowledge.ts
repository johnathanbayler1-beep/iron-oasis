// Single source of truth for Iron Oasis conversational and written copy:
// Agent Storm (chatbot), the FAQ section, objection handling, and any
// future AI sales surface. Do not fork this content — import from here.
//
// Source: Iron Oasis master business model (private, reservation-based
// access — not a gym, not a traditional membership). Pricing is deliberately
// omitted: current site tiers (OASIS LITE/PLUS/MAX, ScrollExperience.tsx)
// use different tier names and $-amounts than this model's Light/Peak/Max
// framing, and this file must never invent or repeat figures that may be
// stale. Booking and pricing live only in the Iron Oasis app.

export type CtaId = 'reserve' | 'check-availability' | 'app';

export type KnowledgeEntry = {
  id: string;
  question: string;
  /** Approved answer direction — the substance an answer must contain, not a locked script. */
  answer: string;
  cta: CtaId;
  /** Only entries flagged high-converting surface in the public FAQ UI. */
  highConverting: boolean;
};

export type KnowledgeCategory = {
  id:
    | 'experience'
    | 'access'
    | 'subscription'
    | 'location'
    | 'first-experience'
    | 'objections'
    | 'conversion';
  label: string;
  entries: KnowledgeEntry[];
};

export const CTA_COPY: Record<CtaId, string> = {
  reserve: 'Reserve Your Time',
  'check-availability': 'Check Availability',
  app: 'Request Access in the App',
};

export const BANNED_TERMS = [
  'gym',
  'workout',
  'fitness',
  'trainer',
  'training',
  'membership',
  'bodybuilding',
  'reps',
  'sets',
  'gains',
  'athletes',
] as const;

export const APPROVED_TERMS = [
  'subscription',
  'access key',
  'private environment',
  'reserved time',
  'private experience',
] as const;

export const KNOWLEDGE_BASE: KnowledgeCategory[] = [
  {
    id: 'experience',
    label: 'The Experience',
    entries: [
      {
        id: 'exp-different',
        question: 'What makes Iron Oasis different?',
        answer:
          'Iron Oasis is a private environment, not a shared facility. You reserve your time, and the space is yours alone for that reservation — no waiting, no crowds, no adapting to someone else\'s schedule.',
        cta: 'reserve',
        highConverting: true,
      },
      {
        id: 'exp-private',
        question: 'Why is it private?',
        answer:
          'Privacy is the product. The reservation model means one person occupies the private environment at a time, so every visit is calm, predictable, and free of distractions.',
        cta: 'check-availability',
        highConverting: true,
      },
      {
        id: 'exp-who',
        question: 'Who is this designed for?',
        answer:
          'For people who value privacy, convenience, and control over their schedule more than they value a shared, unpredictable environment.',
        cta: 'reserve',
        highConverting: false,
      },
    ],
  },
  {
    id: 'access',
    label: 'Access',
    entries: [
      {
        id: 'access-reservations',
        question: 'How do reservations work?',
        answer:
          'You reserve your time in advance through the Iron Oasis app. Once booked, that time and the private environment are held for you — no one else is scheduled alongside you.',
        cta: 'app',
        highConverting: true,
      },
      {
        id: 'access-entry',
        question: 'How does entry work?',
        answer:
          'Entry details are provided in the app once your reservation is confirmed, so you know exactly what to expect before you arrive.',
        cta: 'app',
        highConverting: false,
      },
      {
        id: 'access-arrive',
        question: 'What happens when I arrive?',
        answer:
          'The private environment is already reserved and ready for you — you are not sharing it, waiting for it, or working around anyone else\'s time in it.',
        cta: 'reserve',
        highConverting: true,
      },
      {
        id: 'access-247',
        question: 'Is it open 24/7?',
        answer:
          'The environment is available throughout the day. Your access key determines how often you can reserve, which hours you can book, and your booking priority — never treat this as unlimited, always-open access.',
        cta: 'check-availability',
        highConverting: true,
      },
    ],
  },
  {
    id: 'subscription',
    label: 'Subscription',
    entries: [
      {
        id: 'sub-access-keys',
        question: 'What are the access keys?',
        answer:
          'Iron Oasis uses a subscription-based access key rather than a traditional membership. Access keys differ in how many days per week you can reserve, which hours (off-peak vs. peak) are included, your booking priority, and how far in advance you can book — details and current pricing are in the app.',
        cta: 'app',
        highConverting: true,
      },
      {
        id: 'sub-included',
        question: 'What is included?',
        answer:
          'Every access key includes reserved private time in the environment. Higher tiers add more days per week, peak-hour access, priority booking, and a longer advance-booking window.',
        cta: 'app',
        highConverting: false,
      },
      {
        id: 'sub-fees',
        question: 'Are there signup, cancellation, or hidden fees?',
        answer:
          'No signup fees, no cancellation fees, no hidden fees. The subscription is straightforward and transparent.',
        cta: 'reserve',
        highConverting: true,
      },
    ],
  },
  {
    id: 'location',
    label: 'Location',
    entries: [
      {
        id: 'loc-where',
        question: 'Where is it located?',
        answer:
          'Iron Oasis is set on a quiet residential property in Windsor — intentionally away from commercial traffic and crowds, for a calmer, more private experience.',
        cta: 'check-availability',
        highConverting: false,
      },
      {
        id: 'loc-entrance',
        question: 'How do I find the entrance?',
        answer:
          'Arrival details and directions are provided in the app ahead of your reserved time, so getting there is simple.',
        cta: 'app',
        highConverting: false,
      },
      {
        id: 'loc-parking',
        question: 'Where do I park?',
        answer:
          'Parking information is included with your reservation confirmation in the app.',
        cta: 'app',
        highConverting: false,
      },
    ],
  },
  {
    id: 'first-experience',
    label: 'First Experience',
    entries: [
      {
        id: 'first-expect',
        question: 'What should I expect?',
        answer:
          'A private environment reserved entirely for you, ready when you arrive — no crowd, no waiting, no sharing.',
        cta: 'reserve',
        highConverting: true,
      },
      {
        id: 'first-reserve',
        question: 'How do I reserve my first time?',
        answer:
          'Choose an access key, then reserve your time directly in the Iron Oasis app.',
        cta: 'app',
        highConverting: true,
      },
    ],
  },
  {
    id: 'objections',
    label: 'Objections',
    entries: [
      {
        id: 'obj-normal-place',
        question: 'Why not just use a normal place?',
        answer:
          'Shared environments work for some people. Iron Oasis is built for people who want privacy, convenience, and a reserved environment without distractions instead.',
        cta: 'reserve',
        highConverting: true,
      },
      {
        id: 'obj-subscription',
        question: 'Why is it subscription based?',
        answer:
          'The subscription keeps the reservation system private and predictable. Your access key determines your flexibility and booking priority.',
        cta: 'app',
        highConverting: false,
      },
      {
        id: 'obj-expensive',
        question: 'Is it expensive?',
        answer:
          'Never lead with a discount. The value is the experience itself — your time, your privacy, and a predictable environment reserved around your schedule.',
        cta: 'check-availability',
        highConverting: true,
      },
      {
        id: 'obj-walk-in',
        question: 'Can I just show up?',
        answer:
          'The private experience is built around reservations, so you reserve your time and the environment is ready the moment you arrive.',
        cta: 'reserve',
        highConverting: true,
      },
    ],
  },
  {
    id: 'conversion',
    label: 'Conversion',
    entries: [
      {
        id: 'conv-qualify-priority',
        question: 'What matters most to you — privacy, convenience, flexibility, or avoiding crowded environments?',
        answer:
          'Use this to route the visitor toward the access key and messaging that matches what they actually value, rather than pitching every tier at once.',
        cta: 'check-availability',
        highConverting: false,
      },
      {
        id: 'conv-qualify-frequency',
        question: 'How often would you like to reserve your private space?',
        answer:
          'Use the answer to recommend an access key tier by reservation frequency rather than by price.',
        cta: 'app',
        highConverting: false,
      },
      {
        id: 'conv-qualify-priority-booking',
        question: 'Is having priority booking important for your schedule?',
        answer:
          'A yes points toward the highest-tier access key (longer advance-booking window, priority scheduling); a no keeps the conversation open to lighter tiers.',
        cta: 'app',
        highConverting: false,
      },
    ],
  },
];

export function findEntry(id: string): KnowledgeEntry | undefined {
  for (const category of KNOWLEDGE_BASE) {
    const entry = category.entries.find((e) => e.id === id);
    if (entry) return entry;
  }
  return undefined;
}

export function highConvertingEntries(): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.flatMap((c) => c.entries.filter((e) => e.highConverting));
}

/** Flattened question/answer/CTA text for injection into an LLM system prompt. */
export function knowledgeBaseAsPromptBlock(): string {
  return KNOWLEDGE_BASE.map((category) => {
    const lines = category.entries.map(
      (e) => `- Q: ${e.question}\n  A: ${e.answer}\n  CTA: ${CTA_COPY[e.cta]}`
    );
    return `## ${category.label}\n${lines.join('\n')}`;
  }).join('\n\n');
}
