import fs from "fs";
import path from "path";
import { KnowledgeChunk } from "../models/knowledgeChunk";
import { createEmbedding } from "./embedding.service";

const KNOWLEDGE_SOURCE_PATH = process.env.KNOWLEDGE_SOURCE_PATH || '';

const getFilesRecursively = (
    dir: string,
    matcher: (filePath: string) => boolean
): string[] => {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
        throw new Error(`Knowledge source path does not exist: ${dir}`);
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results.push(...getFilesRecursively(fullPath, matcher));
        } else if (matcher(fullPath)) {
            results.push(fullPath);
        }
    }

    return results;
};

const extractJsReference = (snippet: string) => {
    const match = snippet.match(
        /([a-zA-Z_$][\w$]*)\.([a-zA-Z_$][\w$]*)\s*\(/
    );

    return {
        jsObject: match?.[1] || "",
        jsFunction: match?.[2] || "",
    };
};

const extractJsFunctions = (fileContent: string) => {
    const objectMatch = fileContent.match(/var\s+([a-zA-Z_$][\w$]*)\s*=\s*{/);
    const objectName = objectMatch?.[1] || "unknown";

    const functionRegex =
        /([a-zA-Z_$][\w$]*)\s*:\s*function\s*\([^)]*\)\s*{/g;

    const functions: {
        objectName: string;
        functionName: string;
        code: string;
    }[] = [];

    let match;

    while ((match = functionRegex.exec(fileContent)) !== null) {
        const functionName = match[1];
        const startIndex = match.index;

        let braceCount = 0;
        let endIndex = startIndex;

        for (
            let i = fileContent.indexOf("{", startIndex);
            i < fileContent.length;
            i++
        ) {
            const char = fileContent[i];

            if (char === "{") braceCount++;
            if (char === "}") braceCount--;

            if (braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }

        const code = fileContent.slice(startIndex, endIndex);

        functions.push({
            objectName,
            functionName,
            code,
        });
    }

    return functions;
};

const indexComponentFiles = async () => {
    await KnowledgeChunk.deleteMany({ sourceType: "component" });

    const files = getFilesRecursively(KNOWLEDGE_SOURCE_PATH, (filePath) =>
        filePath.endsWith(".cp.json")
    );

    const chunks = [];

    for (const filePath of files) {
        const rawData = fs.readFileSync(filePath, "utf-8");
        const component = JSON.parse(rawData);

        const fileName = path.basename(filePath);
        const relativePath = path.relative(KNOWLEDGE_SOURCE_PATH, filePath);

        const componentName = component.label || component.tagName || fileName;
        const tagName = component.tagName;

        const content = `
Component: ${componentName}
Tag Name: ${tagName}
Type: ${component.type}
Name: ${component.name}
Source File: ${relativePath}
      `;
        const embedding = await createEmbedding(content);
        chunks.push({
            sourceType: "component",
            componentName,
            tagName,
            chunkType: "overview",
            title: `${componentName} Overview`,
            content,
            embedding,
            metadata: {
                fileName,
                relativePath,
                absolutePath: filePath,
            },
        });

        for (const interaction of component.interactions || []) {
            const jsSnippet =
                interaction.implementations?.[0]?.javaScriptSnippet || "";

            const { jsObject, jsFunction } = extractJsReference(jsSnippet);
            const content = `
Component: ${componentName}
Tag Name: ${tagName}

Interaction Name: ${interaction.name}
Interaction Title: ${interaction.title}
Interaction Type: ${interaction.interactionType}

Summary:
${interaction.summary || ""}

JavaScript Object:
${jsObject}

JavaScript Function:
${jsFunction}

Implementation:
${jsSnippet}

Source File:
${relativePath}
        `;

            const embedding = await createEmbedding(content);
            chunks.push({
                sourceType: "component",
                componentName,
                tagName,
                chunkType: "interaction",
                title: `${componentName} - ${interaction.name} Interaction`,
                content,
                embedding,
                metadata: {
                    fileName,
                    relativePath,
                    absolutePath: filePath,
                    interactionName: interaction.name,
                    interactionTitle: interaction.title,
                    interactionType: interaction.interactionType,
                    summary: interaction.summary,
                    jsSnippet,
                    jsObject,
                    jsFunction,
                },
            });
        }
    }

    if (chunks.length > 0) {
        await KnowledgeChunk.insertMany(chunks);
    }

    return {
        filesIndexed: files.length,
        chunksCreated: chunks.length,
    };
};

const indexInteractionFiles = async () => {
    await KnowledgeChunk.deleteMany({ sourceType: "interaction-js" });

    const files = getFilesRecursively(KNOWLEDGE_SOURCE_PATH, (filePath) => {
        const fileName = path.basename(filePath).toLowerCase();

        return fileName.startsWith("interaction") && fileName.endsWith(".js");
    });

    const chunks = [];
    for (const filePath of files) {
        const fileContent = fs.readFileSync(filePath, "utf-8");

        const fileName = path.basename(filePath);
        const relativePath = path.relative(KNOWLEDGE_SOURCE_PATH, filePath);
        const functions = extractJsFunctions(fileContent);

        for (const fn of functions) {
            const cleanCode = fn.code
                .replace(/\r\n/g, "\n")
                .replace(/\t/g, "  ");

            const content = `
JavaScript Object:
${fn.objectName}

JavaScript Function:
${fn.functionName}

Code:
${cleanCode}

Source File:
${relativePath}
`;
            const embedding = await createEmbedding(content);
            chunks.push({
                sourceType: "interaction-js",
                componentName: undefined,
                tagName: undefined,
                chunkType: "js-function",
                title: `${fn.objectName}.${fn.functionName}`,
                content,
                embedding,
                metadata: {
                    fileName,
                    relativePath,
                    absolutePath: filePath,
                    jsObject: fn.objectName,
                    jsFunction: fn.functionName,
                    code: cleanCode,
                },
            });
        }
    }

    if (chunks.length > 0) {
        await KnowledgeChunk.insertMany(chunks);
    }

    return {
        filesIndexed: files.length,
        chunksCreated: chunks.length,
    };
};

export const indexKnowledgeComponents = async () => {
    const componentResult = await indexComponentFiles();
    const interactionResult = await indexInteractionFiles();

    return {
        sourcePath: KNOWLEDGE_SOURCE_PATH,
        componentFilesIndexed: componentResult.filesIndexed,
        componentChunksCreated: componentResult.chunksCreated,
        interactionFilesIndexed: interactionResult.filesIndexed,
        interactionChunksCreated: interactionResult.chunksCreated,
        totalChunksCreated:
            componentResult.chunksCreated + interactionResult.chunksCreated,
    };
};