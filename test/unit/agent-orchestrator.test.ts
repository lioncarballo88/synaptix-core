import { describe, it, expect, vi } from 'vitest';
import { AgentOrchestrator } from '../src/core/agent-orchestrator';
import { Provider } from '../src/core/agent-orchestrator';
import { LLMRequest } from '../src/core/llm-provider';

describe('AgentOrchestrator', () => {
  it('should be instantiated', () => {
    const orchestrator = new AgentOrchestrator();
    expect(orchestrator).toBeInstanceOf(AgentOrchestrator);
  });

  it('should process a task with OpenAI provider', async () => {
    const orchestrator = new AgentOrchestrator();
    vi.spyOn(orchestrator, 'process').mockResolvedValue({
      output: 'mocked output',
      toolsUsed: [],
      confidence: 1,
      metadata: {},
    });

    const result = await orchestrator.process({
      input: 'Test input',
      agentType: Provider.OpenAI,
      task: 'test-task',
    });

    expect(result.output).toBe('mocked output');
  });
});