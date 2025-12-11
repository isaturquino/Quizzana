import { supabase } from "./supabaseClient";

/**
 * Buscar todas as categorias
 */
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categoria")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }

  return data;
};

/**
  Criar uma nova categoria
 */
export const addCategory = async (categoryName) => {
  const { data, error } = await supabase
    .from("categoria")
    .insert([{ nome: categoryName }])
    .select(); // retorna o registro criado

  if (error) {
    console.error("Erro ao adicionar categoria:", error);
    throw error;
  }

  return data[0]; // retorna a categoria criada
};
