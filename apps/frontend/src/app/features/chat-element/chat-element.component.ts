import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TuiTextfield, TuiIcon, TuiAppearance, TuiTitle } from '@taiga-ui/core';
import {
  TuiDataListWrapper,
  TuiBadge,
  TuiBadgeNotification,
  TuiAvatar,
} from '@taiga-ui/kit';
import { TuiSearch, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { Chat, ChatStatus } from '../../core/chats/models/chat.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-chat-element',
  standalone: true,
  templateUrl: './chat-element.component.html',
  styleUrl: './chat-element.component.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    FormsModule,
    TuiSearch,
    TuiTextfield,
    TuiSelectModule,
    TuiDataListWrapper,
    TuiAppearance,
    TuiBadge,
    CommonModule,
    TuiAvatar,
  ],
})
export class ChatElementComponent {
  @Input({ required: true }) chat!: Chat;

  constructor(private readonly router: Router) {}

  select() {
    this.router.navigate(['/chat', this.chat.id]);
  }

  lastMessageText() {
    if (this.chat.messages.length === 0) return 'Сообщений пока нет';
    const lastMessage = this.chat.messages[this.chat.messages.length - 1];

    return `${lastMessage.sender.email}: ${lastMessage.text}`;
  }
}
