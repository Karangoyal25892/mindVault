import mongoose, { Schema, Document } from "mongoose";

export interface KnowledgeChunkDocument extends Document {
    sourceType: "component" | "interaction-js";
    componentName?: string;
    tagName?: string;
    chunkType: "overview" | "attribute" | "interaction" | "js-function";
    title: string;
    content: string;
    embedding?: number[];
    metadata?: Record<string, unknown>;
}

const KnowledgeChunkSchema = new Schema<KnowledgeChunkDocument>({
    sourceType: {
        type: String,
        enum: ["component", "interaction-js"],
        required: true,
    },
    componentName: String,
    tagName: String,
    chunkType: {
        type: String,
        enum: ["overview", "attribute", "interaction", "js-function"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        default: [],
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
},
    { timestamps: true }
);

KnowledgeChunkSchema.index({ componentName: 1 });
KnowledgeChunkSchema.index({ chunkType: 1 });
KnowledgeChunkSchema.index({ title: "text", content: "text" });
export const KnowledgeChunk = mongoose.model<KnowledgeChunkDocument>(
    "KnowledgeChunk",
    KnowledgeChunkSchema
);