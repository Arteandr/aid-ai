import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {
  RequestSocketMessage,
  ResponseSocketMessage,
} from '../models/websocket-message.model';
import { filter, Observable, Subscription, switchMap } from 'rxjs';
import { UserService } from '../../auth/services/user.service';
import { JwtService } from '../../auth/services/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class ChatsWebsocketService implements OnDestroy {
  private socket$: WebSocketSubject<
    ResponseSocketMessage | RequestSocketMessage
  >;
  private subscriptions: Subscription[] = [];

  constructor(private readonly jwtService: JwtService) {
    this.socket$ = webSocket<ResponseSocketMessage | RequestSocketMessage>({
      url: `ws://localhost:4000/ws?token=${jwtService.getToken()}`,
      openObserver: {
        next: () => console.log('WebSocket открыт'),
      },
      closeObserver: {
        next: () => console.log('WebSocket закрыт'),
      },
    });
  }
  public send(message: RequestSocketMessage) {
    console.log('Отправка сообщения по WebSocket:', message);

    this.socket$.next(message);
  }

  public get messages$(): Observable<ResponseSocketMessage> {
    return this.socket$
      .asObservable()
      .pipe(filter((msg): msg is ResponseSocketMessage => 'data' in msg));
  }

  public close(): void {
    this.socket$.complete();
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  ngOnDestroy(): void {
    this.close();
  }
}
