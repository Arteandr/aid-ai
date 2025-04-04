import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { JwtService } from '../services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    const token = this.jwtService.getToken();

    if (!token && state.url != '/login') {
      this.router.navigate(['/login']);
      return false;
    }

    if (token && state.url == '/login') {
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
