import { AgentOrchestrator, AgentType, Provider } from '../core/agent-orchestrator';

export class OptimizerAgent {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async optimize(code: string, provider: Provider = Provider.OpenAI): Promise<string> {
    const response = await this.orchestrator.process({
      input: `Optimize the following code: ${code}`,
      agentType: AgentType.Optimizer,
      provider
    });

    return response.output;
  }
}
