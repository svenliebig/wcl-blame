// @ts-check

const { SlashCommandBuilder } = require("discord.js");
const wait = require('node:timers/promises').setTimeout;
const { getEncounterFights, getTokenFromUrl, getPlayersForFights, getEncounter, getFailsForEncounter, evaluateFail, Failers, } = require('../../service');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blame')
		.setDescription('Checks a warcraftlogs url for encounters and will print a summary of fails.')
		.addStringOption(options => options.setName('url').setDescription('The warcraftlogs url to check.').setRequired(true)),

		/**
		 * @param {import('discord.js').ChatInputCommandInteraction} interaction
		 */
	async execute(interaction) {
		const url = interaction.options.getString('url') ?? "";
		const token = getTokenFromUrl(url)

		if (!token) {
			await interaction.reply('Could not extract token from the given URL.');
			return;
		}

		const encounterFightsPromise = getEncounterFights(token)
		let reply = `Thank you for your concerns about the raid performance ${interaction.user.username} :heart: We are working on your request!`;
		interaction.reply(reply)
		const encounterFights = await encounterFightsPromise
		const allFights = Array.from((encounterFights).values()).flat();

		if (encounterFights.size === 0) {
			reply += `\n\nNo encounter fights found in this log :cry: git gud! :christmas_casy:`;
			await interaction.editReply(reply);
			return;
		}

		reply += `\n\nFound ${encounterFights.size} encounters in this log with overall ${allFights.length} fights. Processing :hourglass:\n`;
		await interaction.editReply(reply);

		const player = await getPlayersForFights(token, allFights)
	
		for (const [encounterID, fights] of encounterFights) {
			const encounter = await getEncounter(encounterID)
			const fails = getFailsForEncounter(encounterID)

			if (fails.length === 0) {
				reply += `\n❌ ${encounter.name} has no configuration yet.` //, make a PR: https://github.com/svenliebig/wcl-blame/blob/main/service/models/fails.ts!`;
				interaction.editReply(reply);
				continue;
			}
			

			reply += `\n👉 ${encounter.name} has ${fails.length} fail-check${fails.length === 1 ? "": "s"} configured.`;
			interaction.editReply(reply);
			
			
			for (const fail of fails) {
				const failIcon = resolveEmoji(fail.icon, interaction.client);
				let failText = `Fails for ${fail.name} ${failIcon ? `${failIcon} ` : ""}on ${encounter.name}`

				const failers = new Failers(player)
				failers.addFails(await evaluateFail(token, fail, fights))
				failers.addAttendence(fights)
				
				const failArray = Array.from(failers.getFailers().values())
					.filter((data) => data.attended > 0)
					.map((data) => {
						let ratio = 0

						if (data.attended > 0) {
							ratio = parseFloat((data.failed / data.attended).toFixed(2))
						}

						return { ...data, ratio }
					})
					.sort((a, b) => b.ratio - a.ratio)

				for (const data of failArray) {
					const icon = parsePlayerSpecToDiscordIcon(interaction.client, data.player.icon);
					failText += `\n\t${icon ? `${icon} ` : ""}${data.player.name} got hit ${data.failed} time${data.failed === 1 ? "" : "s"} during ${data.attended} fight${data.attended === 1 ? "" : "s"} (${data.ratio} per fight)`;
				}

				interaction.followUp(failText);
			}
		}

		// await wait(2000);
		// await interaction.editReply('We are working on the issue... :hourglass:');
		// await wait(2000);
		// await interaction.editReply(`Provided url: ${url}`);
		// await interaction.followUp('Pong again!');
	},
}

function resolveEmoji(name, client) {
	return client.emojis.cache.find(emoji => emoji.name === name)
}

function parsePlayerSpecToDiscordIcon(client, spec) {
	switch (spec) {
		// dk
		case "DeathKnight-Blood":
			return resolveEmoji("bdk", client)
		case "DeathKnight-Frost":
			return resolveEmoji("fdk", client)
		case "DeathKnight-Unholy":
			return resolveEmoji("udk", client)
		// dh
		case "DemonHunter-Havoc":
			return resolveEmoji("white_casy", client)
		case "DemonHunter-Vengeance":
			return resolveEmoji("dh", client)
		// druid
		case "Druid-Balance":
			return resolveEmoji("balance", client)
		case "Druid-Feral":
			return resolveEmoji("feral", client)
		case "Druid-Guardian":
			return resolveEmoji("guardian", client)
		case "Druid-Restoration":
			return resolveEmoji("rdruid", client)
		// hunter
		case "Hunter-BeastMastery":
			return resolveEmoji("bm", client)
		case "Hunter-Marksmanship":
			return resolveEmoji("mm", client)
		case "Hunter-Survival":
			return resolveEmoji("survival", client)
		// mage
		case "Mage-Frost":
			return resolveEmoji("frost", client)
		case "Mage-Fire":
			return resolveEmoji("fire", client)
		case "Mage-Arcane":
			return resolveEmoji("arcane", client)
		// monk
		case "Monk-Brewmaster":
			return resolveEmoji("brewmaster", client)
		case "Monk-Windwalker":
			return resolveEmoji("ww", client)
		case "Monk-Mistweaver":
			return resolveEmoji("mwmonk", client)
		// pala
		case "Paladin-Holy":
			return resolveEmoji("hpala", client)
		case "Paladin-Protection":
			return resolveEmoji("protp", client)
		case "Paladin-Retribution":
			return resolveEmoji("ret", client)
		// priest
		case "Priest-Discipline":
			return resolveEmoji("disc", client)
		case "Priest-Holy":
			return resolveEmoji("holyp", client)
		case "Priest-Shadow":
			return resolveEmoji("spriest", client)
		// rogue
		case "Rogue-Assassination":
			return resolveEmoji("assa", client)
		case "Rogue-Outlaw":
			return resolveEmoji("outlaw", client)
		case "Rogue-Subtlety":
			return resolveEmoji("sub", client)
		// warlock
		case "Warlock-Demonology":
			return resolveEmoji("demo", client)
		case "Warlock-Destruction":
			return resolveEmoji("destro", client)
		case "Warlock-Affliction":
			return resolveEmoji("affli", client)
		// shaman
		case "Shaman-Enhancement":
			return resolveEmoji("enh", client)
		case "Shaman-Elemental":
			return resolveEmoji("ele", client)
		case "Shaman-Restoration":
			return resolveEmoji("rshaman", client)
		// warrior
		case "Warrior-Arms":
			return resolveEmoji("arms", client)
		case "Warrior-Fury":
			return resolveEmoji("fury", client)
		case "Warrior-Protection":
			return resolveEmoji("prot", client)
		// evoker
		case "Evoker":
			return resolveEmoji("evoker", client)
			
		default:
			return ""
	}
}