-- Verification script for production admin role issues
-- Run this in Supabase SQL Editor to diagnose and fix admin access problems

-- ============================================
-- CHECK 1: Verify admin user exists and has correct role
-- ============================================
-- Replace 'admin@example.com' with your actual admin email

select 
  p.id as user_id,
  p.email,
  p.role,
  p.created_at as profile_created,
  u.email_confirmed_at,
  u.created_at as auth_created
from public.profiles p
join auth.users u on u.id = p.id
where p.email = 'admin@example.com';

-- ============================================
-- CHECK 2: List all profiles with their roles
-- ============================================

select 
  id,
  email,
  role,
  created_at
from public.profiles
order by created_at desc;

-- ============================================
-- CHECK 3: Fix - manually set admin role
-- ============================================
-- Run this to fix: UPDATE public.profiles SET role = 'ADMIN' WHERE email = 'admin@example.com';

-- ============================================
-- CHECK 4: Verify is_admin() function works
-- ============================================
-- This should return true for admin user

select 
  public.is_admin() as is_current_user_admin;

-- ============================================
-- CHECK 5: Verify RLS policies are in place
-- ============================================

select 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
and tablename in ('profiles', 'listings', 'leads', 'agents', 'listing_images')
order by tablename, policyname;

-- ============================================
-- CHECK 6: Test admin access (as admin user)
-- ============================================
-- As admin user, you should be able to see all listings

select count(*) as total_listings from public.listings;

-- ============================================
-- QUICK FIX: If no admin exists, create one
-- ============================================
-- First, find a user to promote:
-- select id, email from auth.users where email = 'your-admin-email';

-- Then update their role:
-- update public.profiles set role = 'ADMIN' where email = 'your-admin-email';
