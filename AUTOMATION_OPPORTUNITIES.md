# Automation Opportunities

This document outlines automation features that can be built to enhance the WingWake ferry flight tracking system.

## MVP-Level Automation (Build Early)

### 1. Status-Based Alerts

**What:** Notify stakeholders when key status changes occur.

**Implementation:**
- Use Supabase Edge Functions or Next.js API routes
- Trigger on status changes (already logged in `audit_logs`)
- Send emails/SMS via services like Resend, Twilio, or SendGrid

**Examples:**
- Mechanic sign-off complete → Notify owner
- FAA permit issued → Notify pilot and owner
- Permit expiring in 7 days → Alert all stakeholders
- Flight status changed to `in_progress` → Notify owner

**Database Support:**
- Status changes already logged in `audit_logs`
- Helper functions available: `get_expiring_permits()`, `get_flights_waiting_on_faa()`

### 2. Missing Document Warnings

**What:** Block status transitions if required documents are missing.

**Implementation:**
- Add validation functions that check document requirements
- Use `get_flight_document_counts()` to verify required categories
- Block status updates if requirements not met

**Required Documents by Status:**
- `inspection_complete` → Requires mechanic statement document
- `faa_submitted` → Requires registration, airworthiness, logbooks
- `permit_issued` → Requires permit document

### 3. SLA Timers

**What:** Track time spent in each status stage.

**Implementation:**
- Calculate time differences from `audit_logs` or `created_at`/`updated_at`
- Display in UI: "Waiting on FAA for 5 days"
- Alert if SLA thresholds exceeded (e.g., >14 days waiting on FAA)

**Database Support:**
- `get_flights_waiting_on_faa()` already calculates days waiting

## Phase 2 Automation (Competitive Advantage)

### 4. FAA Email Parsing

**What:** Automatically update permit status by parsing FAA emails.

**Implementation:**
- Use email parsing service (Resend, Postmark, or custom IMAP)
- Parse common patterns:
  - "Your special flight permit has been approved" → `status: approved`
  - "We need additional information" → `status: faa_questions`
  - "Your application has been denied" → `status: denied`
- Extract permit number, expiration date, limitations

**Value:** Reduces manual data entry, faster status updates

### 5. Smart Checklists

**What:** Auto-populate checklists based on aircraft type and discrepancies.

**Implementation:**
- Build knowledge base of common ferry limitations by:
  - Aircraft type (Cessna 172 vs. Citation)
  - Discrepancy type (engine vs. avionics)
  - Severity level
- Auto-suggest operating limitations
- Pre-fill FAA Form 8130-6 fields

**Example:**
- Discrepancy: "Engine oil leak" + Aircraft: "Cessna 172"
- Suggests: "Day VFR only, no passengers, maintain altitude below 5,000 MSL"

### 6. Pilot Currency Watcher

**What:** Monitor pilot qualifications and alert before expiration.

**Implementation:**
- Use `pilot_qualifications` table (Phase 2)
- Scheduled job checks:
  - Medical expiration
  - Flight review (BFR) expiration
  - Currency requirements
- Alert if pilot becomes non-current before scheduled flight
- Block flight status change to `scheduled` if pilot not current

**Database Support:**
- `pilot_qualifications` table already has expiration fields

### 7. Insurance Guardrails

**What:** Verify insurance coverage before allowing flight execution.

**Implementation:**
- Check `insurance_policies` table before status → `scheduled`
- Verify:
  - Policy is active (not expired)
  - `covers_ferry_flights = true`
  - Coverage limits adequate
- Block scheduling if insurance invalid

**Database Support:**
- `insurance_policies` table ready for Phase 2

### 8. Automated FAA Form Generation

**What:** Generate FAA Form 8130-6 PDF from database data.

**Implementation:**
- Use PDF library (PDFKit, jsPDF, or Puppeteer)
- Populate form fields from:
  - `ferry_flights` table
  - `aircraft` table
  - `discrepancies` table
  - `mechanic_signoffs` table
- Generate downloadable PDF
- Optionally auto-submit via email

**Value:** Saves hours of manual form filling

## Long-Term Moat (Industry Intelligence)

### 9. Analytics Dashboard

**What:** Aggregate data to provide industry insights.

**Metrics to Track:**
- Average FAA approval time by FSDO
- Common denial reasons
- Which discrepancies slow approvals
- Best routes for problem aircraft
- Average time in each status stage

**Implementation:**
- Query `audit_logs` and `ferry_flights` tables
- Aggregate by FSDO, aircraft type, discrepancy type
- Build dashboard with charts/graphs
- Export reports

**Value:** Helps users optimize their process, provides competitive intelligence

### 10. Predictive Alerts

**What:** Predict potential issues before they occur.

**Examples:**
- "Based on similar flights, FAA approval typically takes 10-14 days"
- "This FSDO has 30% denial rate for engine discrepancies"
- "Pilot's medical expires in 45 days, consider scheduling earlier"

**Implementation:**
- Machine learning or simple statistical analysis
- Compare current flight to historical data
- Flag anomalies or risks

### 11. Multi-leg Ferry Tracking

**What:** Support ferry flights with multiple stops.

**Implementation:**
- Extend `ferry_flights` table or create `ferry_legs` table
- Track each leg separately
- Manage permits for each leg
- Update status per leg

**Database Changes Needed:**
- New table: `ferry_legs` with `leg_number`, `origin`, `destination`, `status`

### 12. International Ferry Support

**What:** Handle ferry flights crossing international borders.

**Additional Requirements:**
- Customs documentation
- International permits (not just FAA)
- Multiple regulatory bodies
- Currency exchange for fees

**Database Changes Needed:**
- Extend `faa_permits` to `permits` (support multiple authorities)
- Add `customs_documents` table
- Track multiple regulatory approvals

## Implementation Priority

### Week 1-2 (MVP)
1. Status-based email alerts
2. Missing document warnings
3. SLA timers in UI

### Month 1-2 (Phase 2)
4. FAA email parsing
5. Smart checklists
6. Pilot currency watcher

### Month 3+ (Competitive Moat)
7. Analytics dashboard
8. Automated form generation
9. Predictive alerts

## Technical Stack Recommendations

- **Email:** Resend, Postmark, or SendGrid
- **SMS:** Twilio
- **Scheduled Jobs:** Vercel Cron, Inngest, or Supabase Edge Functions with cron
- **PDF Generation:** PDFKit or Puppeteer
- **Email Parsing:** Resend Inbound, Postmark Inbound, or custom IMAP
- **Analytics:** Supabase Analytics, or export to data warehouse

## Database Functions Already Available

These helper functions are ready to use:

```sql
-- Check if ready for FAA submission
is_ready_for_faa_submission(flight_id)

-- Get flights waiting on FAA
get_flights_waiting_on_faa()

-- Get expiring permits
get_expiring_permits(days_ahead)

-- Get document counts
get_flight_document_counts(flight_id)
```

## Next Steps

1. Set up email service (Resend recommended)
2. Create API route for status change webhooks
3. Build notification templates
4. Implement first automation (status alerts)
5. Test with real ferry flight data
6. Iterate based on user feedback


