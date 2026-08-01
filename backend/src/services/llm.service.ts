import { env } from "../config/env";
import { getOpenAIClient } from '../providers/openai.client';

const provider = env.llmProvider;

const buildPrompt = (question: string, context: string) => `
You are a senior JavaScript automation engineer.

Explain the implementation from a functional perspective.

IMPORTANT:
- Describe WHAT the implementation does.
- Do NOT explain every line of code.
- Do NOT explain every timeout.
- Do NOT explain variable names.
- Focus on business behaviour and user interaction.
- Infer the purpose of the code from the implementation.
- Assume the reader is a QA Automation Engineer.
- Explain the interaction as if documenting the component.

Return only these two sections and nothing else:

SUMMARY:
A short 2-3 sentence explanation.

FLOW:
1. ...
2. ...
3. ...

Do not repeat the question.
Do not add an ANSWER section.

Question:
${question}

Context:
${context}
`;

const generateWithOllama = async (
    question: string,
    context: string
): Promise<string> => {
    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama3.2:3b",
            prompt: buildPrompt(question, context),
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate answer from Ollama");
    }

    const data = await response.json();
    return data.response;
};

const generateWithOpenAI = async (
    question: string,
    context: string
): Promise<string> => {
    const openAi = getOpenAIClient();
    const response = await openAi.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        input: buildPrompt(question, context),
    });

    return response.output_text;
};

export const generateAnswer = async (question: string, context: string): Promise<string> => {
    if (provider === "openai") {
        return generateWithOpenAI(question, context);
    }

    return generateWithOllama(question, context);
};