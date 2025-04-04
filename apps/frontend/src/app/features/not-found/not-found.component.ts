import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'app-not-found',
  standalone: true,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  imports: [TuiBlockStatus, TuiButton],
})
export default class NotFoundComponent {
  constructor(private readonly router: Router) {}

  toMainPage() {
    this.router.navigateByUrl('/');
  }
}
