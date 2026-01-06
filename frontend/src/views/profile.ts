import { State, User } from "../utils/State.ts";
import Page from "../utils/Page.ts";
import { i18n } from "../utils/i18n.ts";

import "../WebComponents/ProfileHeader.ts";
import "../WebComponents/FriendsList.ts";
import "../WebComponents/UserStats.ts";
import "../WebComponents/MatchHistory.ts";
import "../WebComponents/LanguageSwitcher.ts";
import { getMatchHistory, getStats, getUserProfile } from "src/utils/mockApi.ts";
import { ProfileHeader } from "src/WebComponents/ProfileHeader.ts";
import { UserStats } from "src/WebComponents/UserStats.ts";
import { FriendsList } from "src/WebComponents/FriendsList.ts";
import { MatchHistory } from "src/WebComponents/MatchHistory.ts";

export default class Profile extends Page {
  private userid: string | null = "";
  private profileUser: User | null = null;
  private isMyProfile: boolean = false;

  constructor() {
    super();
    this.element.id = "profile-view";
  }

  private extractUserid(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('user') || State.user.id || null ; // TODO default to logged in user id
  }

  private checkIsMyProfile(): boolean {
    return this.extractUserid() === null;
  }

  async render() {
    super.render();
    this.userid = this.extractUserid();
    this.isMyProfile = this.checkIsMyProfile();

    this.profileUser = await getUserProfile(this.userid); // TODO

    if (!this.profileUser) {
      this.element.innerHTML  = `
        <div class="flex flex-col items-center justify-center min-h-screen">
          <h1 class="text-4xl font-bold mb-4">${i18n.t('profile.userNotFound')}</h1>
          <a data-link href="/" class="btn btn-primary">${i18n.t('profile.backHome')}</a>
        </div>
      `;
      return this.element;
    }

    this.element.innerHTML = `
    <div class="relative flex flex-col items-center px-4 py-8 gap-6">
      
      <tr-profile-header id="profile-header"></tr-profile-header>      
      <tr-user-stats id="user-stats"></tr-user-stats>      
      <tr-friends-list id="friends-list"></tr-friends-list>      
      <tr-match-history id="match-history"></tr-match-history>
      
    </div>`;

    return this.element;
  }

  async mount() {
    super.mount();

    const profileHeader = this.element.querySelector("#profile-header") as ProfileHeader;
    const userStats = this.element.querySelector("#user-stats") as UserStats;
    const friendsList = this.element.querySelector("#friends-list") as FriendsList;
    const matchHistory = this.element.querySelector("#match-history") as MatchHistory;

    if (profileHeader) {
      profileHeader.user = this.profileUser;
      profileHeader.editable = this.isMyProfile;
    }

    if (userStats) {
      const stats = await getStats(this.profileUser?.id || ""); // TODO
      userStats.stats = stats;
    }

    if (friendsList) {

      friendsList.friends = State.friends || []; // TODO api call
      friendsList.editable = this.isMyProfile;
    }

    if (matchHistory) {
      const matches = await getMatchHistory(this.profileUser?.id || ""); // TODO
      matchHistory.matchList = matches;
    }

    if (this.isMyProfile) {
      const updateFriends = () => {
        if (friendsList) {
          friendsList.friends = State.friends;
        }
      };
      State.addListener("friends", updateFriends, this);
    }
  }

  unmount() {
    super.unmount();
    State.disconnectListeners(this);
  }
}