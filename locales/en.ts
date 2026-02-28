import { mdv2 } from "@utils/telegramMarkdown";

export const en = {
    start_welcome: (name: string) => mdv2`
Hello *${name}!*

💻 Welcome to *CatFlyVPN!*

We provide VPN access to bypass blocks and ensure your online security. By using our VPN, you get access to *Instagram*, *YouTube*, *TikTok*, *Facebook*, *Twitter*, and other blocked services.

🚀 No speed limits — full internet freedom at maximum speed.
🌍 Access to all websites — no blocks, wherever you are.
⚙️ Quick connection — easy setup in 1 minute on *iPhone*, *Android*, *Android TV*, PC (*Windows*, *Linux*, *macOS*).
💳 Payment via *YooMoney*, *SBP*, and *Bank Cards*.
`,
} as const;
