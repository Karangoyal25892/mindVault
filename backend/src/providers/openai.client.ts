import OpenAI from 'openai';
import { env } from '../config/env';

let openaiClient: OpenAI | null = null;

export const getOpenAIClient = (): OpenAI => {
  if (!env.openAiApiKey) {
    throw new Error('OPENAI_API_KEY is required when using OpenAI provider.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.openAiApiKey,
    });
  }

  return openaiClient;
};