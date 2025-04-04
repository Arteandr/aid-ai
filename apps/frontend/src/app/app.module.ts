import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JwtService } from './core/auth/services/jwt.service';
import { UserService } from './core/auth/services/user.service';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideEventPlugins } from '@taiga-ui/event-plugins';

import { TuiRoot } from '@taiga-ui/core';

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
  imports: [BrowserModule, AppRoutingModule, TuiRoot],
  providers: [
    provideAnimations(),
    provideEventPlugins(),
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
