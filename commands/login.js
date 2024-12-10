import { SlashCommandBuilder,  ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
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
async function deleteUser (userId) {
	readFile('database.json', function (err, data) {
		if (err) throw err;
	
		data = JSON.parse(data);
		data.users = data.users.filter(user => user.userId != userId)
		data = JSON.stringify(data);

		writeFile('database.json', data, err => {
			if (err) throw err;
		});
	});
}
async function changeUser (userId, newSteamId) {
	readFile('database.json', function (err, data) {
		if (err) throw err;
	
		data = JSON.parse(data);
		var newData = data.users.filter(user => user.userId == userId)[0];
		newData.steamId = newSteamId;
		data.users = data.users.filter(user => user.userId != userId)
		data.users.push(newData);
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
			const change = new ButtonBuilder()
			.setCustomId('change')
			.setLabel('Змінити профіль')
			.setEmoji('1148862811414482975')
			.setStyle(ButtonStyle.Secondary);

			const SteamID = new ButtonBuilder()
			.setCustomId('delete')
			.setLabel('Видалити профіль')
			.setEmoji('💀')
			.setStyle(ButtonStyle.Danger);
			
			const row = new ActionRowBuilder()
			.addComponents(change, SteamID);
			
			const response = await interaction.reply({ content: 'Ви вже зареєстровані', ephemeral: true, components: [row] });

			const collectorFilter = i => i.user.id === interaction.user.id;
			try {
				const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000});
				if(confirmation.customId == 'change') {
					const url = interaction.options.getString('url');
					changeUser(user, url);
					await interaction.editReply({ content: 'Профіль зміннено на ' + url, components: [] });
				}
				else if (confirmation.customId == 'delete') {
					deleteUser(user);
					await interaction.editReply({ content: 'Профіль видалено', components: [] });
				}
			} catch (e) {
				console.log(e);
				await interaction.editReply({ content: 'Час вийшов', components: [] });
			}
		}
		else {
			const url = interaction.options.getString('url');
			writeUser(user, url);

			await interaction.reply({ content: 'Реєстрація пройшла успішно', ephemeral: true });
		}
	});
}