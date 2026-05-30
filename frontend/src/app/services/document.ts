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

  register(name: string, email: string, password: string) {
    console.log('Registering user:', name);
    return this.http.post<any>('http://localhost:5000/api/auth/register', { name, email, password });
  }
}
