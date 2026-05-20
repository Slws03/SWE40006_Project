import { supabase } from '../supabase';

export const productsApi = {

  getAll: async (params = {}) => {
    let query = supabase
      .from('products')
      .select('*');

    if (params.category && params.category !== 'All') {
      query = query.eq('category', params.category);
    }

    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    const { data, error } = await query;

    return {
      products: data || [],
      categories: [...new Set((data || []).map(item => item.category))],
      error
    };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    return {
      product: data,
      error
    };
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    return {
      categories: [...new Set((data || []).map(item => item.category))],
      error
    };
  }

};