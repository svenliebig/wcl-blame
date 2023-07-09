import { Fail } from "./fails";

interface Player {
	addFail(fail: Fail): void;
}

interface Failers {
	addPlayer(player: Player): void;
	addFail(player: Player, fail: Fail): void;
	addFail(playerId: number, fail: Fail): void;
}

interface Report {
	encounters: Array<Encounter>;
}

interface Encounter {
	fights: Array<Fight>;
}

interface Fight {
	events: Array<any>;
}
