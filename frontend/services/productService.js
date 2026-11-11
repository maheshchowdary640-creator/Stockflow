import { supabase } from '@/lib/supabaseClient';

/**
 * Service to manage Products via Supabase PostgreSQL (RLS Enforced)
 */
export const productService = {
  /**
   * Fetch all products for the authenticated user's organization
   */
  async getProducts({ search = '', statusFilter = 'ALL' } = {}) {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      query = query.or(`name.ilike.${term},sku.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let products = data || [];

    // Filter by stock status if requested
    if (statusFilter === 'LOW_STOCK') {
      products = products.filter(
        (p) => p.quantity_on_hand > 0 && p.quantity_on_hand <= (p.low_stock_threshold ?? 5)
      );
    } else if (statusFilter === 'OUT_OF_STOCK') {
      products = products.filter((p) => p.quantity_on_hand === 0);
    } else if (statusFilter === 'IN_STOCK') {
      products = products.filter(
        (p) => p.quantity_on_hand > (p.low_stock_threshold ?? 5)
      );
    }

    return products;
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new product
   */
  async createProduct(productData, organizationId) {
    const payload = {
      organization_id: organizationId,
      name: productData.name.trim(),
      sku: productData.sku.trim().toUpperCase(),
      description: productData.description?.trim() || '',
      quantity_on_hand: parseInt(productData.quantity_on_hand, 10) || 0,
      cost_price:
        productData.cost_price !== '' && productData.cost_price !== null
          ? parseFloat(productData.cost_price)
          : null,
      selling_price:
        productData.selling_price !== '' && productData.selling_price !== null
          ? parseFloat(productData.selling_price)
          : null,
      low_stock_threshold:
        productData.low_stock_threshold !== '' && productData.low_stock_threshold !== null
          ? parseInt(productData.low_stock_threshold, 10)
          : null,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing product
   */
  async updateProduct(id, productData) {
    const payload = {
      name: productData.name.trim(),
      sku: productData.sku.trim().toUpperCase(),
      description: productData.description?.trim() || '',
      quantity_on_hand: parseInt(productData.quantity_on_hand, 10) || 0,
      cost_price:
        productData.cost_price !== '' && productData.cost_price !== null
          ? parseFloat(productData.cost_price)
          : null,
      selling_price:
        productData.selling_price !== '' && productData.selling_price !== null
          ? parseFloat(productData.selling_price)
          : null,
      low_stock_threshold:
        productData.low_stock_threshold !== '' && productData.low_stock_threshold !== null
          ? parseInt(productData.low_stock_threshold, 10)
          : null,
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Quickly update stock quantity
   */
  async updateStockQuantity(id, newQuantity) {
    const qty = Math.max(0, parseInt(newQuantity, 10) || 0);
    const { data, error } = await supabase
      .from('products')
      .update({ quantity_on_hand: qty })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};
