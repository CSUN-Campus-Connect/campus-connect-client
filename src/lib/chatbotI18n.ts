import type { SiteLangCode } from "./siteLanguage";
import { SITE_LANGUAGES } from "./siteLanguage";

export function parseSiteLang(raw: unknown): SiteLangCode {
  if (typeof raw !== "string") return "en";
  return SITE_LANGUAGES.some((l) => l.code === raw) ? (raw as SiteLangCode) : "en";
}

const DISCLAIMER: Record<SiteLangCode, string> = {
  en: "Not official CSUN advice. Verify with CSUN sources.",
  es: "No es un consejo oficial de CSUN. Verifica con fuentes oficiales de CSUN.",
  fr: "Ce n'est pas un avis officiel de CSUN. Veuillez vérifier auprès de sources officielles de CSUN.",
  de: "Keine offizielle CSUN-Beratung. Bitte bei offiziellen CSUN-Quellen nachprüfen.",
  ja: "CSUN の公式な助言ではありません。CSUN の公式情報でご確認ください。",
  "zh-CN": "并非 CSUN 官方建议。请以 CSUN 官方来源为准。",
  ar: "ليست نصيحة رسمية من CSUN. يُرجى التحقق من المصادر الرسمية لـ CSUN.",
  hi: "यह CSUN की आधिकारिक सलाह नहीं है। कृपया CSUN के आधिकारिक स्रोतों से सत्यापित करें।",
  pt: "Não é orientação oficial da CSUN. Confirme nas fontes oficiais da CSUN.",
  ko: "CSUN의 공식 안내가 아닙니다. CSUN 공식 출처에서 확인하세요.",
  ru: "Не официальная рекомендация CSUN. Уточняйте по официальным источникам CSUN.",
  hy: "Սա պաշտոնական CSUN խորհուրդ չէ։ Ստուգեք CSUN-ի պաշտոնական աղբյուրներում։",
};

const GREETING_BODY: Record<SiteLangCode, string> = {
  en: "Hi! I can help with general CSUN questions.\n\nAsk away, or use the \"Open email\" option to reach a person.",
  es: "¡Hola! Puedo ayudarte con preguntas generales sobre CSUN.\n\nPregunta lo que necesites o usa la opción «Abrir correo» para contactar a una persona.",
  fr: "Bonjour ! Je peux vous aider pour des questions générales sur CSUN.\n\nPosez votre question ou utilisez l’option « Ouvrir l'e-mail » pour joindre une personne.",
  de: "Hallo! Ich kann bei allgemeinen Fragen zu CSUN helfen.\n\nStellen Sie Ihre Frage oder nutzen Sie „E-Mail öffnen“, um eine Person zu erreichen.",
  ja: "こんにちは。CSUN に関する一般的な質問にお答えします。\n\nお気軽にどうぞ。担当者への連絡は「メールを開く」からもできます。",
  "zh-CN": "你好！我可以协助一般的 CSUN 相关问题。\n\n请直接提问，或使用「打开邮件」联系工作人员。",
  ar: "مرحبًا! يمكنني المساعدة في أسئلة عامة حول CSUN.\n\nاطرح سؤالك أو استخدم خيار «فتح البريد» للتواصل مع شخص.",
  hi: "नमस्ते! मैं CSUN से जुड़े सामान्य प्रश्नों में मदद कर सकता हूँ।\n\nपूछें, या किसी व्यक्ति तक पहुँचने के लिए «ईमेल खोलें» विकल्प का उपयोग करें।",
  pt: "Olá! Posso ajudar com perguntas gerais sobre a CSUN.\n\nPergunte à vontade ou use a opção \"Abrir e-mail\" para falar com alguém.",
  ko: "안녕하세요! CSUN 관련 일반적인 질문을 도와드릴 수 있습니다.\n\n편하게 물어보시거나 «이메일 열기»로 담당자에게 연락하세요.",
  ru: "Здравствуйте! Я могу помочь с общими вопросами о CSUN.\n\nЗадайте вопрос или воспользуйтесь «Открыть письмо», чтобы связаться с человеком.",
  hy: "Ողջույն։ Կարող եմ օգնել ընդհանուր CSUN հարցերով։\n\nՀարցրեք ազատորեն, կամ մարդու հետ կապ հաստատելու համար օգտագործեք «Բացել էլ․ փոստը» տարբերակը։",
};

export function chatbotDisclaimerLine(lang: SiteLangCode): string {
  return DISCLAIMER[lang] ?? DISCLAIMER.en;
}

export function chatbotGreeting(lang: SiteLangCode): string {
  const d = chatbotDisclaimerLine(lang);
  return `${GREETING_BODY[lang] ?? GREETING_BODY.en}\n\n${d}`;
}

export function chatbotEmailAgentReply(lang: SiteLangCode): string {
  const lines: Record<SiteLangCode, string> = {
    en: 'For help from a real person, use the "Open email" link in this chat. A team member will reply within 24 hours. Not official CSUN advice—verify with CSUN sources when needed.',
    es: 'Para hablar con una persona real, usa el enlace «Abrir correo» en este chat. Un miembro del equipo responderá en un plazo de 24 horas. No es un consejo oficial de CSUN; verifica con fuentes oficiales cuando sea necesario.',
    fr: "Pour l'aide d'une personne réelle, utilisez le lien « Ouvrir l'e-mail » dans ce chat. Un membre de l'équipe répondra sous 24 heures. Ce n'est pas un avis officiel de CSUN — vérifiez auprès des sources officielles si besoin.",
    de: 'Für Hilfe von einer echten Person nutzen Sie den Link „E-Mail öffnen“ in diesem Chat. Ein Teammitglied antwortet innerhalb von 24 Stunden. Keine offizielle CSUN-Beratung — prüfen Sie bei Bedarf offizielle Quellen.',
    ja: "実際の担当者のサポートが必要な場合は、このチャットの「メールを開く」リンクをご利用ください。24時間以内にチームから返信します。CSUN の公式助言ではありません。必要に応じて公式情報でご確認ください。",
    "zh-CN": "如需真人协助，请使用此聊天中的「打开邮件」链接。团队成员会在 24 小时内回复。并非 CSUN 官方建议——需要时请查阅 CSUN 官方来源。",
    ar: 'للمساعدة من شخص حقيقي، استخدم رابط «فتح البريد» في هذه الدردشة. سيرد أحد أعضاء الفريق خلال 24 ساعة. ليست نصيحة رسمية من CSUN — يُرجى التحقق من المصادر الرسمية عند الحاجة.',
    hi: "किसी वास्तविक व्यक्ति से मदद के लिए इस चैट में «ईमेल खोलें» लिंक का उपयोग करें। टीम का सदस्य 24 घंटों के भीतर जवाब देगा। यह CSUN की आधिकारिक सलाह नहीं है — ज़रूरत हो तो आधिकारिक स्रोतों से जाँच करें।",
    pt: 'Para falar com uma pessoa de verdade, use o link "Abrir e-mail" neste chat. Um membro da equipe responderá em até 24 horas. Não é orientação oficial da CSUN — confirme nas fontes oficiais quando necessário.',
    ko: '실제 담당자의 도움이 필요하면 이 채팅의 «이메일 열기» 링크를 사용하세요. 팀원이 24시간 이내에 답합니다. CSUN의 공식 안내가 아닙니다. 필요 시 공식 출처를 확인하세요.',
    ru: 'Чтобы связаться с живым человеком, воспользуйтесь ссылкой «Открыть письмо» в этом чате. Сотрудник ответит в течение 24 часов. Не официальная рекомендация CSUN — при необходимости сверяйтесь с официальными источниками.',
    hy: "Իրական մարդու օգնության համար այս զրույցում օգտագործեք «Բացել էլ․ փոստը» հղումը։ Թիմի անդամը կպատասխանի 24 ժամվա ընթացքում։ Սա պաշտոնական CSUN խորհուրդ չէ — անհրաժեշտության դեպքում ստուգեք պաշտոնական աղբյուրները։",
  };
  return lines[lang] ?? lines.en;
}
