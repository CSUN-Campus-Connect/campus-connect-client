import type { Message, Note, Thread, User } from "@/types/messages";
import { ME_ID } from "./constants";

const now = Date.now();
const mins = (m: number) => now - m * 60_000;
const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/icons/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

export const mockUsers: User[] = [
  { id: ME_ID, username: "Student1", displayName: "Student1", avatarUrl: avatar("me"), lastActiveAt: mins(1) },
  { id: "u1", username: "Student2", displayName: "Student2", avatarUrl: avatar("s2"), lastActiveAt: mins(47) },
  { id: "u2", username: "Student3", displayName: "Student3", avatarUrl: avatar("s3"), lastActiveAt: mins(180) },
  { id: "u3", username: "Student4", displayName: "Student4", avatarUrl: avatar("s4"), lastActiveAt: mins(25) },
  { id: "u4", username: "Student5", displayName: "Student5", avatarUrl: avatar("s5"), lastActiveAt: mins(5) },
  { id: "u5", username: "Student6", displayName: "Student6", avatarUrl: avatar("s6"), lastActiveAt: mins(47) },
  { id: "u6", username: "Student7", displayName: "Student7", avatarUrl: avatar("s7"), lastActiveAt: mins(180) },
  { id: "u7", username: "Student8", displayName: "Student8", avatarUrl: avatar("s8"), lastActiveAt: mins(25) },
  { id: "u8", username: "Student9", displayName: "Student9", avatarUrl: avatar("s9"), lastActiveAt: mins(5) },
  { id: "u9", username: "Student10", displayName: "Student10", avatarUrl: avatar("s10"), lastActiveAt: mins(12) },
  { id: "u10", username: "Student11", displayName: "Student11", avatarUrl: avatar("s11"), lastActiveAt: mins(90) },
  { id: "u11", username: "Student12", displayName: "Student12", avatarUrl: avatar("s12"), lastActiveAt: mins(33) },
  { id: "u12", username: "Student13", displayName: "Student13", avatarUrl: avatar("s13"), lastActiveAt: mins(7) },
  { id: "u13", username: "Student14", displayName: "Student14", avatarUrl: avatar("s14"), lastActiveAt: mins(120) },
  { id: "u14", username: "Student15", displayName: "Student15", avatarUrl: avatar("s15"), lastActiveAt: mins(2) },
  { id: "u15", username: "Student16", displayName: "Student16", avatarUrl: avatar("s16"), lastActiveAt: mins(55) },
  { id: "u16", username: "Student17", displayName: "Student17", avatarUrl: avatar("s17"), lastActiveAt: mins(200) },
  { id: "u17", username: "Student18", displayName: "Student18", avatarUrl: avatar("s18"), lastActiveAt: mins(18) },
  { id: "u18", username: "Student19", displayName: "Student19", avatarUrl: avatar("s19"), lastActiveAt: mins(3) },
  { id: "u19", username: "Student20", displayName: "Student20", avatarUrl: avatar("s20"), lastActiveAt: mins(72) },
];

export const mockThreads: Thread[] = [
  { id: "t1", participantIds: [ME_ID, "u1"], updatedAt: mins(10) },
  { id: "t2", participantIds: [ME_ID, "u2"], updatedAt: mins(180) },
  { id: "t3", participantIds: [ME_ID, "u3"], updatedAt: mins(25), isRequest: false },
  { id: "t4", participantIds: [ME_ID, "u4"], updatedAt: mins(2), isRequest: true },
  { id: "t5", participantIds: [ME_ID, "u5"], updatedAt: mins(47) },
  { id: "t6", participantIds: [ME_ID, "u6"], updatedAt: mins(15), isRequest: true },
  { id: "t7", participantIds: [ME_ID, "u7"], updatedAt: mins(88) },
  { id: "t8", participantIds: [ME_ID, "u8"], updatedAt: mins(5) },
  { id: "t9", participantIds: [ME_ID, "u9"], updatedAt: mins(120), isRequest: false },
  { id: "t10", participantIds: [ME_ID, "u10"], updatedAt: mins(33) },
  { id: "t11", participantIds: [ME_ID, "u11"], updatedAt: mins(7), isRequest: true },
  { id: "t12", participantIds: [ME_ID, "u12"], updatedAt: mins(200) },
  { id: "t13", participantIds: [ME_ID, "u13"], updatedAt: mins(18) },
  { id: "t14", participantIds: [ME_ID, "u14"], updatedAt: mins(3), isRequest: true },
  { id: "t15", participantIds: [ME_ID, "u15"], updatedAt: mins(55) },
  { id: "t16", participantIds: [ME_ID, "u16"], updatedAt: mins(72) },
  { id: "t17", participantIds: [ME_ID, "u17"], updatedAt: mins(40) },
  { id: "t18", participantIds: [ME_ID, "u18"], updatedAt: mins(1), isRequest: false },
  { id: "t19", participantIds: [ME_ID, "u19"], updatedAt: mins(90) },
  { id: "t20", participantIds: [ME_ID, "u1", "u2", "u3", "u4", "u5"], updatedAt: mins(8), name: "Study Squad" },
];

export const mockNotes: Note[] = [
  { id: "n_me", userId: ME_ID, text: "Grinding CampusConnect", updatedAt: mins(12) },
  { id: "n1", userId: "u2", text: "Study group @ USU?", updatedAt: mins(40) },
  { id: "n2", userId: "u3", text: "Hack night 6pm", updatedAt: mins(90) },
  { id: "n3", userId: "u4", text: "Anyone going gym?", updatedAt: mins(25) },
  { id: "n4", userId: "u5", text: "CS lab partner needed", updatedAt: mins(15) },
  { id: "n5", userId: "u7", text: "Library 2nd floor", updatedAt: mins(60) },
  { id: "n6", userId: "u10", text: "Project due Friday", updatedAt: mins(100) },
  { id: "n7", userId: "u12", text: "Coffee run?", updatedAt: mins(8) },
  { id: "n8", userId: "u14", text: "Game night tmrw", updatedAt: mins(45) },
  { id: "n9", userId: "u16", text: "Office hours 3pm", updatedAt: mins(30) },
  { id: "n10", userId: "u18", text: "Free for lunch", updatedAt: mins(5) },
];

export const mockMessages: Message[] = [
  { id: "m1", threadId: "t1", fromUserId: "u1", text: "Hey, are you going to the meeting?", createdAt: mins(47) },
  { id: "m2", threadId: "t1", fromUserId: ME_ID, text: "Yeah, what's the plan?", createdAt: mins(10), seenByUserIds: ["u1"] },
  { id: "m3", threadId: "t2", fromUserId: "u2", text: "Sent you an attachment.", createdAt: mins(180) },
  { id: "m4", threadId: "t3", fromUserId: "u3", text: "Wanna study later?", createdAt: mins(25) },
  { id: "m5", threadId: "t4", fromUserId: "u4", text: "Hey, can we connect?", createdAt: mins(2) },
];

export const mockMessagesByThread: Record<string, Message[]> = {
  t1: mockMessages.filter((m) => m.threadId === "t1").sort((a, b) => a.createdAt - b.createdAt),
  t2: mockMessages.filter((m) => m.threadId === "t2").sort((a, b) => a.createdAt - b.createdAt),
  t3: mockMessages.filter((m) => m.threadId === "t3").sort((a, b) => a.createdAt - b.createdAt),
  t4: mockMessages.filter((m) => m.threadId === "t4").sort((a, b) => a.createdAt - b.createdAt),
};
