import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import {
  TuiAppearance,
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiAvatar, TuiAvatarOutline, TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';

import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/auth/services/user.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterLinkActive,
    TuiAppearance,
    TuiButton,
    TuiIcon,
    TuiBadge,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
    TuiAvatar,
    TuiAvatarOutline,
  ],
})
export default class HomeComponent {
  protected expanded = signal(true);
  protected open = false;
  protected switch = false;
  protected readonly routes: any = {};

  constructor(public userService: UserService) {}

  protected handleToggle(): void {
    this.expanded.update((e) => !e);
  }
}
