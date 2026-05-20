
import { env } from '../config/env';
import OpenAI from 'openai';

const OpenAi = new OpenAI({
    apiKey: env.openAiApiKey,
});


export const summarizeDocument = async (text: string) => {
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