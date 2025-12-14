-- Add missing RLS policies for leads update/delete
-- Agents need to be able to update and delete leads for their own listings

-- Allow agents to update leads that belong to their listings
CREATE POLICY leads_owner_update
ON public.leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
);

-- Allow agents to delete leads that belong to their listings
CREATE POLICY leads_owner_delete
ON public.leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_id
      AND l.agent_id = public.current_user_id()
  )
);
