# Investigation: Why INSERT Policy Isn't Working

## Problem
- INSERT works in SQL Editor (when authenticated as user)
- INSERT fails from Next.js app with RLS error 42501
- `auth.uid()` works (returns user ID in test endpoint)
- User is authenticated (confirmed)
- Policy exists and looks correct

## Key Findings

### 1. Authentication Context
- ✅ User is authenticated: `supabase.auth.getUser()` returns user
- ✅ `auth.uid()` works: Returns user ID in database context
- ✅ SELECT works: Can query profiles table
- ❌ INSERT fails: RLS policy blocks INSERT

### 2. Policy Configuration
The policy should be:
```sql
CREATE POLICY "Users can create organizations"
  ON organizations
  AS PERMISSIVE
  FOR INSERT
  TO authenticated  -- or TO public
  WITH CHECK (true);  -- or WITH CHECK (auth.uid() IS NOT NULL)
```

### 3. Possible Issues

#### Issue A: Policy Role Mismatch
- Policy uses `TO authenticated` but JWT might not have `authenticated` role claim
- **Solution**: Try `TO public` with `WITH CHECK (auth.uid() IS NOT NULL)`

#### Issue B: RESTRICTIVE Policy Blocking
- A RESTRICTIVE policy might be blocking all INSERTs
- **Check**: Run diagnostic query to find RESTRICTIVE policies

#### Issue C: Policy Not Applied
- Policy might exist but not be active
- **Check**: Verify policy is actually in pg_policies view

#### Issue D: JWT Not Passed in INSERT Context
- JWT might be passed for SELECT but not INSERT
- **Check**: Compare headers between SELECT and INSERT requests

## Diagnostic Steps

### Step 1: Run Diagnostic SQL
Run `018_diagnose_insert_policy.sql` to see:
- All policies on organizations table
- Whether RESTRICTIVE policies exist
- Exact policy definitions

### Step 2: Test INSERT Endpoint
Visit `/api/seed/test-insert` to see:
- If INSERT succeeds or fails
- Exact error message
- Whether auth.uid() works in INSERT context

### Step 3: Check Policy Role
Try changing policy from `TO authenticated` to `TO public`:
```sql
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Step 4: Verify JWT in Request
Check if JWT is being passed in INSERT requests by:
- Inspecting network requests in browser
- Checking Supabase logs
- Using Supabase dashboard to see request headers

## Current Workaround
Using `SECURITY DEFINER` function (`create_organization`) that bypasses RLS.
This works but is not ideal - we want the direct INSERT policy to work.

## Next Steps
1. Run diagnostic SQL queries
2. Test INSERT endpoint
3. Try policy with `TO public` instead of `TO authenticated`
4. Check for RESTRICTIVE policies
5. Verify JWT is passed in INSERT requests


