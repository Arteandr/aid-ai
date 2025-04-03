import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ClrDropdownModule,
  ClrFormsModule,
  ClrSpinnerModule,
} from '@clr/angular';
import { UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ApiError } from '../models/api-error.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  imports: [
    FormsModule,
    ClrFormsModule,
    ClrDropdownModule,
    CommonModule,
    ClrSpinnerModule,
  ],
})
export default class AuthComponent {
  destroyRef = inject(DestroyRef);

  form = {
    type: 'local',
    username: '',
    password: '',
    rememberMe: false,
  };

  isSubmitting: boolean = false;

  error: ApiError | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.isSubmitting = true;

    let observable = this.userService.login({
      email: this.form.username,
      password: this.form.password,
    });

    observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/']),
      error: (err) => {
        this.error = err;
        this.isSubmitting = false;
      },
    });
  }
}
