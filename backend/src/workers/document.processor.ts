import { getNextItemFromQueue } from "../queues/documentProcessing.queue"
import { getDocumentForProcessing, updateDocument } from "../services/document.service";
import { parsePdf } from "../services/pdf.service";

let isProcessing = false;
export const processDocumentQueue = async () => {
    if (isProcessing) return;
    const docId: string | undefined = getNextItemFromQueue();
    if (!docId) {
        return;
    }
    try {
        isProcessing = true;
        const doc = await getDocumentForProcessing(docId);
        if (!doc) {
            return;
        }

        await updateDocument(docId, { status: "PROCESSING" });
        const extractedText = await parsePdf(doc.path);
        await updateDocument(docId, {
            status: "PROCESSED",
            extractedText,
            processedAt: new Date()
        });
        
    } catch (error) {
        await updateDocument(docId, {
            status: "FAILED",
            processingError: error instanceof Error
                ? error.message
                : "Unknown processing error"
        })
    } finally {
        isProcessing = false;
        void processDocumentQueue();
    }
}