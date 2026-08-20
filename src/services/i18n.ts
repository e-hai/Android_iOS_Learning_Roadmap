import { zhHans } from '../data/locales/zh-Hans';

class I18nService {
  private dictionary: Record<string, string> = zhHans;

  getLanguage(): string {
    return 'zh-Hans';
  }

  t(key: string, ...args: (string | number)[]): string {
    let val = this.dictionary[key] || key;

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

