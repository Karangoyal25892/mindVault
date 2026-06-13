import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly TOKEN_KEY = 'token';

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
    
    setToken(value: string) {
        localStorage.setItem(this.TOKEN_KEY, value)
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    }

}