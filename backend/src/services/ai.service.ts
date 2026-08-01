
import OpenAI from 'openai';
import { getOpenAIClient } from '../providers/openai.client';

let openaiClient: OpenAI | null = null;

export const summarizeDocument = async (text: string | undefined | null) => {
    const OpenAi = getOpenAIClient();
    const response = await OpenAi.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        messages: [
            {
                role: "system",
                content: "You are a helpful document summarizer."
            },
            {
                role: "user",
                content: `Summarize the following document:\n\n${text}`
            }
        ]
    });
    return response.choices[0].message.content;
}