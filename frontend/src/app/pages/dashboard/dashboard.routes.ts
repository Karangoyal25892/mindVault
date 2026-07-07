import { Routes } from '@angular/router';
import { Dashboard } from './dashboard';

export const dashboardRoutes: Routes = [
  {
  path: '',
  component: Dashboard,
  children: [
    {
      path: '',
      pathMatch: 'full',
      loadComponent: () =>
        import('../notes/notes').then((m) => m.Notes),
    },
    {
      path: 'knowledge',
      loadComponent: () =>
        import('../knowledge-assistant/knowledge-assistant').then(
          (m) => m.KnowledgeAssistantComponent
        ),
    },
  ],
}
];