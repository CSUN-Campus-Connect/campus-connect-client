import type { Metadata } from "next";
import "./globals.css"
import { CsunChatbotWidget } from "@/components/widgets/chatbot";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "Toro Campus Connect",
  description: "Your whole campus. One app. Made by students, for CSUN.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@100;200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative overflow-visible">
        <ThemeRegistry options={{ key: "mui" }}>
          {children}
          <CsunChatbotWidget />
        </ThemeRegistry>
      </body>
    </html>
  );
}