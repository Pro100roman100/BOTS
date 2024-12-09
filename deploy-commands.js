import { REST, Routes } from 'discord.js';
import config from './config.json' with {type: 'json'};
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import path from 'path';
import {fileURLToPath} from 'url';

const commands = [];
// Grab all the command folders from the commands directory you created earlier

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
	const filePath = "file://" + join(commandsPath, file);
	const command = await import(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();