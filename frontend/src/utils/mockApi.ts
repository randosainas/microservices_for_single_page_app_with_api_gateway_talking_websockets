import { User } from "./State.ts";
import { UserStatsData } from "../WebComponents/UserStats.ts";
import { Match } from "../WebComponents/MatchHistory.ts";

const mockUsers: User[] = [
  { id: "1", name: "Alice", avatarUrl: "https://i.pravatar.cc/150?img=1", online: true, friends: [], isGuest: false },
  { id: "2", name: "Bob", avatarUrl: "https://i.pravatar.cc/150?img=2", online: false, friends: [], isGuest: false },
  { id: "3", name: "Charlie", avatarUrl: "https://i.pravatar.cc/150?img=3", online: true, friends: [], isGuest: false },
  { id: "4", name: "Diana", avatarUrl: "https://i.pravatar.cc/150?img=4", online: true, friends: [], isGuest: false },
  { id: "5", name: "Eve", avatarUrl: "https://i.pravatar.cc/150?img=5", online: false, friends: [], isGuest: false },
];

const mockStats: { [userId: string]: UserStatsData } = {
  "1": { wins: 45, losses: 23, totalGames: 68, winRate: 66.2 },
  "2": { wins: 32, losses: 28, totalGames: 60, winRate: 53.3 },
  "3": { wins: 58, losses: 12, totalGames: 70, winRate: 82.9 },
  "4": { wins: 21, losses: 19, totalGames: 40, winRate: 52.5 },
  "5": { wins: 67, losses: 33, totalGames: 100, winRate: 67.0 },
};

const mockMatches: { [userId: string]: Match[] } = {
  "1": [
    {
      id: "m1",
      date: "2025-11-02T14:30:00",
      opponent: "Bob",
      opponentAvatar: "https://i.pravatar.cc/150?img=2",
      result: "win",
      score: "11-7",
      duration: "6:45",
    },
    {
      id: "m2",
      date: "2025-11-01T18:15:00",
      opponent: "Charlie",
      opponentAvatar: "https://i.pravatar.cc/150?img=3",
      result: "loss",
      score: "8-11",
      duration: "7:12",
    },
    {
      id: "m3",
      date: "2025-10-30T12:00:00",
      opponent: "Diana",
      opponentAvatar: "https://i.pravatar.cc/150?img=4",
      result: "win",
      score: "11-5",
      duration: "5:30",
    },
    {
      id: "m4",
      date: "2025-10-28T20:45:00",
      opponent: "Eve",
      opponentAvatar: "https://i.pravatar.cc/150?img=5",
      result: "win",
      score: "11-9",
      duration: "8:20",
    },
  ]
};


export async function getUserProfile(usernameOrId: string | null): Promise<User | null> {

  if (!usernameOrId) {
    const data = await fetch(`/api/v1/users/me`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
        'Cache-Control': 'no-cache',
      }
    });
    const msg = await data.json();
    const user: User = {
      id: null,
      name: msg.user.username,
      avatarUrl: msg.user.profilePic,
      online: true,
      friends: [],
      isGuest: false,
    };
    return user;
  }
  const user = mockUsers.find(u =>
    u.name.toLowerCase() === usernameOrId.toLowerCase() ||
    u.id === usernameOrId
  );

  return user || null;
}

export async function updateProfile(userId: string | null, name?: string, avatarUrl?: string | null): Promise<boolean> {

  if (!userId) {
    if (name) {
      const data = await fetch(`/api/v1/users/patchme`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ username: name })
      });
    }

    if (avatarUrl)

      await fetch(`/api/v1/users/patchme`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({ profilePic: avatarUrl })
      });
    return true;
  }

  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;
  }

  return true;
}

export async function deleteUser(): Promise<boolean> {
  await fetch(`/api/v1/users/deleteme`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem("jwt")}`,
    },
  });
  return true;
}


export async function uploadAvatar(file: File): Promise<string> {
  return `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
}


export async function getStats(userId: string): Promise<UserStatsData> {

  return mockStats[userId] || { wins: 0, losses: 0, totalGames: 0, winRate: 0 };
}

export async function getMatchHistory(userId: string): Promise<Match[]> {
  return mockMatches[userId] || [];
}

export async function searchUsers(query: string): Promise<User[]> {

  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(u =>
    u.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}

export async function addFriend(userId: string, friendId: string): Promise<boolean> {
  return true;
}

export async function removeFriend(userId: string, friendId: string): Promise<boolean> {
  return true;
}

export async function getFriendsList(userId: string): Promise<User[]> {
  return mockUsers.slice(0, 3);
}


// end Mock API functions --------------------------------------------------------------
