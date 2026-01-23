# AI Services Abstraction Pattern

**Date:** 2026-01-22

## Principle

Never couple directly to a vendor. Define interfaces, swap implementations.

## Interfaces

```typescript
interface EmbeddingService {
  embed(texts: string[]): Promise<number[][]>;
}

interface ReaderService {
  extract(url: string): Promise<string>;
}

interface SpeechToTextService {
  transcribe(audio: Buffer): Promise<string>;
}

interface TextToSpeechService {
  synthesize(text: string): Promise<Buffer>;
}
```

## Provider Mapping

| Interface | Primary | Fallback | Self-hosted |
|-----------|---------|----------|-------------|
| Embedding | Jina | OpenAI | Ollama |
| Reader | Jina | Firecrawl | - |
| STT | Deepgram | - | Whisper |
| TTS | ElevenLabs | - | Piper |

## Implementation

```typescript
export function createEmbeddingService(): EmbeddingService {
  const provider = config.get('embedding.provider');
  switch (provider) {
    case 'jina': return new JinaEmbedding();
    case 'ollama': return new OllamaEmbedding();
    default: throw new Error(`Unknown: ${provider}`);
  }
}
```

## Benefits

- Vendor dies → flip config
- Want self-hosted → swap to local
- Better option emerges → easy switch
- Test with mocks
