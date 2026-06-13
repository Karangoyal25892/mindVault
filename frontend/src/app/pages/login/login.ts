import { Component, inject, signal } from '@angular/core';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  //service injection
  authStore = inject(AuthStore);

  protected readonly title = signal('Karan');

  constructor() { }

  login = (email: string, password: string) => {
    this.authStore.login(email, password);
  }

  registerUser(){
    this.authStore.register();
  }

  logout(){
    this.authStore.logout();
  }
}
