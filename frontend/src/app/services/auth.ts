import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  authenticated = signal(false);

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      this.authenticated.set(true);
    }
  }
  register(name: string, email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/register', { name, email, password });
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/login', { email, password });
  }
}
