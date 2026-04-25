import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

export interface LLMRequest {
  prompt: string;
  context?: Record<string, any>;
  tools?: string[];
  model?: string;
  provider?: 'openai' | 'anthropic';
  systemPrompt?: string;
}

export interface LLMResponse {
  text: string;
  confidence: number;
  tokensUsed: number;
  provider: string;
  model: string;
}

export class LLMProvider {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const { 
      prompt, 
      context, 
      tools = [], 
      provider = 'openai',
      systemPrompt = 'You are a helpful AI assistant specialized in software engineering and architecture.'
    } = request;
    
    console.log(`[LLM] Provider: ${provider}`);
    console.log(`[LLM] Processing: ${prompt.substring(0, 100)}...`);
    console.log(`[LLM] Tools available: ${tools.join(', ')}`);
    
    try {
      if (provider === 'openai' && this.openai) {
        return await this.completeWithOpenAI(prompt, systemPrompt, context, tools);
      } else if (provider === 'anthropic' && this.anthropic) {
        return await this.completeWithAnthropic(prompt, systemPrompt, context, tools);
      } else {
        throw new Error(`Provider ${provider} not configured or API key missing`);
      }
    } catch (error: any) {
      if (this.isQuotaLikeError(error)) {
        console.warn('[LLM] All configured providers are unavailable. Returning graceful fallback response.');
        return this.createFallbackResponse(prompt, provider, error);
      }

      throw error;
    }
  }

  private async completeWithOpenAI(
    prompt: string, 
    systemPrompt: string,
    context?: Record<string, any>,
    tools?: string[]
  ): Promise<LLMResponse> {
    const model = 'gpt-4o-mini';
    
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: this.buildPromptWithContext(prompt, context, tools) }
    ];

    try {
      const response = await this.openai!.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      return {
        text: response.choices[0]?.message?.content || '',
        confidence: 0.9,
        tokensUsed: response.usage?.total_tokens || 0,
        provider: 'openai',
        model
      };
    } catch (error: any) {
      const status = error?.status;
      const code = error?.code;

      if ((status === 429 || code === 'insufficient_quota') && this.anthropic) {
        console.warn('[LLM] OpenAI quota exhausted. Falling back to Anthropic.');
        return await this.completeWithAnthropic(prompt, systemPrompt, context, tools);
      }

      throw error;
    }
  }

  private async completeWithAnthropic(
    prompt: string,
    systemPrompt: string,
    context?: Record<string, any>,
    tools?: string[]
  ): Promise<LLMResponse> {
    const model = 'claude-3-5-sonnet-20241022';

    const response = await this.anthropic!.messages.create({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { 
          role: 'user', 
          content: this.buildPromptWithContext(prompt, context, tools) 
        }
      ]
    });

    const textContent = response.content[0];
    const text = textContent && textContent.type === 'text' ? textContent.text : '';

    return {
      text,
      confidence: 0.9,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      provider: 'anthropic',
      model
    };
  }

  private buildPromptWithContext(
    prompt: string, 
    context?: Record<string, any>,
    tools?: string[]
  ): string {
    let fullPrompt = prompt;

    if (tools && tools.length > 0) {
      fullPrompt += `\n\nAvailable tools: ${tools.join(', ')}`;
    }

    if (context) {
      fullPrompt += `\n\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    return fullPrompt;
  }

  private isQuotaLikeError(error: any): boolean {
    const status = error?.status;
    const code = error?.code;
    const message = String(error?.message || JSON.stringify(error || ''));

    return (
      status === 429 ||
      code === 'insufficient_quota' ||
      message.toLowerCase().includes('credit balance is too low') ||
      message.toLowerCase().includes('quota')
    );
  }

  private createFallbackResponse(
    prompt: string,
    provider: string,
    error: any
  ): LLMResponse {
    return {
      text:
        `No pude completar la solicitud porque no hay cuota disponible en los proveedores configurados. ` +
        `Proveedor solicitado: ${provider}. ` +
        `Detalle: ${String(error?.message || 'quota unavailable')}. ` +
        `Prompt original: ${prompt.substring(0, 120)}`,
      confidence: 0,
      tokensUsed: 0,
      provider: 'fallback',
      model: 'none'
    };
  }
}
