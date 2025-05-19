import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { ChatsWebsocketService } from '../../core/chats/services/chats-websocket.service';
import { ResponseMessageCommand } from '../../core/chats/models/websocket-message.model';

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
export default class ChatPageComponent implements OnInit, OnDestroy {
  filterForm = new FormGroup({
    search: new FormControl(''),
    filter: new FormControl('Все'),
  });
  items = ['Все', 'Открытые', 'Закрытые'];

  private sub = new Subscription();

  constructor(
    public chatService: ChatsService,
    private ws: ChatsWebsocketService
  ) {}

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.chatService.getMany().subscribe();
  }
}
