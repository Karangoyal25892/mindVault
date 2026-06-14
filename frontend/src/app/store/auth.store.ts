import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, EMPTY, exhaustMap, finalize, Subject, tap } from "rxjs";
import { AuthApiService } from "../api/auth.api";
import { TokenService } from "../service/TokenService";

@Injectable({ providedIn: 'root' })
export class AuthStore {
    //service injection
    router = inject(Router);
    authApiService = inject(AuthApiService);
    tokenService = inject(TokenService);

    //subjects
    loginSubject = new Subject<{ email: string, password: string }>();
    registerSubject = new Subject<void>();

    //signal variables
    authenticated = signal(!!this.tokenService.isAuthenticated());
    role = signal<'USER' | 'ADMIN'>('USER');
    error = signal<string>('');
    loading = signal(false);

    constructor() {
        this.loginSubject.pipe(
            tap(() => {
                this.loading.set(true);
                this.error.set('');
            }),
            exhaustMap(({ email, password }) => {
                return this.authApiService.login(email, password).pipe(
                    catchError(err => {
                        this.error.set(err.error?.message || 'Login failed');
                        return EMPTY;
                    }),
                    finalize(() => {
                        this.loading.set(false);
                    })
                )
            })
        ).subscribe((response: any) => {
            this.authenticated.set(true);
            this.role.set(response.role);
            this.tokenService.setToken(response.token);
            this.router.navigate(['/dashboard']);
        })


        this.registerSubject.pipe(
            tap(() => {
                this.loading.set(true);
                this.error.set('');
            }),
            exhaustMap(() => {
                return this.authApiService.register('karan', 'test@example.com', 'password123').pipe(
                    catchError(err => {
                        this.error.set(err.error?.message || 'Regsitration failed');
                        return EMPTY;
                    }),
                    finalize(() => {
                        this.loading.set(false);
                    })
                )
            })
        ).subscribe((response) => {
            this.error.set(response.message);
        })

    }

    login = (email: string, password: string) => {
        this.loginSubject.next({ email, password })
    }

    register() {
        this.registerSubject.next();
    }

    logout() {
        this.tokenService.removeToken();
        this.authenticated.set(false);
        this.router.navigate(['/']);
    }

}