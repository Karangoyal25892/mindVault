import { Component, inject } from '@angular/core';
import { NotesStore } from '../../store/notes.store';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [],
  templateUrl: './notes.html'
})
export class Notes {
  noteStore = inject(NotesStore);

  onSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.noteStore.search(term);
  }
}