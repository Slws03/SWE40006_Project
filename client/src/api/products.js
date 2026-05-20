import { supabase } from "../supabase";

export const productsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    return { data, error };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    return { data, error };
  },

  getCategories: async () => {
    const { data, error } = await supabase
      .from("products")
      .select("category");

    if (error) {
      return { data: [], error };
    }

    const categories = [...new Set(data.map(item => item.category))];

    return { data: categories, error: null };
  }
};