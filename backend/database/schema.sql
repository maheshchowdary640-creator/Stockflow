-- ====================================================================
-- StockFlow SaaS Inventory Management System
-- Database Schema & Security Migration for Supabase PostgreSQL
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. Clean Up Existing Objects (if rebuilding)
-- ====================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS tr_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS tr_organization_settings_updated_at ON public.organization_settings;
DROP TRIGGER IF EXISTS tr_normalize_product_sku ON public.products;
DROP FUNCTION IF EXISTS public.normalize_product_sku();
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.get_auth_organization_id();

DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.organization_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- ====================================================================
-- 3. Create Tables
-- ====================================================================

-- 3.1 Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Profiles Table (Extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    description TEXT DEFAULT '',
    quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    cost_price NUMERIC(12, 2) CHECK (cost_price >= 0),
    selling_price NUMERIC(12, 2) CHECK (selling_price >= 0),
    low_stock_threshold INTEGER CHECK (low_stock_threshold >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Compound unique constraint on (organization_id, sku)
    -- Enforces SKU uniqueness strictly per organization, allowing different orgs to use the same SKU
    CONSTRAINT uq_organization_sku UNIQUE (organization_id, sku)
);

-- 3.4 Organization Settings Table
CREATE TABLE public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    default_low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (default_low_stock_threshold >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- 4. Triggers & Automation Functions
-- ====================================================================

-- 4.1 Automated updated_at Timestamp Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tr_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4.2 Automated SKU Normalization (Uppercase and Trim)
CREATE OR REPLACE FUNCTION public.normalize_product_sku()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sku := UPPER(TRIM(NEW.sku));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_normalize_product_sku
BEFORE INSERT OR UPDATE OF sku ON public.products
FOR EACH ROW EXECUTE FUNCTION public.normalize_product_sku();

-- 4.3 Automated New User Provisioning (Auth Trigger)
-- When a user registers via Supabase Auth, automatically provision:
-- 1. An Organization owned by the user
-- 2. A Profile linking auth.users to the new Organization
-- 3. Default Organization Settings (default_low_stock_threshold = 5)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_name TEXT;
    org_name TEXT;
BEGIN
    user_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
    );

    org_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'organization_name'), ''),
        user_name || '''s Organization'
    );

    -- 1. Create Organization
    INSERT INTO public.organizations (name, owner_id)
    VALUES (org_name, NEW.id)
    RETURNING id INTO new_org_id;

    -- 2. Create User Profile
    INSERT INTO public.profiles (id, organization_id, name)
    VALUES (NEW.id, new_org_id, user_name);

    -- 3. Create Default Organization Settings
    INSERT INTO public.organization_settings (organization_id, default_low_stock_threshold)
    VALUES (new_org_id, 5);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- 5. Row Level Security (RLS) & Tenant Isolation Policies
-- ====================================================================

-- 5.1 Helper function to resolve the calling user's organization_id
CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- 5.2 Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 5.3 Organizations RLS Policies
CREATE POLICY "Users can view their own organization"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_auth_organization_id());

CREATE POLICY "Organization owners can update their organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- 5.4 Products RLS Policies (Tenant Isolation)
CREATE POLICY "Users can view products within their organization"
ON public.products FOR SELECT
TO authenticated
USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can insert products into their organization"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can update products within their organization"
ON public.products FOR UPDATE
TO authenticated
USING (organization_id = public.get_auth_organization_id())
WITH CHECK (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can delete products within their organization"
ON public.products FOR DELETE
TO authenticated
USING (organization_id = public.get_auth_organization_id());

-- 5.5 Organization Settings RLS Policies
CREATE POLICY "Users can view settings for their organization"
ON public.organization_settings FOR SELECT
TO authenticated
USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can update settings for their organization"
ON public.organization_settings FOR UPDATE
TO authenticated
USING (organization_id = public.get_auth_organization_id())
WITH CHECK (organization_id = public.get_auth_organization_id());

-- ====================================================================
-- 6. Indexes for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
