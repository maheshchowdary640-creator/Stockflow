import { supabase } from '@/lib/supabaseClient';

export const organizationService = {
  /**
   * Get organization settings by organization ID
   */
  async getSettings(organizationId) {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return (
      data || {
        organization_id: organizationId,
        default_low_stock_threshold: 5,
      }
    );
  },

  /**
   * Update or upsert organization settings
   */
  async updateSettings(organizationId, settings) {
    const payload = {
      organization_id: organizationId,
      default_low_stock_threshold: Math.max(
        0,
        parseInt(settings.default_low_stock_threshold, 10) || 5
      ),
    };

    const { data, error } = await supabase
      .from('organization_settings')
      .upsert(payload, { onConflict: 'organization_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update organization name
   */
  async updateOrganization(organizationId, { name }) {
    const { data, error } = await supabase
      .from('organizations')
      .update({ name: name.trim() })
      .eq('id', organizationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId, { name }) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ name: name.trim() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
