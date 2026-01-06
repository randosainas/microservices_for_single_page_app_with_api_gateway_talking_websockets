class Game {
	constructor( Player1ID: number, Player2ID: number, ScorePlayer1: number,
	ScorePlayer2: number, startedAt: Date, finishedAt: Date, isFinished: boolean) 
	{
		this.Player1ID = Player1ID;
		this.Player2ID = Player2ID;
		this.ScorePlayer1 = ScorePlayer1;
		this.ScorePlayer2 = ScorePlayer2;
		this.startedAt = startedAt;
		this.finishedAt = finishedAt;
		this.isFinished = isFinished;
	};
	Player1ID: number;
	Player2ID: number;
	ScorePlayer1: number;
	ScorePlayer2: number;
	startedAt: Date;
	finishedAt: Date;
	isFinished: boolean;
}
