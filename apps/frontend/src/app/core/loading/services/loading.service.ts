import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _loading = signal(false);

  readonly loading = this._loading.asReadonly();

  start(): void {
    this._loading.set(true);
  }

  stop(): void {
    this._loading.set(false);
  }

  set(value: boolean): void {
    this._loading.set(value);
  }
}
