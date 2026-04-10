# Real Estate Lead Platform

A full-stack real estate web application designed for property listing management, lead generation, and content publishing. The platform combines a public-facing property browsing experience with a secure, role-based dashboard for agents and administrators.

## Overview

This project demonstrates a production-style lead generation system tailored for real estate teams.

Public users can browse property listings and submit inquiries, while authenticated agents manage listings and leads through a protected dashboard. Administrators have extended permissions, including blog and content management.

## Key Features

### Public Experience
- Property listing catalog with advanced filtering:
  - City
  - Purpose
  - Price
  - Bedrooms/bathrooms
  - Property type
- Listing detail pages with image galleries
- Lead inquiry form integrated with Supabase

### Dashboard (Authenticated Users)
- Full CRUD operations for listings
- Draft and publish state management
- Lead inbox with:
  - Status tracking
  - Internal notes
  - Filtering
  - Pagination

### Admin Capabilities
- Blog management system:
  - Draft and publish workflow
  - Slug generation
  - Markdown-based content editing

### Core Platform Features
- Role-based access control (`ADMIN`, `AGENT`)
- Row-Level Security (RLS) policies via Supabase
- Cloudinary integration for secure media uploads
- Docker-based local development environment

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend
- Next.js Server Actions
- Route Handlers

### Database & Authentication
- Supabase (PostgreSQL, Auth, RLS)
- SQL migrations in `supabase/migrations`

### Infrastructure & DevOps
- Docker / Docker Compose
- Supabase CLI workflows

### Integrations
- Cloudinary (signed uploads)
- Vercel Analytics

## Architecture Overview

The application is divided into two main areas:

### 1. Public App (`app/(public)`)
Includes:
- Home page
- Listings page
- Listing detail pages
- Contact page
- Blog pages

This area uses published listing and blog data and supports public lead submissions.

### 2. Protected Dashboard (`app/dashboard`)
Includes:
- Listing management
- Lead management
- Admin-only blog operations

Access is restricted to authenticated users, with permissions based on role.

### Core Application Structure

Key business logic is organized under `lib/`:

- `lib/authz.ts` — authentication and authorization
- `lib/queries/*` — data fetching logic
- `lib/actions/*` — server-side mutations
- `lib/supabase/*` — client creation patterns for public, server, and service roles

Database schema and access policies are managed through SQL migrations in `supabase/migrations`.

## Demo

- **Live Demo:** [estatenova.vercel.app](https://estatenova.vercel.app/)

### Suggested Screenshots
1. Public listings page with filters
2. Listing detail page with lead form
3. Dashboard lead inbox and listing management

### Suggested Demo Flow
Create a listing in the dashboard, publish it, view it publicly, submit a lead inquiry, and update the lead status from the dashboard inbox.

## Getting Started

### Prerequisites
- Node.js 20+
- npm
- Supabase project
- Cloudinary account

## Installation

```bash
git clone https://github.com/Shahadat99x/real-estate-lead-platform.git
cd real-estate-lead-platform
npm install
```

## Environment Variables

Create a local environment file from the example file:

```bash
cp .env.example .env.local
```

Set the required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=real-estate-demo
```

Additional variables used by scripts or application metadata:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_REF=
ADMIN_EMAIL=admin@test.com
```

## Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production Build

```bash
npm run build
npm run start
```

## Supabase Migration Workflow

```bash
npm run db:login
npm run db:link
npm run db:push
npm run db:verify
```

Optional demo seed:

```bash
npm run seed:demo
```

## Docker (Local Development)

```bash
docker compose up --build
```

## Project Structure

```text
app/                  # Next.js routes (public pages, dashboard, API handlers)
components/           # Reusable UI and feature components
lib/                  # Auth, Supabase clients, server actions, data queries
supabase/
  migrations/         # SQL schema and RLS migrations
  README.md           # Supabase workflow notes
scripts/              # DB verification and demo seed scripts
docs/                 # Audit/fix documentation phases
public/               # Static assets
Dockerfile
docker-compose.yml
```

## Core Workflows

### Authentication
- Email/password sign-in via Supabase
- Protected dashboard routes require authentication
- Role checks restrict admin-only features

### Listing Flow
- Agent or admin creates and edits listings in the dashboard
- Listings can be saved as draft or published
- Published listings appear on public pages

### Lead Flow
- Visitor submits an inquiry from a listing detail page
- Lead data is saved to the database
- Agent or admin reviews and updates lead status and notes in the dashboard

### Blog Flow (Admin)
- Admin creates markdown-based blog drafts
- Publish and unpublish controls determine public visibility

### Media Flow
- Signed Cloudinary upload parameters are served through API routes
- Uploaded image references are stored and rendered in the UI

## Engineering Highlights

- Role-aware server-side authorization (`ADMIN` vs `AGENT`)
- RLS-based access control in Supabase
- Clear separation between query and mutation layers
- Migration-first schema evolution
- Practical dashboard UX patterns with filtering, pagination, and status workflows
- Dockerized local development setup
- Health route and audit documentation for operational visibility

## Challenges and Trade-offs

- No CI workflow is currently configured in `.github/workflows`
- The root-level README was previously missing
- `next.config.ts` currently ignores TypeScript build errors (`ignoreBuildErrors: true`), which is useful for rapid iteration but not ideal for production
- Some marketing and branding content appears to be placeholder text and should be updated before deployment

## Roadmap

- Add CI checks for type safety, build validation, and testing
- Enforce strict TypeScript builds
- Add seed and reset scripts for easier onboarding
- Add end-to-end tests for listing and lead workflows
- Improve observability for server actions and API routes
- Publish a deployment guide for Vercel, Supabase, and Cloudinary

## Author

- **GitHub:** [@Shahadat99x](https://github.com/Shahadat99x)
- **Portfolio:** [www.dhossain.com](https://www.dhossain.com)
- **LinkedIn:** [shahadat-ai](https://linkedin.com/in/shahadat-ai)
