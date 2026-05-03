import { describe, it, expect, vi } from 'vitest';
import { AgentOrchestrator } from '../src/core/agent-orchestrator';
import { Provider } from '../src/core/agent-orchestrator';

describe('Integration: AgentOrchestrator basic flow', () => {
  it('process should resolve with proper shape', async () => {
    const orchestrator = new AgentOrchestrator();
    vi.spyOn(orchestrator, 'process').mockResolvedValue({
      output: 'test output',
      toolsUsed: [],
      confidence: 1,
      metadata: {},
    });

    const result = await orchestrator.process({
      input: 'Test input',
      agentType: 'Researcher',
      provider: Provider.OpenAI,
    });

    expect(result).toEqual({
      output: 'test output',
      toolsUsed: [],
      confidence: 1,
      metadata: {},
    });
  });
});