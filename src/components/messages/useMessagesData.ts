"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "@/lib/axios";
import type { ID, Message, Note, Thread, User, Attachment } from "@/types/messages";

function toThread(conv: any): Thread {
  return {
    id: conv.id,
    participantIds: conv.Participants.map((p: any) => p.userId),
    updatedAt: new Date(conv.updatedAt).getTime(),
    isRequest: false,
    name: conv.name || undefined,
  };
}

function toUser(participant: any): User {
  const u = participant.User || participant;
  return {
    id: u.id,
    username: u.username || `${u.firstName || ""}${u.lastName || ""}`.toLowerCase(),
    displayName: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
    avatarUrl: u.profilePicture || "",
    lastActiveAt: u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : Date.now(),
  };
}

function toAttachment(att: any): Attachment {
  return {
    id: att.id,
    type: att.type || "file",
    name: att.fileName || "File",
    url: att.fileUrl || "",
    size: att.fileSize ?? undefined,
  };
}

function toMessage(msg: any): Message {
  const attachments: Attachment[] = (msg.Attachments ?? []).map(toAttachment);
  return {
    id: msg.id,
    threadId: msg.conversationId,
    fromUserId: msg.senderId,
    text: msg.content || "",
    createdAt: new Date(msg.createdAt).getTime(),
    attachments: attachments.length > 0 ? attachments : undefined,
    seenByUserIds: [],
  };
}

function getToken(): string | null {
  try { return localStorage.getItem("token"); } catch { return null; }
}

function getStoredUser(): any | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useMessagesData() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notes] = useState<Note[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, Message[]>>({});
  const [selectedThreadId, setSelectedThreadId] = useState<ID | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingByThread, setTypingByThread] = useState<Record<string, string | null>>({});
  const [reactionsByMessage, setReactionsByMessage] = useState<Record<string, { emoji: string; userId: string }[]>>({});
  const [readReceiptsByThread, setReadReceiptsByThread] = useState<Record<string, { userId: string; messageId: string }>>({});
  const [hasMoreByThread, setHasMoreByThread] = useState<Record<string, boolean>>({});
  const [loadingMoreByThread, setLoadingMoreByThread] = useState<Record<string, boolean>>({});
  const [groupPictureByThreadId, setGroupPictureByThreadId] = useState<Record<string, string>>({});

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meIdRef = useRef<string>("");
  const loadingMoreRef = useRef<Record<string, boolean>>({});

  const storedUser = getStoredUser();
  const meId: ID = storedUser?.id || "";
  meIdRef.current = meId;

  const me: User = useMemo(() => ({
    id: meId,
    username: storedUser?.username || storedUser?.firstName?.toLowerCase() || "me",
    displayName: `${storedUser?.firstName || ""} ${storedUser?.lastName || ""}`.trim() || "You",
    avatarUrl: storedUser?.profilePicture || "",
    lastActiveAt: Date.now(),
  }), [meId, storedUser?.username, storedUser?.firstName, storedUser?.lastName, storedUser?.profilePicture]);

  const usersWithMe = useMemo(() => {
    if (users.some((u) => u.id === meId)) return users;
    return [me, ...users];
  }, [users, meId, me]);

  const allMessages = useMemo(() => Object.values(messagesByThread).flat(), [messagesByThread]);
  const threadMessages = useMemo(
    () => (selectedThreadId ? messagesByThread[selectedThreadId] ?? [] : []),
    [selectedThreadId, messagesByThread]
  );

  const fetchConversations = useCallback(async () => {
    const token = getToken();
    if (!token) { setError("Not authenticated"); setLoading(false); return; }

    try {
      const res = await api.get("/api/v1/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const convos: Thread[] = [];
      const userMap = new Map<ID, User>();
      const groupPictures: Record<string, string> = {};
      const readReceipts: Record<string, { userId: string; messageId: string }> = {};

      for (const conv of res.data) {
        convos.push(toThread(conv));

        if (conv.groupPictureUrl) {
          groupPictures[conv.id] = conv.groupPictureUrl;
        }

        for (const p of conv.Participants) {
          if (p.userId !== meIdRef.current && !userMap.has(p.userId)) {
            userMap.set(p.userId, toUser(p));
          }

          if (p.lastReadMessageId && p.userId !== meIdRef.current) {
            readReceipts[conv.id] = {
              userId: p.userId,
              messageId: p.lastReadMessageId,
            };
          }
        }
      }

      setThreads(convos);
      setUsers(Array.from(userMap.values()));
      setGroupPictureByThreadId((prev) => ({ ...prev, ...groupPictures }));
      setReadReceiptsByThread((prev) => ({ ...prev, ...readReceipts }));
      setError(null);

      if (socketRef.current?.connected) {
        convos.forEach((conv) => {
          socketRef.current!.emit("conversation:join", { conversationId: conv.id });
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (threadId: string) => {
    const token = getToken();
    if (!token) return;

    setMessagesByThread((prev) => ({ ...prev, [threadId]: [] }));

    try {
      const res = await api.get(`/api/v1/messages/conversations/${threadId}/messages`, {
        params: { limit: 30 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const msgs = res.data.map(toMessage).reverse();
      setMessagesByThread((prev) => ({ ...prev, [threadId]: msgs }));
      setHasMoreByThread((prev) => ({ ...prev, [threadId]: res.data.length === 30 }));

      if (msgs.length && socketRef.current?.connected) {
        const lastMsg = msgs[msgs.length - 1];
        socketRef.current.emit("message:read", {
          conversationId: threadId,
          messageId: lastMsg.id,
        });
      }

      const reactions: Record<string, { emoji: string; userId: string }[]> = {};
      res.data.forEach((msg: any) => {
        if (msg.Reactions?.length) {
          reactions[msg.id] = msg.Reactions.map((r: any) => ({ emoji: r.emoji, userId: r.userId }));
        }
      });
      setReactionsByMessage((prev) => ({ ...prev, ...reactions }));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, []);

  const fetchOlderMessages = useCallback(async (threadId: string) => {
    const token = getToken();
    if (!token) return;
    if (loadingMoreRef.current[threadId]) return;

    const existing = messagesByThread[threadId] ?? [];
    if (!existing.length) return;

    const cursor = existing[0].id;

    loadingMoreRef.current[threadId] = true;
    setLoadingMoreByThread((prev) => ({ ...prev, [threadId]: true }));

    try {
      const res = await api.get(`/api/v1/messages/conversations/${threadId}/messages`, {
        params: { limit: 30, cursor },
        headers: { Authorization: `Bearer ${token}` },
      });

      const older = res.data.map(toMessage).reverse();
      setMessagesByThread((prev) => ({
        ...prev,
        [threadId]: [...older, ...(prev[threadId] ?? [])],
      }));
      setHasMoreByThread((prev) => ({ ...prev, [threadId]: res.data.length === 30 }));

      const reactions: Record<string, { emoji: string; userId: string }[]> = {};
      res.data.forEach((msg: any) => {
        if (msg.Reactions?.length) {
          reactions[msg.id] = msg.Reactions.map((r: any) => ({ emoji: r.emoji, userId: r.userId }));
        }
      });
      setReactionsByMessage((prev) => ({ ...prev, ...reactions }));
    } catch (err) {
      console.error("Failed to fetch older messages:", err);
    } finally {
      loadingMoreRef.current[threadId] = false;
      setLoadingMoreByThread((prev) => ({ ...prev, [threadId]: false }));
    }
  }, [messagesByThread]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedThreadId) {
      fetchMessages(selectedThreadId);
      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:join", { conversationId: selectedThreadId });
      }
      if (socketRef.current?.connected) {
        const messages = messagesByThread[selectedThreadId];
        if (messages?.length) {
          const lastMsg = messages[messages.length - 1];
          socketRef.current.emit("message:read", {
            conversationId: selectedThreadId,
            messageId: lastMsg.id,
          });
        }
      }
    }
  }, [selectedThreadId, fetchMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      fetchConversations();
    });

    socket.on("message:new", (msg: any) => {
      const mapped = toMessage(msg);
      setMessagesByThread((prev) => {
        const existing = prev[mapped.threadId] ?? [];
        if (existing.some((m) => m.id === mapped.id)) return prev;
        return { ...prev, [mapped.threadId]: [...existing, mapped] };
      });
      setThreads((prev) =>
        prev.map((t) => (t.id === mapped.threadId ? { ...t, updatedAt: Date.now() } : t))
      );
    });

    socket.on("message:edited", (msg: any) => {
      const mapped = toMessage(msg);
      setMessagesByThread((prev) => ({
        ...prev,
        [mapped.threadId]: (prev[mapped.threadId] ?? []).map((m) =>
          m.id === mapped.id ? mapped : m
        ),
      }));
    });

    socket.on("message:deleted", (data: { messageId: string; conversationId: string }) => {
      setMessagesByThread((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] ?? []).map((m) =>
          m.id === data.messageId ? { ...m, text: "" } : m
        ),
      }));
    });

    socket.on("message:reaction", (data: { messageId: string; userId: string; emoji: string; action: "added" | "removed" }) => {
      setReactionsByMessage((prev) => {
        const existing = prev[data.messageId] ?? [];
        if (data.action === "removed") {
          return { ...prev, [data.messageId]: existing.filter((r) => !(r.userId === data.userId && r.emoji === data.emoji)) };
        }
        if (existing.some((r) => r.userId === data.userId && r.emoji === data.emoji)) return prev;
        return { ...prev, [data.messageId]: [...existing, { emoji: data.emoji, userId: data.userId }] };
      });
    });

    socket.on("typing:indicator", (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      console.log("typing:indicator received", data);
      setTypingByThread((prev) => ({
        ...prev,
        [data.conversationId]: data.isTyping ? data.userId : null,
      }));
    });

    socket.on("message:read_receipt", (data: { conversationId: string; userId: string; messageId: string }) => {
      setReadReceiptsByThread((prev) => ({
        ...prev,
        [data.conversationId]: { userId: data.userId, messageId: data.messageId },
      }));
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSend = useCallback(async (threadId: string, text: string, attachmentUrls?: string[]) => {
    if (!text.trim() || !socketRef.current?.connected) {
      const token = getToken();
      if (!token) return;
      try {
        const res = await api.post(
          `/api/v1/messages/conversations/${threadId}/messages`,
          { content: text.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mapped = toMessage(res.data);
        setMessagesByThread((prev) => ({
          ...prev,
          [threadId]: [...(prev[threadId] ?? []), mapped],
        }));
        setThreads((prev) =>
          prev.map((t) => (t.id === threadId ? { ...t, updatedAt: Date.now() } : t))
        );
      } catch (err) {
        console.error("Failed to send message via REST fallback:", err);
      }
      return;
    }

    socketRef.current.emit("message:send", { conversationId: threadId, content: text.trim() });
  }, []);

  const onEditMessage = useCallback(async (messageId: string, newText: string) => {
    if (!newText.trim() || !socketRef.current) return;
    socketRef.current.emit("message:edit", { messageId, content: newText.trim() });
  }, []);

  const onDeleteMessage = useCallback(async (messageId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message:delete", { messageId });
  }, []);

  const onReactMessage = useCallback((messageId: string, emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message:react", { messageId, emoji });
  }, []);

  const onTypingStart = useCallback((threadId: string) => {
    console.log("typing:start emitting", threadId, socketRef.current?.connected);

    if (!socketRef.current) return;
    socketRef.current.emit("typing:start", { conversationId: threadId });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing:stop", { conversationId: threadId });
      }
    }, 3000);
  }, []);

  const onTypingStop = useCallback((threadId: string) => {
    if (!socketRef.current) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socketRef.current.emit("typing:stop", { conversationId: threadId });
  }, []);

  const onUpdateNote = useCallback(async (_text: string) => {}, []);

  const onPickUser = useCallback(async (userId: ID) => {
    if (userId === meIdRef.current) return;
    const token = getToken();
    if (!token) return;

    const existing = threads.find(
      (t) => !t.isRequest && t.participantIds.includes(meIdRef.current) && t.participantIds.includes(userId)
    );
    if (existing) {
      setSelectedThreadId(existing.id);
      return;
    }

    try {
      const res = await api.post(
        "/api/v1/messages/conversations",
        { isGroup: false, participantIds: [userId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newThread = toThread(res.data);
      setThreads((prev) => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);

      for (const p of res.data.Participants) {
        if (p.userId !== meIdRef.current) {
          setUsers((prev) => {
            if (prev.some((u) => u.id === p.userId)) return prev;
            return [...prev, toUser(p)];
          });
        }
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:join", { conversationId: newThread.id });
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    }
  }, [threads]);

  const onCreateGroup = useCallback(async (participantIds: ID[], name: string, groupPictureUrl?: string) => {
    const token = getToken();
    if (!token) return;
    if (participantIds.length < 2) return;

    try {
      const res = await api.post(
        "/api/v1/messages/conversations",
        {
          isGroup: true,
          participantIds: participantIds.filter((id) => id !== meIdRef.current),
          name: name.trim() || "Group chat",
          groupPictureUrl: groupPictureUrl || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newThread = toThread(res.data);
      setThreads((prev) => [newThread, ...prev]);
      setSelectedThreadId(newThread.id);

      if (res.data.groupPictureUrl) {
        setGroupPictureByThreadId((prev) => ({ ...prev, [newThread.id]: res.data.groupPictureUrl }));
      } else if (groupPictureUrl) {
        setGroupPictureByThreadId((prev) => ({ ...prev, [newThread.id]: groupPictureUrl }));
      }

      for (const p of res.data.Participants) {
        if (p.userId !== meIdRef.current) {
          setUsers((prev) => {
            if (prev.some((u) => u.id === p.userId)) return prev;
            return [...prev, toUser(p)];
          });
        }
      }

      if (socketRef.current?.connected) {
        socketRef.current.emit("conversation:join", { conversationId: newThread.id });
      }
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchConversations();
  }, [fetchConversations]);

  const onSearchUsers = useCallback(async (q: string): Promise<User[]> => {
    const token = getToken();
    if (!token || q.trim().length < 2) return [];
    try {
      const res = await api.get(`/api/v1/users/search?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.map((u: any) => toUser(u));
    } catch (err) {
      console.error("User search failed:", err);
      return [];
    }
  }, []);

  return {
    threads,
    usersWithMe,
    notes,
    allMessages,
    threadMessages,
    selectedThreadId,
    setSelectedThreadId,
    me,
    loading,
    error,
    onSend,
    onEditMessage,
    onDeleteMessage,
    onReactMessage,
    onTypingStart,
    onTypingStop,
    typingByThread,
    reactionsByMessage,
    readReceiptsByThread,
    onUpdateNote,
    onPickUser,
    onCreateGroup,
    groupPictureByThreadId,
    refresh,
    onSearchUsers,
    hasMoreByThread,
    loadingMoreByThread,
    fetchOlderMessages,
  };
}