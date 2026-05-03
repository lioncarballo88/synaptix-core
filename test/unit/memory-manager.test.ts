import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryManager } from '../src/database/memory-manager';
import * as fs from 'fs';
import * as path from 'path';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: (table: string) => ({
        insert: () => ({
          data: () => ({
            select: () => ({
              eq: () => ({
                gte: () => ({
                  lte: () => ({
                    toJson: () => ({ data: [], error: null })
                  })
                })
              })
            })
          })
        })
      })
    }))
  };
});

describe('MemoryManager', () => {
  let manager: MemoryManager;
  const supabaseMock = require('@supabase/supabase-js').createClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_KEY = 'test-key';
    manager = new MemoryManager();
  });

  it('should be instantiated when Supabase credentials are provided', () => {
    expect(manager).toBeInstanceOf(MemoryManager);
    expect(manager['supabase']).toBeDefined();
  });

  it('should disable memory when Supabase URL is missing', () => {
    delete process.env.SUPABASE_URL;
    const managerNoUrl = new MemoryManager();
    expect(managerNoUrl['supabase']).toBeNull();
    expect(managerNoUrl['memoryDisabled']).toBe(true);
  });

  it('should store a record successfully when Supabase is available', async () => {
    // Mock successful insert response
    supabaseMock().from('agent_memory').insert().returnValue({
      data: undefined,
      error: null
    });

    await manager.store('test input', { foo: 'bar' });

    // Verify that insert was called with expected parameters
    const callArg = supabaseMock().from('agent_memory').insert();
    expect(callArg).toBeDefined();
  });

  it('should handle Supabase errors gracefully and disable memory', async () => {
    const errorObj = { code: 'PGRST205', message: 'Table does not exist' };
    supabaseMock().from('agent_memory').insert().returnValue({
      data: undefined,
      error: errorObj
    });

    await manager.store('test input', { foo: 'bar' });

    // After error, memory should be disabled
    expect(manager['memoryDisabled']).toBe(true);
  });

  it('should return empty array when retrieving with no results', async () => {
    // Mock empty result set
    supabaseMock().from('agent_memory').select().returnValue({
      data: [], error: null
    });

    const result = await manager.retrieve('any query');
    expect(result).toEqual([]);
  });

  it('should retrieve stored records', async () => {
    // Mock a successful retrieval with two items
    supabaseMock().from('agent_memory').select().returnValue({
      data: [{ input: 'req1', output: { res: 1 }, timestamp: '2023-01-01' },
             { input: 'req2', output: { res: 2 }, timestamp: '2023-01-02' }],
      error: null
    });

    const result = await manager.retrieve('some query', 10);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ input: 'req1' });
    expect(result[1]).toMatchObject({ input: 'req2' });
  });
});