const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('login')
		.setDescription('Приєднати аккаунт Steam до профілю'),
	async execute(interaction) {

		var logged = false;
		fs.readFile('database.json', function (err, data) {
			if (err) throw err;

			data = JSON.parse(data);

			console.log(data, interaction.user.id);

			data.users.forEach(element => {
				if(Number(element.userId) == interaction.user.id) {
					logged = true;
				}
			});

			console.log('Readed!');
		});

		await interaction.reply({ content:'Ви вже зареєстровані' , ephemeral: true});

		if(logged) {
			return;
		}

		const SteamID = new ButtonBuilder()
			.setCustomId('login')
			.setLabel('Увійти')
			.setEmoji('1148862811414482975')
			.setStyle(ButtonStyle.Success);
		
		const Cancel = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Скасувати')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder()
			.addComponents(SteamID, Cancel);

		const response = await interaction.editReply({
			content: `Щоб увійти, перейдіть за посиланням нижче:`,
			components: [row],
			ephemeral: true
		});

		const collectorFilter = i => i.user.id === interaction.user.id;

		try {
			const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
			if(confirmation.customId == 'login') {
				await confirmation.update({ content: `ТИ НЕ ЗАСЛУЖИВ`, components: [] });

				fs.readFile('database.json', function (err, data) {
					if (err) throw err;

					var json = JSON.parse(data);
					json.users.push({ userId : interaction.user.id , steamId : '1394914587305' })
					JSON.stringify(json);
					
					fs.writeFile('database.json', JSON.stringify(json), function (err) {
						if (err) throw err;
						console.log('Replaced!');
					});
				});
			}
			else if (confirmation.customId == 'cancel') {
				await confirmation.update({ content: `Операцію скасовано`, components: [] });
				return;
			}
			
		} catch (e) {
			await interaction.editReply({ content: 'Очікування відповіді зайняло більше 1 хвилини, скасування операції', components: [] });
			console.log(e);
		}
	},
};