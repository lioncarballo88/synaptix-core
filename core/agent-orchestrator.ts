import { LLMProvider } from './llm-provider';
import { MemoryManager } from '../database/memory-manager';

export interface AgentTask {
  input: string;
  context?: Record<string, any>;
  agentType?: 'researcher' | 'optimizer' | 'general';
}

export interface AgentResponse {
  output: string;
  toolsUsed: string[];
  confidence: number;
  metadata?: Record<string, any>;
}

export class AgentOrchestrator {
  private llm: LLMProvider;
  private memory: MemoryManager;

  constructor() {
    this.llm = new LLMProvider();
    this.memory = new MemoryManager();
  }

  async process(task: AgentTask): Promise<AgentResponse> {
    const { input, context, agentType = 'general' } = task;
    
    // Recuperar contexto relevante de memoria
    const relevantMemory = await this.memory.retrieve(input);
    
    // Decidir qué herramientas usar
    const tools = this.selectTools(input, agentType);
    
    // Ejecutar el agente
    const response = await this.llm.complete({
      prompt: input,
      context: { ...context, memory: relevantMemory },
      tools
    });
    
    // Guardar en memoria
    await this.memory.store(input, response);
    
    return {
      output: response.text,
      toolsUsed: tools,
      confidence: response.confidence,
      metadata: { agentType, timestamp: new Date().toISOString() }
    };
  }

  private selectTools(input: string, agentType: string): string[] {
    const tools: string[] = [];
    
    if (input.toLowerCase().includes('buscar') || input.toLowerCase().includes('search')) {
      tools.push('search');
    }
    
    if (agentType === 'researcher') {
      tools.push('web-scraper', 'knowledge-base');
    }
    
    if (agentType === 'optimizer') {
      tools.push('code-analyzer', 'performance-metrics');
    }
    
    return tools;
  }
}
