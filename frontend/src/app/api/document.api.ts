import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DocumentApiService {

  private http = inject(HttpClient);

  getHealth() {
    return this.http.get<any>('/api/');
  }
}
