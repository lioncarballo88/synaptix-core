import { runDemo } from '../index';

describe('Demo orchestrations', () => {
  it('should run without throwing (openai example)', async () => {
    // Mock the AgentOrchestrator to avoid real API calls
    jest.mock('../core/agent-orchestrator', () => {
      return {
        AgentOrchestrator: jest.fn().mockImplementation(() => {
          return {
            process: jest.fn().mockResolvedValue({
              output: 'mocked response',
              toolsUsed: [],
              metadata: {},
            }),
          };
        }),
      };
    });
    await expect(runDemo('openai')).resolves.not.toThrow();
  }, 20000);
});
