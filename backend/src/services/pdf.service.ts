import fs from 'fs';
const pdfParse = require('pdf-parse');

export const parsePdf = async (filePath: string): Promise<string> => {
    const fileData = await fs.promises.readFile(filePath);
    const pdfData = await pdfParse(fileData);
    return pdfData.text;
};