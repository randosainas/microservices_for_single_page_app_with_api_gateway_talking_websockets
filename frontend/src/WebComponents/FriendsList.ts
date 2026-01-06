import { addFriend, removeFriend, searchUsers } from "src/utils/mockApi.ts";
import { User } from "../utils/State.ts";
import { styleSheet } from "../utils/StyleSheet.ts";
import { i18n } from "../utils/i18n.ts";
import { escapeHtml } from "src/utils/escapeHtml.ts";

export class FriendsList extends HTMLElement {
  static observedAttributes = ["editable"];

  private shadow: ShadowRoot;
  private _friends: User[] = [];
  private _editable: boolean = false;
  private _searchResults: User[] = [];
  private _searchQuery: string = "";
  private _currentUserId: string = "";

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

  set friends(f: User[]) {
    this._friends = f;
    this.render();
  }

  set editable(value: boolean) {
    this._editable = value;
    this.render();
  }

  set currentUserId(id: string) {
    this._currentUserId = id;
  }

  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    if (name === "editable") {
      this._editable = newVal === "true" || newVal === true;
      this.render();
    }
  }

  private async handleSearch(query: string) {
    this._searchQuery = query;
    if (query.trim().length > 0) {
      this._searchResults = await searchUsers(query); // TODO
    } else {
      this._searchResults = [];
    }
    this.updateSearchResults();
  }

  private async handleAddFriend(userId: string) {
    await addFriend(this._currentUserId, userId); // TODO
    const addedUser = this._searchResults.find(u => u.id === userId);
    if (addedUser) {
      this._friends.push(addedUser);
    }
    this._searchResults = [];
    this._searchQuery = "";
    this.render();
  }

  private async handleRemoveFriend(userId: string) {
    await removeFriend(this._currentUserId, userId); // TODO
    this._friends = this._friends.filter(f => f.id !== userId);
    this.render();
  }

  render() {
    this.shadow.innerHTML = `
<div class="card w-full max-w-2xl bg-base-200">
  <div class="card-body">
    <h2 class="card-title">${i18n.t('profile.friends')} (${this._friends.length})</h2>
    
    <!-- Search Bar (only if editable) -->
    ${this._editable ? `
      <div class="form-control mb-4">
        <input type="text" id="search-input" 
               value="${this._searchQuery}"
               placeholder="${i18n.t('profile.searchFriends')}" 
               class="input input-bordered" />
      </div>
      
      <!-- Search Results -->
        <div class="mb-4">
        <div class="space-y-2 max-h-48 overflow-y-auto" id="search-results">
            ${this._searchResults.map(user => `
              <div class="flex items-center justify-between p-2 bg-base-300 rounded">
                <div class="flex items-center gap-2">
                  <div class="avatar ${user.online ? 'online' : 'offline'}">
                    <div class="w-10 rounded-full">
                      <img src="${user.avatarUrl || '/favicon.ico'}" alt="${escapeHtml(user.name)}" />
                    </div>
                  </div>
                  <span>${escapeHtml(user.name)}</span>
                </div>
                <button class="btn btn-sm btn-primary add-friend-btn" data-user-id="${user.id}">
                  ${i18n.t('profile.addFriend')}
                </button>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
    
    <!-- Friends List -->
    ${this._friends.length > 0 ? `
      <ul class="space-y-2" id="friends-list">
      ${this._friends.map(friend => `
        <li class="flex items-center justify-between p-2 bg-base-300 rounded hover:bg-base-100">
          <div class="flex items-center gap-3 friend-item" data-user-id="${friend.id}">
            <div class="avatar ${friend.online ? 'online' : 'offline'}">
              <div class="w-12 rounded-full">
                <img src="${friend.avatarUrl || '/favicon.ico'}" alt="${escapeHtml(friend.name)}" />
              </div>
            </div>
            <div class="w-40 overflow-hidden">
              <div class="font-semibold truncate" title="${escapeHtml(friend.name)}">
                ${escapeHtml(friend.name)}
              </div>
              <div class="text-xs opacity-70">
                ${friend.online ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>
          ${this._editable ? `
            <button class="btn btn-sm btn-error remove-friend-btn ml-4" data-user-id="${friend.id}">
              ${i18n.t('profile.removeFriend')}
            </button>
          ` : ''}
        </li>
      `).join('')}
      </ul>` :
        `<p class="text-center py-8 opacity-70">${i18n.t('profile.noFriends')}</p>`}
  </div>
</div>
`;

    if (this._editable) {
      const searchInput = this.shadow.querySelector("#search-input") as HTMLInputElement;
      searchInput?.addEventListener("input", (e) => {
        this.handleSearch((e.target as HTMLInputElement).value);
      });

      const addBtns = this.shadow.querySelectorAll(".add-friend-btn");
      addBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const userId = (btn as HTMLElement).dataset.userId;
          if (userId) this.handleAddFriend(userId);
        });
      });

      const removeBtns = this.shadow.querySelectorAll(".remove-friend-btn");
      removeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const userId = (btn as HTMLElement).dataset.userId;
          if (userId) this.handleRemoveFriend(userId);
        });
      });
    }

    const friendItems = this.shadow.querySelectorAll(".friend-item");
    friendItems.forEach(item => {
      item.addEventListener("click", () => {
        const userId = (item as HTMLElement).dataset.userId;
        window.location.href = `/profile?user=${userId}`;// TODO is this the way?
      });
    });
  }

  private updateSearchResults() {
    const resultsContainer = this.shadow.querySelector("#search-results");
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
    ${this._searchResults.length > 0
        ? `<h3 class="text-sm font-semibold mb-2">${i18n.t('profile.searchResults')}</h3>`
        : ''
      }
    ${this._searchResults.map(user => `
      <div class="flex items-center justify-between p-2 bg-base-300 rounded">
        <div class="flex items-center gap-2">
          <div class="avatar ${user.online ? 'online' : 'offline'}">
            <div class="w-10 rounded-full">
              <img src="${user.avatarUrl || '/favicon.ico'}" alt="${escapeHtml(user.name)}" />
            </div>
          </div>
          <span>${escapeHtml(user.name)}</span>
        </div>
        <button class="btn btn-sm btn-primary add-friend-btn" data-user-id="${user.id}">
          ${i18n.t('profile.addFriend')}
        </button>
      </div>
    `).join('')}
  `;

    const addBtns = resultsContainer.querySelectorAll(".add-friend-btn");
    addBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const userId = (btn as HTMLElement).dataset.userId;
        if (userId) this.handleAddFriend(userId);
      });
    });
  }
}

customElements.define("tr-friends-list", FriendsList);
