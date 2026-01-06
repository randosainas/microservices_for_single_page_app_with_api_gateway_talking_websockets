import { GameState, GameSettings, PlayerSide, PlayerInput, BallState } from "../schemas/messageSchemas.ts";

export const defaultSettings: GameSettings = {
  width: 800,
  height: 600,
  paddleOffset: 12,
  paddleHeight: 120,
  paddleSpeed: 120 * 3,
  paddleSpeedup: 20,
  paddleSpeedMax: 600,
  ballRadius: 10,
  ballControl: true,
  ballInitialSpeed: 800 / 5,
  ballSpeedup: 30,
  ballSpeedMax: 800,
  scoreNeeded: 5,
}

/**
 * GamePhysics class
 *
 * It holds the settings and the state of the game, used to run the physics of the game.
 * This itself does not run an interval on tick, instead it only exposes
 * functions to be called every tick in the GameBase.
 */
export class GamePhysics {
  private settings: GameSettings;
  private state: GameState;
  private winner: PlayerSide | null = null;

  /**
   * @param settings (Optional) Settings to run the game with
   */
  constructor(settings?: GameSettings) {
    if (settings) {
      this.settings = settings;
    } else {
      this.settings = defaultSettings;
    }
    this.state = {
      paddleSpeed: this.settings.paddleSpeed,
      ball: this.resetBall(1),
      p1: { y: this.settings.height / 2, score: 0 },
      p2: { y: this.settings.height / 2, score: 0 },
    };
  }

  getSettings() {
    return this.settings;
  }

  /**
  * Apply a single input frame, moving the paddle of the player
  *
  * @param side which player's input it is
  * @param input the input to be applied
  */
  applyInput(side: PlayerSide, input: PlayerInput) {
    const player = this.state[side];
    const speed = this.state.paddleSpeed * input.dt;
    if (input.up) player.y -= speed;
    if (input.down) player.y += speed;
    player.y = Math.max(this.settings.paddleHeight / 2, Math.min(this.settings.height - this.settings.paddleHeight / 2, player.y));
  }

  /**
  * Update the physics given a timestep delta-time (dt).
  * The paddles don't move in this function, only the applyInput does that.
  * First moves the ball, then checks collision with walls/paddles.
  * Update score and reset if ball is past a player's paddle.
  *
  * @param dt delta-time in milliseconds
  */
  updatePhysics(dt: number) {
    const ball = this.state.ball;
    ball.x += ball.vx * ball.speed * dt;
    ball.y += ball.vy * ball.speed * dt;

    // Bounce off walls
    if (ball.y <= this.settings.ballRadius) {
      ball.vy = Math.abs(ball.vy);
    } else if (ball.y >= this.settings.height - this.settings.ballRadius) {
      ball.vy = -Math.abs(ball.vy);
    }

    const paddleHalf = (this.settings.paddleHeight + this.settings.ballRadius) / 2;

    // Simple paddle-ball collision, paddle seen as single line
    for (const side of ["p1", "p2"] as const) {
      const paddleX = side === "p1" ? this.settings.paddleOffset : this.settings.width - this.settings.paddleOffset;
      const paddle = this.state[side];
      if (
        Math.abs(ball.x - paddleX) < this.settings.ballRadius &&
        Math.abs(ball.y - paddle.y) < paddleHalf
      ) {
        // paddle - ball collision -> send ball back with small flat speedup (could be a setting as well?)

        const dir = side === "p1" ? 1 : -1;
        if (this.settings.ballControl) {
          const paddleHitPercent = (ball.y - paddle.y) / paddleHalf; // range of [-1, 1]
          const angleOut = paddleHitPercent * Math.PI / 3;
          ball.vx = Math.cos(angleOut) * dir;
          ball.vy = Math.sin(angleOut);
        } else {
          ball.vx = Math.abs(ball.vx) * dir;
        }

        ball.speed = Math.min(this.settings.ballSpeedMax, ball.speed + this.settings.ballSpeedup);
        this.state.paddleSpeed = Math.min(this.settings.paddleSpeedMax, this.state.paddleSpeed + this.settings.paddleSpeedup);
      }
    }

    // Simple scoring
    if (ball.x <= 0) {
      this.updateScore("p2");
    } else if (ball.x >= this.settings.width) {
      this.updateScore("p1");
    }
  }

  /**
  * Reset the ball's state with a given x velocity direction
  *
  * @param vx ball start direction, 1 to player 2, -1 to player 1
  */
  protected resetBall(vx: 1 | -1): BallState {
    return {
      speed: this.settings.ballInitialSpeed,
      x: this.settings.width / 2,
      y: this.settings.height / 2,
      vx: vx * Math.cos(Math.PI / 4),
      vy: Math.random() > 0.5 ? Math.sin(Math.PI / 4) : -Math.sin(Math.PI / 4)
    };
  }

  /**
  * Increase score of a given player, reset to initial state
  * Crown the player as winner if scoreNeeded is reached
  *
  * @param p player to increase the score for
  */
  updateScore(p: PlayerSide) {
    this.state[p].score++;
    this.state.ball = this.resetBall(p === "p1" ? 1 : -1);
    this.state.paddleSpeed = this.settings.paddleSpeed;
    if (this.state[p].score === this.settings.scoreNeeded) {
      this.winner = p;
    }
  }

  getWinner() {
    return this.winner;
  }

  getState() {
    return this.state;
  }

}
