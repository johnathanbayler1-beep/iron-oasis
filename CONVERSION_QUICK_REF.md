# Iron Oasis V3 — Conversion Quick Reference

**TL;DR:** Single CTA in Scene7 needs forms + email + analytics to convert leads. No code changes needed yet—just architecture.

---

## Current State

```
Scene7 CTA: "Request Private Access"
href: "#" (placeholder, doesn't navigate)
Forms: ✗ None
Email: ✗ None
Analytics: ✗ None
Database: ✗ None
Risk: CTA goes nowhere, no lead capture
```

---

## What Needs to Happen

```
1. Forms (3-4 days)
   ├── Backend: /api/forms/submit route
   ├── Frontend: /app/apply form page
   ├── Frontend: /app/confirmation success page
   └── Database: Users table to store leads

2. Email (1-2 days)
   ├── Email service: Resend (or SendGrid)
   ├── Applicant confirmation email
   └── Operator notification email

3. Analytics (1 day)
   ├── GA4 property + gtag script
   ├── Event tracking: cta_click, form_submit
   └── Funnel dashboard

4. Integration (1 day)
   ├── Scene7 CTA: href "#" → "/apply"
   ├── Add onClick tracking
   └── Test end-to-end
```

---

## Three Files to Review

| File | Purpose | Length |
|------|---------|--------|
| CONVERSION_ARCHITECTURE.md | Detailed spec (forms, API, email, analytics, DB schema, phases) | 350 lines |
| LAUNCH_CHECKLIST.md | Step-by-step task list + testing checklist + go-live criteria | 280 lines |
| CONVERSION_SUMMARY.md | This audit summary + decisions + timeline + risks | 350 lines |

---

## Implementation Phases

### Phase 1: MVP (Critical, 4 Days)
- [ ] Forms: /app/apply (name, email, phone, experience)
- [ ] API: /api/forms/submit (validate, store, send email)
- [ ] Email: Resend configured, templates created
- [ ] Database: Users table (PostgreSQL or Supabase)
- [ ] Scene7 CTA: href updated to /apply
- **Outcome:** Leads captured, emails delivered, ops notified

### Phase 2: Analytics (High, 1 Day)
- [ ] GA4: Property created, gtag initialized
- [ ] Events: Track CTA clicks, form submits, errors
- [ ] Dashboard: Conversion funnel visible
- **Outcome:** Full visibility into conversion rates

### Phase 3: Operator Dashboard (Medium, 1 Week)
- [ ] Admin UI to review applications
- [ ] Email notifications to ops team
- [ ] Application status workflow (pending → approved → rejected)
- **Outcome:** Ops can manage leads in-app

---

## Forms Spec (Simplified)

### /app/apply (Membership Application)

**Fields:**
```
Name (text, required)
Email (email, required, unique)
Phone (tel, required)
Experience Level (radio: Beginner/Intermediate/Advanced)
Training Focus (checkbox: Strength/Cardio/Flexibility/Sport)
Commitment (radio: 3x/week / 4x/week / 5x+/week)
Preferred Times (checkbox: Early morning/Midday/Evening)
Why Iron Oasis? (textarea, optional)

[Submit Button] → POST /api/forms/submit
```

**On Success:**
- Redirect to /confirmation
- Send email to applicant
- Send email to ops team
- GA4 event: form_submit_success

---

## Email Templates (Minimal)

### Applicant Confirmation
```
Subject: Your Iron Oasis Application

Hi [Name],

Thank you for applying! We typically respond within 48 hours.

Questions? Reply to this email.

The Iron Oasis Team
```

### Operator Notification
```
Subject: New Application: [Name]

Name: [Name]
Email: [Email]
Phone: [Phone]
Experience: [Level]
Focus: [Focus]

→ Review in dashboard [link coming Phase 3]
→ Reply to [Email]
```

---

## Analytics Events (Minimal)

```
cta_view      → Scene7 CTA visible (opacity > 0.5)
cta_click     → User clicks "Request Private Access"
form_submit   → User submits form successfully
form_error    → Validation error on form
confirmation  → Success page loads
```

---

## Scene7 CTA Changes

**Current:**
```jsx
<a href="#" className="...">Request Private Access</a>
```

**After Phase 1:**
```jsx
<a
  href="/apply"
  onClick={() => trackCTAClick()}
  className="..."
>
  Request Private Access
</a>
```

That's it. Animation/timing untouched.

---

## Files Created (New Only)

```
✗ /app/apply/page.tsx                    # Form page
✗ /app/confirmation/page.tsx             # Success page
✗ /app/api/forms/submit/route.ts         # Backend API
✗ /components/v3/forms/MembershipForm.tsx # Form component
✗ /lib/analytics/track.ts                # GA4 utilities
✗ /lib/db/schema.ts                      # DB schema
```

Files Modified (2):
```
✓ components/v3/scenes/Scene7FinalAccess.tsx  # CTA href + tracking
✓ app/layout.tsx                              # GA4 gtag script
```

---

## Decisions Made

### Why one form only?
Simplest MVP. Single path reduces complexity and friction. Waitlist form can be Phase 2.

### Why no modal form?
Modal interrupts experience. Full page form lets users take time, revisit hero, etc.

### Why custom form vs. Typeform?
Brand consistency, analytics integration, operator workflow, data control.

### Why phone required?
Operators need to qualify applicants by phone conversation. Email alone isn't enough.

### Why no header CTA?
Cinematic restraint (Apple-style). Breaking immersion with persistent nav undermines the whole film concept.

---

## Success Looks Like

**Week 1:**
- [ ] First lead received
- [ ] Confirmation email in applicant inbox
- [ ] Operator notification in ops inbox
- [ ] GA4 shows conversion funnel

**Week 2:**
- [ ] 10-20 applications submitted
- [ ] 5-10% conversion rate
- [ ] 48-hour response SLA maintained
- [ ] No errors in logs

**Month 1:**
- [ ] 30-50 qualified leads
- [ ] Conversion funnel baseline established
- [ ] Operator workflow efficient
- [ ] Ready for Phase 3 (dashboard)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| No forms → no leads | 🔴 Critical | Build forms Phase 1 |
| No email → applicant confusion | 🔴 Critical | Add Resend Phase 1 |
| No analytics → invisible | 🟡 High | Add GA4 Phase 2 |
| No operator dashboard → manual emails | 🟡 Medium | Accept Phase 1, build Phase 3 |
| Phone invalid format → bad data | 🟡 Medium | Validate regex Phase 1 |
| Email too long → abandonment | 🟢 Low | Test form UX, iterate |

---

## Environment Setup

```bash
# Install dependencies
npm install resend react-hook-form zod

# Add .env.local
NEXT_PUBLIC_GA_ID=G-XXXXX
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...

# Run TypeScript check
npx tsc --noEmit

# Build
npm run build
```

---

## Deployment Order

1. Database: Create Users table, test connection
2. Email: Configure Resend, send test email
3. API: Deploy /api/forms/submit, test validation
4. Forms: Deploy /app/apply and /confirmation
5. Analytics: Add GA4 gtag to layout
6. Scene7: Update CTA href to /apply
7. Test: Mobile, desktop, end-to-end
8. Monitor: Daily for first week

---

## Go/No-Go Criteria

**All must be YES before launch:**
- [ ] Database connected and tested
- [ ] Email sends to real inbox (not spam)
- [ ] API validates and stores data
- [ ] Form works on mobile
- [ ] Scene7 CTA navigates to /apply
- [ ] GA4 events fire in real-time
- [ ] Build passes (npm run build)
- [ ] TypeScript passes (npx tsc --noEmit)
- [ ] Ops team trained

---

## Contact & Ownership

**Phase 1 (Forms/Email):** Engineering (4 days)  
**Phase 2 (Analytics):** Growth (1 day)  
**Phase 3 (Operator Dashboard):** Product + Engineering (1 week)  

Questions? See:
- CONVERSION_ARCHITECTURE.md (detailed spec)
- LAUNCH_CHECKLIST.md (step-by-step)
- CONVERSION_SUMMARY.md (decisions + timeline)

---

**Status:** Ready for Phase 1 implementation  
**Timeline:** 4 days to MVP, launch-ready  
**Owner:** Product lead  
**Last Updated:** 2026-08-06
