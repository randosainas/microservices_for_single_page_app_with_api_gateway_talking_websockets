import * as zod from 'zod';

/* ---------------------------- GAME TYPES ---------------------------------- */

/** Settings for the game, set with client message, used by GamePhysics class.
* No attempt is made to check if the dimensions make sense to play a game on.
*/
export const schemaGameSettings = zod.object({
  width: zod.number(), // width of the canvas played on
  height: zod.number(), // height of the canvas played on
  paddleOffset: zod.number(), // Offset along width where the paddle-ball hit is checked
  paddleHeight: zod.number(), // Height of a paddle
  paddleSpeed: zod.number(), // Initial starting speed of paddle on start/reset
  paddleSpeedup: zod.number(), // Change in speed after paddle-ball contact
  paddleSpeedMax: zod.number(), // Max paddle speed, set this to height for ~1s travel from top to bottom
  ballRadius: zod.number(), // Radius of the ball
  ballControl: zod.boolean(), // Enable/disable manipulating outgoing ball angle for more skillful play
  ballInitialSpeed: zod.number(), // Initial speed of ball on start/reset
  ballSpeedup: zod.number(), // Change in speed after paddle-ball contact
  ballSpeedMax: zod.number(), // Max speed of the ball, set this to width for ~1s travel from left to right
  scoreNeeded: zod.number(), // The score needed for a winner to be crowned.
})
export type GameSettings = zod.infer<typeof schemaGameSettings>;

/** Input a player makes */
export const schemaPlayerInput = zod.object({
  dt: zod.number(), // time between inputs, tickrate of backend and frontend can be different
  up: zod.boolean(), // Is the up key pressed?
  down: zod.boolean(), // Is the down key pressed?
})
export type PlayerInput = zod.infer<typeof schemaPlayerInput>;

/** State of a player */
export const schemaPlayerState = zod.object({
  y: zod.number(), // y coord, represents the middle of the paddle of the player
  score: zod.number(), // the current score of the player.
})
export type PlayerState = zod.infer<typeof schemaPlayerState>;

export const schemaPlayerSide = zod.union([zod.literal("p1"), zod.literal("p2")]);
export type PlayerSide = zod.infer<typeof schemaPlayerSide>; // "p1" | "p2"

/** State of the ball */
export const schemaBallState = zod.object({
  speed: zod.number(), // current speed of the ball
  x: zod.number(), // current x position
  y: zod.number(), // current y position
  vx: zod.number(), // current x velocity (normalized vector)
  vy: zod.number(), // current y velocity
})
export type BallState = zod.infer<typeof schemaBallState>;

// Represents current game state structure (more explicit than z.any)
export const schemaGameState = zod.object({
  paddleSpeed: zod.number(),
  ball: schemaBallState,
  p1: schemaPlayerState,
  p2: schemaPlayerState,
});
export type GameState = zod.infer<typeof schemaGameState>;


/* ---------------------- CLIENT MESSAGES FOR MANAGER ----------------------- */

// Ask to set up a game for local play
export const schemaClientLocal1v1 = zod.object({
  type: zod.literal('local1v1'),
  payload: zod.object({
    settings: schemaGameSettings,
  })
});
export type ClientLocal1v1 = zod.infer<typeof schemaClientLocal1v1>;

export const schemaUser = zod.object({
  name: zod.string(),
  avatarUrl: zod.string(),
  isGuest: zod.boolean().optional(),
});
export type User = zod.infer<typeof schemaUser>;

export const schemaClientJoinQueue = zod.object({
  type: zod.literal('queue-join'),
  payload: zod.object({
    user: schemaUser,
  }),
});
export type ClientJoinQueue = zod.infer<typeof schemaClientJoinQueue>;

// Union of messages meant for the game manager
export const schemaClientMessageManager = zod.union([
  schemaClientLocal1v1,
  schemaClientJoinQueue,
]);
export type ClientMessageManager = zod.infer<typeof schemaClientMessageManager>;

/* ----------------------- CLIENT MESSAGES FOR GAME ------------------------- */

/** Input for a local 1v1 game */
export const schemaClientLocal1v1Input = zod.object({
  type: zod.literal('local1v1-input'),
  payload: zod.object({
    p1: schemaPlayerInput,
    p2: schemaPlayerInput,
  }),
});
export type ClientLocal1v1Input = zod.infer<typeof schemaClientLocal1v1Input>;

/** Local 1v1 game: Start */
export const schemaClientLocal1v1Start = zod.object({
  type: zod.literal('local1v1-start'),
});
export type ClientLocal1v1Start = zod.infer<typeof schemaClientLocal1v1Start>;

/** Input for a local 1v1 game */
export const schemaClientLocal1v1Stop = zod.object({
  type: zod.literal('local1v1-stop'),
});

/** Input for a local 1v1 game */
export const schemaClientLocal1v1Pause = zod.object({
  type: zod.literal('local1v1-pause'),
});
export type ClientLocal1v1Pause = zod.infer<typeof schemaClientLocal1v1Pause>;

// Union of messages meant for a local game
export const schemaClientMessageLocal1v1 = zod.union([
  schemaClientLocal1v1Input,
  schemaClientLocal1v1Start,
  schemaClientLocal1v1Stop,
  schemaClientLocal1v1Pause,
]);
export type ClientMessageLocal1v1 = zod.infer<typeof schemaClientMessageLocal1v1>;

export const schemaClientOnlinePlayerReady = zod.object({
  type: zod.literal('online-player-ready'),
})
export type ClientOnlinePlayerReady = zod.infer<typeof schemaClientOnlinePlayerReady>;

/** Local 1v1 game: Start */
export const schemaClientOnlineStart = zod.object({
  type: zod.literal('online-start'),
});
export type ClientOnlineStart = zod.infer<typeof schemaClientOnlineStart>;

export const schemaClientOnlineInput = zod.object({
  type: zod.literal('online-input'),
  payload: zod.object({
    input: schemaPlayerInput,
  })
})
export type ClientOnlineInput = zod.infer<typeof schemaClientOnlineInput>;

// Union of messages meant for an online/remote game
export const schemaClientMessageOnline = zod.union([
  schemaClientOnlineStart,
  schemaClientOnlinePlayerReady,
  schemaClientOnlineInput,
]);
export type ClientMessageOnline = zod.infer<typeof schemaClientMessageOnline>;

// Union of messages meant for the game instance
// INFO: Probably never needed except for union of all client messages
export const schemaClientMessageGame = zod.union([
  schemaClientMessageLocal1v1,
  schemaClientMessageOnline,
]);
export type ClientMessageGame = zod.infer<typeof schemaClientMessageGame>;


/* ----------------------------- CLIENT MESSAGES ---------------------------- */

// Ping the player to keep the connection alive
export const schemaClientPing = zod.object({
  type: zod.literal('ping'),
});

// Union of all client messages
export const schemaClientMessage = zod.union([
  schemaClientMessageGame,
  schemaClientMessageManager,
  schemaClientPing,
]);
export type ClientMessage = zod.infer<typeof schemaClientMessage>;

/* ----------------------------- SERVER MESSAGES ---------------------------- */

// When game state updates (sent every tick)
export const schemaServerState = zod.object({
  type: zod.literal('state'),
  payload: schemaGameState,
});

// Settings set for the game in the gameserver backend
export const schemaServerSettings = zod.object({
  type: zod.literal('game-settings'),
  payload: schemaGameSettings,
});

export const schemaServerGameStarted = zod.object({
  type: zod.literal('started'),
  payload: zod.object({
    players: zod.object({
      player1: schemaUser,
      player2: schemaUser,
    }),
  }).optional()
});

// When game state updates (sent every tick)
export const schemaServerGamePaused = zod.object({
  type: zod.literal('paused'),
});

// When game state updates (sent every tick)
export const schemaServerGameStopped = zod.object({
  type: zod.literal('stopped'),
});

// When game state updates (sent every tick)
export const schemaServerGameFinished = zod.object({
  type: zod.literal('finished'),
  payload: schemaPlayerSide,
});

// When player successfully joins
export const schemaServerGameReady = zod.object({
  type: zod.literal('game-ready'),
  payload: zod.object({
    matchId: zod.string(),
    settings: schemaGameSettings,
    players: zod.object({
      player1: schemaUser,
      player2: schemaUser,
    }).optional(),
  }),
});

// When an error occurs
export const schemaServerError = zod.object({
  type: zod.literal('error'),
  payload: zod.object({
    message: zod.string(),
  }),
});

// Union of all server messages
export const schemaServerMessage = zod.union([
  schemaServerState,
  schemaServerSettings,
  schemaServerGameFinished,
  schemaServerGameReady,
  schemaServerGameStarted,
  schemaServerGamePaused,
  schemaServerGameStopped,
  schemaServerError,
]);

export type ServerMessage = zod.infer<typeof schemaServerMessage>;
