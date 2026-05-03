import type { Metadata } from "next";
import "./globals.css";
import { CsunChatbotWidget } from "@/components/widgets/chatbot";
import ThemeRegistry from "./ThemeRegistry";
import { SiteAppearanceProvider } from "@/components/SiteAppearanceProvider";
import SiteLanguageBootstrap from "@/components/SiteLanguageBootstrap";
import SiteLanguageCookieScript from "@/components/SiteLanguageCookieScript";
import SiteLanguageHtmlLang from "@/components/SiteLanguageHtmlLang";
import SiteLanguageRouteSync from "@/components/SiteLanguageRouteSync";
import { AnnouncementProvider } from "@/contexts/AnnouncementContext";
import AnnouncementBanner from "@/components/announcement/AnnouncementBanner";
import { SessionExpiredProvider } from "@/contexts/SessionExpiredContext";
import { SessionExpiredDialog } from "@/components/SessionExpiredDialog";
import { AxiosSessionInterceptor } from "@/components/AxiosSessionInterceptor";

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
        <SiteAppearanceProvider>
          <ThemeRegistry options={{ key: "mui" }}>
            <SessionExpiredProvider>
              <AxiosSessionInterceptor />
              <SessionExpiredDialog />
              <AnnouncementProvider>
                <SiteLanguageCookieScript />
                <SiteLanguageBootstrap />
                <SiteLanguageHtmlLang />
                <SiteLanguageRouteSync />
                <AnnouncementBanner />
                {children}
                <CsunChatbotWidget />
              </AnnouncementProvider>
            </SessionExpiredProvider>
          </ThemeRegistry>
        </SiteAppearanceProvider>
      </body>
    </html>
  );
}