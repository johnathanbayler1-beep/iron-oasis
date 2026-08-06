# Iron Oasis V3 — Launch Conversion Architecture

Complete audit of all CTA paths, form requirements, and lead capture infrastructure needed for launch.

---

## 1. Current CTA Audit

### Scene7FinalAccess — Primary CTA

**Component:** `components/v3/scenes/Scene7FinalAccess.tsx` (lines 180–185)

```jsx
<a
  href="#"
  className="inline-flex items-center justify-center rounded-full border border-[#C9A84C] px-10 py-4 font-display text-[14px] font-medium uppercase tracking-[0.3em] text-[#C9A84C] transition-colors duration-300 hover:bg-[#C9A84C] hover:text-black"
>
  Request Private Access
</a>
```

**Current State:**
- Placeholder href="#"
- Only interactive element in the entire scroll experience
- Displayed during Beat 3 (last ~11% of scroll)
- Opacity controlled by `beatOpacity()` curve (slower 0.4 resolve-in, no fade-out)
- `pointerEvents` enabled only when beat opacity > 0.5 (prevents accidental clicks)
- Positioned over gym backdrop at full brightness (scrim fades as CTA resolves)

**Copy & Positioning:**
- Headline: "Request Private Access"
- Subheading: "Membership by application." (gray text, line 189)
- Context: "Your private training space is ready." (Beat 1, lines 134–138)
- Store badges placeholder: "Available on iOS and Android." (Beat 2, lines 145–162)

**No Secondary/Header CTAs:** The entire experience has zero header navigation, persistent buttons, or alternative CTAs.

---

## 2. Recommended Launch Conversion Funnel

### Flow A: Membership Application (Primary Path)

**Ideal for:** Visitors ready to apply for membership on first exposure

```
Scene7 CTA "Request Private Access"
    ↓
/apply form (modal or new tab)
    ↓
Email capture (name, email, phone)
    ↓
Gym experience questions (space fit, training style, commitment)
    ↓
Application submitted confirmation
    ↓
Backend: Trigger email to ops team + auto-responder to applicant
```

**Implementation Point:** Scene7 CTA href → `/apply`

---

### Flow B: Waitlist (Secondary Path)

**Ideal for:** Visitors still evaluating, not ready to apply

```
Scene7 CTA alternate text "Join Waitlist"
    ↓
/waitlist form (lightweight email capture)
    ↓
Email captured, opt-in to updates
    ↓
Confirmation: "We'll reach out when your match is ready."
    ↓
Backend: Segment email into waitlist, trigger drip sequence
```

**Note:** Can coexist with Flow A via a radio/toggle choice on the form, or as a separate button.

---

### Flow C: Booking Call (Tertiary Path)

**Ideal for:** Operators who want immediate qualification

```
Scene7 CTA → Calendly embed or booking link
    ↓
Schedule 15-min intro call with operator
    ↓
Operator qualifies fit, discusses membership
    ↓
If qualified: Email with next steps (application, onboarding)
```

**Implementation Point:** Scene7 CTA href → Calendly or internal booking page

---

## 3. Lead Capture Infrastructure

### Email Capture (Minimum Viable)

**Form Location:** Modal or dedicated page at `/apply` or `/waitlist`

**Required Fields (Form A — Membership Application):**
- Full Name (required)
- Email (required, validated)
- Phone (required)
- Experience Level (radio: Beginner / Intermediate / Advanced)
- Training Focus (multi-select: Strength / Cardio / Flexibility / Sport-specific)
- Commitment Level (radio: 3x/week / 4x/week / 5x+/week)
- Preferred Session Times (multi-select: Early morning / Midday / Evening / Flexible)
- Why Iron Oasis? (textarea, optional)

**Required Fields (Form B — Waitlist Lightweight):**
- Full Name (required)
- Email (required, validated)
- Interested In (checkbox: Membership application / Updates / Both)

**Backend Requirements:**
- Email validation (RFC compliant)
- Database: Users table (name, email, phone, form_type, created_at)
- Email send: Transactional (confirmation), CRM sync (lead capture)
- Deduplication: Check email exists before creating

---

## 4. Analytics & Event Tracking

### Google Analytics 4 (GA4)

**Setup Required:**
1. GA4 property creation (if not exists)
2. Add gtag snippet to `app/layout.tsx` or via `Providers`
3. Event tracking in Scene7 and form handlers

**Events to Track:**

| Event | Trigger | Payload | Purpose |
|-------|---------|---------|---------|
| `cta_view` | Scene7 CTA becomes visible (opacity > 0.5) | `beat: "cta", scene: 7` | Measure CTA engagement rate |
| `cta_click` | User clicks "Request Private Access" | `href_destination: "/apply"` | Measure CTA conversion rate |
| `form_impression` | Form loads (/apply or /waitlist) | `form_type: "application" \| "waitlist"` | Measure funnel entry |
| `form_field_focus` | User focuses on form field | `field_name: "email"` | Identify friction points |
| `form_submit` | User submits form | `form_type: "application" \| "waitlist", fields_completed: 6` | Measure submission rate |
| `form_error` | Form validation error | `field_name: "email", error_type: "invalid_format"` | Debug UX issues |
| `confirmation_view` | Success page loads | `form_type: "application" \| "waitlist"` | Measure successful conversions |
| `scroll_depth` | Scene progress milestones | `scene: 7, progress: 0.95` | Measure engagement by scene |

**Implementation Points:**
- Scene7 CTA click event → hook on `<a>` tag via onClick
- Form events → React hook in form component
- Scroll depth → existing MasterTimeline progress already available

---

## 5. Confirmation States & User Experience

### Post-Submission Confirmation Flow

**After Form Submit:**

1. **Optimistic UI:** Button shows "Submitting..." with disabled state (prevent double-submit)
2. **Server Response (Success):**
   - Redirect to `/confirmation?type=application` (or inline confirmation)
   - Display: "Thank you, [Name]. We'll review your application and reach out within 48 hours."
   - Secondary CTA: "Return to Home" (href="/")
   - Optional: Display expected timeline (e.g., "Typical response: 24-48 hours")
3. **Server Response (Error):**
   - Stay on form, show error banner: "Something went wrong. Please try again."
   - If email already exists: "This email is already registered. Check your inbox or contact us."
4. **Email Confirmation:**
   - From: `noreply@ironoasis.com`
   - Subject: "Your Iron Oasis Application"
   - Body: Applicant name, application date, next steps, operator contact info

---

## 6. Files Affected & Required Changes

### New Files to Create

#### `/app/api/forms/submit` (Next.js API route)

**Purpose:** Handle form submissions, validate, store in DB, send emails

```
/app/api/forms/submit/route.ts
```

**Responsibilities:**
- Accept POST with form data
- Validate all required fields
- Check for duplicate emails
- Insert into `users` table
- Send transactional emails (via Resend, SendGrid, AWS SES, or PostMark)
- Return 200 + confirmation URL or 400 + error message

---

#### `/app/apply` & `/app/waitlist` (Form Pages)

**Purpose:** Dedicated form pages

```
/app/apply/page.tsx          # Membership application form
/app/waitlist/page.tsx       # Lightweight waitlist form
/app/confirmation/page.tsx   # Post-submit confirmation
```

**Structure:**
- Heading matching Scene7 context ("Your private training space is ready.")
- Form with validated fields
- Submit button that calls `/api/forms/submit`
- Error & success states

---

#### `/components/v3/forms/MembershipForm.tsx`

**Purpose:** Reusable membership application form component

**Features:**
- Client-side form state (React hook)
- Field validation (email regex, phone format)
- Submit handler with error/success logic
- Accessible labels and ARIA attributes
- Loading state during submission

---

#### `/components/v3/forms/WaitlistForm.tsx`

**Purpose:** Lightweight waitlist capture form

**Features:**
- Name + email only
- Checkbox for communication preferences
- Submit handler

---

#### `/components/v3/analytics/Analytics.tsx`

**Purpose:** GA4 initialization and event tracking utilities

**Exports:**
- `trackCTAView()` – Called when Scene7 CTA becomes active
- `trackCTAClick()` – Called when CTA is clicked
- `trackFormSubmit(type, fieldsCompleted)` – Called on form success
- `trackFormError(fieldName)` – Called on validation error

---

#### `lib/db/schema.ts` (or similar)

**Purpose:** Database schema definition (users table)

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  experience_level?: "beginner" | "intermediate" | "advanced";
  training_focus?: string[];
  commitment_level?: string;
  form_type: "application" | "waitlist";
  created_at: Date;
  updated_at: Date;
}
```

---

### Modified Files

#### `components/v3/scenes/Scene7FinalAccess.tsx`

**Changes:**
1. Import analytics tracking functions
2. Update CTA href from `"#"` → `"/apply"` (or pass dynamic)
3. Add onClick handler: `() => trackCTAClick()`
4. Add onVisible hook to track when Scene7 CTA becomes active (opacity > 0.5)

**Before:**
```jsx
<a href="#" className="...">Request Private Access</a>
```

**After:**
```jsx
<a
  href="/apply"
  onClick={() => trackCTAClick({ destination: "/apply" })}
  className="..."
>
  Request Private Access
</a>
```

---

#### `app/layout.tsx`

**Changes:**
1. Add GA4 gtag script (if not already present)
2. Initialize analytics in Providers

**Before:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**After:**
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" />
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXX');
        </script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

#### `app/providers.tsx`

**Changes:**
1. Initialize analytics on client (GA4 pageview tracking)
2. Set up router event listeners for SPA navigation

---

#### `.env.local` (or `.env`)

**Add:**
```
NEXT_PUBLIC_GA_ID=G-XXXXX
NEXT_PUBLIC_API_URL=https://api.ironoasis.com
DATABASE_URL=postgresql://...
EMAIL_PROVIDER=resend|sendgrid|aws-ses
EMAIL_API_KEY=sk_...
```

---

## 7. Conversion Funnel Map

### CTA Placement & Conversion Points

```
ENTRY → Scene0 (Loading)
        ↓
        Scene1 (Logo Reveal)
        ↓
        SceneHook (NOT A PUBLIC GYM. THE SPACE IS YOURS.)
        ↓
        Scene2 (Gym Reveal — first 3D intro)
        ↓
        Scene3 (Private Experience)
        ↓
        Scene4 (How It Works — 5 steps)
        ↓
        Scene5 (App Experience — 3 device beats)
        ↓
        Scene6 (Location Trust — 5 location shots)
        ↓
        ★ Scene7 (CTA BEAT — "Request Private Access")
        ↓
        /apply [Form A] → Email capture → Confirmation
        ↓
        Backend: Store lead → Send email → Route to operator
        ↓
        /confirmation page
```

### Conversion Rate Benchmarks (for planning)

| Metric | Target | Notes |
|--------|--------|-------|
| Scroll to Scene7 | 80% | % of visitors reaching final CTA |
| Scene7 CTA view | 70% | % of visitors with CTA at > 0.5 opacity |
| CTA click rate | 5-10% | % of viewers who click (typical landing page: 2-5%) |
| Form completion rate | 80% | % of form starts that convert to submission |
| Overall conversion rate | 0.4-0.8% | (80% scroll × 80% CTA view × 8% click × 80% complete) |

---

## 8. Missing Launch Dependencies

### Backend Requirements

- [ ] Database (PostgreSQL, Supabase, or similar)
- [ ] Email service (Resend, SendGrid, AWS SES, or PostMark)
- [ ] API route for form submission with validation
- [ ] Lead database schema + CRUD operations
- [ ] Email templates (confirmation, ops notification, auto-responder)
- [ ] Operator dashboard to review applications (future phase)

### Frontend Components

- [ ] MembershipForm component (with validation, loading state)
- [ ] WaitlistForm component (lightweight)
- [ ] Confirmation page
- [ ] Error page/modal
- [ ] Analytics tracking utilities
- [ ] GA4 integration

### Analytics

- [ ] Google Analytics 4 property created
- [ ] GA4 gtag initialized in layout
- [ ] Event tracking implemented in Scene7 + forms
- [ ] Conversion funnel dashboard configured

### Email Infrastructure

- [ ] Email provider account (Resend recommended for Next.js)
- [ ] Email templates designed (confirmation, ops notification)
- [ ] Email domain verification (SPF, DKIM, DMARC)
- [ ] Test emails sent and verified

---

## 9. Recommended Implementation Phase

### Phase 1: Forms & Email (Essential for Launch)

**Timeline:** 2-3 days

1. Set up email service (Resend)
2. Create `/app/api/forms/submit` API route
3. Create `/app/apply` page with MembershipForm
4. Create `/app/confirmation` page
5. Update Scene7 CTA href to `/apply`
6. Test end-to-end form submission + email delivery

**Outcome:** Forms are live, leads can be captured, emails arrive in inbox

**Files Changed:** Scene7FinalAccess.tsx, +4 new files

---

### Phase 2: Analytics (High Priority, Launch)

**Timeline:** 1 day

1. Add GA4 gtag script to layout.tsx
2. Implement `trackCTAView()` and `trackCTAClick()` events
3. Implement form event tracking
4. Set up GA4 conversion funnel dashboard
5. Test events in GA4 real-time dashboard

**Outcome:** Complete visibility into visitor journey and conversion rates

**Files Changed:** layout.tsx, Scene7FinalAccess.tsx, +1 new file (Analytics.ts)

---

### Phase 3: Operator Experience (Post-Launch)

**Timeline:** 1 week

1. Build operator dashboard to review applications
2. Add admin email notifications
3. Implement application status tracking (pending → approved → rejected)
4. Create operator onboarding guide

**Outcome:** Ops team can review and respond to applications in-app

**Files Changed:** +5 new files (dashboard pages, API routes)

---

### Phase 4: Optimizations (Optional)

**Timeline:** Ongoing

1. A/B test CTA copy ("Request Private Access" vs "Apply Now" vs "Join Membership")
2. Implement email drip campaigns for waitlist
3. Add SMS capture for faster follow-up
4. Build Zapier/Make integration for CRM sync
5. Implement retargeting ads for form abandonment

---

## 10. Integration Checklist for Launch

### Pre-Launch (Week 1)

- [ ] Database: Users table created, migrations tested
- [ ] Email service: Account created, API key configured, test email sent
- [ ] API route: `/api/forms/submit` deployed and tested
- [ ] Forms: `/app/apply` and `/app/confirmation` pages deployed
- [ ] Scene7 CTA: href updated to `/apply`, tested end-to-end
- [ ] Analytics: GA4 property created, gtag initialized, events firing
- [ ] Validation: npx tsc --noEmit passes, npm run build succeeds

### Launch Day

- [ ] All forms tested on mobile and desktop
- [ ] Email confirmations verified as delivering
- [ ] GA4 real-time dashboard showing live events
- [ ] Ops team briefed on how to access applications
- [ ] Fallback: Manual email forwarding setup in case API fails

### Post-Launch (Week 2)

- [ ] Monitor conversion rates daily
- [ ] Review first 5-10 applications for quality
- [ ] Adjust form fields if drop-off high
- [ ] Implement operator response workflow

---

## 11. Technical Decisions & Rationale

### Why No Header CTA?

The cinematic scroll experience is designed without persistent navigation or header. Adding a header CTA would break the immersive, filmlike pacing. The single CTA at the end (Scene7) forces a complete commitment to the narrative before conversion is offered — this aligns with the brand's "restraint" principle (Apple-style, no hard sell).

**Alternative:** If later user research shows visitors want an "early exit," a subtle top-right icon (e.g., subtle button or scroll indicator) could be added non-intrusively.

---

### Why Not Typeform/Embed?

Embedding Typeform, Google Forms, or similar would:
- Break visual consistency (external service styling)
- Add external dependency (slower load, potential SLA issues)
- Complicate analytics tracking
- Make email/data flow less transparent

**Recommendation:** Custom form gives full control over styling, validation, and backend integration.

---

### Why Phone Number Required?

Operators likely want to contact applicants by phone for qualifying conversations. Email alone leaves a gap in the sales process.

**Alternative:** Make phone optional initially, then request post-apply.

---

### Why Not Calendly Directly?

Calendly embed adds:
- External dependency (slower page load)
- No data capture (phone, experience level)
- Harder to qualify before scheduling

**Recommendation:** Form first (qualify → data capture) → then Calendly booking (if approved).

---

## 12. Security & Compliance Notes

- [ ] Email validation: Check for disposable email addresses
- [ ] CAPTCHA: Add reCAPTCHA v3 to form if bot submissions spike
- [ ] Rate limiting: Implement on `/api/forms/submit` (max 5 submissions per IP per hour)
- [ ] GDPR: Add explicit consent checkbox ("I agree to be contacted about membership")
- [ ] Data retention: Set policy (auto-delete unconfirmed signups after 90 days?)

---

## Summary

**Current State:** One CTA (Scene7), no forms, no analytics, no lead capture

**For Launch:** Forms + email + analytics + confirmation flows

**Key Files Affected:**
1. Scene7FinalAccess.tsx (update CTA href + analytics tracking)
2. app/layout.tsx (add GA4 gtag)
3. +4 new pages (/apply, /waitlist, /confirmation, API route)
4. +2 form components
5. +1 analytics utilities file

**Timeline:** 3-4 days to MVP (forms + email), +1 day for analytics

**Next Phase:** Operator dashboard + email workflows (post-launch)

---

**Last Updated:** 2026-08-06  
**Next Review:** After first 10 applications received  
**Owner:** Product / Growth team
