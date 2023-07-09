type FailType = "DamageTaken" | "DamageDone" | "HealingDone";

// maybe we need hostility type here too.
export interface Fail {
	encounterID: number;
	abilityID: number;
	icon: string;
	name: string;
	type: FailType;
}

const ENCOUNTER_FAILS = new Map<number, Array<Fail>>();

const ENCOUNTER_ID_RASHOK = 2680;

ENCOUNTER_FAILS.set(ENCOUNTER_ID_RASHOK, [
	{
		encounterID: ENCOUNTER_ID_RASHOK,
		abilityID: 403543,
		type: "DamageTaken",
		icon: "lava_wave",
		name: "Lava Wave",
	},
]);

export function getFailsForEncounter(encounterID: number): Array<Fail> {
	return ENCOUNTER_FAILS.get(encounterID) ?? [];
}
