# Phase 1 Auth/Profile Fix

## 1. Problem Addressed

The app was silently failing in production when:

- User was authenticated but had no profile row in the database
- Dashboard pages returned `null` instead of showing errors
- Auth errors were hidden, making debugging impossible

### Before:

- `app/dashboard/layout.tsx` returned `null` when profile missing → blank page
- `app/dashboard/page.tsx` returned `null` when profile missing → blank page
- `app/dashboard/leads/page.tsx` returned `null` when profile missing → blank page
- `app/dashboard/listings/page.tsx` returned `null` when profile missing → blank page
- `app/dashboard/listings/[id]/edit/page.tsx` returned `null` when profile missing → blank page
- `app/dashboard/listings/new/page.tsx` returned `null` when profile missing → blank page
- `lib/authz.ts` returned ambiguous `null` for different failure cases
- `app/login/page.tsx` unnecessarily fetched profile before login

## 2. Fixes Implemented

### A. Improved Auth State Detection (`lib/authz.ts`)

- Added `AuthState` type that distinguishes:
  - `no_session` - User not logged in
  - `profile_missing` - User authenticated but no profile row
  - `error` - Database/query error
  - `ok` with profile - Success
- Added `ProfileMissingError` class for explicit error handling
- Added `getAuthState()` function with detailed state reporting
- Added production logging for debugging auth issues

### B. Removed Silent Null Rendering

All dashboard pages now show clear error messages instead of blank pages:

- `app/dashboard/layout.tsx` - Shows "Account Error" with sign out button
- `app/dashboard/page.tsx` - Shows error message
- `app/dashboard/leads/page.tsx` - Shows error message
- `app/dashboard/listings/page.tsx` - Shows error message
- `app/dashboard/listings/[id]/edit/page.tsx` - Shows error message
- `app/dashboard/listings/new/page.tsx` - Shows error message

### C. Fixed Login Page (`app/login/page.tsx`)

- Removed unnecessary `getCurrentProfile()` call before login
- Login form now shows with empty email instead of trying to fetch profile

## 3. Files Changed

1. **`lib/authz.ts`** - Complete rewrite with better auth state handling
2. **`app/dashboard/layout.tsx`** - Added error state UI
3. **`app/dashboard/page.tsx`** - Added error message, removed silent null
4. **`app/dashboard/leads/page.tsx`** - Added error message, removed silent null
5. **`app/dashboard/listings/page.tsx`** - Added error message, removed silent null
6. **`app/dashboard/listings/[id]/edit/page.tsx`** - Added error message, removed silent null
7. **`app/dashboard/listings/new/page.tsx`** - Added error message, removed silent null
8. **`app/login/page.tsx`** - Removed unnecessary profile fetch

## 4. New Behavior

### When User is Logged Out

- Redirects to `/login` from protected routes
- Login page shows normally

### When User is Logged In But Profile Missing

- Dashboard layout shows "Account Error" page with:
  - Clear error message explaining the issue
  - Sign out button to try again
- Server logs diagnostic message in production:
  ```
  [Auth] User {id} authenticated but no profile row. This usually means the Supabase trigger 'handle_new_user' didn't fire or failed.
  ```

### When User is Logged In With Valid Profile

- Dashboard works normally

### When Dashboard Query Fails

- Shows error message in console
- User sees empty state or error message

## 5. What Remains for Phase 2

### High Priority:

1. **Database Migration Verification** - Confirm migrations ran in production
2. **Cloudinary Setup** - Image uploads may still fail if env vars missing
3. **Role System Review** - Only ADMIN and AGENT supported (no USER role)
4. **RLS Policy Verification** - Confirm policies applied in production

### Medium Priority:

1. **TypeScript Errors** - `ignoreBuildErrors: true` hides real issues
2. **Environment Variables** - Add validation at startup
3. **Middleware** - Consider adding for better auth protection

## 6. Manual Verification Checklist

After deploying to Vercel:

### Test 1: Logged Out User Access

- [ ] Visit `/dashboard` while logged out
- [ ] Should redirect to `/login`

### Test 2: Login Flow

- [ ] Visit `/login`
- [ ] Should show login form (no errors)
- [ ] Login with valid credentials
- [ ] Should redirect to `/dashboard`

### Test 3: Profile Missing Scenario (if possible)

- [ ] Create user in Supabase Auth without profile row
- [ ] Try to access dashboard
- [ ] Should see "Account Error" page (not blank)
- [ ] Should have "Sign Out" button

### Test 4: Valid User

- [ ] Login as user with profile
- [ ] Visit `/dashboard`
- [ ] Should see dashboard overview

### Test 5: Check Vercel Logs

- [ ] After testing, check Vercel function logs
- [ ] Look for `[Auth]` prefixed log messages

## 7. Diagnostic Information Added

The following logging was added to help debug production issues:

```typescript
// In lib/authz.ts
if (process.env.NODE_ENV === "production") {
  console.warn("[Auth] Session error:", userError.message);
  console.error("[Auth] Profile fetch error:", profileError.message);
  console.error(`[Auth] User ${user.id} authenticated but no profile row...`);
}
```

These logs help identify:

- Session/authentication issues
- Profile missing (most common production issue)
- Database errors

## 8. Related Files Reference

- Auth helpers: `lib/authz.ts`
- Server client: `lib/supabase/server.ts`
- Dashboard layout: `app/dashboard/layout.tsx`
- Login: `app/login/page.tsx`
