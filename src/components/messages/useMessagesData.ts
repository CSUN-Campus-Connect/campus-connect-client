"use client";

import { useCallback, useMemo, useState } from "react";
import type { ID, Message, Note, Thread, User } from "@/types/messages";
import { ME_ID } from "./constants";
import { mockUsers, mockThreads, mockNotes, mockMessagesByThread } from "./mockData";

// Use fixed timestamp so placeholder user is consistent between server and client (avoids hydration mismatch).
const placeholderMe: User = { id: ME_ID, username: "me", displayName: "You", avatarUrl: "", lastActiveAt: 1700000000000 };

export function useMessagesData() {
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>(mockMessagesByThread);
  const [selectedThreadId, setSelectedThreadId] = useState<ID | null>(() => {
    const first = mockThreads.find((t) => !t.isRequest);
    return first?.id ?? null;
  });

  const usersWithMe = useMemo(() => (users.some((u) => u.id === ME_ID) ? users : [placeholderMe, ...users]), [users]);
  const me = useMemo(() => usersWithMe.find((u) => u.id === ME_ID) ?? placeholderMe, [usersWithMe]);
  const allMessages = useMemo(() => Object.values(messagesByThread).flat(), [messagesByThread]);
  const threadMessages = useMemo(() => (selectedThreadId ? messagesByThread[selectedThreadId] ?? [] : []), [selectedThreadId, messagesByThread]);

  const onSend = useCallback<(threadId: string, text: string, attachmentUrls?: string[]) => Promise<void>>(async (threadId, text, attachmentUrls) => {
    const attachments = (attachmentUrls ?? []).map((url, i) => ({ id: `opt-${Date.now()}-${i}`, type: "image" as const, name: "GIF", url }));
    const newMsg: Message = { id: `opt-${Date.now()}`, threadId, fromUserId: ME_ID, text, createdAt: Date.now(), ...(attachments.length > 0 ? { attachments } : {}) };
    setMessagesByThread((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), newMsg] }));
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, updatedAt: Date.now() } : t)));
  }, []);

  const onUpdateNote = useCallback<(text: string) => Promise<void>>(async (text) => {
    setNotes((prev) => {
      const withoutMe = prev.filter((n) => n.userId !== ME_ID);
      return [{ id: "n_me", userId: ME_ID, text: text.slice(0, 60), updatedAt: Date.now() }, ...withoutMe];
    });
  }, []);

  const onPickUser = useCallback<(userId: ID) => Promise<void>>(async (userId) => {
    if (userId === ME_ID) return;
    const existing = threads.find((t) => t.participantIds.includes(ME_ID) && t.participantIds.includes(userId));
    if (existing) { setSelectedThreadId(existing.id); return; }
    const newThread: Thread = { id: `t_${Date.now()}`, participantIds: [ME_ID, userId], updatedAt: Date.now(), isRequest: false };
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThreadId(newThread.id);
  }, [threads]);

  const [groupPictureByThreadId, setGroupPictureByThreadId] = useState<Record<string, string>>({});

  const onCreateGroup = useCallback(
    async (participantIds: ID[], name: string, groupPictureUrl?: string) => {
      if (participantIds.length < 2) return;
      const newThread: Thread = {
        id: `t_${Date.now()}`,
        participantIds,
        updatedAt: Date.now(),
        isRequest: false,
        name: name.trim() || "Group chat",
      };
      setThreads((prev) => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);
      if (groupPictureUrl) setGroupPictureByThreadId((prev) => ({ ...prev, [newThread.id]: groupPictureUrl }));
    },
    []
  );

  const refresh = useCallback(() => {}, []);

  return {
    threads,
    usersWithMe,
    notes,
    allMessages,
    threadMessages,
    selectedThreadId,
    setSelectedThreadId,
    me,
    loading: false,
    error: null,
    onSend,
    onUpdateNote,
    onPickUser,
    onCreateGroup,
    groupPictureByThreadId,
    refresh,
  };
}
