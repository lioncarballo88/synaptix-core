import { describe, it, expect, vi } from 'vitest';
import { ResearcherAgent } from '../src/agents/researcher';
import { Provider } from '../src/core/agent-orchestrator';

describe('ResearcherAgent', () => {
  it('should be instantiated', () => {
    const researcher = new ResearcherAgent();
    expect(researcher).toBeInstanceOf(ResearcherAgent);
  });

  it('should research a topic using the orchestrator', async () => {
    const researcher = new ResearcherAgent();

    // Mock the underlying orchestrator.process call
    vi.spyOn(researcher['orchestrator'], 'process').mockResolvedValue({
      output: 'research output mock',
      toolsUsed: [],
      confidence: 1,
      metadata: {},
    });

    const result = await researcher.research('Quantum computing', Provider.OpenAI);
    expect(result).toBe('research output mock');
    expect(researcher['orchestrator'].process).toHaveBeenCalledTimes(1);
  });
});