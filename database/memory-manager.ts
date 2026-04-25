import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

export class MemoryManager {
  private supabase: SupabaseClient | null = null;
  private memoryDisabled = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';
    
    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.log('[Memory] Supabase not configured, memory features disabled');
    }
  }

  async store(input: string, output: unknown): Promise<void> {
    if (!this.supabase || this.memoryDisabled) return;
    
    try {
      const { error } = await this.supabase
        .from('agent_memory')
        .insert({
          input,
          output: JSON.stringify(output),
        timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('[Memory] Store error:', error);
        this.handleSupabaseError(error);
      }
    } catch (err) {
      console.error('[Memory] Store failed:', err);
    }
  }

  async retrieve(_query: string, limit: number = 5): Promise<Record<string, unknown>[]> {
    if (!this.supabase || this.memoryDisabled) return [];
    
    try {
      const { data, error } = await this.supabase
        .from('agent_memory')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Memory] Retrieve error:', error);
        this.handleSupabaseError(error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[Memory] Retrieve failed:', err);
      return [];
    }
  }

  private handleSupabaseError(error: unknown): void {
    const errorRecord = (error && typeof error === 'object') ? (error as Record<string, unknown>) : {};
    const code = errorRecord.code;
    const message = String(errorRecord.message || '');

    if (
      code === 'PGRST205' ||
      code === '42P01' ||
      message.includes('agent_memory') ||
      message.includes('schema cache')
    ) {
      this.memoryDisabled = true;
      console.warn('[Memory] Disabling memory for this session because the agent_memory table is unavailable.');
    }
  }
}
