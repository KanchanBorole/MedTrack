/*
# Medicine Tracker — Core Schema

## Purpose
A platform connecting individuals, NGOs, and hospitals to reduce medicine waste.
Users list surplus medicines for donation; NGOs/hospitals post medicine needs;
expiry-date reminders help everyone use medicines before they expire.

## Tables

1. `profiles`
   - Extends auth.users with app-specific data.
   - `id` uuid PK, matches auth.users id.
   - `full_name` text — display name or org name.
   - `role` text — 'user' | 'ngo' | 'hospital'.
   - `phone` text — contact number.
   - `address` text — street address.
   - `city` text — city for filtering.
   - `latitude` / `longitude` numeric — for map integration.
   - `description` text — about the user/org.
   - `created_at` timestamptz.

2. `medicines`
   - Central listing table for donations AND requests.
   - `id` uuid PK.
   - `owner_id` uuid FK → profiles, defaults to auth.uid().
   - `name` text — brand/common name.
   - `generic_name` text — generic/active ingredient.
   - `category` text — e.g. Pain Relief, Antibiotics, Vitamins.
   - `quantity` integer — units available or needed.
   - `expiry_date` date — null for requests.
   - `listing_type` text — 'donate' | 'request'.
   - `status` text — 'available' | 'reserved' | 'fulfilled'.
   - `notes` text — condition, storage, urgency.
   - `created_at` timestamptz.

## Security
- RLS enabled on both tables.
- Profiles: each authenticated user reads/updates their own row; all authenticated
  users can read profiles (directory of orgs for map/contact).
- Medicines: all authenticated users can read (browse marketplace); only the owner
  can insert/update/delete their own listings.
- Owner columns default to auth.uid() so inserts that omit owner_id succeed.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','ngo','hospital')),
  phone text,
  address text,
  city text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
  ON profiles FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  generic_name text,
  category text,
  quantity integer NOT NULL DEFAULT 1,
  expiry_date date,
  listing_type text NOT NULL DEFAULT 'donate' CHECK (listing_type IN ('donate','request')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','fulfilled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "medicines_select_all" ON medicines;
CREATE POLICY "medicines_select_all"
  ON medicines FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "medicines_insert_own" ON medicines;
CREATE POLICY "medicines_insert_own"
  ON medicines FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "medicines_update_own" ON medicines;
CREATE POLICY "medicines_update_own"
  ON medicines FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "medicines_delete_own" ON medicines;
CREATE POLICY "medicines_delete_own"
  ON medicines FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_medicines_owner ON medicines(owner_id);
CREATE INDEX IF NOT EXISTS idx_medicines_listing_type ON medicines(listing_type);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines(category);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
