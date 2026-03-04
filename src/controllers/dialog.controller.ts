import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request.types';
import {
  getOrCreateDialog,
  getAllDialogs,
  getMessages,
  sendMessage,
  getMessageViewedStatus,
  markMessageAsSpam,
  deleteMessage,
  restoreMessage,
  getNewMessages,
  getNewMessagesCount,
} from '../services/dialog.service';
import {
  DEFAULT_PAGE,
  DEFAULT_COUNT,
} from '../types/dialog.types';

// Standard response helper
const successResponse = <T>(data: T): { resultCode: number; messages: string[]; data: T } => ({
  resultCode: 0,
  messages: [],
  data,
});

const errorResponse = (message: string, data: Record<string, unknown> = {}): { resultCode: number; messages: string[]; data: Record<string, unknown> } => ({
  resultCode: 1,
  messages: [message],
  data,
});

// PUT /dialogs/{userId} - Start chat / refresh companion to top
export const startChat = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const userId = Number(request.params.userId);
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(userId) || userId <= 0) {
      response.status(400).json(errorResponse('Invalid user ID'));
      return;
    }

    if (userId === currentUserId) {
      response.status(400).json(errorResponse('Cannot start chat with yourself'));
      return;
    }

    const dialog = await getOrCreateDialog(userId, currentUserId);

    response.status(200).json(successResponse({
      id: dialog.id,
      userId: userId,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to start chat';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// GET /dialogs - Get all dialogs
export const getDialogs = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    const result = await getAllDialogs(currentUserId);

    response.status(200).json(successResponse({
      items: result.items,
      totalCount: result.totalCount,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get dialogs';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// GET /dialogs/{userId}/messages - Get messages with friend
export const getDialogMessages = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const userId = Number(request.params.userId);
    const currentUserId = request.user?.userId;
    const page = Number(request.query.page) || DEFAULT_PAGE;
    const count = Number(request.query.count) || DEFAULT_COUNT;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(userId) || userId <= 0) {
      response.status(400).json(errorResponse('Invalid user ID'));
      return;
    }

    if (page < 1 || count < 1) {
      response.status(400).json(errorResponse('Invalid pagination parameters'));
      return;
    }

    const result = await getMessages(currentUserId, userId, page, count);

    response.status(200).json(successResponse({
      items: result.items,
      totalCount: result.totalCount,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get messages';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// POST /dialogs/{userId}/messages - Send message to friend
export const sendMessageToUser = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const userId = Number(request.params.userId);
    const currentUserId = request.user?.userId;
    const { body } = request.body;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(userId) || userId <= 0) {
      response.status(400).json(errorResponse('Invalid user ID'));
      return;
    }

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      response.status(400).json(errorResponse('Message body is required'));
      return;
    }

    if (body.trim().length > 5000) {
      response.status(400).json(errorResponse('Message is too long'));
      return;
    }

    if (userId === currentUserId) {
      response.status(400).json(errorResponse('Cannot send message to yourself'));
      return;
    }

    const message = await sendMessage(currentUserId, userId, body.trim());

    response.status(200).json(successResponse({
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      recipientId: message.recipientId,
      addedAt: message.addedAt,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// GET /dialogs/messages/{messageId}/viewed - Check if message is viewed
export const getMessageViewed = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const messageId = Number(request.params.messageId);
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(messageId) || messageId <= 0) {
      response.status(400).json(errorResponse('Invalid message ID'));
      return;
    }

    const result = await getMessageViewedStatus(messageId, currentUserId);

    if (!result) {
      response.status(404).json(errorResponse('Message not found'));
      return;
    }

    response.status(200).json(successResponse(result));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get message status';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// POST /dialogs/messages/{messageId}/spam - Mark message as spam
export const markSpam = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const messageId = Number(request.params.messageId);
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(messageId) || messageId <= 0) {
      response.status(400).json(errorResponse('Invalid message ID'));
      return;
    }

    const success = await markMessageAsSpam(messageId, currentUserId);

    if (!success) {
      response.status(404).json(errorResponse('Message not found'));
      return;
    }

    response.status(200).json(successResponse({}));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark message as spam';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// DELETE /dialogs/messages/{messageId} - Delete message for yourself
export const deleteMessageForUser = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const messageId = Number(request.params.messageId);
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(messageId) || messageId <= 0) {
      response.status(400).json(errorResponse('Invalid message ID'));
      return;
    }

    const success = await deleteMessage(messageId, currentUserId);

    if (!success) {
      response.status(404).json(errorResponse('Message not found'));
      return;
    }

    response.status(200).json(successResponse({}));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// PUT /dialogs/messages/{messageId}/restore - Restore deleted/spam message
export const restoreDeletedMessage = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const messageId = Number(request.params.messageId);
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(messageId) || messageId <= 0) {
      response.status(400).json(errorResponse('Invalid message ID'));
      return;
    }

    const success = await restoreMessage(messageId, currentUserId);

    if (!success) {
      response.status(404).json(errorResponse('Message not found'));
      return;
    }

    response.status(200).json(successResponse({}));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to restore message';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// GET /dialogs/{userId}/messages/new?newerThen={date} - Get new messages
export const getNewDialogMessages = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const userId = Number(request.params.userId);
    const currentUserId = request.user?.userId;
    const newerThenParam = String(request.query.newerThen);

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    if (isNaN(userId) || userId <= 0) {
      response.status(400).json(errorResponse('Invalid user ID'));
      return;
    }

    if (!newerThenParam) {
      response.status(400).json(errorResponse('Date parameter is required'));
      return;
    }

    const newerThen = new Date(newerThenParam);
    if (isNaN(newerThen.getTime())) {
      response.status(400).json(errorResponse('Invalid date format'));
      return;
    }

    const messages = await getNewMessages(currentUserId, userId, newerThen);

    response.status(200).json(successResponse({
      items: messages,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get new messages';
    response.status(400).json(errorResponse(errorMessage));
  }
};

// GET /dialogs/messages/new/count - Get count of new messages
export const getNewMessagesTotalCount = async (
  request: AuthenticatedRequest,
  response: Response
): Promise<void> => {
  try {
    const currentUserId = request.user?.userId;

    if (!currentUserId) {
      response.status(401).json(errorResponse('Unauthorized'));
      return;
    }

    const counts = await getNewMessagesCount(currentUserId);

    response.status(200).json(successResponse({
      items: counts,
    }));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get new messages count';
    response.status(400).json(errorResponse(errorMessage));
  }
};

