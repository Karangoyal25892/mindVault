import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

type EmbeddingProvider = 'local' | 'openai';
type LlmProvider = 'ollama' | 'openai';

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(`${key} is required`);
  }

  return value.trim();
};

const optionalEnv = (key: string, fallback = ''): string => {
  const value = process.env[key];

  if (!value || value.trim() === '' || value.trim().toLowerCase() === 'null') {
    return fallback;
  }

  return value.trim();
};

const validateEmbeddingProvider = (value: string): EmbeddingProvider => {
  if (value === 'local' || value === 'openai') {
    return value;
  }

  throw new Error('EMBEDDING_PROVIDER must be either local or openai');
};

const validateLlmProvider = (value: string): LlmProvider => {
  if (value === 'ollama' || value === 'openai') {
    return value;
  }

  throw new Error('LLM_PROVIDER must be either ollama or openai');
};

const embeddingProvider = validateEmbeddingProvider(
  optionalEnv('EMBEDDING_PROVIDER', 'local')
);

const llmProvider = validateLlmProvider(
  optionalEnv('LLM_PROVIDER', 'ollama')
);

const openAiApiKey = optionalEnv('OPENAI_API_KEY');

if ((embeddingProvider === 'openai' || llmProvider === 'openai') && !openAiApiKey) {
  throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
}

export const env = {
  port: Number(optionalEnv('PORT', '5000')),

  mongoUri: requiredEnv('MONGO_URI'),
  jwtSecret: requiredEnv('JWT_SECRET'),

  openAiApiKey,
  openAiModel: optionalEnv('OPENAI_MODEL', 'gpt-5.5'),
  openAiEmbeddingModel: optionalEnv(
    'OPENAI_EMBEDDING_MODEL',
    'text-embedding-3-small'
  ),

  embeddingProvider,
  llmProvider,

  knowledgeSourcePath: path.resolve(
    process.cwd(),
    optionalEnv('KNOWLEDGE_SOURCE_PATH', './knowledge-source')
  ),
};