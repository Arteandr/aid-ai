import { Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { JwtService } from './jwt.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser = signal<User | null>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly jwtService: JwtService,
    private readonly router: Router
  ) {}

  get user() {
    return this.currentUser;
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>('/auth/sign-in', {
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(tap(({ token }) => this.setAuth(token)));
  }

  register(credentials: {
    email: string;
    password: string;
  }): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>('/auth/sign-up', {
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(tap(({ token }) => this.setAuth(token)));
  }

  logout(): void {
    this.purgeAuth();
    void this.router.navigate(['/']);
  }

  getCurrentUser() {
    return this.http.get<User>('/users/me').pipe(
      tap({
        next: (user) => this.currentUser.set(user),
        error: () => this.purgeAuth(),
      }),
      shareReplay(1)
    );
  }

  refreshToken(): Observable<string> {
    return this.http
      .post<{ token: string }>(`/auth/refresh`, null, {
        withCredentials: true,
      })
      .pipe(
        tap(({ token }) => {
          this.setAuth(token);
        }),
        switchMap(({ token }) => of(token))
      );
  }

  private setAuth(token: string) {
    this.jwtService.saveToken(token);
  }

  private purgeAuth(): void {
    this.jwtService.destroyToken();
    this.currentUser.set(null);
  }
}
