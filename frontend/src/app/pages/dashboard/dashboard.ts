import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  authStore = inject(AuthStore);
  isAdmin = computed(() => this.authStore.role() === 'ADMIN');

  logout() {
    this.authStore.logout();
  }
}