import { LLMProvider } from './llm-provider';
import { MemoryManager } from '../database/memory-manager';
import { Logger, LogLevel } from '../logs/logger';

export interface AgentTask {
  input: string;
  context?: Record<string, any>;
  agentType?: 'researcher' | 'optimizer' | 'general';
  provider?: 'openai' | 'anthropic';
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
  private logger: Logger;

  constructor() {
    this.llm = new LLMProvider();
    this.memory = new MemoryManager();
    this.logger = new Logger();
  }

  async process(task: AgentTask): Promise<AgentResponse> {
    const startTime = Date.now();
    const { input, context, agentType = 'general', provider = 'openai' } = task;
    
    this.logger.log(LogLevel.INFO, 'Processing task', { agentType, provider });
    
    try {
      const relevantMemory = await this.memory.retrieve(input);
      this.logger.log(LogLevel.DEBUG, `Retrieved ${relevantMemory.length} memory entries`);
      
      const tools = this.selectTools(input, agentType);
      this.logger.log(LogLevel.DEBUG, 'Tools selected', { tools });
      
      const systemPrompt = this.buildSystemPrompt(agentType);
      
      const response = await this.llm.complete({
        prompt: input,
        context: { ...context, memory: relevantMemory },
        tools,
        provider,
        systemPrompt
      });
      
      await this.memory.store(input, response);
      
      const duration = Date.now() - startTime;
      this.logger.log(LogLevel.INFO, 'Task completed', { 
        duration, 
        tokensUsed: response.tokensUsed,
        provider: response.provider
      });
      
      return {
        output: response.text,
        toolsUsed: tools,
        confidence: response.confidence,
        metadata: { 
          agentType, 
          provider: response.provider,
          model: response.model,
          timestamp: new Date().toISOString(),
          duration,
          tokensUsed: response.tokensUsed
        }
      };
    } catch (error) {
      this.logger.log(LogLevel.ERROR, 'Task failed', { error: String(error) });
      throw error;
    }
  }

  private selectTools(input: string, agentType: string): string[] {
    const tools: string[] = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('buscar') || lowerInput.includes('search')) {
      tools.push('search');
    }
    
    if (agentType === 'researcher') {
      tools.push('web-scraper', 'knowledge-base', 'document-analyzer');
    }
    
    if (agentType === 'optimizer') {
      tools.push('code-analyzer', 'performance-metrics', 'best-practices-checker');
    }
    
    tools.push('memory-retrieval');
    
    return tools;
  }

  private buildSystemPrompt(agentType: string): string {
    const basePrompt = 'You are an advanced AI assistant with access to various tools and long-term memory.';
    
    const prompts: Record<string, string> = {
      researcher: `${basePrompt} You specialize in research, analysis, and information synthesis. Provide detailed, well-sourced responses.`,
      optimizer: `${basePrompt} You specialize in code optimization, performance analysis, and best practices. Focus on actionable improvements.`,
      general: `${basePrompt} You help with a wide range of tasks, from coding to architecture decisions.`
    };
    
    return prompts[agentType] || prompts.general;
  }
}
