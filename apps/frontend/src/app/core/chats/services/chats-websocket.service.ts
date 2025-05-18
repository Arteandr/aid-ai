import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { JwtService } from '../../auth/services/jwt.service';
import {
  RequestSocketMessage,
  ResponseSocketMessage,
} from '../models/websocket-message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatsWebsocketService implements OnDestroy {
  private socket$: WebSocketSubject<
    ResponseSocketMessage | RequestSocketMessage
  > | null = null;
  private destroy$ = new Subject<void>();
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private messageQueue: RequestSocketMessage[] = [];

  constructor(private readonly jwtService: JwtService) {
    this.connect();
  }

  private connect(): void {
    if (this.socket$ !== null) {
      return;
    }

    const token = this.jwtService.getToken();
    if (!token) {
      console.error('No token available for WebSocket connection');
      return;
    }

    this.socket$ = webSocket<ResponseSocketMessage | RequestSocketMessage>({
      url: `ws://localhost:4000/ws?token=${token}`,
      openObserver: {
        next: () => {
          console.log('WebSocket connected');
          this.connectionStatus$.next(true);
          this.reconnectAttempts = 0;

          // Send any queued messages
          if (this.messageQueue.length > 0) {
            console.log(`Sending ${this.messageQueue.length} queued messages`);
            this.messageQueue.forEach((msg) => this.sendImmediate(msg));
            this.messageQueue = [];
          }
        },
      },
      closeObserver: {
        next: (event) => {
          console.log('WebSocket disconnected', event);
          this.connectionStatus$.next(false);
          this.socket$ = null;
          this.attemptReconnect();
        },
      },
    });

    // Handle errors
    this.socket$.pipe(takeUntil(this.destroy$)).subscribe({
      error: (err) => {
        console.error('WebSocket error:', err);
        this.connectionStatus$.next(false);
        this.socket$ = null;
        this.attemptReconnect();
      },
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`
    );
    setTimeout(() => this.connect(), delay);
  }

  public send(message: RequestSocketMessage): void {
    console.log('Sending message via WebSocket:', message);

    if (this.connectionStatus$.value) {
      this.sendImmediate(message);
    } else {
      console.log('Connection not open, queueing message');
      this.messageQueue.push(message);
      this.connect(); // Try to establish connection
    }
  }

  private sendImmediate(message: RequestSocketMessage): void {
    if (this.socket$) {
      try {
        this.socket$.next(message);
      } catch (error) {
        console.error('Error sending message:', error);
        this.messageQueue.push(message);
      }
    } else {
      console.error('Socket is null, cannot send message');
      this.messageQueue.push(message);
    }
  }

  public get messages$(): Observable<ResponseSocketMessage> {
    if (!this.socket$) {
      this.connect();
    }

    return this.socket$
      ? this.socket$
          .asObservable()
          .pipe(filter((msg): msg is ResponseSocketMessage => 'data' in msg))
      : new Observable<ResponseSocketMessage>();
  }

  public get isConnected$(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  public waitForConnection(): Observable<boolean> {
    return this.connectionStatus$.pipe(
      filter((status) => status === true),
      take(1)
    );
  }

  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    this.connectionStatus$.next(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.close();
  }
}
