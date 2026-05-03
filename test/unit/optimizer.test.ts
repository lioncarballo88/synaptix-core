import { describe, it, expect, vi } from 'vitest';
import { OptimizerAgent } from '../src/agents/optimizer';
import { Provider } from '../src/core/agent-orchestrator';

describe('OptimizerAgent', () => {
  it('should be instantiated', () => {
    const optimizer = new OptimizerAgent();
    expect(optimizer).toBeInstanceOf(OptimizerAgent);
  });

  it('should optimize code using the orchestrator', async () => {
    const optimizer = new OptimizerAgent();

    // Mock the underlying orchestrator.process call
    vi.spyOn(optimizer['orchestrator'], 'process').mockResolvedValue({
      output: 'optimized code mock',
      toolsUsed: [],
      confidence: 1,
      metadata: {},
    });

    const result = await optimizer.optimize('console.log(\"test\");', Provider.OpenAI);
    expect(result).toBe('optimized code mock');
    expect(optimizer['orchestrator'].process).toHaveBeenCalledTimes(1);
  });
});