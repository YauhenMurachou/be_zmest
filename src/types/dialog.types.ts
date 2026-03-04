// Database types
export type Dialog = {
  id: number;
  userOneId: number;
  userTwoId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Message = {
  id: number;
  dialogId: number;
  senderId: number;
  recipientId: number;
  body: string;
  addedAt: Date;
  viewed: boolean;
  spam: boolean;
  deletedBySender: boolean;
  deletedByRecipient: boolean;
};

// Input types
export type DialogStartInput = {
  userId: number;
};

export type MessageSendInput = {
  recipientId: number;
  body: string;
};

export type MessageGetInput = {
  recipientId: number;
  page: number;
  count: number;
};

export type MessagesNewInput = {
  recipientId: number;
  newerThen: Date;
};

// Response types
export type DialogListItem = {
  id: number;
  userId: number;
  userName: string;
  lastMessage: string | null;
  lastMessageAddedAt: Date | null;
  newMessages: number;
  photos: {
    small: string | null;
    large: string | null;
  };
};

export type MessageListItem = {
  id: number;
  body: string;
  senderId: number;
  recipientId: number;
  addedAt: Date;
  viewed: boolean;
  spam: boolean;
  deletedBy: boolean;
};

export type MessageViewedResponse = {
  messageId: number;
  viewed: boolean;
};

export type NewMessagesCountItem = {
  userId: number;
  newMessages: number;
};

// API Response wrappers
export type DialogResponse = {
  items: DialogListItem[];
  totalCount: number;
};

export type MessageResponse = {
  items: MessageListItem[];
  totalCount: number;
};

export type NewMessagesResponse = {
  items: MessageListItem[];
};

export type NewMessagesCountResponse = {
  items: NewMessagesCountItem[];
};

export type SingleMessageResponse = {
  id: number;
  body: string;
  senderId: number;
  recipientId: number;
  addedAt: Date;
  viewed: boolean;
  spam: boolean;
  deletedBySender: boolean;
  deletedByRecipient: boolean;
};

export type OperationResponse = {
  resultCode: number;
  messages: string[];
  data: Record<string, unknown>;
};

// Constants
export const DEFAULT_PAGE = 1;
export const DEFAULT_COUNT = 10;
export const MAX_COUNT = 100;

