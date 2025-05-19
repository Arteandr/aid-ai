import { CommonModule, DatePipe } from '@angular/common';
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
import { TuiButton, TuiHint, TuiIcon, TuiLoader } from '@taiga-ui/core';
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
import { LoadingService } from '../../core/loading/services/loading.service';

interface MessageGroup {
  date: Date;
  label: string;
  messages: Message[];
}

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
    TuiLoader,
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
    public loadingService: LoadingService,
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
        const currentChatId = this.chatId();
        const msgChatId =
          typeof receivedChatId === 'string'
            ? parseInt(receivedChatId, 10)
            : receivedChatId;

        if (msgChatId === currentChatId) {
          console.log('Получено новое сообщение:', message);
          this.messages.update((messages) => [
            ...messages,
            {
              ...message,
              createdAt: this.convertDate(message.createdAt.toString()),
            },
          ]);
          this.cdr.detectChanges(); // Запуск обнаружения изменений
          setTimeout(() => this.scrollToBottom(), 0);
        }
      }
    });
  }

  loadHistory(chatId: number) {
    this.chatService.getHistory(chatId).subscribe((data) => {
      const { messages } = data;
      this.messages.set(
        messages.map((msg) => ({
          ...msg,
          createdAt: this.convertDate(msg.createdAt.toString()),
        }))
      );
      this.cdr.detectChanges(); // Запуск обнаружения изменений
      setTimeout(() => this.scrollToBottom(), 100); // Небольшая задержка для рендеринга
    });
  }

  convertDate(dateString: string): Date {
    return new Date(dateString.replace(' ', 'T') + 'Z');
  }

  isMyMessage(message: Message) {
    return this.userService.user?.id === message.sendedBy;
  }
  /** Проверяет, это сегодня */
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /** Проверяет, это вчера */
  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  private formatGroupLabel(date: Date): string {
    if (this.isToday(date)) {
      return 'Сегодня';
    }
    if (this.isYesterday(date)) {
      return 'Вчера';
    }
    // например: "26 февраля"
    const datePipe = new DatePipe('ru');
    return datePipe.transform(date, 'd MMMM', undefined, 'ru')!;
  }
  get groupedMessages(): MessageGroup[] {
    const groups: MessageGroup[] = [];
    for (const msg of this.messages()) {
      const d = new Date(msg.createdAt);
      const dayKey = d.toDateString();
      let group = groups.find((g) => g.date.toDateString() === dayKey);
      if (!group) {
        group = {
          date: d,
          label: this.formatGroupLabel(d),
          messages: [],
        };
        groups.push(group);
      }
      group.messages.push(msg);
    }
    // при желании можно отсортировать группы по возрастанию даты:
    groups.sort((a, b) => a.date.getTime() - b.date.getTime());
    return groups;
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
