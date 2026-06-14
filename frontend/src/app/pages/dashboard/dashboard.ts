import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '../../store/auth.store';
import { NotesStore } from '../../store/notes.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  noteStore = inject(NotesStore);
  authStore = inject(AuthStore);
  isAdmin = computed(() => this.authStore.role() === 'ADMIN');
  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.noteStore.search(term);
  }

  logout() {
    this.authStore.logout();
  }
}
