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
      data: data || [],
      error
    };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) {
      return { data: [], error };
    }

    const categories = [
      ...new Set(data.map(item => item.category))
    ];

    return {
      data: categories,
      error: null
    };
  }
};