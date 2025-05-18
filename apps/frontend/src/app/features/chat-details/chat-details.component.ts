import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TuiTextareaModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { Message } from '../../core/models/message.model';
import { ChatsService } from '../../core/chats/services/chats.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {
  TuiButton,
  TuiHint,
  TuiIcon,
  TuiLink,
  TuiScrollbar,
} from '@taiga-ui/core';
import { ChatsWebsocketService } from '../../core/chats/services/chats-websocket.service';
import {
  RequestMessageCommand,
  ResponseMessageCommand,
} from '../../core/chats/models/websocket-message.model';
import { UserService } from '../../core/auth/services/user.service';
import { TuiScrollService } from '@taiga-ui/cdk/services';
import { TuiAvatar } from '@taiga-ui/kit';
import { ChatDetailsInfoComponent } from '../chat-details-info/chat-details-info.component';

@Component({
  selector: 'app-chat-details',
  standalone: true,
  templateUrl: './chat-details.component.html',
  styleUrl: './chat-details.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTextareaModule,
    TuiTextareaModule,
    TuiTextfieldControllerModule,
    TuiIcon,
    TuiButton,
    TuiAvatar,
    TuiHint,
    ChatDetailsInfoComponent,
  ],
  providers: [TuiScrollService],
})
export default class ChatDetailsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('scrollbarContainer') private scrollContainer!: ElementRef;

  messageForm = new FormGroup({
    messageInput: new FormControl(''),
  });

  messages = signal<Message[]>([]);
  chatId = signal<number>(0);
  private routeSub?: Subscription;

  constructor(
    public userService: UserService,
    private readonly chatService: ChatsService,
    private readonly route: ActivatedRoute,
    private readonly wsService: ChatsWebsocketService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      console.log(el.scrollHeight, el.scrollTop);
      el.scrollTop = el.scrollHeight;
      console.log(el.scrollHeight, el.scrollTop);
    } catch (err) {
      console.error('Ошибка автоскролла:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      const chatId = params['id'];
      this.chatId.set(chatId);
      this.loadHistory(chatId);
    });
  }

  loadHistory(chatId: number) {
    this.chatService.getHistory(chatId).subscribe((data) => {
      const { messages } = data;
      this.messages.set(messages);
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  isMyMessage(message: Message) {
    return this.userService.user?.id === message.sendedBy;
  }

  sendMessage(message: string) {
    const chatId = this.chatId() ?? 0;
    this.wsService.send({
      data: {
        command: RequestMessageCommand.SEND_MESSAGE,
        text: message,
        chat_id: chatId,
      },
    });
    setTimeout(() => this.scrollToBottom(), 0);
  }

  onEnterPressed(event: Event) {
    event.preventDefault();
    if (!this.messageForm.value.messageInput) return;
    const message = this.messageForm.value.messageInput.trim();
    if (!message) return;
    this.sendMessage(message);
    this.messageForm.setValue({ messageInput: '' });
  }

  onSendButtonPressed() {
    if (!this.messageForm.value.messageInput) return;
    const message = this.messageForm.value.messageInput.trim();
    if (!message) return;
    this.sendMessage(message);
    this.messageForm.setValue({ messageInput: '' });
  }
}
