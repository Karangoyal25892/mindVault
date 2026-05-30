import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { Document } from '../../services/document';


@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  //service injection
  documentService = inject(Document);


  public time = signal(0);
  protected readonly title = signal('Karan');
  public count = signal(0);
  public http = inject(HttpClient);
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
  registerUser = () => {
    this.documentService.register('karan', 'test@example.com', 'password123').subscribe(response => {
      this.backendMessage.set(response.message);
    });
  }
  doubleCount = computed(() => this.count() * 2);
  increment = () => this.count.update((c) => c + 1);
  reset = () => {
    this.count.set(0);
    this.time.set(0);
    this.message.set('');
  };
}
