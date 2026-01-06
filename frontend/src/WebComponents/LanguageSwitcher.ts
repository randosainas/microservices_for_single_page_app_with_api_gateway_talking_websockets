import { i18n, Language } from "../utils/i18n";

export class LanguageSwitcher extends HTMLElement {
  
  constructor() {
    super();
  }

  private languageChangedHandler = () => this.render();

  connectedCallback() {
    this.render();
    i18n.on('languageChanged', this.languageChangedHandler);
  }

  disconnectedCallback() {
    i18n.off('languageChanged', this.languageChangedHandler);
  }

  render() {
    const currentLang = i18n.language;
    const languages = i18n.getLanguages();

    this.innerHTML = `
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-5 h-5 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
          </svg>
        </label>
        <ul tabindex="0" class="menu dropdown-content z-[1] p-2 shadow bg-base-200 rounded-box w-32 mt-3">
          ${languages.map(lang => `
            <li>
              <a data-lang="${lang}" class="lang-option ${lang === currentLang ? 'active' : ''}">
                <span class="text-lg">${this.getFlagEmoji(lang)}</span>
                ${i18n.t(`lang.${lang}`)}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    // Add click handlers
    this.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = (e.currentTarget as HTMLElement).dataset.lang as Language;
        i18n.setLanguage(lang);
      });
    });
  }

  getFlagEmoji(lang: Language): string {
    const flags: Record<Language, string> = {
      'en': '🇬🇧',
      'nl': '🇳🇱',
      'fr': '🇫🇷'
    };
    return flags[lang];
  }
}

customElements.define('language-switcher', LanguageSwitcher);