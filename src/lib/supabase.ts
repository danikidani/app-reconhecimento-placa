import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente para habilitar funcionalidades completas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface QueryLog {
  id?: string;
  plate: string;
  timestamp: string;
  user_id?: string;
  result_data?: any;
}

// Função para registrar consulta
export async function logQuery(plate: string, resultData: any) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('Supabase não configurado - log não salvo');
      return null;
    }

    const { data, error } = await supabase
      .from('query_logs')
      .insert([
        {
          plate,
          timestamp: new Date().toISOString(),
          result_data: resultData,
        },
      ])
      .select();

    if (error) {
      console.error('Erro ao registrar consulta:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao registrar consulta:', error);
    return null;
  }
}

// Função para buscar histórico de consultas
export async function getQueryHistory(limit: number = 10) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return [];
    }

    const { data, error } = await supabase
      .from('query_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}
