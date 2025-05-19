// Request related types

import { Message } from '../../models/message.model';

export enum RequestMessageCommand {
  SEND_MESSAGE = 'send_message',
}

export interface SendMessageData {
  command: RequestMessageCommand.SEND_MESSAGE; // Use literal type 'send_message'
  text: string;
  chat_id?: number; // Optional property
}

export type RequestSocketMessageData = SendMessageData;

export interface RequestSocketMessage {
  data: RequestSocketMessageData;
}

// Response related types

export enum ResponseMessageCommand {
  NEW_MESSAGE = 'new_message',
}

export interface NewMessageData {
  message: Message;
  chatId: number;
}

// Alias for clarity in ResponseSocketMessage type
export type ResponseSocketMessageData = NewMessageData;

export interface ResponseSocketMessage {
  command: ResponseMessageCommand;
  data: ResponseSocketMessageData;
}
