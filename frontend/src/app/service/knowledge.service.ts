import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CodeSnippet {
    title: string;
    code: string;
    linkedFrom: string;
}

export interface InteractionDetails {
    component: string;
    name: string;
    title: string;
    type: string;
    summary: string;
    implementation: string;
}

export interface AskKnowledgeResponse {
    success: boolean;
    answer: string;
    interaction: InteractionDetails | null;
    codeSnippets: CodeSnippet[];
}

@Injectable({
    providedIn: 'root',
})
export class KnowledgeService {
    private http = inject(HttpClient);

    askKnowledge(query: string, componentName?: string): Observable<AskKnowledgeResponse> {
        return this.http.post<AskKnowledgeResponse>(
            '/api/api/knowledge/ask',
            {
                query,
                componentName,
            }
        );
    }
}