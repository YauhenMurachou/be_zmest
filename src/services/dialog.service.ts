import { pool } from '../database/connection';
import {
  Dialog,
  Message,
  DialogListItem,
  MessageListItem,
  MessageViewedResponse,
  NewMessagesCountItem,
  DEFAULT_PAGE,
  DEFAULT_COUNT,
  MAX_COUNT,
} from '../types/dialog.types';

const mapRowToDialog = (row: Record<string, unknown>): Dialog => ({
  id: Number(row.id),
  userOneId: Number(row.user_one_id),
  userTwoId: Number(row.user_two_id),
  createdAt: new Date(String(row.created_at)),
  updatedAt: new Date(String(row.updated_at)),
});

const mapRowToMessage = (row: Record<string, unknown>): Message => ({
  id: Number(row.id),
  dialogId: Number(row.dialog_id),
  senderId: Number(row.sender_id),
  recipientId: Number(row.recipient_id),
  body: String(row.body),
  addedAt: new Date(String(row.added_at)),
  viewed: Boolean(row.viewed),
  spam: Boolean(row.spam),
  deletedBySender: Boolean(row.deleted_by_sender),
  deletedByRecipient: Boolean(row.deleted_by_recipient),
});

// Get or create dialog between current user and friend
export const getOrCreateDialog = async (userId: number, currentUserId: number): Promise<Dialog> => {
  // First try to find existing dialog
  const findResult = await pool.query(
    `SELECT id, user_one_id, user_two_id, created_at, updated_at
     FROM dialogs
     WHERE (user_one_id = $1 AND user_two_id = $2)
        OR (user_one_id = $2 AND user_two_id = $1)`,
    [userId, currentUserId]
  );

  if (findResult.rows.length > 0) {
    // Update updated_at to bring conversation to top
    await pool.query(
      `UPDATE dialogs SET updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [findResult.rows[0].id]
    );
    return mapRowToDialog(findResult.rows[0]);
  }

  // Create new dialog
  const createResult = await pool.query(
    `INSERT INTO dialogs (user_one_id, user_two_id)
     VALUES ($1, $2)
     RETURNING id, user_one_id, user_two_id, created_at, updated_at`,
    [currentUserId, userId]
  );

  if (createResult.rows.length === 0) {
    throw new Error('Failed to create dialog');
  }

  return mapRowToDialog(createResult.rows[0]);
};

// Get all dialogs for a user
export const getAllDialogs = async (userId: number): Promise<{ items: DialogListItem[]; totalCount: number }> => {
  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM dialogs
     WHERE user_one_id = $1 OR user_two_id = $1`,
    [userId]
  );
  const totalCount = Number(countResult.rows[0]?.total ?? 0);

  // Get dialogs with last message and unread count
  const result = await pool.query(
    `SELECT
       d.id,
       d.user_one_id,
       d.user_two_id,
       d.updated_at,
       COALESCE(m.body, '') AS last_message,
       m.added_at AS last_message_added_at,
       p.user_id AS profile_user_id,
       p.photo_small_url,
       p.photo_large_url,
       (SELECT COUNT(*) FROM messages m2
        WHERE m2.dialog_id = d.id
          AND m2.recipient_id = $1
          AND m2.viewed = FALSE
          AND m2.deleted_by_recipient = FALSE
          AND m2.spam = FALSE) AS new_messages
     FROM dialogs d
     LEFT JOIN LATERAL (
       SELECT m.id, m.body, m.added_at
       FROM messages m
       WHERE m.dialog_id = d.id
         AND ((m.sender_id = $1 AND m.deleted_by_sender = FALSE)
              OR (m.recipient_id = $1 AND m.deleted_by_recipient = FALSE))
         AND m.spam = FALSE
       ORDER BY m.added_at DESC
       LIMIT 1
     ) m ON TRUE
     LEFT JOIN profiles p ON p.user_id = CASE
       WHEN d.user_one_id = $1 THEN d.user_two_id
       ELSE d.user_one_id
     END
     WHERE d.user_one_id = $1 OR d.user_two_id = $1
     ORDER BY d.updated_at DESC`,
    [userId]
  );

  const items: DialogListItem[] = result.rows.map((row) => {
    const companionId = row.user_one_id === userId ? row.user_two_id : row.user_one_id;
    return {
      id: Number(row.id),
      userId: companionId,
      userName: row.profile_user_id ? '' : String(companionId), // Will be filled with username if available
      lastMessage: row.last_message === '' ? null : String(row.last_message),
      lastMessageAddedAt: row.last_message_added_at ? new Date(String(row.last_message_added_at)) : null,
      newMessages: Number(row.new_messages ?? 0),
      photos: {
        small: row.photo_small_url as string | null,
        large: row.photo_large_url as string | null,
      },
    };
  });

  // Fetch usernames for companions
  for (const item of items) {
    const userResult = await pool.query(
      `SELECT username FROM users WHERE id = $1`,
      [item.userId]
    );
    if (userResult.rows.length > 0) {
      item.userName = String(userResult.rows[0].username);
    }
  }

  return { items, totalCount };
};

// Get messages for a dialog
export const getMessages = async (
  userId: number,
  recipientId: number,
  page: number = DEFAULT_PAGE,
  count: number = DEFAULT_COUNT
): Promise<{ items: MessageListItem[]; totalCount: number }> => {
  // First find the dialog
  const dialogResult = await pool.query(
    `SELECT id FROM dialogs
     WHERE (user_one_id = $1 AND user_two_id = $2)
        OR (user_one_id = $2 AND user_two_id = $1)`,
    [userId, recipientId]
  );

  if (dialogResult.rows.length === 0) {
    return { items: [], totalCount: 0 };
  }

  const dialogId = dialogResult.rows[0].id;
  const limit = Math.min(count, MAX_COUNT);
  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM messages
     WHERE dialog_id = $1
       AND ((sender_id = $2 AND deleted_by_sender = FALSE)
            OR (recipient_id = $2 AND deleted_by_recipient = FALSE))
       AND spam = FALSE`,
    [dialogId, userId]
  );
  const totalCount = Number(countResult.rows[0]?.total ?? 0);

  // Get messages
  const result = await pool.query(
    `SELECT id, body, sender_id, recipient_id, added_at, viewed, spam,
            deleted_by_sender, deleted_by_recipient
     FROM messages
     WHERE dialog_id = $1
       AND ((sender_id = $2 AND deleted_by_sender = FALSE)
            OR (recipient_id = $2 AND deleted_by_recipient = FALSE))
       AND spam = FALSE
     ORDER BY added_at DESC
     LIMIT $3 OFFSET $4`,
    [dialogId, userId, limit, offset]
  );

  const items: MessageListItem[] = result.rows.map((row) => ({
    id: Number(row.id),
    body: String(row.body),
    senderId: Number(row.sender_id),
    recipientId: Number(row.recipient_id),
    addedAt: new Date(String(row.added_at)),
    viewed: Boolean(row.viewed),
    spam: Boolean(row.spam),
    deletedBy: row.sender_id === userId ? Boolean(row.deleted_by_sender) : Boolean(row.deleted_by_recipient),
  }));

  // Mark messages as viewed
  await pool.query(
    `UPDATE messages
     SET viewed = TRUE
     WHERE dialog_id = $1
       AND recipient_id = $2
       AND viewed = FALSE`,
    [dialogId, userId]
  );

  return { items: items.reverse(), totalCount };
};

// Send a message
export const sendMessage = async (senderId: number, recipientId: number, body: string): Promise<Message> => {
  // Get or create dialog
  const dialog = await getOrCreateDialog(recipientId, senderId);

  const result = await pool.query(
    `INSERT INTO messages (dialog_id, sender_id, recipient_id, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, dialog_id, sender_id, recipient_id, body, added_at, viewed, spam,
               deleted_by_sender, deleted_by_recipient`,
    [dialog.id, senderId, recipientId, body]
  );

  if (result.rows.length === 0) {
    throw new Error('Failed to send message');
  }

  return mapRowToMessage(result.rows[0]);
};

// Get message viewed status
export const getMessageViewedStatus = async (messageId: number, userId: number): Promise<MessageViewedResponse | null> => {
  const result = await pool.query(
    `SELECT id, viewed
     FROM messages
     WHERE id = $1
       AND (sender_id = $2 OR recipient_id = $2)`,
    [messageId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    messageId: Number(result.rows[0].id),
    viewed: Boolean(result.rows[0].viewed),
  };
};

// Mark message as spam
export const markMessageAsSpam = async (messageId: number, userId: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE messages
     SET spam = TRUE
     WHERE id = $1
       AND (sender_id = $2 OR recipient_id = $2)
     RETURNING id`,
    [messageId, userId]
  );

  return result.rows.length > 0;
};

// Delete message for current user only
export const deleteMessage = async (messageId: number, userId: number): Promise<boolean> => {
  // Check if user is sender or recipient
  const checkResult = await pool.query(
    `SELECT sender_id FROM messages WHERE id = $1`,
    [messageId]
  );

  if (checkResult.rows.length === 0) {
    return false;
  }

  const isSender = Number(checkResult.rows[0].sender_id) === userId;

  if (isSender) {
    const result = await pool.query(
      `UPDATE messages
       SET deleted_by_sender = TRUE
       WHERE id = $1
       RETURNING id`,
      [messageId]
    );
    return result.rows.length > 0;
  } else {
    const result = await pool.query(
      `UPDATE messages
       SET deleted_by_recipient = TRUE
       WHERE id = $1
       RETURNING id`,
      [messageId]
    );
    return result.rows.length > 0;
  }
};

// Restore message from deleted/spam
export const restoreMessage = async (messageId: number, userId: number): Promise<boolean> => {
  const result = await pool.query(
    `UPDATE messages
     SET spam = FALSE,
         deleted_by_sender = FALSE,
         deleted_by_recipient = FALSE
     WHERE id = $1
       AND (sender_id = $2 OR recipient_id = $2)
     RETURNING id`,
    [messageId, userId]
  );

  return result.rows.length > 0;
};

// Get new messages newer than date
export const getNewMessages = async (
  userId: number,
  recipientId: number,
  newerThen: Date
): Promise<MessageListItem[]> => {
  // Find the dialog
  const dialogResult = await pool.query(
    `SELECT id FROM dialogs
     WHERE (user_one_id = $1 AND user_two_id = $2)
        OR (user_one_id = $2 AND user_two_id = $1)`,
    [userId, recipientId]
  );

  if (dialogResult.rows.length === 0) {
    return [];
  }

  const dialogId = dialogResult.rows[0].id;

  const result = await pool.query(
    `SELECT id, body, sender_id, recipient_id, added_at, viewed, spam,
            deleted_by_sender, deleted_by_recipient
     FROM messages
     WHERE dialog_id = $1
       AND added_at > $2
       AND ((sender_id = $3 AND deleted_by_sender = FALSE)
            OR (recipient_id = $3 AND deleted_by_recipient = FALSE))
       AND spam = FALSE
     ORDER BY added_at ASC`,
    [dialogId, newerThen, userId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    body: String(row.body),
    senderId: Number(row.sender_id),
    recipientId: Number(row.recipient_id),
    addedAt: new Date(String(row.added_at)),
    viewed: Boolean(row.viewed),
    spam: Boolean(row.spam),
    deletedBy: row.sender_id === userId ? Boolean(row.deleted_by_sender) : Boolean(row.deleted_by_recipient),
  }));
};

// Get count of new messages from all dialogs
export const getNewMessagesCount = async (userId: number): Promise<NewMessagesCountItem[]> => {
  const result = await pool.query(
    `SELECT
       CASE
         WHEN sender_id = $1 THEN recipient_id
         ELSE sender_id
       END AS companion_id,
       COUNT(*) AS new_messages
     FROM messages
     WHERE recipient_id = $1
       AND viewed = FALSE
       AND deleted_by_recipient = FALSE
       AND spam = FALSE
     GROUP BY companion_id`,
    [userId]
  );

  return result.rows.map((row) => ({
    userId: Number(row.companion_id),
    newMessages: Number(row.new_messages),
  }));
};

