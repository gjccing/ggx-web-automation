export type Bet4365Locale = "en-HK" | "zh-HK";

/** Source: BET-4333 / shared SubmittedView timeline + WhatsApp template. */
export const bet4365SuccessPageCopy: Record<
  Bet4365Locale,
  {
    title: RegExp;
    timeline: string[];
    timelineSubtitle: string;
    whatsappContact: RegExp;
    backToHome: RegExp;
    obsoleteProgress: RegExp[];
  }
> = {
  "en-HK": {
    title: /Your request has been submitted/i,
    timeline: [
      "Submit a request",
      "Preparing a quotation",
      "Arrange move",
      "Moving complete",
    ],
    timelineSubtitle: "We will contact you via WhatsApp or email.",
    whatsappContact: /6467\s*5050/,
    backToHome: /^Back to home$/,
    obsoleteProgress: [/arranging suitable workers/i, /arranging workers/i],
  },
  "zh-HK": {
    title: /您的查詢已提交/,
    timeline: ["提交查詢", "準備報價中", "安排搬屋", "完成搬運"],
    timelineSubtitle: "我們會透過 WhatsApp 與您溝通",
    whatsappContact: /6467\s*5050/,
    backToHome: /^返回主頁$/,
    obsoleteProgress: [/正在安排合適師傅/, /安排合適師傅/],
  },
};

export const bet4365WhatsAppNumber = "85264675050";

export function buildBet4365WhatsAppMessage(
  locale: Bet4365Locale,
  datetime: string,
  phone: string,
): string {
  if (locale === "zh-HK") {
    return `你好，我喺 ${datetime} 提交咗搬屋查詢（聯絡電話：${phone}），想更新訂單資料。`;
  }
  return `Hi GoGoX Moving team, I submitted a moving enquiry on ${datetime} (contact: ${phone}) and would like to update my order details.`;
}

export function parseBet4365Locale(locale: string): Bet4365Locale {
  if (locale !== "en-HK" && locale !== "zh-HK") {
    throw new Error(
      `Unsupported BET-4365 locale "${locale}" — use "en-HK" or "zh-HK"`,
    );
  }
  return locale;
}
