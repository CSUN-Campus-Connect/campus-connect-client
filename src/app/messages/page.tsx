"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import { LoadingState, ErrorState } from "@/components/messages/MessagesStates";
import MessagesView from "@/components/messages/MessagesView";
import { useMessagesData } from "@/components/messages/useMessagesData";

const DashboardSidebar = dynamic(() => import("@/components/dashboard/sidebar"), {
  ssr: false,
  loading: () => <Box sx={{ width: 220, flexShrink: 0, height: "100vh", borderRight: "1px solid rgba(0,0,0,0.08)", bgcolor: "white" }} />,
});

function MessagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Box sx={{ display: "flex", bgcolor: "#fafafb", height: "100vh" }}>
      <DashboardSidebar drawerWidth={220} onLogout={() => router.push("/")} />
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>{children}</Box>
    </Box>
  );
}

export default function MessagesPage() {
  const data = useMessagesData();
  if (data.loading && data.threads.length === 0) return <MessagesLayout><LoadingState /></MessagesLayout>;
  if (data.error && data.threads.length === 0) return <MessagesLayout><ErrorState error={data.error} onRetry={data.refresh} /></MessagesLayout>;
  return (
    <MessagesView
      me={data.me}
      meId={data.me.id}
      threads={data.threads}
      users={data.usersWithMe}
      notes={data.notes}
      allMessages={data.allMessages}
      threadMessages={data.threadMessages}
      selectedThreadId={data.selectedThreadId}
      onSelectedThreadIdChange={data.setSelectedThreadId}
      onSend={data.onSend}
      onUpdateNote={data.onUpdateNote}
      onPickUser={data.onPickUser}
      onCreateGroup={data.onCreateGroup}
      groupPictureByThreadId={data.groupPictureByThreadId}
      onRefresh={data.refresh}
      onEditMessage={data.onEditMessage}
      onDeleteMessage={data.onDeleteMessage}
      onTypingStart={data.onTypingStart}
      onTypingStop={data.onTypingStop}
      typingByThread={data.typingByThread}
      readReceiptsByThread={data.readReceiptsByThread}
      onReactMessage={data.onReactMessage}
      reactionsByMessage={data.reactionsByMessage}
      onSearchUsers={data.onSearchUsers}
      hasMoreByThread={data.hasMoreByThread}
      loadingMoreByThread={data.loadingMoreByThread}
      onFetchOlder={data.fetchOlderMessages}
      uploadAttachment={data.uploadAttachment}
      onLeaveGroup={data.onLeaveGroup}
      blockedUserIds={data.blockedUserIds}
      blockUser={data.blockUser}
      unblockUser={data.unblockUser}
    />
  );
}