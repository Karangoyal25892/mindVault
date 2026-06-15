import mongoose from "mongoose";

export type Status =
    | "UPLOADED"
    | "PROCESSING"
    | "PROCESSED"
    | "FAILED";

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
    },
    status: {
        type: String,
        enum :["UPLOADED", "PROCESSING", "PROCESSED", "FAILED"],
        default: "UPLOADED"
    },
    processingError: {
        type: String,
    },
    processedAt: {
        type: Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export const Document = mongoose.model('Document', documentSchema);