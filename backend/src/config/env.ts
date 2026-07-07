import dotenv from 'dotenv';
dotenv.config();
export const env = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    kowledgeSourcePath: process.env.KNOWLEDGE_SOURCE_PATH || '',
    llm_provider: process.env.LLM_PROVIDER,
    Embedding_provider: process.env.EMBEDDING_PROVIDER,
    openai_embedding_model: process.env.OPENAI_EMBEDDING_MODEL

};