import { Component, inject } from '@angular/core';
import { NotesStore } from '../../store/notes.store';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {

  noteStore = inject(NotesStore);
  authStore = inject(AuthStore);

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.noteStore.search(term);
  }

  logout(){
    this.authStore.logout();
  }
}
