import OpenAI from "openai";
import { pipeline } from "@xenova/transformers";
import { env } from "../config/env";

const provider = env.Embedding_provider || 'local';

let extractor: any;

const openai = new OpenAI({
  apiKey: env.openAiApiKey,
});

const createLocalEmbedding = async (text: string): Promise<number[]> => {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};

const createOpenAIEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: env.openai_embedding_model || "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
};

export const createEmbedding = async (text: string): Promise<number[]> => {
  if (provider === "openai") {
    return createOpenAIEmbedding(text);
  }

  return createLocalEmbedding(text);
};