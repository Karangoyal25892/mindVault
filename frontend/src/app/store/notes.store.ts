import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, of, Subject, switchMap, tap } from "rxjs";
import { Note } from "../model/note.model";
import { NotesApiService } from "../api/notes.api";

@Injectable({
    providedIn: "root"
})
export class NotesStore {
    private searchSubject = new Subject<string>();
    private notesApi = inject(NotesApiService);
    notes = signal<Note[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    noteCount = computed(() => this.notes().length);

    constructor() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => {
                this.loading.set(true);
                this.error.set(null);
            }),

            switchMap((term: string) => {
                if (!term.trim()) {
                    this.notes.set([]);
                    this.loading.set(false);
                    return EMPTY;
                }
                return this.notesApi.search(term).pipe(
                    catchError(err => {
                        this.error.set('Failed to load notes');
                        return of([] as Note[]);
                    }),
                    finalize(() => {
                        this.loading.set(false);
                    })
                )
            }),

        ).subscribe((notes) => this.notes.set(notes));
    }

    search(term: string) {
        this.searchSubject.next(term);
    }
}