import { styleSheet } from "../utils/StyleSheet.ts";
import { i18n } from "../utils/i18n.ts";

export interface UserStatsData {
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

export class UserStats extends HTMLElement {
  private shadow: ShadowRoot;
  private _stats: UserStatsData = {
    wins: 0,
    losses: 0,
    totalGames: 0,
    winRate: 0
  };

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

  set stats(s: UserStatsData) {
    this._stats = s;
    this.render();
  }

  render() {
    const winRate = this._stats.totalGames > 0 
      ? ((this._stats.wins / this._stats.totalGames) * 100).toFixed(1) 
      : 0;

    this.shadow.innerHTML = `
<div class="card w-full max-w-2xl bg-base-200">
  <div class="card-body">
    <h2 class="card-title">${i18n.t('profile.stats')}</h2>
    
    <div class="stats stats-vertical lg:stats-horizontal shadow w-full">
      <!-- Wins -->
      <div class="stat">
        <div class="stat-figure text-success">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="stat-title">${i18n.t('profile.wins')}</div>
        <div class="stat-value text-success">${this._stats.wins}</div>
      </div>
      
      <!-- Losses -->
      <div class="stat">
        <div class="stat-figure text-error">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div class="stat-title">${i18n.t('profile.losses')}</div>
        <div class="stat-value text-error">${this._stats.losses}</div>
      </div>
      
      <!-- Win Rate -->
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div class="stat-title">${i18n.t('profile.winRate')}</div>
        <div class="stat-value text-primary">${winRate}%</div>
        <div class="stat-desc">${this._stats.totalGames} ${i18n.t('profile.totalGames')}</div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="w-full mt-4">
      <div class="flex justify-between text-xs mb-1">
        <span class="text-success">${this._stats.wins} ${i18n.t('profile.wins')}</span>
        <span class="text-error">${this._stats.losses} ${i18n.t('profile.losses')}</span>
      </div>
      <progress class="progress progress-success w-full" 
                value="${this._stats.wins}" 
                max="${this._stats.totalGames || 1}"></progress>
    </div>
  </div>
</div>
`;
  }
}

customElements.define("tr-user-stats", UserStats);