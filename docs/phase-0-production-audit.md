# Phase 0 Production Audit Report

## 1. Summary

The app works on localhost but fails on Vercel due to a combination of **environment variable misconfiguration**, **RLS/database migration issues**, and **Next.js production behavior differences**. The most critical issues are:

1. **Missing `NEXT_PUBLIC_SITE_URL`** - Defaults to localhost in production redirects
2. **Missing `SUPABASE_SERVICE_ROLE_KEY`** - Required for server-side operations but not documented
3. **Missing Cloudinary env vars** - Image uploads fail completely
4. **Database migration may not have run** - RLS policies or schema changes missing in production
5. **Silent null returns** - Dashboard pages return null instead of proper error handling

---

## 2. Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Public Pages          Dashboard             Auth               │
│  ─────────────        ──────────            ────               │
│  / (home)             /dashboard            /login             │
│  /listings            /dashboard/listings    /logout            │
│  /listings/[id]      /dashboard/leads                          │
│  /blog               /dashboard/admin                           │
│  /blog/[slug]        /dashboard/admin/blog                     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                     Supabase Integration                        │
├─────────────────────────────────────────────────────────────────┤
│  Client: @supabase/ssr (browser)                               │
│  Server: @supabase/ssr (Next.js App Router)                    │
│  Public: @supabase/supabase-js (no auth)                       │
│  Service: @supabase/supabase-js (bypass RLS)                   │
│                                                                 │
│  Tables: profiles, agents, listings, listing_images, leads,     │
│          blog_posts                                             │
├─────────────────────────────────────────────────────────────────┤
│                     Auth & Roles                               │
├─────────────────────────────────────────────────────────────────┤
│  Roles: ADMIN, AGENT (USER role NOT supported)                 │
│  Auth: Supabase Auth (email/password)                          │
│  Middleware: NONE (relies on layout.tsx requireUser)           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Evidence Collected

### Critical Files Reviewed:

- [`lib/supabase/client.ts`](lib/supabase/client.ts) - Browser client setup
- [`lib/supabase/server.ts`](lib/supabase/server.ts) - Server client with cookie handling
- [`lib/supabase/service.ts`](lib/supabase/service.ts) - Service role client
- [`lib/authz.ts`](lib/authz.ts) - Authorization helpers
- [`app/dashboard/layout.tsx`](app/dashboard/layout.tsx) - Dashboard auth check
- [`app/dashboard/page.tsx`](app/dashboard/page.tsx) - Dashboard overview
- [`app/login/page.tsx`](app/login/page.tsx) - Login page
- [`app/logout/route.ts`](app/logout/route.ts) - Logout handler
- [`lib/queries/dashboard.ts`](lib/queries/dashboard.ts) - Dashboard data queries
- [`lib/queries/blog.ts`](lib/queries/blog.ts) - Blog queries
- [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) - Initial schema
- [`supabase/migrations/20250101000002_blog_posts.sql`](supabase/migrations/20250101000002_blog_posts.sql) - Blog schema (has RLS bug)
- [`supabase/migrations/20250101000003_blog_posts_phase6.sql`](supabase/migrations/20250101000003_blog_posts_phase6.sql) - Blog fix
- [`next.config.ts`](next.config.ts) - Next.js config
- [`package.json`](package.json) - Dependencies

---

## 4. Ranked Root Cause Hypotheses

### 🔴 HIGH CONFIDENCE

#### 1. Missing `NEXT_PUBLIC_SITE_URL` in Vercel Environment

- **Confidence**: HIGH
- **Evidence**: [`app/logout/route.ts:7`](app/logout/route.ts:7), [`app/sitemap.ts:6`](app/sitemap.ts:6)
- **Code**: `process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'`
- **Affected Features**: Logout redirect, sitemap, robots.txt, all canonical URLs
- **Why Production Fails**: After logout, users are redirected to localhost instead of production domain. Search engines see wrong canonical URLs.

#### 2. Missing Cloudinary Environment Variables

- **Confidence**: HIGH
- **Evidence**: [`app/api/cloudinary/sign/route.ts:32-35`](app/api/cloudinary/sign/route.ts:32-35)
- **Affected Features**: Listing image uploads, blog cover image uploads
- **Why Production Fails**: Image upload API routes return errors or 500s when Cloudinary vars missing.

#### 3. Database Migrations Not Applied in Production

- **Confidence**: HIGH
- **Evidence**: Migration files exist but no evidence they're auto-run during Vercel deploy
- **Affected Features**: Blog posts table, leads status columns, RLS policies
- **Why Production Fails**: Tables/columns/policies may not exist, causing query failures.

#### 4. `SUPABASE_SERVICE_ROLE_KEY` Missing

- **Confidence**: HIGH
- **Evidence**: [`lib/supabase/service.ts:11`](lib/supabase/service.ts:11) requires this var
- **Not in .env.example**: The seed script requires it but it's not documented
- **Affected Features**: Any code using `createServiceRoleClient()` - likely none currently, but future admin features
- **Why Production Fails**: Server actions requiring admin bypass will fail.

### 🟡 MEDIUM CONFIDENCE

#### 5. Profile Row May Not Exist for Logged-In Users

- **Confidence**: MEDIUM
- **Evidence**: [`app/dashboard/layout.tsx:8-10`](app/dashboard/layout.tsx:8-10) returns `null` if no profile
- **Code**: `if (!profile) return null;` - SILENT FAILURE
- **Affected Features**: Dashboard, listings, leads, admin pages
- **Why Production Fails**: If Supabase trigger `handle_new_user()` doesn't fire or fails, user has auth session but no profile row, causing blank pages.

#### 6. TypeScript Errors Disabled in Build

- **Confidence**: MEDIUM
- **Evidence**: [`next.config.ts:32-35`](next.config.ts:32-35): `ignoreBuildErrors: true`
- **Why Production Fails**: Real type errors that would catch bugs are hidden during build.

#### 7. RLS Policy for Blog Admin Uses Wrong Role Case

- **Confidence**: MEDIUM (partially fixed)
- **Evidence**: [`supabase/migrations/20250101000002_blog_posts.sql:46`](supabase/migrations/20250101000002_blog_posts.sql:46) used `'admin'` (lowercase)
- **Note**: [`20250101000003_blog_posts_phase6.sql`](supabase/migrations/20250101000003_blog_posts_phase6.sql) line 36 does `upper(status)` which should fix case
- **Why Production Fails**: If migration didn't run or ran out of order, admin blog management fails.

### 🟢 LOW CONFIDENCE

#### 8. No Custom Middleware for Auth Protection

- **Confidence**: LOW
- **Evidence**: No `middleware.ts` file in project root
- **Why Production Fails**: Relies entirely on layout.tsx `requireUser()` - first render may show flash of unauthenticated state.

#### 9. Cookie Handling Differences in Production

- **Confidence**: LOW
- **Evidence**: [`lib/supabase/server.ts:25-37`](lib/supabase/server.ts:25-37) swallows cookie errors
- **Why Production Fails**: Server components may fail silently in Vercel edge/runtime.

#### 10. Dashboard Returns Null Instead of Redirect

- **Confidence**: LOW
- **Evidence**: Multiple pages: [`app/dashboard/page.tsx:20`](app/dashboard/page.tsx:20), [`app/dashboard/leads/page.tsx:19`](app/dashboard/leads/page.tsx:19)
- **Code**: `if (!profile) return null;`
- **Why Production Fails**: Users see blank pages instead of proper error/redirect.

---

## 5. Environment Variables Audit

| Variable                        | Where Used                                               | Client/Server | Required in Vercel | Risk if Missing                |
| ------------------------------- | -------------------------------------------------------- | ------------- | ------------------ | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | All Supabase clients                                     | Both          | ✅ YES             | App crashes completely         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Supabase clients                                     | Both          | ✅ YES             | App crashes completely         |
| `SUPABASE_SERVICE_ROLE_KEY`     | `lib/supabase/service.ts`                                | Server        | ⚠️ Future use      | Future admin features fail     |
| `NEXT_PUBLIC_SITE_URL`          | `app/logout/route.ts`, `app/sitemap.ts`, `app/robots.ts` | Server        | ✅ YES             | Wrong redirects, bad SEO       |
| `CLOUDINARY_CLOUD_NAME`         | `app/api/cloudinary/sign/route.ts`                       | Server        | ✅ YES             | Image uploads fail             |
| `CLOUDINARY_API_KEY`            | `app/api/cloudinary/sign/route.ts`                       | Server        | ✅ YES             | Image uploads fail             |
| `CLOUDINARY_API_SECRET`         | `app/api/cloudinary/sign/route.ts`                       | Server        | ✅ YES             | Image uploads fail             |
| `CLOUDINARY_FOLDER`             | `app/api/cloudinary/sign/route.ts`                       | Server        | ❌ NO              | Defaults to 'real-estate-demo' |

### Missing from `.env.example`:

- `SUPABASE_SERVICE_ROLE_KEY` - Not documented but required for service operations
- `NEXT_PUBLIC_SITE_URL` - Critical for production

---

## 6. Auth and Session Audit

### Auth Flow:

1. User visits `/login`
2. Server component checks `getUser()` - if exists, redirects to `/dashboard`
3. User submits email/password via server action `signIn()`
4. Supabase creates session, cookies set via SSR client
5. Redirect to `/dashboard`
6. Dashboard layout calls `requireUser()` → `getCurrentProfile()`
7. `getCurrentProfile()` queries `profiles` table by auth.uid()

### Problems Found:

#### Problem 1: Profile Query Can Return Null Silently

- **File**: [`lib/authz.ts:27-34`](lib/authz.ts:27-34)
- **Issue**: If profile doesn't exist, returns null instead of throwing
- **Impact**: Dashboard shows blank page

#### Problem 2: Login Page Tries to Get Profile When Not Logged In

- **File**: [`app/login/page.tsx:13`](app/login/page.tsx:13)
- **Code**: `const profile = await getCurrentProfile();` - runs even for logged out users
- **Impact**: Unnecessary DB query, potential error

#### Problem 3: No Logout Confirmation or Error Handling

- **File**: [`app/logout/route.ts`](app/logout/route.ts)
- **Issue**: Uses localhost fallback for redirect

---

## 7. Role and Authorization Audit

### Role System:

- **Roles Defined**: `ADMIN`, `AGENT` (from [`types/db.ts:17`](types/db.ts:17))
- **USER role NOT supported** - Only ADMIN and AGENT can login
- **Role Assignment**: Via `handle_new_user()` trigger defaults to 'AGENT'

### Role Checks:

- [`lib/authz.ts:67-84`](lib/authz.ts:67-84): `requireRole(['ADMIN'], ...)` - Admin pages
- [`lib/queries/dashboard.ts`](lib/queries/dashboard.ts): Role passed to queries, filters data
- [`app/dashboard/admin/layout.tsx:5`](app/dashboard/admin/layout.tsx:5): Requires ADMIN role

### Problems Found:

#### Problem 1: Role Type Doesn't Match What Users Expect

- **File**: [`types/db.ts:17`](types/db.ts:17)
- **Issue**: Only `ADMIN | AGENT` - no USER role
- **Impact**: Regular users cannot sign up/login - only agents and admins

#### Problem 2: Silent UI Filtering vs Server Enforcement

- **File**: [`app/dashboard/DashboardShell.tsx:26`](app/dashboard/DashboardShell.tsx:26)
- **Issue**: Nav items filtered client-side based on role
- **Impact**: If server-side check fails, UI still shows items but queries return empty

---

## 8. Supabase / DB / RLS Audit

### Database Schema (from migrations):

#### Tables:

- `profiles` - Auth-bound, role-based
- `agents` - 1:1 with profiles
- `listings` - Property listings
- `listing_images` - Property photos
- `leads` - Customer inquiries
- `blog_posts` - Blog content

### RLS Policies Found:

| Table            | Policies                                                       | Notes                       |
| ---------------- | -------------------------------------------------------------- | --------------------------- |
| `profiles`       | self read/update, admin all                                    | ✅ Looks correct            |
| `agents`         | public read active, self full, admin all                       | ✅ Looks correct            |
| `listings`       | public published, owner full, admin all                        | ✅ Looks correct            |
| `listing_images` | Complex based on listing                                       | ✅ Looks correct            |
| `leads`          | public insert (published), owner read/update/delete, admin all | ✅ Looks correct            |
| `blog_posts`     | public read published, admin all                               | ⚠️ Had case sensitivity bug |

### Problems Found:

#### Problem 1: Lead Status Column Added Later

- **Evidence**: [`supabase/migrations/20250101000000_leads_inbox.sql`](supabase/migrations/20250101000000_leads_inbox.sql)
- **Risk**: Migration may not have run in production

#### Problem 2: Blog Posts RLS Had Case Bug (Possibly Fixed)

- **Evidence**: [`20250101000002_blog_posts.sql:46`](supabase/migrations/20250101000002_blog_posts.sql:46) used `'admin'` lowercase
- **Fix**: [`20250101000003_blog_posts_phase6.sql:36`](supabase/migrations/20250101000003_blog_posts_phase6.sql:36) does `upper(status)`
- **Risk**: If migrations ran out of order, blog admin fails

#### Problem 3: Service Role Key Not Documented

- **Evidence**: Not in `.env.example`
- **Risk**: Future admin features will fail without it

---

## 9. Next.js Production Risks

### Issues Found:

#### Issue 1: TypeScript Errors Disabled

- **File**: [`next.config.ts:34`](next.config.ts:34)
- **Code**: `ignoreBuildErrors: true`
- **Risk**: Hides real bugs that could affect production

#### Issue 2: Null Returns Instead of Error Pages

- **Files**:
  - [`app/dashboard/page.tsx:20`](app/dashboard/page.tsx:20)
  - [`app/dashboard/leads/page.tsx:19`](app/dashboard/leads/page.tsx:19)
  - [`app/dashboard/layout.tsx:8-10`](app/dashboard/layout.tsx:8-10)
- **Code**: `if (!profile) return null;`
- **Risk**: Users see blank pages instead of meaningful errors

#### Issue 3: No Dynamic Rendering Declarations

- **Risk**: Pages may be statically generated at build time, missing auth state

#### Issue 4: Dev-Only Session Display

- **File**: [`app/dashboard/page.tsx:158-166`](app/dashboard/page.tsx:158-166)
- **Code**: `process.env.NODE_ENV !== 'production'`
- **Risk**: Not a bug, but shows different behavior in dev vs prod

#### Issue 5: Absolute URL Generation Without Site URL

- **Files**:
  - [`app/logout/route.ts:7`](app/logout/route.ts:7)
  - [`app/sitemap.ts`](app/sitemap.ts)
  - [`app/robots.ts`](app/robots.ts)
- **Risk**: Fallback to localhost in production

---

## 10. Feature-by-Feature Failure Matrix

| Feature                | Works Locally Because...      | Likely Fails In Production Because...    | Relevant Files                                                 |
| ---------------------- | ----------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| **Login**              | Uses same Supabase project    | May work if credentials set correctly    | [`app/login/*`](app/login)                                     |
| **Dashboard Overview** | Profile exists in local DB    | Profile row missing → returns null       | [`app/dashboard/page.tsx`](app/dashboard/page.tsx)             |
| **Listings CRUD**      | RLS allows owner ops          | Migration may not have run               | [`lib/queries/dashboard.ts`](lib/queries/dashboard.ts)         |
| **Leads**              | Same as listings              | Same                                     | [`app/dashboard/leads/page.tsx`](app/dashboard/leads/page.tsx) |
| **Blog Admin**         | Role check works              | RLS case sensitivity bug OR migration    | [`app/dashboard/admin/blog/*`](app/dashboard/admin/blog)       |
| **Blog Public**        | Uses public client            | Should work                              | [`app/(public)/blog/*`](<app/(public)/blog>)                   |
| **Image Upload**       | Cloudinary vars in .env.local | CLOUDINARY\_\* vars missing in Vercel    | [`app/api/cloudinary/*`](app/api/cloudinary)                   |
| **Logout**             | Redirects to localhost        | NEXT_PUBLIC_SITE_URL missing → localhost | [`app/logout/route.ts`](app/logout/route.ts)                   |

---

## 11. Recommended Fix Order

### Phase 1: Critical Environment Fixes (DO FIRST)

1. Add `NEXT_PUBLIC_SITE_URL` to Vercel project env vars
2. Add all Cloudinary vars to Vercel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
3. Verify Supabase env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run database migrations in production Supabase project
5. Seed demo data to create admin profile

### Phase 2: Critical Code Fixes

1. Fix null returns → proper error handling/redirects
2. Fix login page unnecessary profile fetch
3. Remove `ignoreBuildErrors: true` from next.config.ts

### Phase 3: Stabilization

1. Add `SUPABASE_SERVICE_ROLE_KEY` to .env.example
2. Add validation for required env vars at startup
3. Consider adding middleware.ts for auth protection
4. Add health check endpoint that verifies DB connection

---

## 12. Safe Next Actions

**Do NOT implement fixes yet** - This is Phase 0 audit only.

Next steps after audit:

1. Share this report with team
2. Verify Vercel environment variables match audit
3. Check Supabase project has migrations applied
4. Test login in Incognito mode on production URL
5. Plan Phase 1 fixes based on this report

---

## 13. Unknowns / Needs Verification

### Runtime Checks Needed:

1. **Vercel Env Vars** - Need to verify all required vars are set in Vercel project settings
2. **Migration Status** - Need to check if all migrations applied in production Supabase
3. **Actual Error Messages** - Need to see actual Vercel function logs to confirm theories
4. **Profile Data** - Need to verify users have profiles after signup in production
5. **Cloudinary Config** - Need to verify bucket/folder exists

### Questions for Team:

1. Is the same Supabase project used for both local and production?
2. Are migrations applied automatically or manually?
3. Is there a seed script that ran in production?
4. What is the exact error message users see?

---

## 14. Appendix

### Key File Paths:

- Auth: [`lib/authz.ts`](lib/authz.ts), [`lib/supabase/server.ts`](lib/supabase/server.ts)
- Dashboard: [`app/dashboard/page.tsx`](app/dashboard/page.tsx), [`app/dashboard/layout.tsx`](app/dashboard/layout.tsx)
- Login: [`app/login/page.tsx`](app/login/page.tsx), [`app/login/actions.ts`](app/login/actions.ts)
- Blog: [`lib/blog.ts`](lib/blog.ts), [`lib/queries/blog.ts`](lib/queries/blog.ts)
- Database: [`supabase/migrations/`](supabase/migrations/)

### Environment Variables Summary:

```
Required in Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL=https://your-domain.com
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Optional:
- CLOUDINARY_FOLDER
- SUPABASE_SERVICE_ROLE_KEY (for future admin features)
```

### Database Role Types:

- Only `ADMIN` and `AGENT` are supported
- Regular `USER` role will NOT work

### Build Config Note:

- `ignoreBuildErrors: true` is enabled in [`next.config.ts`](next.config.ts) - should be disabled to catch real errors
