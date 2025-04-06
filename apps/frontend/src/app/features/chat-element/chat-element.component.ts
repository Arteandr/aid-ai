import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TuiTextfield, TuiIcon, TuiAppearance, TuiTitle } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiBadge } from '@taiga-ui/kit';
import { TuiSearch, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { Chat, ChatStatus } from '../../core/chats/models/chat.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-element',
  standalone: true,
  templateUrl: './chat-element.component.html',
  styleUrl: './chat-element.component.scss',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TuiSearch,
    TuiTextfield,
    TuiSelectModule,
    TuiIcon,
    TuiDataListWrapper,
    TuiAppearance,
    TuiCardLarge,
    TuiHeader,
    TuiTitle,
    TuiBadge,
    CommonModule,
    DatePipe,
  ],
})
export class ChatElementComponent {
  @Input({ required: true }) chat!: Chat;
}
