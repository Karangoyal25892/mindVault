import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { Auth } from '../../services/auth';
import { Document } from '../../services/document';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  //service injection
  documentService = inject(Document);
  authService = inject(Auth);
  http = inject(HttpClient);
  router = inject(Router);

  protected readonly title = signal('Karan');
  time = signal(0);
  count = signal(0);
  message = signal('');
  backendMessage = signal('');

  constructor() {
    effect(() => {
      console.log(`Count is: ${this.count()}`);
    });

    interval(1000).subscribe(val => {
      this.time.set(val);
    });

    const getHealth = this.documentService.getHealth();
    getHealth.subscribe(response => {
      this.message.set(response.message);
    });
  }

  doubleCount = computed(() => this.count() * 2);
  increment = () => this.count.update((c) => c + 1);
  login = (email: string, password: string) => {
    this.backendMessage.set('');
    this.authService.login(email, password).subscribe({
      next: response => {
        console.error('Login successful:', response);
        this.backendMessage.set(response.message);
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.authService.authenticated.set(true);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.backendMessage.set(err.error?.message || 'An error occurred');
      }
    });
  }

  registerUser = () => {
    this.backendMessage.set('');
    this.authService.register('karan', 'test@example.com', 'password123').
      subscribe({
        next: response => {
          console.error('Registration successful:', response);
          this.backendMessage.set(response.message);
        },
        error: err => {
          this.backendMessage.set(err.error?.message || 'An error occurred');
        }
      });
  }

  reset = () => {
    this.count.set(0);
    this.time.set(0);
    this.message.set('');
    this.backendMessage.set('');
  };
}
