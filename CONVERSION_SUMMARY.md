# Iron Oasis V3 — Launch Conversion Architecture Summary

**Date:** 2026-08-06  
**Phase:** Conversion Architecture Audit (No Backend Implementation)  
**Status:** ✓ Architecture Designed, Ready for Implementation

---

## Executive Summary

Iron Oasis V3 is a cinematic scroll-driven product film (400vh, 8 scenes) that ends with a single interactive CTA: "Request Private Access" in Scene7. The experience currently has **no conversion infrastructure** — no forms, no analytics, no lead capture, no email delivery.

This audit designs the complete launch conversion system without modifying the animation, timing, or cinematic architecture.

---

## Findings

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Primary CTA | ✓ Live | Scene7, `href="#"` placeholder only |
| Secondary CTAs | ✗ None | No header, nav, or intermediate CTAs |
| Forms | ✗ Missing | No membership, waitlist, or contact forms |
| Email Capture | ✗ Missing | No database or email service connected |
| Email Delivery | ✗ Missing | No transactional email setup |
| Analytics | ✗ Missing | No GA4 or event tracking |
| Confirmation Flows | ✗ Missing | No post-submit user feedback |
| Operator Integration | ✗ Missing | Manual email forwarding only |

**Risk:** Without forms/email/analytics, the CTA is a dead-end. Visitors click "Request Private Access" but nothing happens (href="#" does not navigate).

---

## Recommended Launch Funnel

### Single Primary Path (MVP)

```
Visitor scrolls through Scenes 0-6
    ↓
Scene7: "Your private training space is ready."
    ↓
Scene7 CTA: "Request Private Access" (href="/apply")
    ↓
/apply Form [Membership Application]
    • Name (required)
    • Email (required, validated)
    • Phone (required)
    • Experience level, training focus, commitment
    ↓
POST /api/forms/submit
    • Validate fields (email regex, phone format)
    • Check for duplicate email
    • Insert into DB
    • Send confirmation email to applicant
    • Send operator notification
    ↓
/confirmation Page
    "Thank you. We'll review and reach out within 48 hours."
    ↓
Applicant receives email confirmation
Operator receives application notification
Database stores lead for CRM sync
GA4 tracks conversion event
```

### Optional Future Paths (Phase 2+)

- **Waitlist Form:** Lightweight email capture for "not ready to apply yet"
- **Calendly Booking:** Direct scheduling call with operator (skips form)
- **Contact Form:** General inquiry (less qualified than application)

**Decision:** MVP launches with single /apply form only. Simplest path, highest conversion rate.

---

## Architecture Decisions

### Why One CTA Only?

The experience is designed around cinematic restraint (Apple-style). Adding a persistent header CTA or intermediate CTAs breaks immersion. The single CTA at the end forces commitment to the narrative before offering conversion—aligns with brand philosophy.

### Why No Modal/Inline Form?

Modal forms interrupt the viewing experience and don't allow full context. Dedicated `/apply` page lets viewers return to hero image, read testimonials, or access FAQs while filling out form (Phase 2).

### Why Custom Form vs. Typeform/Google Forms?

**Custom form advantages:**
- Full styling control (matches brand)
- Direct backend integration (no external dependency)
- Complete analytics tracking
- Secure, first-party data
- Operator integration baked in

**Typeform disadvantages:**
- External dependency (SLA, cost, data control)
- Breaks visual consistency
- Harder to track analytics
- Can't integrate with operator workflow

### Why Phone Required?

Operators need to qualify applicants by phone. Email alone leaves a gap. Later phases can make phone optional if needed.

---

## Conversion Map

### Files Affected (7 New, 2 Modified)

#### NEW FILES

```
/app/apply/page.tsx                      # Form container page
/app/confirmation/page.tsx               # Success confirmation page
/app/api/forms/submit/route.ts           # Form submission API handler
/components/v3/forms/MembershipForm.tsx  # Reusable form component
/lib/analytics/track.ts                  # GA4 event tracking utilities
/lib/db/schema.ts                        # Database schema
/lib/email/...                           # Email templates (Resend)
```

#### MODIFIED FILES

```
components/v3/scenes/Scene7FinalAccess.tsx   # Update CTA href + add analytics
app/layout.tsx                               # Add GA4 gtag initialization
```

---

## Implementation Timeline

### Phase 1: Forms & Email (Critical, 3-4 Days)

**Must-have for launch:**
- [ ] Backend API: `/api/forms/submit` (validate, store, email)
- [ ] Frontend: `/app/apply` page with MembershipForm
- [ ] Frontend: `/app/confirmation` success page
- [ ] Email service: Resend or SendGrid configured
- [ ] Database: Users table created (Supabase or Railway)
- [ ] Scene7 CTA: href updated from "#" to "/apply"

**Outcome:** Forms live, leads captured, email confirmations delivered

---

### Phase 2: Analytics (High Priority, 1 Day)

**Must-have for launch:**
- [ ] GA4 property initialized
- [ ] gtag script added to layout.tsx
- [ ] Events tracked: cta_view, cta_click, form_submit, form_error
- [ ] Conversion funnel dashboard configured

**Outcome:** Full visibility into visitor journey, conversion rates measured

---

### Phase 3: Operator Experience (Post-Launch, 1 Week)

**Nice-to-have for launch, essential by week 2:**
- [ ] Operator dashboard to review applications
- [ ] Admin email notifications
- [ ] Application status tracking (pending → approved → rejected)
- [ ] Operator response templates

**Outcome:** Ops team can manage applications in-app instead of manual email

---

## Analytics Events to Track

| Event | Trigger | Purpose |
|-------|---------|---------|
| `cta_view` | Scene7 CTA becomes visible (opacity > 0.5) | Measure reach |
| `cta_click` | User clicks "Request Private Access" | Measure intent |
| `form_impression` | Form page loads | Measure funnel entry |
| `form_submit_success` | User submits valid form | Measure conversion |
| `form_submit_error` | Validation error on form | Identify friction |
| `confirmation_view` | Success page loads | Measure completion |

---

## Database Schema

### Users Table

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique, validated
  name: string;                  // Full name
  phone: string;                 // Phone number
  experience_level?: string;     // "beginner" | "intermediate" | "advanced"
  training_focus?: string[];     // ["Strength", "Cardio", ...]
  commitment_level?: string;     // "3x/week" | "4x/week" | "5x+/week"
  preferred_times?: string[];    // ["Early morning", "Evening", ...]
  form_type: string;             // "application" | "waitlist"
  status?: string;               // "pending" | "approved" | "rejected"
  created_at: Date;              // Submission timestamp
  updated_at: Date;              // Last update
}
```

---

## Email Templates

### Applicant Confirmation

**Subject:** Your Iron Oasis Membership Application  
**Body:**
```
Hi [Name],

Thank you for applying to Iron Oasis.

Your application has been received. Our team typically responds within 48 hours.

In the meantime, here's what to expect:
- Review your profile and training goals
- Verify your fit for our community
- Reach out with next steps (onboarding, tour, membership terms)

Questions? Reply to this email.

The Iron Oasis Team
```

### Operator Notification

**To:** ops@ironoasis.com  
**Subject:** New Membership Application: [Name]  
**Body:**
```
New application received:

Name: [Name]
Email: [Email]
Phone: [Phone]
Experience: [Level]
Training Focus: [Focus]
Commitment: [Level]

Action: Review and respond within 48 hours
Dashboard: [Link to operator dashboard - Phase 3]
Reply: Use dashboard or email [Name] at [Email]
```

---

## Success Metrics (First 30 Days)

| Metric | Target | How to Measure |
|--------|--------|-----------------|
| Scroll depth | 80% reach Scene7 | GA4 scroll depth event |
| CTA visibility | 70% see CTA (opacity > 0.5) | Scene7 `cta_view` event |
| CTA click rate | 5-10% of visitors | GA4 `cta_click` event |
| Form submission | 80% complete after start | GA4 `form_submit` event |
| Overall conversion | 0.4-0.8% | (80% × 70% × 8% × 80%) |
| Email delivery | 98%+ | Check spam rate, bounce rate |
| Operator response | < 48h | Manual tracking in Phase 1 |

---

## No Code Changes Required Yet

**Important:** This is an architecture audit only. No files have been modified. Animation, timing, and scene architecture remain untouched and working.

To proceed to implementation:
1. Review CONVERSION_ARCHITECTURE.md (detailed specification)
2. Review LAUNCH_CHECKLIST.md (step-by-step tasks)
3. Start Phase 1: Forms & Email (4-day sprint)
4. Validate with `npx tsc --noEmit` + `npm run build`

---

## Risk Assessment

### High Risk (Mitigate Before Launch)

- **No forms = no lead capture:** Must have /apply form live before public launch
- **No email = no confirmation:** Applicants won't know if submission worked
- **No analytics = no visibility:** Can't measure conversion or identify problems
- **No backend validation = bad data:** Phone/email formats may be invalid

**Mitigation:** All addressed in Phase 1 implementation plan

### Medium Risk

- **No operator dashboard:** Ops team manages emails manually (workable short-term)
- **No SMS capture:** Phone is optional, can't do fast SMS follow-up
- **No Zapier/CRM sync:** Leads aren't auto-synced to CRM (manual export needed)

**Mitigation:** Phase 3 can address, doesn't block launch

### Low Risk

- **No A/B testing:** CTA copy is good, can optimize later
- **No retargeting:** Can set up later for form abandoners
- **No social proof:** Can add later (testimonials, logos, etc.)

---

## Deployment Checklist

Before flipping switch to public (in order):

1. **Database Ready**
   - [ ] PostgreSQL or Supabase created
   - [ ] Users table migrated
   - [ ] Test connection works

2. **Email Ready**
   - [ ] Resend account created
   - [ ] API key configured in .env
   - [ ] Test email sent successfully
   - [ ] Email templates created

3. **API Ready**
   - [ ] /api/forms/submit route deployed
   - [ ] Validation working (invalid email rejected)
   - [ ] Database insert working (data persists)
   - [ ] Email send working (inbox received)
   - [ ] Error handling working (500 error shows friendly message)

4. **Forms Ready**
   - [ ] /app/apply page loads
   - [ ] Form fields render correctly
   - [ ] Validation shows errors (frontend)
   - [ ] Submit sends API request
   - [ ] Loading state shows during submit
   - [ ] Success redirects to /confirmation

5. **Analytics Ready**
   - [ ] GA4 property created
   - [ ] gtag script added to layout
   - [ ] Events firing in real-time dashboard
   - [ ] Conversion funnel visible

6. **Scene7 Ready**
   - [ ] CTA href is "/apply" (not "#")
   - [ ] onClick handler tracks event
   - [ ] CTA is clickable during beat (pointerEvents working)

7. **Testing Done**
   - [ ] npm run build succeeds
   - [ ] npx tsc --noEmit passes
   - [ ] Mobile testing passed
   - [ ] End-to-end test passed (click → form → email)
   - [ ] GA4 real-time shows events

8. **Team Ready**
   - [ ] Ops team trained on reviewing applications
   - [ ] Response SLA defined (e.g., 48 hours)
   - [ ] Email forwarding set up as backup
   - [ ] Monitor plan in place (daily checks first week)

---

## What's Next

### For Product/Growth

1. **Decide:** Single membership form (MVP) or also waitlist form?
2. **Decide:** Operator response workflow (in-app dashboard Phase 3, or manual Phase 1?)
3. **Decide:** Email provider (Resend recommended for Next.js, or SendGrid/AWS SES?)
4. **Decide:** Database (Supabase recommended for full integration, or PostgreSQL + Railway?)

### For Engineering

1. Start Phase 1 implementation (3-4 day sprint)
2. Follow LAUNCH_CHECKLIST.md step-by-step
3. Test thoroughly on mobile + desktop
4. Deploy to staging for QA
5. Monitor first 24h closely
6. Iterate on form fields if needed

### For Operators

1. Set up inbox/process to receive application notifications
2. Define response templates (acceptance, rejection, follow-up)
3. Brief team on decision criteria (who qualifies?)
4. Plan handoff (ops → memberships → onboarding)

---

## Files Delivered

1. **CONVERSION_ARCHITECTURE.md** (this file + detailed spec) — 350 lines
   - Complete funnel design
   - Form specs and required fields
   - API route specification
   - Analytics event definitions
   - Database schema
   - Email templates
   - Implementation roadmap (4 phases)

2. **LAUNCH_CHECKLIST.md** — 280 lines
   - Week-by-week implementation breakdown
   - Files checklist (new vs. modified)
   - Testing checklist (forms, email, analytics, mobile)
   - Go-live criteria (all must-haves)
   - Post-launch monitoring dashboard

3. **CONVERSION_SUMMARY.md** (this file) — 350 lines
   - Executive overview
   - Architecture decisions + rationale
   - Conversion funnel diagram
   - Timeline (phases 1-3)
   - Risk assessment
   - Deployment checklist
   - Next steps

---

## Validation

✓ **TypeScript:** No errors (npx tsc --noEmit)  
✓ **Build:** Success (npm run build, 6/6 static pages)  
✓ **No breaking changes:** Animation, timing, scenes untouched  

---

## Handoff

**To:** Product, Engineering, Growth, Operations  
**Docs:** See CONVERSION_ARCHITECTURE.md and LAUNCH_CHECKLIST.md in repo root  
**Status:** Ready for Phase 1 implementation  
**Owner:** Product lead  
**Timeline:** 4 days to MVP, launch-ready  

---

**Created:** 2026-08-06  
**Phase:** Architecture (no code yet)  
**Next Phase:** Forms & Email Implementation
