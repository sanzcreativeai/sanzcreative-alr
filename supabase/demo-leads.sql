-- =============================================
-- SANZCREATIVE ALR — Demo Leads
-- Run AFTER schema.sql and after creating your
-- first super_admin user in Supabase Auth.
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID
-- from auth.users or the profiles table.
-- =============================================

-- First, update your user profile to super_admin role:
-- update public.profiles set role = 'super_admin' where email = 'your@email.com';

insert into public.leads
  (id, client_id, campaign_id, full_name, phone, email, source, status, raw_form_data, created_at, updated_at)
values
  (
    'c0000001-0000-0000-0000-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001',
    'Arjun Mehta', '+91 99001 23456', 'arjun.mehta@gmail.com',
    'Facebook Lead Ad', 'contacted',
    '{"What model are you interested in?": "Citroën C3", "Preferred color": "Platinum Silver", "When are you looking to purchase?": "Within 1 month"}',
    '2025-01-08 11:23:00+00', '2025-01-09 09:00:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000002',
    'a0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001',
    'Priya Nair', '+91 88112 34567', 'priya.nair@yahoo.com',
    'Facebook Lead Ad', 'new',
    '{"What model are you interested in?": "Citroën C3", "Preferred color": "Red Magma", "When are you looking to purchase?": "3–6 months"}',
    '2025-01-09 14:05:00+00', '2025-01-09 14:05:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000003',
    'a0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000002',
    'Kiran Raj', '+91 77223 45678', null,
    'Instagram Lead Ad', 'follow_up',
    '{"Are you interested in a test drive?": "Yes", "Nearest city": "Chennai"}',
    '2025-02-03 09:47:00+00', '2025-02-05 10:00:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000004',
    'a0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000001',
    'Deepa Suresh', '+91 66334 56789', 'deepa.suresh@outlook.com',
    'Facebook Lead Ad', 'converted',
    '{"What model are you interested in?": "Citroën C3", "Preferred color": "Steel Grey", "When are you looking to purchase?": "Within 1 month"}',
    '2025-01-10 16:20:00+00', '2025-01-22 11:00:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000005',
    'a0000001-0000-0000-0000-000000000002',
    'b0000001-0000-0000-0000-000000000003',
    'Meena Krishnan', '+91 55445 67890', 'meena.k@gmail.com',
    'Instagram Lead Ad', 'interested',
    '{"Nail art style preferred": "Gel Extensions", "Occasion": "Valentine Day", "Preferred date": "Feb 12–14"}',
    '2025-02-07 12:10:00+00', '2025-02-08 09:00:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000006',
    'a0000001-0000-0000-0000-000000000002',
    'b0000001-0000-0000-0000-000000000004',
    'Sunitha Pillai', '+91 44556 78901', 'sunitha.pillai@gmail.com',
    'Facebook Lead Ad', 'new',
    '{"Service interested in": "Manicure + Pedicure Combo", "New branch location": "Anna Nagar"}',
    '2025-03-05 10:30:00+00', '2025-03-05 10:30:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000007',
    'a0000001-0000-0000-0000-000000000003',
    'b0000001-0000-0000-0000-000000000005',
    'Venkat Raman', '+91 33667 89012', 'venkat.r@gmail.com',
    'Facebook Lead Ad', 'contacted',
    '{"Budget range": "₹80L – ₹1.2Cr", "Bedrooms required": "3 BHK", "Ready to move in": "Yes", "Looking to book site visit?": "This weekend"}',
    '2025-01-22 08:45:00+00', '2025-01-23 14:00:00+00'
  ),
  (
    'c0000001-0000-0000-0000-000000000008',
    'a0000001-0000-0000-0000-000000000003',
    'b0000001-0000-0000-0000-000000000005',
    'Anjali Devi', '+91 22778 90123', 'anjali.devi@hotmail.com',
    'Facebook Lead Ad', 'not_interested',
    '{"Budget range": "₹60L – ₹80L", "Bedrooms required": "2 BHK", "Ready to move in": "No, under construction preferred", "Looking to book site visit?": "Next week"}',
    '2025-01-25 15:30:00+00', '2025-01-28 10:00:00+00'
  )
on conflict (id) do nothing;
