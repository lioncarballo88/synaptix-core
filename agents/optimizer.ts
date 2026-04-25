import { AgentOrchestrator } from '../core/agent-orchestrator';

export class OptimizerAgent {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async optimize(code: string): Promise<string> {
    const response = await this.orchestrator.process({
      input: `Optimize the following code: ${code}`,
      agentType: 'optimizer'
    });

    return response.output;
  }
}
