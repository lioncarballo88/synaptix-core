# Synaptix Core

**AI Orchestration Framework** para gestión inteligente de agentes con memoria de largo plazo.

## 🚀 Características

- **Orquestación Multi-Agente**: Sistema modular para coordinar diferentes tipos de agentes (Researcher, Optimizer)
- **Memoria Vectorial**: Integración con Supabase para persistencia y recuperación contextual
- **LLM Agnóstico**: Soporte para múltiples proveedores (OpenAI, Anthropic, modelos locales)
- **Observabilidad**: Sistema de logs para rastrear decisiones y rendimiento de agentes
- **TypeScript**: Tipado fuerte para desarrollo escalable

## 📁 Estructura del Proyecto

```
synaptix-core/
├── agents/          # Agentes especializados
│   ├── researcher.ts
│   └── optimizer.ts
├── core/            # Motor de orquestación
│   ├── agent-orchestrator.ts
│   └── llm-provider.ts
├── database/        # Gestión de memoria
│   └── memory-manager.ts
├── functions/       # Lógica de automatización
├── logs/            # Sistema de observabilidad
└── README.md
```

## 🛠️ Instalación

```bash
npm install
```

## ⚙️ Configuración

1. Copia `.env.example` a `.env`
2. Configura tus credenciales:
   - `SUPABASE_URL` y `SUPABASE_KEY`
   - `OPENAI_API_KEY` o `ANTHROPIC_API_KEY`

## 🎯 Uso

### Prueba Rápida

```bash
npm run test
```

### Uso Básico

```typescript
import { AgentOrchestrator } from './core/agent-orchestrator';

const orchestrator = new AgentOrchestrator();

// Con OpenAI
const response = await orchestrator.process({
  input: "Analiza las mejores prácticas de arquitectura de microservicios",
  agentType: "researcher",
  provider: "openai"
});

// Con Anthropic Claude
const response2 = await orchestrator.process({
  input: "Optimiza este código",
  agentType: "optimizer",
  provider: "anthropic"
});

console.log(response.output);
```

### Modelos Soportados

- **OpenAI**: `gpt-4o-mini` (configurable)
- **Anthropic**: `claude-3-5-sonnet-20241022` (configurable)

## 🧠 Arquitectura

El sistema utiliza un patrón de orquestación donde:

1. **Input** → El usuario envía una tarea
2. **Tool Selection** → El orquestador decide qué herramientas usar
3. **LLM Processing** → Se ejecuta el modelo con contexto relevante
4. **Memory Storage** → Se guarda el resultado en Supabase
5. **Output** → Se devuelve la respuesta procesada

## 📊 Observabilidad

Los logs se almacenan en `/logs` con información sobre:
- Decisiones de herramientas
- Tiempos de respuesta
- Tokens utilizados
- Nivel de confianza

## 🔮 Roadmap

- [ ] Integración con LangSmith para tracing
- [ ] Soporte para embeddings vectoriales
- [ ] API REST para acceso externo
- [ ] Dashboard de métricas en tiempo real

## 📝 Licencia

ISC
