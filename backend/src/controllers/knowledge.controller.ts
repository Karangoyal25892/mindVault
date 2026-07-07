import { NextFunction, Request, Response } from "express";
import { askKnowledge, searchKnowledge, semanticSearchKnowledge } from "../services/knowledge.service";
import { indexKnowledgeComponents } from "../services/knowledgeIndexer.service";

export const index = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await indexKnowledgeComponents();
        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.body?.query as string;
        if (!query) {
            return res.status(401).json({ message: 'No user query' });
        }
        const componentName = req.body?.query as string || '';
        const result = await searchKnowledge(query);
        res.status(200).json({
            success: true,
            results: result,
        });
    } catch (error) {
        next(error);
    }
};

export const semanticSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.body?.query as string;
        if (!query) {
            return res.status(401).json({ message: 'No user query' });
        }
        const topK = Number(req.body.topK) || 5;
        const componentName = req.body.componentName || '';
        const results = await semanticSearchKnowledge(query, topK, componentName);
        res.status(200).json({
            success: true,
            results,
        });
    } catch (error) {
        next(error);
    }
};


export const ask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.body?.query as string;
        if (!query) {
            return res.status(401).json({ message: 'No user query' });
        }
        const componentName = req.body.componentName || '';
        const result = await askKnowledge(query, componentName);
        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};