import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from './services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ApiError } from '../models/api-error.type';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  TuiAlertService,
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiError,
  TuiIcon,
  TuiNotification,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TuiFieldErrorPipe,
  TuiSegmented,
  TuiPassword,
  tuiValidationErrorsProvider,
  TuiDataListWrapper,
  TuiPushService,
  TuiPush,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { switchMap, take, timeout } from 'rxjs';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiHeader,
    TuiIcon,
    TuiSegmented,
    TuiTextfield,
    TuiTitle,
    TuiPassword,
    TuiNotification,
    TuiDataList,
    TuiDataListWrapper,
    TuiPush,
  ],
})
export default class AuthComponent {
  destroyRef = inject(DestroyRef);

  protected readonly form = new FormGroup(
    {
      type: new FormControl('login', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      isLogin: new FormControl(true),
    },
    (control) =>
      Object.values((control as FormGroup).controls).every(({ valid }) => valid)
        ? null
        : { other: 'Введен неправильный логин или пароль' }
  );

  isSubmitting: boolean = false;

  error: ApiError | null = null;

  private readonly alert = inject(TuiAlertService);
  protected readonly push = inject(TuiPushService);

  constructor(
    private readonly userService: UserService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (!this.form.valid) return;
    this.error = null;
    this.isSubmitting = true;

    const credentials = {
      email: this.form.value.email || '',
      password: this.form.value.password || '',
    };

    let observable = this.form.value.isLogin
      ? this.userService.login(credentials)
      : this.userService.register(credentials);

    observable
      .pipe(takeUntilDestroyed(this.destroyRef), timeout(2000))
      .subscribe({
        next: () => {
          this.alert.open('Вы успешно авторизовались!').subscribe();
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          this.error = err;
          this.isSubmitting = false;
        },
      });
  }
}
