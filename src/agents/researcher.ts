import { AgentOrchestrator, AgentType, Provider } from '../core/agent-orchestrator';

export class ResearcherAgent {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async research(topic: string, provider: Provider = Provider.OpenAI): Promise<string> {
    const response = await this.orchestrator.process({
      input: `Research the following topic: ${topic}`,
      agentType: AgentType.Researcher,
      provider
    });

    return response.output;
  }
}
