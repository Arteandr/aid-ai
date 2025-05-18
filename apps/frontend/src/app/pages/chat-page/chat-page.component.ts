import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiScrollbar,
  TuiTextfield,
} from '@taiga-ui/core';
import {
  TuiDataListWrapper,
  TuiFieldErrorPipe,
  TuiSkeleton,
} from '@taiga-ui/kit';
import { TuiSearch } from '@taiga-ui/layout';
import { TuiSelectModule } from '@taiga-ui/legacy';
import { ChatElementComponent } from '../../features/chat-element/chat-element.component';
import { ChatsService } from '../../core/chats/services/chats.service';
import { ChatEmptyComponent } from '../../features/chat-empty/chat-empty.component';
import { tuiScrollbarOptionsProvider } from '@taiga-ui/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
  imports: [
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TuiSearch,
    TuiTextfield,
    TuiSelectModule,
    TuiIcon,
    TuiDataListWrapper,
    TuiError,
    TuiFieldErrorPipe,
    AsyncPipe,
    TuiButton,
    TuiAppearance,
    ChatEmptyComponent,
    ChatElementComponent,
    TuiSkeleton,
    TuiScrollbar,
  ],
  providers: [
    tuiScrollbarOptionsProvider({
      mode: 'hover',
    }),
  ],
})
export default class ChatPageComponent implements OnInit {
  filterForm = new FormGroup({
    search: new FormControl(''),
    filter: new FormControl('Все'),
  });
  items = ['Все', 'Открытые', 'Закрытые'];

  constructor(public chatService: ChatsService) {}

  ngOnInit(): void {
    this.chatService.getMany().subscribe();
  }
}
