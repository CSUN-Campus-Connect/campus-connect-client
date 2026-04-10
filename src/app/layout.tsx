import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { CsunChatbotWidget } from "@/components/widgets/chatbot";
import { SiteAppearanceProvider } from "@/components/SiteAppearanceProvider";
import SiteLanguageBootstrap from "@/components/SiteLanguageBootstrap";
import SiteLanguageCookieScript from "@/components/SiteLanguageCookieScript";
import SiteLanguageHtmlLang from "@/components/SiteLanguageHtmlLang";
import SiteLanguageRouteSync from "@/components/SiteLanguageRouteSync";
import ThemeRegistry from "./ThemeRegistry";

export const metadata: Metadata = {
  title: "Campus Connect",
  description: "Campus Connect",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`relative overflow-visible ${geistSans.variable} ${geistMono.variable}`}>
        <Script id="cc-site-appearance-init" strategy="beforeInteractive">
          {`(function(){
  var k='cc_appearance_v1';
  var def={theme:'light',textSize:'medium'};
  var sizes=['small','medium','large','extra-large'];
  try{
    var raw=localStorage.getItem(k);
    var o=raw?JSON.parse(raw):{};
    var theme=o.theme==='dark'?'dark':'light';
    var textSize=sizes.indexOf(o.textSize)!==-1?o.textSize:def.textSize;
    var r=document.documentElement;
    r.dataset.theme=theme;
    r.dataset.textSize=textSize;
    r.setAttribute('data-bs-theme',theme==='dark'?'dark':'light');
    r.style.colorScheme=theme==='dark'?'dark':'light';
  }catch(e){
    var r=document.documentElement;
    r.dataset.theme=def.theme;
    r.dataset.textSize=def.textSize;
    r.setAttribute('data-bs-theme','light');
    r.style.colorScheme='light';
  }
})();`}
        </Script>
        <SiteAppearanceProvider>
          <ThemeRegistry options={{ key: "mui" }}>
            <SiteLanguageCookieScript />
            <SiteLanguageBootstrap />
            <SiteLanguageHtmlLang />
            <SiteLanguageRouteSync />
            {children}
            <CsunChatbotWidget />
          </ThemeRegistry>
        </SiteAppearanceProvider>
      </body>
    </html>
  );
}
