import { KnowledgeChunk } from "../models/knowledgeChunk";
import { createEmbedding } from "./embedding.service";
import { generateAnswer } from "./llm.service";

type KnowledgeSearchResult = {
    chunk: any;
    score: number;
    linkedFrom?: string;
};

export const searchKnowledge = async (query: string) => {
    const chunks = await KnowledgeChunk.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);

    return chunks;
};

const cosineSimilarity = (a: number[], b: number[]) => {
    let dotProduct = 0;
    let aMagnitude = 0;
    let bMagnitude = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        aMagnitude += a[i] * a[i];
        bMagnitude += b[i] * b[i];
    }

    if (aMagnitude === 0 || bMagnitude === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
};

const getRelatedJsChunks = async (results: KnowledgeSearchResult[]): Promise<KnowledgeSearchResult[]> => {
    const relatedChunks: KnowledgeSearchResult[] = [];

    for (const result of results) {
        const jsObject = result.chunk.metadata?.jsObject;
        const jsFunction = result.chunk.metadata?.jsFunction;

        if (!jsObject || !jsFunction) continue;

        const jsChunk = await KnowledgeChunk.findOne({
            sourceType: "interaction-js",
            "metadata.jsObject": jsObject,
            "metadata.jsFunction": jsFunction,
        });

        if (jsChunk) {
            relatedChunks.push({
                chunk: jsChunk,
                score: 1,
                linkedFrom: result.chunk.title,
            });
        }
    }

    return relatedChunks;
};

const NAME_MATCH_BOOST = 0.2;
const TITLE_PHRASE_BOOST_PER_WORD = 0.3;
const TITLE_WORDSOUP_BOOST_PER_WORD = 0.15;

const getLexicalBoost = (normalizedQuery: string, queryWords: string[], chunk: any): number => {
    const interactionName = chunk.metadata?.interactionName?.toLowerCase();
    const interactionTitle = chunk.metadata?.interactionTitle?.toLowerCase();

    let boost = 0;

    if (interactionName && queryWords.includes(interactionName)) {
        boost += NAME_MATCH_BOOST;
    }

    if (interactionTitle) {
        const titleWords = interactionTitle.split(/\s+/).filter(Boolean);

        if (titleWords.length > 0) {
            if (normalizedQuery.includes(interactionTitle)) {
                // Whole title appears as a contiguous phrase in the query - most specific match.
                boost += TITLE_PHRASE_BOOST_PER_WORD * titleWords.length;
            } else if (titleWords.every((word: string) => queryWords.includes(word))) {
                // All title words present, but scattered - weaker match.
                boost += TITLE_WORDSOUP_BOOST_PER_WORD * titleWords.length;
            }
        }
    }

    return boost;
};

export const semanticSearchKnowledge = async (query: string, topK = 5, componentName: string | undefined) => {
    const queryEmbedding = await createEmbedding(query);
    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
    const dbQuery: any = {
        embedding: { $exists: true, $ne: [] },
    };

    if (componentName) {
        dbQuery.$or = [
            { componentName: { $regex: componentName, $options: 'i' } },
            { tagName: { $regex: componentName, $options: 'i' } },
        ];
    }
    const chunks = await KnowledgeChunk.find(dbQuery);
    const rankedChunks = chunks
        .map((chunk) => ({
            chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding || []) + getLexicalBoost(normalizedQuery, queryWords, chunk),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

    return rankedChunks;
};


export const askKnowledge = async (query: string, componentName?: string) => {
    const semanticResults = await semanticSearchKnowledge(query, 3, componentName);
    const topInteractionResults = semanticResults.filter(
        result => result.chunk.chunkType === "interaction"
    );
    const topInteraction = topInteractionResults[0];
    if (!topInteraction) {
        return {
            answer: 'No matching interaction found.',
            interaction: null,
            codeSnippets: [],
        };
    }
    const relatedJsChunks = await getRelatedJsChunks(
        topInteractionResults.slice(0, 1)
    );

    const allResults: KnowledgeSearchResult[] = [
        ...topInteractionResults.slice(0, 1),
        ...relatedJsChunks,
    ];

    const context = allResults
        .map((result) => result.chunk.content)
        .join("\n\n--------------------\n\n");
    const answer = await generateAnswer(query, context);
    return {
        answer,
        interaction: {
            component: topInteraction.chunk.componentName,
            name: topInteraction.chunk.metadata?.interactionName,
            title: topInteraction.chunk.metadata?.interactionTitle,
            type: topInteraction.chunk.metadata?.interactionType,
            summary: topInteraction.chunk.metadata?.summary,
            implementation: topInteraction.chunk.metadata?.jsSnippet,
        },
        codeSnippets: relatedJsChunks.map((result) => ({
            title: result.chunk.title,
            code: result.chunk.metadata?.code,
            linkedFrom: result.linkedFrom,
        })),
    };
};
