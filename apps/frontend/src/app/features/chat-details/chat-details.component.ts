import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import { ActivatedRoute } from '@angular/router';
import { TuiScrollService } from '@taiga-ui/cdk/services';
import { TuiButton, TuiHint, TuiIcon } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import {
  TuiTextareaModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { Subscription } from 'rxjs';
import { UserService } from '../../core/auth/services/user.service';
import {
  RequestMessageCommand,
  ResponseMessageCommand,
} from '../../core/chats/models/websocket-message.model';
import { ChatsWebsocketService } from '../../core/chats/services/chats-websocket.service';
import { ChatsService } from '../../core/chats/services/chats.service';
import { Message } from '../../core/models/message.model';
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
  private wsSubscription?: Subscription;

  constructor(
    public userService: UserService,
    private readonly chatService: ChatsService,
    private readonly route: ActivatedRoute,
    private readonly wsService: ChatsWebsocketService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom(): void {
    try {
      const el = this.scrollContainer.nativeElement;
      console.log('Прокрутка вниз:', {
        scrollHeight: el.scrollHeight,
        'scrollTop до': el.scrollTop,
      });
      el.scrollTop = el.scrollHeight;
      console.log('scrollTop после:', el.scrollTop);
    } catch (err) {
      console.error('Ошибка автоскролла:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe((params) => {
      const chatId = parseInt(params['id'], 10); // Надежное преобразование в число
      console.log('ID чата из маршрута:', chatId, 'тип:', typeof chatId);
      this.chatId.set(chatId);
      this.loadHistory(chatId);
    });

    this.wsSubscription = this.wsService.messages$.subscribe((msg) => {
      if (msg.command === ResponseMessageCommand.NEW_MESSAGE) {
        const { chatId: receivedChatId, message } = msg.data;
        // Преобразуем оба значения в числа для надежного сравнения
        const currentChatId = this.chatId();
        const msgChatId =
          typeof receivedChatId === 'string'
            ? parseInt(receivedChatId, 10)
            : receivedChatId;

        console.log('Сравнение ID чатов:', {
          'Текущий ID (this.chatId())': currentChatId,
          'Тип текущего ID': typeof currentChatId,
          'ID из сообщения': msgChatId,
          'Тип ID из сообщения': typeof msgChatId,
        });

        if (msgChatId === currentChatId) {
          console.log('Получено новое сообщение:', message);
          this.messages.update((messages) => [...messages, message]);
          this.cdr.detectChanges(); // Запуск обнаружения изменений
          setTimeout(() => this.scrollToBottom(), 0);
        }
      }
    });
  }

  loadHistory(chatId: number) {
    this.chatService.getHistory(chatId).subscribe((data) => {
      const { messages } = data;
      this.messages.set(messages);
      this.cdr.detectChanges(); // Запуск обнаружения изменений
      setTimeout(() => this.scrollToBottom(), 100); // Небольшая задержка для рендеринга
    });
  }

  isMyMessage(message: Message) {
    return this.userService.user?.id === message.sendedBy;
  }

  sendMessage(message: string) {
    const chatId = this.chatId();
    console.log('Отправка сообщения в чат ID:', chatId, 'тип:', typeof chatId);
    this.wsService.send({
      data: {
        command: RequestMessageCommand.SEND_MESSAGE,
        text: message,
        chat_id: chatId,
      },
    });
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
