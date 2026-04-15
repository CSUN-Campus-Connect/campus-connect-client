import Script from "next/script";

export default function SiteLanguageCookieScript() {
  return (
    <Script id="cc-site-lang-googtrans-sync" strategy="beforeInteractive">
      {`
(function () {
  try {
    var k = 'cc_site_lang_v1';
    var lang = localStorage.getItem(k);
    if (lang === 'en') {
      document.cookie = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      return;
    }
    if (lang && lang !== 'en') {
      document.cookie = 'googtrans=/en/' + lang + ';path=/;max-age=31536000;SameSite=Lax';
    }
  } catch (e) {}
})();
      `}
    </Script>
  );
}
