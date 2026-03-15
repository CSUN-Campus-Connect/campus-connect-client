export type ID = string;

export interface User {
  id: ID;
  username: string;
  displayName: string;
  avatarUrl: string;
  lastActiveAt: number;
}

export interface Note {
  id: string;
  userId: ID;
  text: string;
  updatedAt: number;
}

export interface Thread {
  id: ID;
  participantIds: ID[];
  updatedAt: number;
  isRequest?: boolean;
<<<<<<< HEAD
  /** Optional display name for group chats */
=======
  /** Optional name for group chats */
>>>>>>> 7acbbfd (refactored messaging added files from dev branch)
  name?: string;
}

export type AttachmentType = "image" | "audio" | "file";

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  size?: number;
}

export interface Message {
  id: string;
  threadId: ID;
  fromUserId: ID;
  text: string;
  createdAt: number;
  attachments?: Attachment[];
  seenByUserIds?: ID[];
}
