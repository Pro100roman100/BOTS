import { SlashCommandBuilder } from 'discord.js';
import { readFile, writeFile } from 'node:fs';
 
async function readUser (userId, callback) {
	readFile('database.json', function (err, data) {
		if (err) throw err;
	
		var data = JSON.parse(data);

		var isInBase = false;
		data.users.forEach(element => {
			if(element.userId == userId && !isInBase) {
				callback(true);
				isInBase = true;
			}
		});
		if(!isInBase)
			callback(false);
	});
}
async function writeUser (userId, url) {
	const item = {"userId":userId,"steamId":url}
	readFile('database.json', function (err, data) {
		if (err) throw err;
	
		data = JSON.parse(data);
		data.users.push(item);
		data = JSON.stringify(data);

		writeFile('database.json', data, err => {
			if (err) throw err;
		});
	});
}

export const data = new SlashCommandBuilder()
	.setName('login')
	.setDescription('Приєднати аккаунт Steam до профілю')
	.addStringOption(url => url.setName('url')
		.setDescription('посилання на профіль steam')
		.setRequired(true))
	.addUserOption(user => user.setName('користувач')
		.setDescription('кого зареєструвати')
		.setRequired(false));
export async function execute(interaction) {
	const anotherUser = interaction.options.getUser('користувач');
	var user;
	if (anotherUser != null)
		user = anotherUser.id;

	else
		user = interaction.user.id;

	readUser(user, async (logged) => {
		if (logged) {
			await interaction.reply({ content: 'Ви вже зареєстровані', ephemeral: true });
		}
		else {
			const url = interaction.options.getString('url');
			writeUser(user, url);

			await interaction.reply({ content: 'Реєстрація пройшла успішно', ephemeral: true });
		}
	});
}