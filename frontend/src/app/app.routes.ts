import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
    {
        path: '',
        component: Login
    }, {
        path: 'dashboard',
        component: Dashboard,
        canMatch: [authGuard]
    }, {
        path: 'register',
        component: Register
    }
];

