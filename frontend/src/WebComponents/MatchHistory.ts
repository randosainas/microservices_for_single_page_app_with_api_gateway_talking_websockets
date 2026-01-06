import { styleSheet } from "../utils/StyleSheet.ts";
import { i18n } from "../utils/i18n.ts";
import { escapeHtml } from "src/utils/escapeHtml.ts";

export interface Match {
  id: string;
  date: string;
  opponent: string;
  opponentAvatar?: string;
  result: "win" | "loss";
  score: string; // e.g., "11-5"
  duration: string; // e.g., "5:32"
}

export class MatchHistory extends HTMLElement {
  private shadow: ShadowRoot;
  private _matchList: Match[] = [];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this.render();
  }

  connectedCallback() {
    i18n.on('languageChanged', () => this.render());
  }

  disconnectedCallback() {
    i18n.off('languageChanged', () => this.render());
  }

  set matchList(m: Match[]) {
    this._matchList = m;
    this.render();
  }


  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return i18n.t('profile.today');
    if (diffDays === 1) return i18n.t('profile.yesterday');
    if (diffDays < 7) return `${diffDays} ${i18n.t('profile.daysAgo')}`;

    return date.toLocaleDateString(i18n.language);
  }

  render() {
    this.shadow.innerHTML = `
<div class="card w-full max-w-2xl bg-base-200">
  <div class="card-body">
    <h2 class="card-title">${i18n.t('profile.matchHistory')}</h2>
    
    ${this._matchList.length > 0 ? `
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>${i18n.t('profile.date')}</th>
              <th>${i18n.t('profile.opponent')}</th>
              <th>${i18n.t('profile.result')}</th>
              <th>${i18n.t('profile.score')}</th>
              <th>${i18n.t('profile.duration')}</th>
            </tr>
          </thead>
          <tbody>
            ${this._matchList.map(match => `
              <tr class="hover">
                <td class="text-sm">${this.formatDate(match.date)}</td>
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar">
                      <div class="w-8 rounded-full">
                        <img src="${match.opponentAvatar || '/favicon.ico'}" alt="${escapeHtml(match.opponent)}" />
                      </div>
                    </div>
                    <span class="font-semibold">${escapeHtml(match.opponent)}</span>
                  </div>
                </td>
                <td>
                  <span class="badge ${match.result === 'win' ? 'badge-success' : 'badge-error'}">
                    ${match.result === 'win' ? i18n.t('profile.win') : i18n.t('profile.loss')}
                  </span>
                </td>
                <td class="font-mono font-bold">${match.score}</td>
                <td class="text-sm opacity-70">${match.duration}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="text-center py-8 opacity-70">
        <p>${i18n.t('profile.noMatches')}</p>
      </div>
    `}
  </div>
</div>
`;
  }
}

customElements.define("tr-match-history", MatchHistory);
