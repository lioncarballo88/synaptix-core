import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

export class MemoryManager {
  private supabase: SupabaseClient | null = null;
  private openai: OpenAI | null = null;
  private disabled = false;

  constructor() {
    const url = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_KEY ?? '';

    if (url.startsWith('http') && key) {
      this.supabase = createClient(url, key);
    } else {
      console.log('[Memory] Supabase not configured, memory disabled');
      this.disabled = true;
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async store(input: string, output: unknown): Promise<void> {
    if (this.disabled || !this.supabase) return;

    const embedding = await this.embed(input);

    const { error } = await this.supabase.from('agent_memory').insert({
      input,
      output: JSON.stringify(output),
      embedding,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('[Memory] Store error:', error.message);
      this.maybeDisable(error);
    }
  }

  async retrieve(query: string, limit = 5): Promise<Record<string, unknown>[]> {
    if (this.disabled || !this.supabase) return [];

    const embedding = await this.embed(query);
    if (!embedding) return [];

    const { data, error } = await this.supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) {
      console.error('[Memory] Retrieve error:', error.message);
      this.maybeDisable(error);
      return [];
    }

    return (data as Record<string, unknown>[]) ?? [];
  }

  private async embed(text: string): Promise<number[] | null> {
    if (!this.openai) return null;

    try {
      const res = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return res.data[0]?.embedding ?? null;
    } catch (err) {
      console.error('[Memory] Embedding error:', err);
      return null;
    }
  }

  private maybeDisable(error: { code?: string; message?: string }): void {
    if (
      error.code === '42P01' ||
      error.code === 'PGRST205' ||
      error.message?.includes('agent_memory')
    ) {
      this.disabled = true;
      console.warn('[Memory] Disabling memory — agent_memory table unavailable');
    }
  }
}
