import * as dotenv from 'dotenv';
dotenv.config();

export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  tools?: string[];
  model?: string;
}

export interface LLMResponse {
  text: string;
  confidence: number;
  tokensUsed?: number;
}

export class LLMProvider {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const { prompt, context, tools = [] } = request;
    
    // Aquí integrarías con OpenAI, Anthropic, etc.
    // Por ahora, estructura básica
    
    console.log(`[LLM] Processing: ${prompt}`);
    console.log(`[LLM] Tools available: ${tools.join(', ')}`);
    
    // Simulación de respuesta
    return {
      text: `Processed: ${prompt}`,
      confidence: 0.95,
      tokensUsed: 150
    };
  }
}
