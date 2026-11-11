-- ====================================================================
-- StockFlow SaaS Inventory Management System
-- Initial Migration: Organizations, Profiles, Products, Settings, RLS
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations Table
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Table
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

    CONSTRAINT uq_organization_sku UNIQUE (organization_id, sku)
);

-- Organization Settings Table
CREATE TABLE public.organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    default_low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (default_low_stock_threshold >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
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

-- Automated SKU Normalization
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

-- Automated New User Provisioning (Auth Trigger)
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

    INSERT INTO public.organizations (name, owner_id)
    VALUES (org_name, NEW.id)
    RETURNING id INTO new_org_id;

    INSERT INTO public.profiles (id, organization_id, name)
    VALUES (NEW.id, new_org_id, user_name);

    INSERT INTO public.organization_settings (organization_id, default_low_stock_threshold)
    VALUES (new_org_id, 5);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to resolve the calling user's organization_id
CREATE OR REPLACE FUNCTION public.get_auth_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Organizations RLS
CREATE POLICY "Users can view their own organization"
ON public.organizations FOR SELECT
TO authenticated
USING (id = public.get_auth_organization_id());

CREATE POLICY "Organization owners can update their organization"
ON public.organizations FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Products RLS
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

-- Organization Settings RLS
CREATE POLICY "Users can view settings for their organization"
ON public.organization_settings FOR SELECT
TO authenticated
USING (organization_id = public.get_auth_organization_id());

CREATE POLICY "Users can update settings for their organization"
ON public.organization_settings FOR UPDATE
TO authenticated
USING (organization_id = public.get_auth_organization_id())
WITH CHECK (organization_id = public.get_auth_organization_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
