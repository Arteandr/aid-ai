import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/home/home.component'),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/default-page/default-page.component'),
      },
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat-page/chat-page.component'),
      },
    ],
    canActivate: [AuthGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./core/auth/auth.component'),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component'),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
