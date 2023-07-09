const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

require('dotenv').config({ path: '../.env/test'})

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID_RISE_AGAIN = process.env.DISCORD_GUILD_ID_RISE_AGAIN;
const GUILD_ID_MAMA_IST_STOLZ = process.env.DISCORD_GUILD_ID_MAMA_IST_STOLZ;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		console.log(` - adding command: ${command.data.name}`)
		commands.push(command.data.toJSON())
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const rise_again = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID_RISE_AGAIN),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${rise_again.length} application (/) commands on rise again.`);

		const mama_ist_stolz = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID_MAMA_IST_STOLZ),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${mama_ist_stolz.length} application (/) commands in mama ist stolz.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();