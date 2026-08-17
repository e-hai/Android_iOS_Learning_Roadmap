import { Language } from '../models/types';
import { zhHans } from '../data/locales/zh-Hans';
import { en } from '../data/locales/en';

type Listener = (lang: Language) => void;

class I18nService {
  private currentLang: Language = 'zh-Hans';
  private listeners: Set<Listener> = new Set();
  private dictionaries: Record<Language, Record<string, string>> = {
    'zh-Hans': zhHans,
    'en': en,
  };

  constructor() {
    const saved = localStorage.getItem('learning_cockpit_lang') as Language | null;
    if (saved && (saved === 'zh-Hans' || saved === 'en')) {
      this.currentLang = saved;
    } else {
      // Default to browser language preference if starts with 'en'
      const navLang = navigator.language.toLowerCase();
      this.currentLang = navLang.startsWith('en') ? 'en' : 'zh-Hans';
    }
  }

  getLanguage(): Language {
    return this.currentLang;
  }

  setLanguage(lang: Language) {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    localStorage.setItem('learning_cockpit_lang', lang);
    this.notify();
  }

  toggleLanguage(): Language {
    const next = this.currentLang === 'zh-Hans' ? 'en' : 'zh-Hans';
    this.setLanguage(next);
    return next;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentLang);
    }
  }

  t(key: string, ...args: (string | number)[]): string {
    const dict = this.dictionaries[this.currentLang];
    let val = dict[key] || zhHans[key] || key;

    if (args.length > 0) {
      // Handle positional tokens like %1$lld, %1$d, %1$@, %lld, %d, %@, %s
      val = val.replace(/%(\d+)\$[lld|d|@|s]/g, (_, index) => {
        const i = parseInt(index, 10) - 1;
        return args[i] !== undefined ? String(args[i]) : '';
      });

      let argIndex = 0;
      val = val.replace(/%(lld|d|@|s)/g, () => {
        const res = args[argIndex] !== undefined ? String(args[argIndex]) : '';
        argIndex++;
        return res;
      });
    }

    return val;
  }
}

export const i18n = new I18nService();
