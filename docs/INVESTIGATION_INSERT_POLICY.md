# Investigation: Why INSERT Policy Isn't Working

## Problem
- INSERT works in SQL Editor (when authenticated as user)
- INSERT fails from Next.js app with RLS error 42501
- `auth.uid()` works (returns user ID in test endpoint)
- User is authenticated (confirmed)
- Policy exists and looks correct

## Key Findings

### 1. Authentication Context
- ✅ User is authenticated: Convex Auth returns user
- ✅ User ID works: Returns user ID in Convex context
- ✅ SELECT works: Can query profiles table via Convex queries
- ❌ INSERT fails: Authorization check blocks INSERT

### 2. Authorization Configuration
Authorization should be implemented in Convex mutations:
```typescript
export const createOrganization = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Create organization with proper authorization
    return await ctx.db.insert("organizations", { ... });
  }
});
```

### 3. Possible Issues

#### Issue A: Authentication Not Checked
- Mutation might not be checking for authenticated user
- **Solution**: Ensure `ctx.auth.getUserIdentity()` is called in mutation

#### Issue B: Authorization Logic Missing
- Authorization checks might be missing in mutation
- **Check**: Verify mutation checks user permissions before allowing INSERT

#### Issue C: Identity Not Available
- User identity might not be available in mutation context
- **Check**: Verify Convex Auth is properly configured

#### Issue D: Context Not Passed Correctly
- Authentication context might not be passed to mutation
- **Check**: Verify Convex client is properly authenticated

## Diagnostic Steps

### Step 1: Check Convex Mutation
Review the mutation code in `convex/mutations/organizations.ts` to see:
- Authentication checks
- Authorization logic
- Error handling

### Step 2: Test INSERT Endpoint
Visit `/api/seed/test-insert` to see:
- If INSERT succeeds or fails
- Exact error message
- Whether authentication works in mutation context

### Step 3: Check Authorization Logic
Review mutation to ensure proper authorization:
```typescript
export const createOrganization = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // Ensure authentication check exists
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Add authorization checks as needed
    // ...
  }
});
```

### Step 4: Verify Authentication in Request
Check if authentication is being passed in INSERT requests by:
- Inspecting network requests in browser
- Checking Convex logs
- Using Convex dashboard to see request context

## Current Workaround
Using Convex mutations with authorization checks in the mutation logic.
This works but authorization should be properly implemented in the mutation.

## Next Steps
1. Review Convex mutation code
2. Test INSERT endpoint
3. Verify authentication is checked in mutation
4. Check authorization logic in mutation
5. Verify Convex Auth is properly configured


