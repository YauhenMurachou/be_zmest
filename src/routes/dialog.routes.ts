import { Router } from 'express';
import {
  startChat,
  getDialogs,
  getDialogMessages,
  sendMessageToUser,
  getMessageViewed,
  markSpam,
  deleteMessageForUser,
  restoreDeletedMessage,
  getNewDialogMessages,
  getNewMessagesTotalCount,
} from '../controllers/dialog.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All dialog routes require authentication
router.use(authenticateToken);

// PUT /dialogs/{userId} - Start chat / refresh companion to top
router.put('/:userId', startChat);

// GET /dialogs - Get all dialogs
router.get('/', getDialogs);

// GET /dialogs/{userId}/messages - Get messages with friend
router.get('/:userId/messages', getDialogMessages);

// GET /dialogs/{userId}/messages/new?newerThen={date} - Get new messages
router.get('/:userId/messages/new', getNewDialogMessages);

// POST /dialogs/{userId}/messages - Send message to friend
router.post('/:userId/messages', sendMessageToUser);

// GET /dialogs/messages/{messageId}/viewed - Check if message is viewed
router.get('/messages/:messageId/viewed', getMessageViewed);

// POST /dialogs/messages/{messageId}/spam - Mark message as spam
router.post('/messages/:messageId/spam', markSpam);

// DELETE /dialogs/messages/{messageId} - Delete message for yourself
router.delete('/messages/:messageId', deleteMessageForUser);

// PUT /dialogs/messages/{messageId}/restore - Restore deleted/spam message
router.put('/messages/:messageId/restore', restoreDeletedMessage);

// GET /dialogs/messages/new/count - Get count of new messages
router.get('/messages/new/count', getNewMessagesTotalCount);

export default router;

