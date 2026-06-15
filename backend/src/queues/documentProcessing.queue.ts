
const documentProcessingQueue: string[] = [];
export const addItemToQueue = (documentId: string) => {
    documentProcessingQueue.push(documentId);

}
export const getNextItemFromQueue = () : string | undefined => {
    if (getQueueLength() > 0) {
        return documentProcessingQueue.shift();
    }

    return undefined;
}

export const getQueueLength = () => {
    return documentProcessingQueue.length;
}