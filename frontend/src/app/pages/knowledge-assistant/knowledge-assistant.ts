import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CodeSnippet, InteractionDetails, KnowledgeService } from '../../service/knowledge.service';

@Component({
  selector: 'app-knowledge-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './knowledge-assistant.html',
  styleUrl: './knowledge-assistant.scss',
})
export class KnowledgeAssistantComponent {
  private knowledgeService = inject(KnowledgeService);

  question = signal('');
  componentName = signal('');
  loading = signal(false);
  answer = signal<string | null>(null);
  codeSnippets = signal<CodeSnippet[]>([]);
  error = signal<string | null>(null);
  interaction = signal<InteractionDetails | null>(null);

  ask() {
    const query = this.question().trim();
    const component = this.componentName().trim();
    if (!query) return;
    this.reset();
    this.knowledgeService
      .askKnowledge(query, component || undefined)
      .subscribe({
        next: (res) => {
          this.answer.set(res.answer);
          this.codeSnippets.set(res.codeSnippets || []);
          this.loading.set(false);
          this.interaction.set(res.interaction);
        },
        error: () => {
          this.error.set('Something went wrong while asking knowledge assistant.');
          this.loading.set(false);
        },
      });
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code);
  }

  reset() {
    this.loading.set(true);
    this.error.set(null);
    this.answer.set(null);
    this.codeSnippets.set([]);
    this.interaction.set(null);
  }
}