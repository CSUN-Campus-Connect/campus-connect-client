"use client";

import Script from "next/script";

export default function SiteLanguageBootstrap() {
  return (
    <>
      <div
        id="google_translate_element"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", clip: "rect(0,0,0,0)" }}
        inert
      />
      <Script id="google-translate-init" strategy="beforeInteractive">
        {`
(function(){
  window.googleTranslateElementInit = function googleTranslateElementInit() {
    if (typeof google === 'undefined' || !google.translate) return;
    try {
      new google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,es,fr,de,ja,zh-CN,ar,hi,pt,ko,ru,hy',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    } catch (e) { console.warn('Google Translate init', e); }
    function resolveLang() {
      var key = 'cc_site_lang_v1';
      var lang = null;
      try { lang = localStorage.getItem(key); } catch (e) {}
      if (!lang || lang === 'en') {
        var m = document.cookie.match(/googtrans=([^;]+)/);
        if (m && m[1]) {
          var raw = decodeURIComponent(m[1].trim());
          var segs = raw.split('/');
          if (segs.length >= 3 && segs[2]) lang = segs[2];
        }
      }
      if (!lang || lang === 'en') return null;
      return lang;
    }
    function applyStored() {
      var lang = resolveLang();
      if (!lang) return;
      var tries = 0;
      var t = setInterval(function () {
        tries += 1;
        var combo = document.querySelector('.goog-te-combo');
        if (combo && combo instanceof HTMLSelectElement) {
          var opts = Array.prototype.slice.call(combo.options);
          var match = opts.find(function (o) { return o.value === lang; })
            || opts.find(function (o) { return o.value && o.value.indexOf(lang) !== -1; });
          if (match) combo.value = match.value;
          else combo.value = lang;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
          clearInterval(t);
          return;
        }
        if (tries >= 120) clearInterval(t);
      }, 100);
    }
    setTimeout(applyStored, 0);
    setTimeout(applyStored, 800);
  };
})();
        `}
      </Script>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
