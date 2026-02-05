/**
 * Ollama Embedding Generation
 *
 * Provides local embedding generation using Ollama's qwen3-embedding model.
 * Falls back gracefully when Ollama is unavailable.
 */

import ollama from "ollama";

/**
 * The embedding model to use for vector generation.
 * qwen3-embedding:0.6b is a compact, efficient model for semantic similarity.
 */
export const EMBEDDING_MODEL = "qwen3-embedding:0.6b";

/**
 * Dimension of the embedding vectors produced by qwen3-embedding:0.6b.
 * Must match the Orama schema vector dimension.
 */
export const EMBEDDING_DIMENSIONS = 1024;

/**
 * Checks if the Ollama daemon is running and accessible.
 *
 * @returns true if Ollama is available, false otherwise
 *
 * @example
 * ```typescript
 * const available = await checkOllamaAvailable();
 * if (!available) {
 *   console.log("Start Ollama with: ollama serve");
 * }
 * ```
 */
export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the embedding model is available in Ollama.
 *
 * @returns true if qwen3-embedding model is installed, false otherwise
 *
 * @example
 * ```typescript
 * const hasModel = await checkEmbeddingModel();
 * if (!hasModel) {
 *   console.log("Pull model with: ollama pull qwen3-embedding:0.6b");
 * }
 * ```
 */
export async function checkEmbeddingModel(): Promise<boolean> {
  try {
    const models = await ollama.list();
    return models.models.some(
      (m) => m.name.includes("qwen3-embedding") || m.name.includes("embedding")
    );
  } catch {
    return false;
  }
}

/**
 * Generates an embedding vector for a single text input.
 *
 * @param text - The text to embed
 * @returns A 768-dimensional embedding vector
 * @throws Error if Ollama is unavailable or embedding fails
 *
 * @example
 * ```typescript
 * const embedding = await generateEmbedding("pattern for error handling");
 * console.log(embedding.length); // 768
 * ```
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await ollama.embed({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return result.embeddings[0];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embedding: ${message}`);
  }
}

/**
 * Generates embedding vectors for multiple text inputs in a single batch.
 * More efficient than calling generateEmbedding multiple times.
 *
 * @param texts - Array of texts to embed
 * @returns Array of 768-dimensional embedding vectors
 * @throws Error if Ollama is unavailable or embedding fails
 *
 * @example
 * ```typescript
 * const embeddings = await generateEmbeddings([
 *   "error handling pattern",
 *   "retry with backoff",
 *   "circuit breaker pattern"
 * ]);
 * console.log(embeddings.length); // 3
 * console.log(embeddings[0].length); // 768
 * ```
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    const result = await ollama.embed({
      model: EMBEDDING_MODEL,
      input: texts,
    });
    return result.embeddings;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embeddings: ${message}`);
  }
}
