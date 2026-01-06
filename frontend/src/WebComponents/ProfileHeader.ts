import { escapeHtml } from "src/utils/escapeHtml.ts";
import { guestUser, State, User } from "../utils/State.ts";
import { styleSheet } from "../utils/StyleSheet.ts";
import { i18n } from "../utils/i18n.ts";
import { deleteUser, updateProfile, uploadAvatar } from "src/utils/mockApi.ts";

export class ProfileHeader extends HTMLElement {
  static observedAttributes = ["editable"];

  private shadow: ShadowRoot;
  private _user: User;
  private _editable: boolean = false;
  private _editMode: boolean = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.adoptedStyleSheets = [styleSheet];
    this._user = { ...guestUser };
    this.render();
  }

  connectedCallback() {
    i18n.on('languageChanged', () => this.render());
  }

  disconnectedCallback() {
    i18n.off('languageChanged', () => this.render());
  }

  set user(u: User | null) {
    if (!u) {
      this._user = { ...guestUser };
      this.render();
      return;
    }
    this._user = u;
    this.render();
  }

  get user() {
    return this._user;
  }

  set editable(value: boolean) {
    this._editable = value;
    this.render();
  }

  attributeChangedCallback(name: string, _oldVal: any, newVal: any) {
    if (name === "editable") {
      this._editable = newVal === "true" || newVal === true;
      this.render();
    }
  }

  private openEditModal() {
    this._editMode = true;
    this.render();
  }

  private closeEditModal() {
    this._editMode = false;
    this.render();
  }

  private async handleSave() {
    const nameInput = this.shadow.querySelector("#edit-name") as HTMLInputElement;
    const newName = nameInput?.value.trim();

    if (newName && newName !== this._user.name) {
      if (await updateProfile(this._user.id || null, newName, null)) {
        this._user.name = newName;
        State.setUser(this._user);
        this.closeEditModal();
        return;
      }
      alert(i18n.t('profile.updateFailed'));
      return;
    }
    this.closeEditModal();
  }

  private async handleAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const newAvatarUrl = await uploadAvatar(file);
      await updateProfile(this._user.id || "", this._user.name, newAvatarUrl);
      this._user.avatarUrl = newAvatarUrl;
      State.setUser(this._user);
      this.render();
    }
  }

  private async handleRemoveAvatar() {
    await updateProfile(this._user.id || "", this._user.name, "/favicon.ico");
    this._user.avatarUrl = "/favicon.ico";
    State.setUser(this._user);
    this.render();
  }

  private async handleDeleteAccount() {
    const confirmDelete = confirm(i18n.t('profile.confirmDelete'));
    if (!confirmDelete) return;

    const success = await deleteUser();
    if (success) {
      alert(i18n.t('profile.accountDeleted'));
      sessionStorage.clear();
      window.location.replace("/");
    } else {
      alert(i18n.t('profile.deleteFailed'));
    }
  }

  render() {
    const avatarSrc = this._user?.avatarUrl || "/favicon.ico";

    const safeName = escapeHtml(this._user?.name || guestUser.name);
    const safeAvatarAlt = escapeHtml(this._user?.name || "User avatar");

    this.shadow.innerHTML = `
<div class="card w-full max-w-2xl bg-base-200">
  <div class="card-body items-center text-center">
    <!-- Profile Avatar -->
    <div class="avatar ${this._user?.online ? "online" : "offline"} mb-4 mt-2">
      <div class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
        <img src="${avatarSrc}" alt="${safeAvatarAlt}" />
      </div>
    </div>
    
    <!-- User Info -->
    <h2 class="card-title text-3xl">${safeName}</h2>
    
    <!-- Edit Button (only if editable) -->
    ${this._editable ? `
      <button id="edit-btn" class="btn btn-primary mt-4">
        ${i18n.t('profile.editProfile')}
      </button>
    ` : ''}
  </div>
</div>

<!-- Edit Modal -->
${this._editMode ? `
<div class="modal modal-open">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">${i18n.t('profile.editProfile')}</h3>
    
    <!-- Avatar Section -->
    <div class="form-control mb-4">
      <div class="flex items-center gap-4">
        <div class="avatar">
          <div class="w-20 rounded-full">
            <img src="${avatarSrc}" alt="Current avatar" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button id="remove-avatar-btn" class="btn btn-error btn-sm">
            ${i18n.t('profile.removePhoto')}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Name Input -->
    <div class="form-control mb-4">
      <label class="label">
        <span class="label-text">${i18n.t('profile.changeName')}</span>
      </label>
      <input type="text" id="edit-name" class="input input-bordered" 
             placeholder="${i18n.t('profile.name')}" />
    </div>
    
    <!-- Modal Actions -->
    <div class="modal-action flex justify-between w-full">
      <button id="delete-account-btn" class="btn btn-error">
        ${i18n.t('profile.deleteAccount')}
      </button>
      <div class="flex gap-2">
        <button id="cancel-btn" class="btn">${i18n.t('profile.cancel')}</button>
        <button id="save-btn" class="btn btn-primary">${i18n.t('profile.save')}</button>
      </div>
    </div>
  </div>
</div>
` : ''}
`;

    if (this._editMode) {
      const nameInput = this.shadow.querySelector("#edit-name") as HTMLInputElement;
      if (nameInput) {
        nameInput.value = this._user?.name || '';
      }
    }

    if (this._editable) {
      const editBtn = this.shadow.querySelector("#edit-btn");
      editBtn?.addEventListener("click", () => this.openEditModal());
    }

    if (this._editMode) {
      const cancelBtn = this.shadow.querySelector("#cancel-btn");
      const saveBtn = this.shadow.querySelector("#save-btn");
      // const avatarInput = this.shadow.querySelector("#avatar-input"); // NOTE: Currently don't let avatar get changed
      const removeAvatarBtn = this.shadow.querySelector("#remove-avatar-btn");
      const deleteBtn = this.shadow.querySelector("#delete-account-btn");

      cancelBtn?.addEventListener("click", () => this.closeEditModal());
      saveBtn?.addEventListener("click", () => this.handleSave());
      // avatarInput?.addEventListener("change", (e) => this.handleAvatarChange(e));
      removeAvatarBtn?.addEventListener("click", () => this.handleRemoveAvatar());
      deleteBtn?.addEventListener("click", () => this.handleDeleteAccount());
    }
  }
}

customElements.define("tr-profile-header", ProfileHeader);
