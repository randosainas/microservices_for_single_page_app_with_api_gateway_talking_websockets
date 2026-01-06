// src/utils/i18n.ts
import { Emitter } from "./Emitter";

export type Language = 'en' | 'nl' | 'fr';

export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}


/*
i18n comes from the word “internationalization”:

i → first letter
18 → number of letters between the first and last letter
n → last letter
*/
class I18n extends Emitter {
  private currentLanguage: Language;
  private translations: Translations = {};
  private isLoaded: boolean = false;

  constructor() {
    super();
    // Load saved language or use browser language or default to English
    const saved = localStorage.getItem('language') as Language | null;
    const browserLang = navigator.language.split('-')[0] as Language;
    
    this.currentLanguage = saved || 
      (['en', 'nl', 'fr'].includes(browserLang) ? browserLang : 'en');
    
    this.loadTranslations();
  }

  async loadTranslations() {
    if (this.isLoaded) return;

    try {
      const response = await fetch('/translations.json');
      if (!response.ok) {
        throw new Error('Failed to load translations');
      }
      this.translations = await response.json();
      this.isLoaded = true;
      this.emit('languageChanged');
    } catch (error) {
      console.error('Error loading translations:', error);
      this.translations = {};
      this.isLoaded = true;
    }
  }

  get language(): Language {
    return this.currentLanguage;
  }

  setLanguage(lang: Language) {
    if (this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.emit('languageChanged', lang);
    }
  }

  t(key: string, params?: Record<string, string>): string {
    if (!this.isLoaded) {
      console.warn('Translations not loaded yet');
      return key;
    }

    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    let text = translation[this.currentLanguage] || translation['en'] || key;

    // Replace parameters like {name} with actual values
    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }

    return text;
  }

  getLanguages(): Language[] {
    return ['en', 'nl', 'fr'];
  }

  get loaded(): boolean {
    return this.isLoaded;
  }
}

export const i18n = new I18n();