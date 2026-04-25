import { afterEach, describe, expect, it, vi } from 'vitest';
import { AgentOrchestrator } from '../core/agent-orchestrator';
import { runDemo } from '../index';

describe('Demo orchestrations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs openai example without throwing', async () => {
    const processSpy = vi
      .spyOn(AgentOrchestrator.prototype, 'process')
      .mockResolvedValue({
        output: 'mocked response',
        toolsUsed: [],
        confidence: 1,
        metadata: {},
      });

    await expect(runDemo('openai')).resolves.not.toThrow();
    expect(processSpy).toHaveBeenCalledTimes(1);
  });

  it('runs all examples without throwing', async () => {
    const processSpy = vi
      .spyOn(AgentOrchestrator.prototype, 'process')
      .mockResolvedValue({
        output: 'mocked response',
        toolsUsed: [],
        confidence: 1,
        metadata: {},
      });

    await expect(runDemo('all')).resolves.not.toThrow();
    expect(processSpy).toHaveBeenCalledTimes(2);
  });
});
