import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Document {

  private http = inject(HttpClient);

  getHealth() {
    return this.http.get<any>('http://localhost:5000/');
  }
}
