import { MemoryManager } from '../database/memory-manager';
import { Logger, LogLevel } from '../logs/logger';
import { LLMProvider } from './llm-provider';

// Enums for agent types and providers
export enum AgentType {
  Researcher = 'researcher',
  Optimizer = 'optimizer',
  General = 'general'
}

export enum Provider {
  OpenAI = 'openai',
  Anthropic = 'anthropic'
}

// Type for tool names
/**
 * Context type for task metadata.
 */
export type Context = Record<string, unknown>;

export type ToolName = 'search' | 'web-scraper' | 'knowledge-base' | 'document-analyzer' | 'code-analyzer' | 'performance-metrics' | 'best-practices-checker' | 'memory-retrieval';

// Updated interface with enums
export interface AgentTask {
  input: string;
  context?: Context;
  agentType?: AgentType;
  provider?: Provider;
}

export interface AgentResponse {
  output: string;
  toolsUsed: ToolName[];
  confidence: number;
  metadata?: Context;
}

/**
 * Orchestrates agent tasks using LLM, memory, and logging.
 *
 * @remarks
 * This class handles the processing of agent tasks, including selecting tools,
 * building system prompts, and managing responses. It also tracks metrics and
 * ensures proper resource cleanup.
 */
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
    const { input, context, agentType = AgentType.General, provider = Provider.OpenAI } = task;
    
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

  private selectTools(input: string, agentType: AgentType): ToolName[] {
    const tools: ToolName[] = [];
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('buscar') || lowerInput.includes('search')) {
      tools.push('search');
    }
    
    if (agentType === AgentType.Researcher) {
      tools.push('web-scraper', 'knowledge-base', 'document-analyzer');
    }
    
    if (agentType === AgentType.Optimizer) {
      tools.push('code-analyzer', 'performance-metrics', 'best-practices-checker');
    }
    
    tools.push('memory-retrieval');
    
    return tools;
  }

  private buildSystemPrompt(agentType: AgentType): string {
    const basePrompt = 'You are an advanced AI assistant with access to various tools and long-term memory.';
    
    if (agentType === AgentType.Researcher) {
      return `${basePrompt} You specialize in research, analysis, and information synthesis. Provide detailed, well-sourced responses.`;
    }
    
    if (agentType === AgentType.Optimizer) {
      return `${basePrompt} You specialize in code optimization, performance analysis, and best practices. Focus on actionable improvements.`;
    }
    
    return `${basePrompt} You help with a wide range of tasks, from coding to architecture decisions.`;
  }
}
