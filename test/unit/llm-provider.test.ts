import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LLMProvider } from '../src/core/llm-provider';
import type { LLMRequest } from '../src/core/llm-provider';

// Mock the external SDKs
vi.mock('@anthropic-ai/sdk', async () => {
  const mockAnthropic = {
    messages: {
      create: vi.fn()
    }
  };
  return { default: mockAnthropic };
});

vi.mock('openai', async () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  };
  return { default: mockOpenAI };
});

describe('LLMProvider', () => {
  let provider: LLMProvider;
  const mockRequest: LLMRequest = {
    prompt: 'Explain quantum computing in simple terms',
    provider: 'openai' as const,
  };

  beforeEach(() => {
    // Ensure clean environment for each test
    vi.clearAllMocks();

    // Set dummy API keys so the constructor creates the clients
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.SUPABASE_URL = ''; // not needed for provider
    process.env.SUPABASE_KEY = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('should be instantiated and create OpenAI client when key is present', () => {
    provider = new LLMProvider();
    expect(provider['openai']).toBeDefined();
    expect(provider['anthropic']).toBeDefined();
  });

  it('should call OpenAI completion and return proper response', async () => {
    // Arrange
    const mockOpenAIResponse = {
      choices: [{ message: { content: 'Quantum computing uses qubits...' } }],
      usage: { total_tokens: 150 },
    };
    ;(provider as any)['openai'].chat.completions.create as any =
      vi.fn().mockResolvedValue(mockOpenAIResponse);

    // Act
    const response = await provider.complete({
      ...mockRequest,
      model: 'gpt-4o-mini',
    });

    // Assert
    expect(response).toEqual({
      text: 'Quantum computing uses qubits...',
      confidence: 0.9,
      tokensUsed: 150,
      provider: 'openai',
      model: 'gpt-4o-mini',
    });
    expect(provider['openai'].chat.completions.create).toHaveBeenCalledTimes(1);
  });

  it('should fall back to Anthropic when OpenAI quota error occurs', async () => {
    // Arrange
    const mockOpenAIError = new Error('Quota exceeded');
    ;(provider as any)['openai'].chat.completions.create as any = vi
      .fn()
      .mockRejectedValue({ status: 429, code: 'insufficient_quota' });

    const mockAnthropicResponse = {
      content: [{ text: 'Fallback answer from Anthropic' }],
      usage: { input_tokens: 50, output_tokens: 30 },
    };
    ;(provider as any)['anthropic'].messages.create as any = vi
      .fn()
      .mockResolvedValue(mockAnthropicResponse);

    // Act
    const response = await provider.complete({
      ...mockRequest,
      provider: 'openai' as const,
    });

    // Assert
    expect(response.text).toBe('Fallback answer from Anthropic');
    expect(response.provider).toBe('anthropic');
    expect(provider['openai'].chat.completions.create).toHaveBeenCalledTimes(1);
    expect(provider['anthropic'].messages.create).toHaveBeenCalledTimes(1);
  });

  it('should throw when no configured provider has an API key', () => {
    // Arrange
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    provider = new LLMProvider();

    // Act & Assert
    return expect(provider.complete(mockRequest)).rejects.toThrow(
      /Provider .* not configured or API key missing/
    );
  });

  it('should create fallback response when all providers fail', async () => {
    // Arrange
    const genericError = new Error('Network error');
    ;(provider as any)['openai'].chat.completions.create as any = vi
      .fn()
      .mockRejectedValue(genericError);
    ;(provider as any)['anthropic'].messages.create as any = vi
      .fn()
      .mockRejectedValue(genericError);

    // Act
    const response = await provider.complete(mockRequest);

    // Assert
    expect(response.provider).toBe('fallback');
    expect(response.confidence).toBe(0);
    expect(response.text).toContain('No pude completar la solicitud');
  });
});