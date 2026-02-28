// import rawEn from "@/../locales/en/translation.json";
import { en as enRaw } from "@/../locales/en.ts";
import { ru as ruRaw } from "@/../locales/ru.ts";

export const SUPPORTED_LANGS = ["ru", "en"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

const translations: Record<SupportedLang, typeof ruRaw> = {
    ru: ruRaw,
    en: enRaw,
};

export const normalizeLang = (lang?: string): SupportedLang => {
    if (!lang) return "en";
    const short = lang.split("-")[0];
    return SUPPORTED_LANGS.includes(short as SupportedLang)
        ? (short as SupportedLang)
        : "en";
};

/**
 * Строгая функция t()
 */
export const t = <K extends keyof typeof ruRaw>(
    lang: string | undefined,
    key: K,
    ...args: Parameters<(typeof translations)[SupportedLang][K]>
): string => {
    const safeLang = normalizeLang(lang);
    // @ts-expect-error TS знает параметры через Parameters<>
    return translations[safeLang][key](...args);
};
export const tRaw = <K extends keyof typeof ru>(
    lang: SupportedLang | undefined,
    key: K,
    ...args: Parameters<(typeof ru)[K]>
): string => {
    const safeLang = lang ?? "ru";
    return translations[safeLang][key](...args); // уже с * и _
};
