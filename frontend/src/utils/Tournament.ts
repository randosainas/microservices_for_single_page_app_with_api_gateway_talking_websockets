import { User } from "./State";


/** Represents one match in the tournament */
export type Match = {
  serverId?: string;      // Unique UUID from the backend server gameAPI
  id: string;            // Unique ID for identifying the match in bracket "R<number>-M<number>"
  round: number;         // Which round this match belongs to (1 = first round)
  player1?: User | null; // Player 1 (null = TBD)
  player2?: User | null; // Player 2 (null = TBD)
  winner?: User | null;  // Winner (set after match is played)
  score?: { p1: number; p2: number }; // Score of the match
  autoadvanced?: boolean;
};

/** Match with empty fields */
export const emptyMatch: Readonly<Match> = {
  serverId: "",
  id: "",
  round: -1,
  player1: null,
  player2: null,
}

/** Represents the whole tournament */
export type Tournament = {
  rounds: Match[][];
};

/**
 * Parse a match id into the round and match index.
 *
 * @param id
 * @throws If match id string is invalid, regex pattern was not matched.
 *
 * @returns object with roundIndex and matchIndex properties.
 *
 * @example
 * parseMatchId("R1-M1"); // { roundIndex: 1, matchIndex: 1 }
 * parseMatchId("R2-M4"); // { roundIndex: 2, matchIndex: 4 }
 * parseMatchId("R1-M"); // throws Error("invalid match id: R1-M")
 */
export function parseMatchId(id: string) {
  const m = id.match(/^R(\d+)-M(\d+)$/i);
  if (!m) throw new Error(`Invalid match id: ${id}`);
  return {
    roundIndex: parseInt(m[1]) - 1,
    matchIndex: parseInt(m[2]) - 1,
  };
}

/**
 * Generate seed order list for given bracket size.
 * e.g. for 8 → [1,8,5,4,3,6,7,2]
 */
function getSeedOrder(size: number): number[] {
  let matches = [[1, 2]];
  for (let round = 1; round < Math.log2(size); round++) {
    const roundMatches: number[][] = [];
    const sum = Math.pow(2, round + 1) + 1;
    for (const match of matches) {
      roundMatches.push([match[0], sum - match[0]]);
      roundMatches.push([sum - match[1], match[1]]);
    }
    matches = roundMatches;
  }
  return matches.flat();
}

/**
 * Auto-advance players in round 1 that have no opponent (byes),
 * placing them into the next round only once.
 * The match the player is moved from is marked as autoadvanced by setting the
 * property to true.
 *
 * @param rounds The rounds property of the tournament to autoadvance the first round for.
 */
function autoAdvanceByes(rounds: Match[][]) {

  if (rounds.length < 1) return;

  rounds[0].forEach((m, i) => {
    if (m.player1 && m.player2) return;
    if (m.player1 && !m.player2) {
      m.winner = m.player1;
      m.player1 = null;
    } else if (!m.player1 && m.player2) {
      m.winner = m.player2;
      m.player2 = null;
    }
    m.autoadvanced = true;
    const nextMatch = rounds[1][Math.floor(i / 2)];
    if (i % 2 === 0) nextMatch.player1 = m.winner;
    else nextMatch.player2 = m.winner;
  })
}

export function generateTournament(players: User[]): Tournament {
  if (players.length < 2) throw new Error("Need at least two players.");
  // if (players.length > 16) throw new Error("Max 16 players supported.");

  const playerCount = players.length;
  const rounds = Math.ceil(Math.log2(playerCount));
  const bracketSize = Math.pow(2, rounds);
  // const requiredByes = bracketSize - playerCount;

  // Shuffle players for now (later can sort by actual seed)
  const shuffled = [...players].sort(() => Math.random() - 0.5);

  // Get seeding pattern (e.g. [1,8,5,4,3,6,7,2] for 8 players) for full bracket
  const seedOrder = getSeedOrder(bracketSize);

  // Place players or null (bye) according to seed order
  const slots: (User | null)[] = seedOrder.map(seed =>
    seed <= playerCount ? shuffled[seed - 1] : null
  );

  // Initialize rounds
  const tournamentRounds: Match[][] = [];
  let currentMatches: Match[] = [];

  for (let i = 0; i < bracketSize; i += 2) {
    currentMatches.push({
      serverId: "",
      id: `R1-M${i / 2 + 1}`,
      round: 1,
      player1: slots[i],
      player2: slots[i + 1],
      winner: null,
    });
  }

  tournamentRounds.push(currentMatches);

  // Build remaining rounds (empty placeholders)
  for (let r = 2; r <= rounds; r++) {
    const prev = tournamentRounds[r - 2];
    const matches: Match[] = [];
    for (let i = 0; i < prev.length / 2; i++) {
      matches.push({
        serverId: "",
        id: `R${r}-M${i + 1}`,
        round: r,
        player1: null,
        player2: null,
        winner: null,
      });
    }
    tournamentRounds.push(matches);
  }

  // Single auto-advance for byes
  autoAdvanceByes(tournamentRounds);

  return { rounds: tournamentRounds };
}

/**
* Updates a match result and advances the winner to the next round.
*
* @param tournament The tournament to update the match for.
* @param match The match to update.
*
* @returns The next round's match if a winner moved to it
*/
export function updateMatchResult(tournament: Tournament, match: Match): Match | null {
  const allMatches = tournament.rounds.flat();
  const matchInTournament = allMatches.find(m => m.id === match.id);
  if (!matchInTournament) throw new Error(`Match ${match.id} not found.`);

  const { round, id } = match;
  const { matchIndex } = parseMatchId(id);

  if (round === tournament.rounds.length && match.winner) {
    return null; // No next round match to update
  }

  /**
   * Put winner in the correct slot of the next round's match
   */
  const nextRound = tournament.rounds[round];
  const nextMatch = nextRound[Math.floor(matchIndex / 2)];
  const slotIsPlayer1 = matchIndex % 2 === 0;
  const slotKey: "player1" | "player2" = slotIsPlayer1 ? "player1" : "player2";
  nextMatch[slotKey] = match.winner;

  return nextMatch;
}
