# Iron Oasis V3 — Launch Readiness Checklist

Quick reference for conversion infrastructure needed before public launch.

---

## Current State vs. Launch Ready

| Component | Current | Launch Ready | Priority |
|-----------|---------|--------------|----------|
| Primary CTA | ✓ Scene7 "Request Private Access" | ✓ href="/apply" | Critical |
| Forms | ✗ None | ✓ Membership application | Critical |
| Email Capture | ✗ None | ✓ Database + transactional | Critical |
| Email Delivery | ✗ None | ✓ Resend/SendGrid/SES | Critical |
| API Backend | ✗ None | ✓ /api/forms/submit | Critical |
| Confirmation Flow | ✗ None | ✓ /confirmation page | Critical |
| Analytics | ✗ None | ✓ GA4 + event tracking | High |
| Operator Dashboard | ✗ None | ✗ Post-launch phase | Medium |
| Waitlist Form | ✗ None | ✗ Phase 2 (optional) | Low |

---

## Implementation Roadmap

### Week 1: Forms & Email (Critical Path)

```
Day 1: Setup
├── [ ] Create Resend account, get API key
├── [ ] Create PostgreSQL database (Supabase or Railway)
├── [ ] Add env vars: DATABASE_URL, RESEND_API_KEY, GA_ID
└── [ ] Create git branch: feature/conversion-infrastructure

Day 2: Backend API
├── [ ] Create lib/db/schema.ts (User interface)
├── [ ] Create app/api/forms/submit/route.ts
│   ├── Validate all fields (email, phone, etc.)
│   ├── Check for duplicate emails
│   ├── Insert into DB
│   ├── Send confirmation email (template)
│   ├── Send operator notification (template)
│   └── Return 200 + confirmation URL
├── [ ] Create email templates (Resend React Email)
│   ├── applicant-confirmation.tsx
│   └── operator-notification.tsx
└── [ ] Test with curl/Postman

Day 3: Frontend Forms
├── [ ] Create components/v3/forms/MembershipForm.tsx
│   ├── Form state (React hook)
│   ├── Field validation (email regex, phone)
│   ├── Submit handler (POST /api/forms/submit)
│   ├── Error/success states
│   └── Loading state + button disabled
├── [ ] Create app/apply/page.tsx
│   ├── MembershipForm
│   ├── Heading context
│   └── Error boundary
├── [ ] Create app/confirmation/page.tsx
│   ├── Success message
│   ├── Timeline (48-hour response)
│   └── Return home button
└── [ ] Test all forms on mobile + desktop

Day 4: Integration & Analytics
├── [ ] Update Scene7FinalAccess.tsx
│   ├── href="#" → href="/apply"
│   ├── Add onClick tracking
│   └── Import analytics utils
├── [ ] Create lib/analytics/track.ts
│   ├── trackCTAClick()
│   ├── trackCTAView()
│   ├── trackFormSubmit()
│   └── trackFormError()
├── [ ] Add GA4 gtag to app/layout.tsx
├── [ ] Test events in GA4 real-time
└── [ ] End-to-end test: click CTA → fill form → receive email

Week 1 Outcome: Forms live, leads captured, emails deliver, analytics tracking
```

---

### Week 2: Polish & Launch Prep

```
Day 1: QA & Testing
├── [ ] Test form validation (invalid email, missing fields)
├── [ ] Test email delivery (check spam, formatting)
├── [ ] Test mobile UX (slow network, small screen)
├── [ ] Test analytics (GA4 events firing correctly)
└── [ ] Performance audit (Lighthouse)

Day 2: Ops Onboarding
├── [ ] Create operator guide (how to access applications)
├── [ ] Set up email forwarding (manual for now)
├── [ ] Draft response templates (acceptance, rejection)
└── [ ] Brief team on day-1 process

Day 3-4: Launch Prep
├── [ ] Merge feature branch to main
├── [ ] Deploy to production
├── [ ] Smoke test on live domain
├── [ ] Set up monitoring/alerts
├── [ ] Monitor first applications + conversions
└── [ ] Be ready to roll back if issues
```

---

## Files Checklist

### New Files (8 total)

```
✗ app/apply/page.tsx                      # Membership form page
✗ app/waitlist/page.tsx                   # Lightweight waitlist (optional Phase 2)
✗ app/confirmation/page.tsx               # Success page post-submit
✗ app/api/forms/submit/route.ts          # Form submission API endpoint
✗ components/v3/forms/MembershipForm.tsx # Reusable form component
✗ components/v3/forms/WaitlistForm.tsx   # Optional lightweight form
✗ lib/analytics/track.ts                 # GA4 event tracking utilities
✗ lib/db/schema.ts                       # Database schema definitions

Optional (Post-launch):
✗ lib/email/templates/...                # Email template components
✗ app/operator/...                       # Operator dashboard
```

### Modified Files (2 total)

```
✓ components/v3/scenes/Scene7FinalAccess.tsx   # Update CTA href + analytics
✓ app/layout.tsx                               # Add GA4 gtag script
✓ .env.local                                   # Add environment variables
```

---

## Environment Variables Required

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXX

# Database
DATABASE_URL=postgresql://user:password@localhost/iron_oasis

# Email
RESEND_API_KEY=re_...

# Optional
NEXT_PUBLIC_API_URL=https://api.ironoasis.com
OPERATOR_EMAIL=ops@ironoasis.com
```

---

## Dependencies (May Require npm install)

```json
{
  "resend": "^4.0.0",           // Email sending
  "@react-email/react": "^0.0.x", // Email templates (optional)
  "react-hook-form": "^7.x",    // Form management (optional)
  "zod": "^3.x"                 // Schema validation (optional)
}
```

---

## Testing Checklist

### Form Submission
- [ ] Valid submission → email sent → confirmation page
- [ ] Duplicate email → error message shown → no email sent
- [ ] Missing required field → validation error, form not submitted
- [ ] Invalid email format → validation error
- [ ] Invalid phone format → validation error
- [ ] Form refresh after success → shows confirmation, not blank form

### Email Delivery
- [ ] Confirmation email arrives in inbox (not spam)
- [ ] Operator notification email arrives (formatted correctly)
- [ ] Email contains applicant data (name, email, phone, etc.)
- [ ] Email contains action link (if applicable)

### Analytics
- [ ] GA4 event triggered when Scene7 CTA visible
- [ ] GA4 event triggered when CTA clicked
- [ ] GA4 event triggered when form submitted
- [ ] GA4 event triggered on validation error
- [ ] Conversion funnel shows in GA4 dashboard

### Mobile
- [ ] Form inputs are touch-friendly (large tap targets)
- [ ] Form fits on small screens without horizontal scroll
- [ ] CTA button is tappable (not too close to edges)
- [ ] Email confirmation readable on mobile

### Performance
- [ ] Form page loads in < 2 seconds
- [ ] Form submit completes in < 1 second (or shows loader)
- [ ] No layout shift when confirmation message appears
- [ ] No console errors or warnings

---

## Go-Live Criteria

All of the following must be true before making conversion live:

- [ ] Database connected and tested (insert/read works)
- [ ] Email service sending successfully (real inbox, not spam)
- [ ] API endpoint returning 200 on valid submit
- [ ] Scene7 CTA href points to /apply (not "#")
- [ ] Form validation working (frontend + backend)
- [ ] Confirmation page shows after success
- [ ] GA4 events firing in real-time dashboard
- [ ] Mobile testing passed (form usable on small screen)
- [ ] Lighthouse score > 80 on apply page
- [ ] No TypeScript errors (npx tsc --noEmit)
- [ ] Build succeeds (npm run build)
- [ ] Operator team trained + ready to receive leads
- [ ] Fallback plan ready (if API fails, manual email capture?)

---

## Post-Launch Monitoring (First Week)

Track daily:
- [ ] Conversion rate (% who submit form)
- [ ] Form drop-off rate (% who start but don't complete)
- [ ] Email delivery rate (% emails received in inbox)
- [ ] Response time to apply (ops team SLA)
- [ ] User feedback / complaints

Adjust if needed:
- [ ] Form fields (too many? remove optional fields)
- [ ] CTA copy (not resonating? test alternatives)
- [ ] Email templates (too wordy? too short?)
- [ ] Confirmation message (clear enough?)

---

## Handoff Checklist

Before going live, document:

- [ ] Database credentials + access (shared with ops team)
- [ ] Email service API key (stored securely, shared with dev)
- [ ] GA4 property ID + dashboard link (shared with growth team)
- [ ] Form field definitions (what each field captures)
- [ ] Email template copies (subject lines, body text)
- [ ] Response SLA (how quickly ops should reply?)
- [ ] Lead routing (which team reviews applications?)
- [ ] Rejection criteria (when to say no?)

---

## Success Metrics (First 30 Days)

| Metric | Target | Notes |
|--------|--------|-------|
| Forms submitted | 10-50 | Depends on traffic |
| Submission rate | 5-10% | Of unique visitors |
| Form completion rate | 80%+ | Started form but didn't submit |
| Email delivery rate | 98%+ | Should arrive in inbox |
| Ops response time | < 48h | Average time to reply |
| Qualified leads | 70%+ | % that match ideal profile |

---

## Version History

- **v1.0** (2026-08-06): Initial architecture, forms + email phase
- **Future:** Phase 2 = waitlist, Phase 3 = operator dashboard

---

**Owner:** Product / Engineering  
**Last Updated:** 2026-08-06  
**Status:** Ready for implementation
