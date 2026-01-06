// TODO: get this from shared
export type GameState = {
  paddleSpeed: number;
  ball: {
    speed: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  p1: {
    y: number;
    score: number;
  };
  p2: {
    y: number;
    score: number;
  };
}

// TODO: get this from shared
export type GameSettings = {
  width: number;
  height: number;
  paddleOffset: number;
  paddleHeight: number;
  paddleSpeed: number;
  paddleSpeedup: number;
  paddleSpeedMax: number;
  ballRadius: number;
  ballControl: boolean;
  ballInitialSpeed: number;
  ballSpeedup: number;
  ballSpeedMax: number;
  scoreNeeded: number;
}
