# WingWake Ferry Flight Tracking System

## Overview

This is a SaaS platform for tracking and monitoring ferry flight progress from initial need identification through FAA permit approval and flight execution.

## System Architecture

### Core Systems (MVP)

1. **Ferry Flight Case System** - The central workflow engine
2. **Aircraft System** - Aircraft registry and ownership
3. **Discrepancy Tracking** - Unairworthy condition documentation
4. **Mechanic Sign-off System** - Safety assessment and logbook authority
5. **FAA Permit Tracking** - Permit application and approval workflow
6. **Document Management** - Centralized file storage

### Phase 2 Systems

- Pilot Currency Automation
- Insurance Policy Logic
- Structured Operating Limitations
- Route/Weather Constraint Engine
- FAA Email Parsing
- Multi-leg / International Ferry Logic
- Analytics Dashboard

## Database Schema

### Core Tables

- `profiles` - User accounts with roles
- `organizations` - Aircraft owners/operators
- `aircraft` - Aircraft registry
- `ferry_flights` - Ferry flight cases (core entity)
- `discrepancies` - Aircraft discrepancies
- `mechanic_signoffs` - Mechanic safety statements
- `faa_permits` - FAA special flight permits
- `documents` - Document metadata and storage references

### Supporting Tables

- `organization_members` - Many-to-many user-organization relationship
- `pilot_qualifications` - Pilot credentials (Phase 2)
- `insurance_policies` - Insurance tracking (Phase 2)
- `audit_logs` - Compliance audit trail

## User Roles & Permissions

### Roles

- **admin** - Full system access
- **owner** - Create/manage ferry flights, submit permits
- **mechanic** - Add discrepancies, create sign-offs
- **pilot** - View permits, update flight status
- **viewer** - Read-only access

### Permission Matrix

See `lib/permissions.ts` for detailed permission mappings.

## Ferry Flight Status Workflow

```
draft
  ↓
inspection_pending
  ↓
inspection_complete (requires mechanic signoff)
  ↓
faa_submitted
  ↓
faa_questions (optional, if FAA has questions)
  ↓
permit_issued (when FAA approves)
  ↓
scheduled
  ↓
in_progress
  ↓
completed | aborted
```

Alternative paths:
- `denied` - Can return to `draft` to restart
- `aborted` - Terminal state

## API Usage Examples

### Create a Ferry Flight

```typescript
import { createFerryFlight } from '@/lib/db'

const flight = await createFerryFlight({
  aircraft_id: 'aircraft-uuid',
  owner_id: 'org-uuid',
  origin: 'KORD',
  destination: 'KLAX',
  purpose: 'Repositioning to maintenance facility',
  status: 'draft',
})
```

### Add Discrepancies

```typescript
import { createDiscrepancy } from '@/lib/db'

await createDiscrepancy({
  ferry_flight_id: flight.id,
  description: 'Engine oil leak',
  severity: 'major',
  affects_flight: true,
  affected_system: 'powerplant',
})
```

### Create Mechanic Sign-off

```typescript
import { createSignoff } from '@/lib/db'

await createSignoff({
  ferry_flight_id: flight.id,
  statement: 'Aircraft is safe for intended ferry flight',
  limitations: 'Day VFR only, no passengers',
})
```

### Submit FAA Permit

```typescript
import { createPermit, submitPermit } from '@/lib/db'

const permit = await createPermit({
  ferry_flight_id: flight.id,
  status: 'draft',
  fsdo_mido: 'CHI FSDO',
})

await submitPermit(permit.id, 'email')
```

### Check Readiness for FAA Submission

```typescript
import { checkReadyForFAASubmission } from '@/lib/db'

const ready = await checkReadyForFAASubmission(flight.id)
// Returns true if: has signoff, has discrepancies, has aircraft
```

## Automation Features

### Status Change Logging

All status changes are automatically logged to `audit_logs` table.

### Status Transition Validation

Invalid status transitions are blocked by database triggers.

### Auto-Update on Permit Approval

When FAA permit status changes to `approved`, ferry flight status automatically updates to `permit_issued`.

### Helper Functions

- `get_flights_waiting_on_faa()` - Flights pending FAA response
- `get_expiring_permits(days_ahead)` - Permits expiring soon
- `is_ready_for_faa_submission(flight_id)` - Compliance check
- `get_flight_document_counts(flight_id)` - Document statistics

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Restrict access based on organization membership
- Enforce role-based permissions
- Allow pilots/mechanics to access assigned flights
- Prevent unauthorized data access

### Permission Checks

Use the permissions system in `lib/permissions.ts`:

```typescript
import { hasPermission, requirePermission } from '@/lib/permissions'

// Check permission
if (await hasPermission('ferry_flight:create')) {
  // Create flight
}

// Require permission (throws if not allowed)
await requirePermission('mechanic_signoff:create')
```

## File Storage

Documents are stored in Supabase Storage bucket `documents` with structure:
```
documents/
  {ferry_flight_id}/
    {timestamp}.{ext}
```

## Migration Instructions

1. Run migrations in order:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`
   - `003_automation_triggers.sql`

2. Create storage bucket (see `supabase/migrations/README.md`)

3. Set up environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## Next Steps

1. Build UI components for ferry flight management
2. Implement notification system (email/SMS)
3. Add FAA form 8130-6 generation
4. Build analytics dashboard
5. Implement Phase 2 features

## Support

For questions or issues, refer to:
- Database schema: `lib/types/database.ts`
- Helper functions: `lib/db/*.ts`
- Permissions: `lib/permissions.ts`
- Migrations: `supabase/migrations/`


