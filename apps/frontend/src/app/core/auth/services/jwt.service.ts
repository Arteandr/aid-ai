import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  getToken(): string {
    return window.localStorage['authToken'];
  }

  saveToken(token: string): void {
    window.localStorage['authToken'] = token;
  }

  destroyToken(): void {
    window.localStorage.removeItem('authToken');
  }
}
