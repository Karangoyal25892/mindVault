import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);

  constructor() { }

  register(name: string, email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/register', { name, email, password });
  }

  login(email: string, password: string) {
    return this.http.post<any>('http://localhost:5000/api/auth/login', { email, password });
  }

  refreshToken() {
    return this.http.post<any>('http://localhost:5000/api/auth/refreshtoken', {}, { withCredentials: true })
  }
}
