# Database Migrations

This directory contains SQL migration files for the WingWake Ferry Flight Tracking System.

## Migration Files

### 001_initial_schema.sql
Creates all database tables:
- `profiles` - User profiles extending auth.users
- `organizations` - Aircraft owners/operators
- `organization_members` - Many-to-many relationship
- `aircraft` - Aircraft registry
- `ferry_flights` - Core ferry flight cases
- `discrepancies` - Aircraft discrepancies
- `mechanic_signoffs` - Mechanic safety statements
- `faa_permits` - FAA special flight permits
- `documents` - Document storage metadata
- `pilot_qualifications` - Pilot credentials (Phase 2)
- `insurance_policies` - Insurance tracking (Phase 2)
- `audit_logs` - Compliance audit trail

### 002_rls_policies.sql
Row Level Security (RLS) policies for all tables:
- Role-based access control
- Organization-based data isolation
- User-specific permissions

### 003_automation_triggers.sql
Automation functions and triggers:
- Status change validation
- Audit logging
- Auto-update flight status on permit approval
- Helper functions for notifications and compliance checks

## Running Migrations

### Using Supabase CLI

```bash
# Apply all migrations
supabase db push

# Or apply specific migration
supabase migration up
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration

## Migration Order

Migrations must be run in order:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_automation_triggers.sql`
4. `004_storage_bucket.sql` (creates storage bucket and policies)

## Storage Bucket Setup

After running migrations, create a storage bucket for documents. You have two options:

### Option 1: Using SQL Migration (Recommended)

Run the migration file `004_storage_bucket.sql` which will:
- Create the `documents` storage bucket
- Set up Row Level Security policies
- Configure upload/view/delete permissions

**Via Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `004_storage_bucket.sql`
4. Copy and paste the contents
5. Click **Run** to execute

**Via Supabase CLI:**
```bash
supabase db push
```

### Option 2: Using Supabase Dashboard UI

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure:
   - **Name:** `documents`
   - **Public bucket:** Unchecked (private)
5. Click **Create bucket**
6. Then run the storage policies SQL from `004_storage_bucket.sql` in the SQL Editor

### Verify Setup

After creating the bucket, verify it exists:
1. Go to **Storage** → **Buckets**
2. You should see `documents` listed
3. The bucket should be **Private** (not public)

## Notes

- All tables use UUID primary keys
- Timestamps use `timestamptz` for timezone awareness
- RLS is enabled on all tables
- Audit logging is automatic for status changes
- Status transitions are validated by triggers

