import {
  APP_INITIALIZER,
  inject,
  NgModule,
  provideAppInitializer,
  runInInjectionContext,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { JwtService } from './core/auth/services/jwt.service';
import { UserService } from './core/auth/services/user.service';
import { EMPTY, firstValueFrom } from 'rxjs';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { Router } from '@angular/router';

export function initAuth(jwtService: JwtService, userService: UserService) {
  const router = inject(Router);
  const token = jwtService.getToken();

  if (!token) {
    router.navigate(['/login']);
    return EMPTY;
  }

  return userService.getCurrentUser();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClarityModule,
  ],
  providers: [
    provideHttpClient(
      withInterceptors([apiInterceptor, tokenInterceptor, errorInterceptor])
    ),
    provideAppInitializer(() => {
      const jwtService = inject(JwtService);
      const userService = inject(UserService);
      return initAuth(jwtService, userService);
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
