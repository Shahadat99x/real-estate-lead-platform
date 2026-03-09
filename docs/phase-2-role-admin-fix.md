# Phase 2: Role and Admin Access Fix

## Overview

This document describes the fixes applied in Phase 2 to resolve role and admin access issues that were causing production failures on Vercel.

## Root Cause Identified

### Bug: Seed Script Never Sets ADMIN Role

**Location:** [`scripts/seed-demo.mjs`](scripts/seed-demo.mjs)

**Problem:** The seed script was creating users but never setting their role to 'ADMIN'. All new users get role 'AGENT' by default from the database trigger `handle_new_user()` (defined in [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), line 123).

**Impact:**

- Admin user created via seed had role 'AGENT' instead of 'ADMIN'
- Admin dashboard at `/dashboard/admin` redirected to `/dashboard` because `requireRole(['ADMIN'])` failed
- This would appear in production but might not be obvious in local development (depends on seed execution order)

### Database Trigger Default Behavior

The database trigger `handle_new_user()` (line 113-136 in init.sql) creates profiles with role 'AGENT' by default:

```sql
insert into public.profiles (id, role, full_name, email, phone, avatar_url)
values (
  new.id,
  'AGENT',  -- Default role, never changed by seed
  ...
)
```

## Fixes Applied

### 1. Fixed Seed Script (`scripts/seed-demo.mjs`)

Added code to explicitly set the admin role after creating the user:

```javascript
// First, ensure the admin profile has ADMIN role
const { data: existingProfile } = await supabase
  .from("profiles")
  .select("id, email, role")
  .eq("email", ADMIN_EMAIL)
  .single();

if (existingProfile) {
  if (existingProfile.role !== "ADMIN") {
    console.log(`Setting role to ADMIN for ${ADMIN_EMAIL}...`);
    await supabase
      .from("profiles")
      .update({ role: "ADMIN" })
      .eq("id", existingProfile.id);
  }
}
```

### 2. Enhanced Role Diagnostics (`lib/authz.ts`)

Added:

- **ForbiddenError class** - Custom error for role mismatches with detailed message
- **Production logging** - Warnings logged when role mismatch detected in production
- **checkIsAdmin()** function - Convenience function for checking admin without redirect

```typescript
// Added ForbiddenError class
export class ForbiddenError extends Error {
  constructor(userRole: string, requiredRoles: Role[]) {
    super(
      `User has role '${userRole}' but requires one of: ${requiredRoles.join(", ")}`,
    );
    this.name = "ForbiddenError";
  }
}

// Enhanced requireRole with production logging
if (!roles.includes(profile.role)) {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      `[Auth] Access denied: User ${profile.id} has role '${profile.role}' but requires one of: ${roles.join(", ")}`,
    );
  }
  if (options.redirectTo) redirect(options.redirectTo);
  throw new ForbiddenError(profile.role, roles);
}
```

### 3. Verification Script (`scripts/verify-admin-role.sql`)

Created a manual SQL verification script that can be run in Supabase SQL Editor to:

- Check if admin user exists with correct role
- List all profiles and their roles
- Manually fix admin role if needed
- Verify RLS policies are in place
- Test admin access

## Files Modified

| File                            | Change                                                   |
| ------------------------------- | -------------------------------------------------------- |
| `scripts/seed-demo.mjs`         | Added admin role update logic                            |
| `lib/authz.ts`                  | Added ForbiddenError, production logging, checkIsAdmin() |
| `scripts/verify-admin-role.sql` | New verification script                                  |

## How to Verify Fix in Production

### Option 1: Run Verification Script

1. Open Supabase Dashboard → SQL Editor
2. Run [`scripts/verify-admin-role.sql`](scripts/verify-admin-role.sql)
3. Check that admin user has `role = 'ADMIN'`

### Option 2: Manual Check

```sql
-- Check admin profile
select email, role from public.profiles where email = 'admin@example.com';

-- If role is not ADMIN, fix it:
update public.profiles set role = 'ADMIN' where email = 'admin@example.com';
```

### Option 3: Re-run Seed Script

```bash
npm run db:seed
```

Or if using the Supabase CLI:

```bash
npx supabase exec -p <project-ref> scripts/seed-demo.mjs
```

## Production Deployment Notes

After deploying these fixes:

1. **Run seed script** on production database to ensure admin has correct role
2. **Check Vercel logs** for role access denied warnings (new in this fix)
3. **Test admin access** by visiting `/dashboard/admin`

## Related Files

- [`docs/phase-0-production-audit.md`](docs/phase-0-production-audit.md) - Full audit report
- [`docs/phase-1-auth-profile-fix.md`](docs/phase-1-auth-profile-fix.md) - Phase 1 documentation
