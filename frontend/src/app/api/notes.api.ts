import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Note } from "../model/note.model";

@Injectable({
    providedIn: 'root'
})
export class NotesApiService {

    private http = inject(HttpClient);

    search(term: string): Observable<Note[]> {
        return this.http.get<any>(`/api/api/note?search=${term}`);
    }
}