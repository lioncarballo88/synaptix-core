import { AgentOrchestrator } from '../core/agent-orchestrator';

export class ResearcherAgent {
  private orchestrator: AgentOrchestrator;

  constructor() {
    this.orchestrator = new AgentOrchestrator();
  }

  async research(topic: string): Promise<string> {
    const response = await this.orchestrator.process({
      input: `Research the following topic: ${topic}`,
      agentType: 'researcher'
    });

    return response.output;
  }
}
