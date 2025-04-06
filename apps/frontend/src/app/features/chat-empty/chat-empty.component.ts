import { Component } from '@angular/core';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'app-chat-empty',
  standalone: true,
  templateUrl: './chat-empty.component.html',
  styleUrl: './chat-empty.component.scss',
  imports: [TuiBlockStatus, TuiButton, TuiIcon],
})
export class ChatEmptyComponent {}
