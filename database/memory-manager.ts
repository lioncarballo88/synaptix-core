import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

export class MemoryManager {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async store(input: string, output: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('agent_memory')
        .insert({
          input,
          output: JSON.stringify(output),
          timestamp: new Date().toISOString()
        });

      if (error) console.error('[Memory] Store error:', error);
    } catch (err) {
      console.error('[Memory] Store failed:', err);
    }
  }

  async retrieve(query: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Memory] Retrieve error:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[Memory] Retrieve failed:', err);
      return [];
    }
  }
}
